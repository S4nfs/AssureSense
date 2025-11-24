'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk'

export default function DeepgramMicTranscriber() {
  const router = useRouter()
  const [finalTranscript, setFinalTranscript] = useState('')
  const [partialTranscript, setPartialTranscript] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [deepgramToken, setDeepgramToken] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const connectionRef = useRef<any>(null)

  // Derived combined transcript for rendering
  const transcript = (finalTranscript + (partialTranscript ? ` ${partialTranscript}` : '')).trim()

  useEffect(() => {
    return () => {
      try {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop()
        }
      } catch (e) {
        // ignore
      }
      try {
        if (connectionRef.current) {
          if (typeof connectionRef.current.requestClose === 'function') connectionRef.current.requestClose()
          else if (typeof connectionRef.current.close === 'function') connectionRef.current.close()
        }
      } catch (e) {
        // ignore
      }
    }
  }, [])

  // Fetching here server-side token for Deepgram
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

    setFinalTranscript('')
    setPartialTranscript('')
    setIsRecording(true)

    if (!deepgramToken) {
      console.warn('Deepgram token not available yet')
      setIsRecording(false)
      return
    }

    const deepgram = createClient(deepgramToken as string)

    const connection = deepgram.listen.live({
      model: 'nova-3',
      language: 'en-US',
      smart_format: true,
      interim_results: true,
      punctuate: true,
      sample_rate: 48000,
    })

    connectionRef.current = connection

    connection.on(LiveTranscriptionEvents.Open, async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const options = { mimeType: 'audio/webm' }
        const mediaRecorder = new MediaRecorder(stream as MediaStream, options as MediaRecorderOptions)
        mediaRecorderRef.current = mediaRecorder

        mediaRecorder.addEventListener('dataavailable', (event: BlobEvent) => {
          if (event.data && event.data.size > 0) {
            // prefer SDK send wrapper when available
            try {
              if (typeof connection.send === 'function') {
                connection.send(event.data)
                return
              }
            } catch (e) {
              // fallthrough to raw ws send
            }

            // fallback: access underlying websocket if present
            try {
              const ws = (connection as any).conn
              if (ws && typeof ws.send === 'function') {
                ws.send(event.data)
              }
            } catch (e) {
              console.warn('Failed to send audio blob:', e)
            }
          }
        })

        mediaRecorder.start(250)
      } catch (err) {
        console.error('Could not start media recorder:', err)
      }
    })

    // transcript events -----interim v/s final
    connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
      try {
        const newText = data?.channel?.alternatives?.[0]?.transcript || data?.alternatives?.[0]?.transcript || ''
        const isFinal = !!(data?.is_final || data?.type === 'FinalTranscript')
        if (!newText) return
        if (isFinal) {
          setFinalTranscript((prev) => (prev ? `${prev} ${newText}` : newText))
          setPartialTranscript('')
        } else {
          setPartialTranscript(newText)
        }
      } catch (e) {
        console.debug('Transcript parse error', e)
      }
    })

    connection.on(LiveTranscriptionEvents.Error, (err: any) => {
      console.error('Deepgram error:', err)
    })

    connection.on(LiveTranscriptionEvents.Close, () => {
      console.log('Deepgram connection closed')
      setIsRecording(false)
    })
  }

  const stopRecording = () => {
    setIsRecording(false)
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') mediaRecorderRef.current.stop()
    } catch (e) {
      // ignore
    }
    if (connectionRef.current) {
      try {
        if (typeof connectionRef.current.requestClose === 'function') connectionRef.current.requestClose()
        else if (typeof connectionRef.current.close === 'function') connectionRef.current.close()
      } catch (e) {
        console.warn('Error closing Deepgram connection', e)
      }
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 900 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
          <button onClick={() => router.back()} style={{ padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>
            ← Back
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            borderRadius: 12,
            boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
            background: 'white',
          }}
        >
          <h1 style={{ margin: 0, marginBottom: 12 }}>Deepgram Live Transcriber (Debug)</h1>

          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!deepgramToken && !isRecording}
            title={!deepgramToken && !isRecording ? 'Waiting for token...' : undefined}
            style={{ padding: '10px 16px', marginTop: 8, borderRadius: 8, cursor: 'pointer' }}
          >
            {isRecording ? 'Stop Recording' : !deepgramToken ? 'Loading...' : 'Start Recording'}
          </button>

          <div style={{ marginTop: 20, whiteSpace: 'pre-wrap', width: '100%' }}>
            <h3 style={{ marginBottom: 8 }}>Transcript:</h3>
            <div
              style={{
                minHeight: 120,
                padding: 12,
                borderRadius: 8,
                border: '1px solid #e6e6e6',
                background: '#fafafa',
                textAlign: 'left',
                overflowWrap: 'break-word',
              }}
            >
              <p style={{ margin: 0 }}>{transcript || 'Start speaking to see transcription.'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
