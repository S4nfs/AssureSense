'use client'

import { useState, useRef, useEffect } from 'react'
import type { Patient } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Mic, Square, Play, Pause, Wand2, Clock, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { TemplateSelector } from './template-selector'
import { createClient as createDeepgramClient, LiveTranscriptionEvents } from '@deepgram/sdk'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PatientForm } from './patient-form'

interface Props {
  initialPatient: Patient | null
  allPatients: Patient[]
  resumeConsultationId?: string
  resumeTranscript?: string
  resumeDuration?: number
}

export function ConsultationInterface({ initialPatient, allPatients, resumeConsultationId, resumeTranscript, resumeDuration }: Props) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(initialPatient)
  const [consultationType, setConsultationType] = useState<'in-person' | 'telehealth'>('in-person')
  const [patientName, setPatientName] = useState(initialPatient?.name || '')
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false)
  const [patients, setPatients] = useState<Patient[]>(allPatients)

  useEffect(() => {
    if (patientName) {
      const matchedPatient = patients.find((p) => p.name.toLowerCase() === patientName.toLowerCase())
      if (matchedPatient && matchedPatient.id !== selectedPatient?.id) {
        setSelectedPatient(matchedPatient)
      }
    }
  }, [patientName, patients, selectedPatient])

  useEffect(() => {
    if (selectedPatient) {
      setPatientName(selectedPatient.name)
    }
  }, [selectedPatient])

  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(resumeDuration || 0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  const [finalUtterances, setFinalUtterances] = useState<Array<{ speaker: number; text: string }>>(resumeTranscript ? [{ speaker: 0, text: resumeTranscript }] : [])
  const [partialUtterance, setPartialUtterance] = useState<{ speaker: number; text: string } | null>(null)
  const [isFinal, setIsFinal] = useState(false)
  const [dgError, setDgError] = useState<string | null>(null)
  const [deepgramToken, setDeepgramToken] = useState<string | null>(null)
  const connectionRef = useRef<any>(null)

  const transcript = (() => {
    const finalText = finalUtterances.map((u) => `[Speaker ${u.speaker}] ${u.text}`).join('\n')
    const partialText = partialUtterance ? `[Speaker ${partialUtterance.speaker}] ${partialUtterance.text}` : ''
    if (finalText && partialText) return `${finalText}\n${partialText}`
    return finalText || partialText || ''
  })()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/deepgram/token')
        const data = await res.json()
        if (!mounted) return
        if (res.ok && data?.token) setDeepgramToken(data.token)
        else console.warn('Failed to fetch Deepgram token', data)
      } catch (e) {
        console.warn('Could not fetch Deepgram token', e)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const [isGenerating, setIsGenerating] = useState(false)
  const [soapNote, setSoapNote] = useState<any>(null)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  const router = useRouter()

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (mediaRecorderRef.current) mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop())
    }
  }, [])

  useEffect(() => {
    console.log(transcript)
  }, [transcript])

  useEffect(() => {
    if (dgError) console.error('Deepgram error state:', dgError)
  }, [dgError])

  const [consultationId, setConsultationId] = useState<string | null>(resumeConsultationId || null)
  const autosaveIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') mediaRecorderRef.current.stop()
    } catch (e) {
      /* ignore */
    }
    try {
      if (connectionRef.current) {
        if (typeof connectionRef.current.requestClose === 'function') connectionRef.current.requestClose()
        else if (typeof connectionRef.current.close === 'function') connectionRef.current.close()
      }
    } catch (e) {
      /* ignore */
    }

    if (!resumeConsultationId) {
      setFinalUtterances([])
      setPartialUtterance(null)
    }
    setIsFinal(false)
    setIsRecording(true)

    timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000)

    if (!deepgramToken) {
      alert('Waiting for Deepgram token. Try again soon.')
      setIsRecording(false)
      return
    }

    const deepgram = createDeepgramClient(deepgramToken as string)
    const connection = deepgram.listen.live({
      model: 'nova-3',
      language: 'en-US',
      smart_format: true,
      interim_results: true,
      punctuate: true,
      diarize: true,
      utterances: true,
      sample_rate: 48000,
    })

    connectionRef.current = connection

    connection.on(LiveTranscriptionEvents.Open, async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg'
        const mediaRecorder = new MediaRecorder(stream as MediaStream, { mimeType } as MediaRecorderOptions)
        mediaRecorderRef.current = mediaRecorder

        mediaRecorder.addEventListener('dataavailable', (ev: BlobEvent) => {
          if (ev.data && ev.data.size > 0) {
            try {
              if (typeof connection.send === 'function') {
                connection.send(ev.data)
                return
              }
            } catch (e) {
              // fallthrough
            }
            try {
              const ws = (connection as any).conn
              if (ws && typeof ws.send === 'function') ws.send(ev.data)
            } catch (e) {
              console.warn('Failed to send audio blob:', e)
            }
          }
        })

        mediaRecorder.start(100)
      } catch (err) {
        console.error('Could not start media recorder:', err)
      }
    })

    connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
      try {
        const utterances = data?.utterances || data?.channel?.alternatives?.[0]?.utterances
        const altTranscript = data?.channel?.alternatives?.[0]?.transcript || data?.alternatives?.[0]?.transcript || ''
        const isFinalSeg = !!(data?.is_final || data?.type === 'FinalTranscript')

        if (utterances && Array.isArray(utterances) && utterances.length > 0) {
          if (isFinalSeg) {
            const newUtterances = utterances.map((u: any) => ({ speaker: u.speaker ?? 0, text: u.text ?? '' }))
            setFinalUtterances((prev) => (prev ? [...prev, ...newUtterances] : [...newUtterances]))
            setPartialUtterance(null)
            setIsFinal(true)
          } else {
            const last = utterances[utterances.length - 1]
            if (last && last.text) setPartialUtterance({ speaker: last.speaker ?? 0, text: last.text })
          }
          return
        }

        if (!altTranscript) return
        if (isFinalSeg) {
          setFinalUtterances((prev) => (prev ? [...prev, { speaker: 0, text: altTranscript }] : [{ speaker: 0, text: altTranscript }]))
          setPartialUtterance(null)
          setIsFinal(true)
        } else {
          setPartialUtterance({ speaker: 0, text: altTranscript })
        }
      } catch (e) {
        console.debug('Transcript parse error', e)
      }
    })

    connection.on(LiveTranscriptionEvents.Error, (err: any) => {
      console.error('Deepgram error:', err)
      const message = (err as any)?.message || String(err)
      setDgError(message)
    })

    connection.on(LiveTranscriptionEvents.Close, () => {
      console.log('Deepgram connection closed')
      setIsRecording(false)
    })

    if (selectedPatient && !consultationId) {
      try {
        const res = await fetch('/api/consultations/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId: selectedPatient.id,
            consultationType,
          }),
        })
        const data = await res.json()
        if (data.success && data.data) {
          setConsultationId(data.data.id)
          console.log('S4nfs: Created consultation:', data.data.id)
        }
      } catch (e) {
        console.error('S4nfs: Failed to create consultation:', e)
      }
    }

    autosaveIntervalRef.current = setInterval(() => {
      if (consultationId && transcript) {
        autoSaveConsultation()
      }
    }, 30000)
  }

  const pauseRecording = () => {
    const rec = mediaRecorderRef.current
    if (!rec || !isRecording) return
    if (isPaused) {
      rec.resume()
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000)
    } else {
      rec.pause()
      if (timerRef.current) clearInterval(timerRef.current)
    }
    setIsPaused(!isPaused)
  }

  const stopRecording = () => {
    const rec = mediaRecorderRef.current
    if (!rec || !isRecording) return
    try {
      rec.stop()
    } catch (e) {
      /* ignore */
    }
    rec.stream.getTracks().forEach((t) => t.stop())
    if (connectionRef.current) {
      try {
        if (typeof connectionRef.current.requestClose === 'function') connectionRef.current.requestClose()
        else if (typeof connectionRef.current.close === 'function') connectionRef.current.close()
      } catch (e) {
        console.warn('Error closing Deepgram connection', e)
      }
    }
    if (timerRef.current) clearInterval(timerRef.current)
    setIsRecording(false)
    setIsPaused(false)

    if (autosaveIntervalRef.current) {
      clearInterval(autosaveIntervalRef.current)
      autosaveIntervalRef.current = null
    }

    if (consultationId && transcript) {
      autoSaveConsultation()
    }
  }

  const autoSaveConsultation = async () => {
    if (!consultationId || !transcript) return

    try {
      await fetch('/api/consultations/autosave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultationId,
          transcript,
          duration,
          status: 'in-progress',
        }),
      })
      console.log('S4nfs: Autosaved consultation')
    } catch (e) {
      console.error('S4nfs: Autosave failed:', e)
    }
  }

  const generateSOAPNote = async () => {
    if (!selectedPatient) {
      const proceed = confirm('No patient selected. Would you like to add a patient now?')
      if (proceed) {
        setIsPatientDialogOpen(true)
        return
      }
      return
    }

    setIsGenerating(true)
    try {
      const res = await fetch('/api/generate-soap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcript,
          patientId: selectedPatient?.id || null,
          consultationType,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setSoapNote(data.soapNote)

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user && selectedPatient) {
        if (consultationId) {
          await supabase
            .from('consultations')
            .update({
              status: 'completed',
              transcript: transcript,
              soap_note: data.soapNote,
              duration_seconds: duration,
              updated_at: new Date().toISOString(),
            })
            .eq('id', consultationId)
            .eq('user_id', user.id)
        } else {
          const { data: newConsultation } = await supabase
            .from('consultations')
            .insert({
              user_id: user.id,
              patient_id: selectedPatient.id,
              consultation_type: consultationType,
              status: 'completed',
              transcript: transcript,
              soap_note: data.soapNote,
              duration_seconds: duration,
            })
            .select()
            .single()

          if (newConsultation) {
            setConsultationId(newConsultation.id)
          }
        }
      }
    } catch (e) {
      console.error(e)
      alert((e as Error).message || 'Failed to generate SOAP note')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePatientAdded = (patient: Patient) => {
    setSelectedPatient(patient)
    setPatientName(patient.name)
    setPatients((prev) => {
      const exists = prev.find((p) => p.id === patient.id)
      if (exists) {
        return prev.map((p) => (p.id === patient.id ? patient : p))
      }
      return [...prev, patient]
    })
    setIsPatientDialogOpen(false)
  }

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div className='p-8'>
      {/* header */}
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <Input placeholder='Enter patient name' value={patientName} onChange={(e) => setPatientName(e.target.value)} className='mb-2' />
          <h1 className='text-3xl font-bold text-gray-900'>{patientName || 'New Consultation'}</h1>
          {selectedPatient && (
            <p className='mt-1 text-sm text-gray-500'>
              {selectedPatient.age} years old • {selectedPatient.gender || 'Not specified'}
            </p>
          )}
          {resumeConsultationId && <p className='mt-1 text-sm font-medium text-blue-600'>Resuming consultation...</p>}
        </div>

        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <Button variant={consultationType === 'in-person' ? 'default' : 'outline'} size='sm' onClick={() => setConsultationType('in-person')}>
              In Person
            </Button>
            <Button variant={consultationType === 'telehealth' ? 'default' : 'outline'} size='sm' onClick={() => setConsultationType('telehealth')}>
              Telehealth
            </Button>
          </div>

          <div className='flex items-center gap-2'>
            {!isRecording ? (
              <Button
                size='sm'
                onClick={startRecording}
                disabled={!deepgramToken}
                className='gap-2'
                title={!deepgramToken ? 'Waiting for Deepgram token...' : 'Start recording (patient optional)'}
              >
                <Mic className='h-4 w-4' />
                {!deepgramToken ? 'Loading...' : resumeConsultationId ? 'Resume' : 'Start'}
              </Button>
            ) : (
              <>
                <Button size='sm' variant='outline' onClick={pauseRecording} className='gap-2 bg-transparent'>
                  {isPaused ? <Play className='h-4 w-4' /> : <Pause className='h-4 w-4' />}
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button size='sm' variant='destructive' onClick={stopRecording} className='gap-2'>
                  <Square className='h-4 w-4' />
                  Stop
                </Button>
              </>
            )}
          </div>

          <div className='flex items-center gap-2 rounded-lg border bg-white px-4 py-2'>
            <Clock className='h-4 w-4 text-gray-500' />
            <span className='font-mono text-lg font-semibold'>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* patient selector */}
      <div className='mb-6 flex items-end gap-2'>
        <div className='flex-1'>
          <label className='mb-2 block text-sm font-medium text-gray-700'>Select Patient</label>
          <Select
            value={selectedPatient?.id || ''}
            onValueChange={(val) => {
              const patient = patients.find((p) => p.id === val)
              setSelectedPatient(patient || null)
            }}
          >
            <SelectTrigger className='w-full bg-white'>
              <SelectValue placeholder='Choose a patient...' />
            </SelectTrigger>
            <SelectContent>
              {patients.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} - {p.age} years old
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isPatientDialogOpen} onOpenChange={setIsPatientDialogOpen}>
          <DialogTrigger asChild>
            <Button variant='outline' className='gap-2 bg-transparent'>
              <UserPlus className='h-4 w-4' />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className='max-h-[90vh] w-[95vw] max-w-2xl overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
            </DialogHeader>
            <PatientForm onSuccess={handlePatientAdded} />
          </DialogContent>
        </Dialog>
      </div>

      {/* tabs */}
      <Tabs defaultValue='transcript' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='context'>Context</TabsTrigger>
          <TabsTrigger value='transcript'>Transcript</TabsTrigger>
          {soapNote && <TabsTrigger value='soap'>SOAP Note</TabsTrigger>}
          <TabsTrigger value='templates'>Templates</TabsTrigger>
        </TabsList>

        {/* context */}
        <TabsContent value='context' className='space-y-4'>
          <Card>
            <CardContent className='pt-6'>
              {selectedPatient ? (
                <div className='space-y-4'>
                  <div>
                    <h3 className='font-semibold text-gray-900'>Medical History</h3>
                    <p className='mt-1 text-sm text-gray-600'>{selectedPatient.medical_history || 'No medical history recorded'}</p>
                  </div>
                  <div>
                    <h3 className='font-semibold text-gray-900'>Allergies</h3>
                    <p className='mt-1 text-sm text-gray-600'>{selectedPatient.allergies || 'No known allergies'}</p>
                  </div>
                  <div>
                    <h3 className='font-semibold text-gray-900'>Current Medications</h3>
                    <p className='mt-1 text-sm text-gray-600'>{selectedPatient.current_medications || 'No current medications'}</p>
                  </div>
                </div>
              ) : (
                <div className='text-center'>
                  <p className='mb-4 text-gray-500'>No patient selected</p>
                  <Button variant='outline' onClick={() => setIsPatientDialogOpen(true)} className='gap-2'>
                    <UserPlus className='h-4 w-4' />
                    Add Patient
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* transcript */}
        <TabsContent value='transcript' className='space-y-4'>
          <Card>
            <CardContent className='pt-6'>
              <div className='min-h-[400px] whitespace-pre-wrap rounded-lg bg-gray-50 p-4 font-mono text-sm'>{transcript || 'Start recording to see the transcript...'}</div>
              {isFinal && <div className='mt-2 text-green-600'>Final transcript received.</div>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* soap */}
        {soapNote && (
          <TabsContent value='soap' className='space-y-4'>
            <Card>
              <CardContent className='pt-6'>
                <div className='space-y-6'>
                  <div>
                    <h3 className='mb-2 text-lg font-semibold text-gray-900'>Subjective</h3>
                    <p className='text-sm text-gray-700'>{soapNote.subjective}</p>
                  </div>
                  <div>
                    <h3 className='mb-2 text-lg font-semibold text-gray-900'>Objective</h3>
                    <p className='text-sm text-gray-700'>{soapNote.objective}</p>
                  </div>
                  <div>
                    <h3 className='mb-2 text-lg font-semibold text-gray-900'>Assessment</h3>
                    <p className='text-sm text-gray-700'>{soapNote.assessment}</p>
                  </div>
                  <div>
                    <h3 className='mb-2 text-lg font-semibold text-gray-900'>Plan</h3>
                    <p className='text-sm text-gray-700'>{soapNote.plan}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* templates */}
        <TabsContent value='templates' className='space-y-4'>
          {selectedPatient && transcript ? (
            <TemplateSelector
              patient={selectedPatient}
              transcript={transcript}
              diagnosis={soapNote?.assessment}
              doctorName='Dr. [Your Name]'
              clinicName='[Your Clinic]'
              consultationId={consultationId || undefined}
            />
          ) : (
            <Card>
              <CardContent className='pt-6 text-center'>
                {!selectedPatient ? (
                  <div>
                    <p className='mb-4 text-gray-500'>Please add a patient to generate templates</p>
                    <Button variant='outline' onClick={() => setIsPatientDialogOpen(true)} className='gap-2'>
                      <UserPlus className='h-4 w-4' />
                      Add Patient
                    </Button>
                  </div>
                ) : (
                  <p className='text-gray-500'>Record a consultation to generate templates</p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* generate / navigate */}
      {transcript && !soapNote && (
        <div className='mt-6 flex justify-end'>
          <Button size='lg' onClick={generateSOAPNote} disabled={isGenerating} className='gap-2'>
            <Wand2 className='h-5 w-5' />
            {isGenerating ? 'Generating...' : 'Generate SOAP Note'}
          </Button>
        </div>
      )}

      {soapNote && (
        <div className='mt-6 flex justify-end gap-2'>
          <Button variant='outline' onClick={() => router.push('/patients')}>
            Back to Patients
          </Button>
          <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
        </div>
      )}
    </div>
  )
}
