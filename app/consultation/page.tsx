import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/sidebar"
import { ConsultationInterface } from "@/components/consultation-interface"

export default async function ConsultationPage({
  searchParams,
}: {
  searchParams: { patientId?: string; resumeId?: string }
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch all patients
  const { data: patients } = await supabase.from("patients").select("*").eq("user_id", user.id).order("name")

  // Get initial patient if specified
  let initialPatient = null
  if (searchParams.patientId) {
    const { data } = await supabase
      .from("patients")
      .select("*")
      .eq("id", searchParams.patientId)
      .eq("user_id", user.id)
      .single()
    initialPatient = data
  }

  let resumeData = null
  if (searchParams.resumeId) {
    const { data } = await supabase
      .from("consultations")
      .select("*")
      .eq("id", searchParams.resumeId)
      .eq("user_id", user.id)
      .single()

    if (data) {
      resumeData = {
        consultationId: data.id,
        transcript: data.transcript || "",
        duration: data.duration_seconds || 0,
      }
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <ConsultationInterface
          initialPatient={initialPatient}
          allPatients={patients || []}
          resumeConsultationId={resumeData?.consultationId}
          resumeTranscript={resumeData?.transcript}
          resumeDuration={resumeData?.duration}
        />
      </main>
    </div>
  )
}
