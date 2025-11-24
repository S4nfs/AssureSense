// deepgram-utils.ts
import { useRef, useState, useCallback } from 'react'
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk'

interface DeepgramConfig {
  model?: string
  language?: string
  punctuate?: boolean
  interimResults?: boolean
  endpointing?: number
  smartFormat?: boolean
}

interface DeepgramState {
  start: () => Promise<void>
  sendAudioChunk: (chunk: Blob) => void
  stop: () => void
  transcript: string
  isOpen: boolean
  error: string | null
}

// onTranscript now receives a richer payload: { utterances?, transcript?, isFinal, raw }
export function useDeepgramStreaming(
  apiKey: string | undefined,
  onTranscript: (payload: { utterances?: any[]; transcript?: string; isFinal: boolean; raw?: any }) => void,
  config: DeepgramConfig = {}
): DeepgramState {
  const dgConnRef = useRef<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transcript, setTranscript] = useState('')

  const { model = 'nova-3', language = 'en-US', punctuate = true, interimResults = true, endpointing = 500, smartFormat = true } = config

  const start = useCallback((): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      if (!apiKey) return reject(new Error('Deepgram API key is required'))
      try {
        setError(null)
        setTranscript('')

        const deepgram = createClient(apiKey)
        const connection = deepgram.listen.live({
          model,
          language,
          punctuate,
          interim_results: interimResults,
          endpointing,
          smart_format: smartFormat,
          encoding: 'opus',
          sample_rate: 48000,
          diarize: true,
        })

        dgConnRef.current = connection

        connection.on(LiveTranscriptionEvents.Open, () => {
          setIsOpen(true)
          resolve()
        })

        connection.on(LiveTranscriptionEvents.Close, (code: number, reason?: any) => {
          setIsOpen(false)
          if (code !== 1000) {
            const msg = `Connection closed: ${reason || 'Unknown reason'} (code ${code})`
            setError(msg)
            reject(new Error(msg))
          }
        })

        connection.on(LiveTranscriptionEvents.Error, (err: any) => {
          const message = (err as any)?.message || 'Deepgram connection error'
          setError(message)
          setIsOpen(false)
          reject(err)
        })

        connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
          const utterances = data?.utterances || data?.channel?.alternatives?.[0]?.utterances
          const text = data?.channel?.alternatives?.[0]?.transcript || ''
          const isFinal = !!(data?.is_final || data?.type === 'FinalTranscript')

          if (utterances && Array.isArray(utterances) && utterances.length > 0) {
            // If diarization is present, build a transcript string for internal state
            const formatted = utterances.map((u: any) => `[Speaker ${u.speaker}] ${u.text}`).join('\n')
            if (isFinal) {
              setTranscript((prev) => (prev ? `${prev}\n${formatted}` : formatted))
            } else {
              // interim: reflect last utterance as partial in the provided payload
              // still setTranscript conservatively only if desired; keep internal transcript unchanged for interim
            }
            try {
              onTranscript({ utterances, transcript: formatted, isFinal, raw: data })
            } catch (e) {
              /* ignore handler error */
            }
            return
          }

          if (text) {
            if (isFinal) setTranscript((prev) => `${prev} ${text}`.trim())
            try {
              onTranscript({ transcript: text, isFinal, raw: data })
            } catch (e) {
              /* ignore handler error */
            }
          }
        })
      } catch (err) {
        const message = (err as any)?.message || 'Failed to start Deepgram'
        setError(message)
        setIsOpen(false)
        reject(err)
      }
    })
  }, [apiKey, onTranscript, model, language, punctuate, interimResults, endpointing, smartFormat])

  // Chunk must be Blob (from MediaRecorder)
  const sendAudioChunk = useCallback((chunk: Blob) => {
    if (!dgConnRef.current || typeof dgConnRef.current.send !== 'function') {
      console.warn('No active Deepgram connection')
      return
    }
    // Prefer sending the original Blob through the SDK connection if it accepts it
    try {
      // Some SDK wrappers accept Blob directly (and handle framing/encoding)
      dgConnRef.current.send(chunk)
      return
    } catch (e) {
      // fall through to ArrayBuffer send
    }

    // Fallback: convert to ArrayBuffer and send raw bytes
    chunk.arrayBuffer().then((buf) => {
      try {
        dgConnRef.current.send(buf)
      } catch (err) {
        console.warn('Error sending audio chunk (ArrayBuffer fallback):', err)
      }
    })
  }, [])

  const stop = useCallback(() => {
    if (dgConnRef.current) {
      try {
        dgConnRef.current.send(JSON.stringify({ type: 'CloseStream' }))
      } catch {
        /* ignore */
      }
      setTimeout(() => {
        try {
          dgConnRef.current.close?.()
        } catch {
          /* ignore */
        }
        dgConnRef.current = null
        setIsOpen(false)
      }, 200)
    }
  }, [])

  return { start, sendAudioChunk, stop, transcript, isOpen, error }
}
