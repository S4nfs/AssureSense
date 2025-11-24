import { embed } from 'ai'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { text, patientId, consultationId } = await request.json()

    if (!text || !patientId) {
      return Response.json({ error: 'Text and patientId are required' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate embeddings using Vercel AI SDK
    const { embedding } = await embed({
      model: 'google/text-embedding-004',
      value: text,
    })

    return Response.json({
      embedding,
      message: 'Embedding generated successfully',
    })
  } catch (error) {
    console.error('Error generating embedding:', error)
    return Response.json({ error: 'Failed to generate embedding' }, { status: 500 })
  }
}
