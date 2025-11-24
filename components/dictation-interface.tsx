'use client'

import { useState, useRef, useEffect } from 'react'
import type { Patient } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Mic, Square, Play, Pause, Save, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'
import { useDeepgramStreaming } from '@/lib/deepgram-utils'

interface DictationInterfaceProps {
  allPatients: Patient[]
}

export function DictationInterface({ allPatients }: DictationInterfaceProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [title, setTitle] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [isSaving, setIsSaving] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const router = useRouter()

  const [finalUtterances, setFinalUtterances] = useState<Array<{ speaker: number; text: string }>>([])
  const [partialUtterance, setPartialUtterance] = useState<{ speaker: number; text: string } | null>(null)
  const [isFinal, setIsFinal] = useState(false)
  const [deepgramError, setDeepgramError] = useState<string | null>(null)
  const [deepgramToken, setDeepgramToken] = useState<string | null>(null)

  const { start, sendAudioChunk, stop, transcript, isOpen, error } = useDeepgramStreaming(deepgramToken || '', (payload) => {
    // payload: { utterances?, transcript?, isFinal, raw }
    try {
      if (payload?.utterances && Array.isArray(payload.utterances) && payload.utterances.length > 0) {
        if (payload.isFinal) {
          // convert incoming utterances into structured form and append
          const newUtterances = payload.utterances.map((u: any) => ({ speaker: u.speaker ?? 0, text: u.text ?? '' }))
          setFinalUtterances((prev) => (prev ? [...prev, ...newUtterances] : [...newUtterances]))
          setPartialUtterance(null)
          setIsFinal(true)
        } else {
          // show last utterance as the partial interim
          const last = payload.utterances[payload.utterances.length - 1]
          if (last && last.text) setPartialUtterance({ speaker: last.speaker ?? 0, text: last.text })
        }
      } else if (payload?.transcript) {
        if (payload.isFinal) {
          const txt = payload.transcript ?? ''
          // store as speaker 0 (unknown) when diarization not present
          setFinalUtterances((prev) => (prev ? [...prev, { speaker: 0, text: txt }] : [{ speaker: 0, text: txt }]))
          setPartialUtterance(null)
          setIsFinal(true)
        } else {
          setPartialUtterance({ speaker: 0, text: payload.transcript })
        }
      }
    } catch (e) {
      console.debug('Transcript handler error', e)
    }
  })

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

  useEffect(() => {
    if (error) setDeepgramError(error)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (mediaRecorderRef.current) mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop())
    }
  }, [error])

  const startRecording = async () => {
    try {
      if (!deepgramToken) {
        alert('Waiting for Deepgram token — please try again in a moment.')
        return
      }
      await start() // open Deepgram socket first
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) sendAudioChunk(ev.data)
      }

      // wait until socket is open before recording
      const poll = () => {
        if (isOpen) {
          recorder.start(100)
          setIsRecording(true)
          setIsPaused(false)
          setDuration(0)
          timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000)
        } else {
          setTimeout(poll, 100)
        }
      }
      poll()
    } catch (err) {
      console.error(err)
      alert('Could not access microphone')
    }
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

    rec.ondataavailable = (ev) => {
      if (ev.data.size) sendAudioChunk(ev.data)
    }

    rec.onstop = () => {
      setTimeout(() => stop(), 300) // flush then finish
    }

    rec.stop()
    rec.stream.getTracks().forEach((t) => t.stop())
    setIsRecording(false)
    setIsPaused(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const saveDictation = async () => {
    if (!selectedPatient && !title) {
      alert('Please provide either a patient or a title for the dictation.')
      return
    }
    setIsSaving(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')
      const assembled = (() => {
        const finalText = finalUtterances.map((u) => `[Speaker ${u.speaker}] ${u.text}`).join('\n')
        const partialText = partialUtterance ? `[Speaker ${partialUtterance.speaker}] ${partialUtterance.text}` : ''
        if (finalText && partialText) return `${finalText}\n${partialText}`
        return finalText || partialText || ''
      })()
      await supabase.from('dictations').insert({
        user_id: user.id,
        patient_id: selectedPatient?.id || null,
        title: title || 'Untitled Dictation',
        transcript: assembled,
        duration_seconds: duration,
        is_final: isFinal,
      })
      router.push('/history')
    } catch (err) {
      console.error(err)
      alert('Failed to save dictation. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div className='p-8'>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-3xl font-bold text-gray-900'>New Dictation</h1>

        <div className='flex items-center gap-3'>
          {/* recording controls in top-right for mobile friendliness */}
          <div className='flex items-center gap-2'>
            {!isRecording ? (
              <Button size='sm' onClick={startRecording} disabled={!deepgramToken} className='gap-2' title={!deepgramToken ? 'Waiting for Deepgram token...' : undefined}>
                <Mic className='h-4 w-4' />
                {!deepgramToken ? 'Loading...' : 'Start'}
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

      <div className='mb-6 grid gap-4 md:grid-cols-2'>
        <div>
          <Label htmlFor='title'>Title</Label>
          <Input id='title' placeholder='Enter dictation title...' value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <Label htmlFor='patient'>Patient (Optional)</Label>
          <Select value={selectedPatient?.id || 'none'} onValueChange={(val) => setSelectedPatient(val === 'none' ? null : allPatients.find((p) => p.id === val) || null)}>
            <SelectTrigger className='bg-white'>
              <SelectValue placeholder='Select patient (optional)' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='none'>No patient</SelectItem>
              {allPatients.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <Label className='mb-2 block'>Transcript</Label>
          <Textarea
            className='min-h-[400px] font-mono text-sm'
            placeholder='Start recording to see the transcript...'
            value={(() => {
              const finalText = finalUtterances.map((u) => `[Speaker ${u.speaker}] ${u.text}`).join('\n')
              const partialText = partialUtterance ? `[Speaker ${partialUtterance.speaker}] ${partialUtterance.text}` : ''
              if (finalText && partialText) return `${finalText}\n${partialText}`
              return finalText || partialText || ''
            })()}
            readOnly
          />
          {deepgramError && <div className='mt-2 text-red-500'>Deepgram error: {deepgramError}</div>}
          {isFinal && <div className='mt-2 text-green-600'>Final transcript received.</div>}
        </CardContent>
      </Card>

      <div className='mt-6 flex items-center justify-end gap-4'>
        {(finalUtterances.length > 0 || partialUtterance) && (
          <Button size='lg' onClick={saveDictation} disabled={isSaving} className='gap-2'>
            <Save className='h-5 w-5' />
            {isSaving ? 'Saving...' : 'Save Dictation'}
          </Button>
        )}
      </div>
    </div>
  )
}
