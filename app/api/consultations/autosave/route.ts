import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { consultationId, transcript, duration, status } = await request.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update existing consultation with incremental data
    const { data, error } = await supabase
      .from("consultations")
      .update({
        transcript,
        duration_seconds: duration,
        status: status || "in-progress",
        last_saved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", consultationId)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Autosave error:", error)
      return Response.json({ error: "Failed to autosave" }, { status: 500 })
    }

    return Response.json({ success: true, data })
  } catch (error) {
    console.error("Autosave error:", error)
    return Response.json({ error: "Failed to autosave" }, { status: 500 })
  }
}
