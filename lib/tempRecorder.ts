import { useEffect, useRef, useState } from 'react'

export function useTempRecorder() {
  // Keeping the last recording for debug purpose
  const [blob, setBlob] = useState<Blob | null>(null)
  const [url, setUrl] = useState<string | null>(null)
  const urlRef = useRef<string | null>(null)

  const save = (b: Blob) => {
    if (urlRef.current) {
      try {
        URL.revokeObjectURL(urlRef.current)
      } catch {}
    }
    const objectUrl = URL.createObjectURL(b)
    urlRef.current = objectUrl
    setBlob(b)
    setUrl(objectUrl)
  }

  const clear = () => {
    if (urlRef.current) {
      try {
        URL.revokeObjectURL(urlRef.current)
      } catch {}
    }
    urlRef.current = null
    setBlob(null)
    setUrl(null)
  }

  useEffect(() => {
    return () => {
      if (urlRef.current) {
        try {
          URL.revokeObjectURL(urlRef.current)
        } catch {}
      }
    }
  }, [])

  return { blob, url, save, clear }
}
