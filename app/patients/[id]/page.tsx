import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/sidebar"
import { PatientProfile } from "@/components/patient-profile"

export default async function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch patient data
  const { data: patient } = await supabase.from("patients").select("*").eq("id", id).eq("user_id", user.id).single()

  if (!patient) {
    redirect("/patients")
  }

  // Fetch consultations with templates
  const { data: consultations } = await supabase
    .from("consultations")
    .select("*, generated_templates:generated_templates(*)")
    .eq("patient_id", id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <PatientProfile patient={patient} consultations={consultations || []} />
      </main>
    </div>
  )
}
