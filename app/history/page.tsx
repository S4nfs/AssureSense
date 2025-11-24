import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/sidebar"
import { HistoryList } from "@/components/history-list"

export default async function HistoryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: consultations } = await supabase
    .from("consultations")
    .select("*, patient:patients(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const { data: dictations } = await supabase
    .from("dictations")
    .select("*, patient:patients(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <HistoryList consultations={consultations || []} dictations={dictations || []} />
      </main>
    </div>
  )
}
