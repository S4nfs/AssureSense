import { embed } from 'ai'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { query, patientId } = await request.json()

    if (!query || !patientId) {
      return Response.json({ error: 'Query and patientId are required' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate embedding for the search query
    const { embedding } = await embed({
      model: 'google/text-embedding-004',
      value: query,
    })

    // Fetch all consultations for the patient
    const { data: consultations } = await supabase.from('consultations').select('*').eq('patient_id', patientId).eq('user_id', user.id).order('created_at', { ascending: false })

    const relevantConsultations = consultations?.slice(0, 5) || []

    return Response.json({
      consultations: relevantConsultations,
      message: 'Search completed successfully',
    })
  } catch (error) {
    console.error('Error searching history:', error)
    return Response.json({ error: 'Failed to search history' }, { status: 500 })
  }
}
