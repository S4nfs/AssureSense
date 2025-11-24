import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/sidebar'
import { ConsultationInterface } from '@/components/consultation-interface'

export default async function NewConsultationPage({ searchParams }: { searchParams: Promise<{ patientId?: string }> }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const params = await searchParams
  const patientId = params.patientId

  let patient = null
  if (patientId) {
    const { data } = await supabase.from('patients').select('*').eq('id', patientId).single()
    patient = data
  }

  const { data: patients } = await supabase.from('patients').select('*').eq('user_id', user.id).order('name', { ascending: true })

  return (
    <div className='flex h-screen'>
      <Sidebar />
      <main className='flex-1 overflow-y-auto bg-gray-50'>
        <ConsultationInterface initialPatient={patient} allPatients={patients || []} />
      </main>
    </div>
  )
}
