import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/sidebar"
import { DictationInterface } from "@/components/dictation-interface"

export default async function NewDictationPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: patients } = await supabase
    .from("patients")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true })

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <DictationInterface allPatients={patients || []} />
      </main>
    </div>
  )
}
