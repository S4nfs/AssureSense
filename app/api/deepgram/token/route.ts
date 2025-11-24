import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.DEEPGRAM_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Deepgram API key not configured." }, { status: 500 })
    }
    return NextResponse.json({ token: apiKey })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
