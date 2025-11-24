import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/sidebar"
import { DashboardContent } from "@/components/dashboard-content"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch statistics
  const { data: consultations } = await supabase
    .from("consultations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const { data: dictations } = await supabase
    .from("dictations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const { data: patients } = await supabase.from("patients").select("*").eq("user_id", user.id)

  // Calculate hours saved (assuming 15 minutes saved per consultation/dictation)
  const totalActivities = (consultations?.length || 0) + (dictations?.length || 0)
  const hoursSaved = (totalActivities * 15) / 60

  // Get recent activity
  const recentConsultations =
    consultations?.slice(0, 5).map((c) => ({
      ...c,
      type: "consultation" as const,
    })) || []

  const recentDictations =
    dictations?.slice(0, 5).map((d) => ({
      ...d,
      type: "dictation" as const,
    })) || []

  const recentActivity = [...recentConsultations, ...recentDictations]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <DashboardContent
          profile={profile}
          stats={{
            consultations: consultations?.length || 0,
            dictations: dictations?.length || 0,
            hoursSaved: Number(hoursSaved.toFixed(2)),
            activeUsers: 1,
          }}
          recentActivity={recentActivity}
          patients={patients || []}
        />
      </main>
    </div>
  )
}
