// Keeps API key secure on the server

import { type NextRequest, NextResponse } from "next/server"

interface TextToSpeechRequest {
  text: string
  options?: {
    voice?: string
    encoding?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: TextToSpeechRequest = await request.json()
    const { text, options = {} } = body

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    const apiKey = process.env.DEEPGRAM_API_KEY

    if (!apiKey) {
      console.warn("Deepgram API key not configured, returning mock audio")
      return new NextResponse(new Blob(["mock audio"], { type: "audio/mp3" }), {
        headers: { "Content-Type": "audio/mp3" },
      })
    }

    const params = new URLSearchParams({
      text,
      voice: options.voice || "aura-asteria-en",
      encoding: options.encoding || "mp3",
    })

    const response = await fetch(`https://api.deepgram.com/v1/speak?${params}`, {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Deepgram API error: ${response.statusText}`)
    }

    const audioBlob = await response.blob()

    return new NextResponse(audioBlob, {
      headers: { "Content-Type": "audio/mp3" },
    })
  } catch (error) {
    console.error("Text-to-speech error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate speech" },
      { status: 500 },
    )
  }
}
