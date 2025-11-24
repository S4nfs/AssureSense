import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { patientId, consultationType } = await request.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!patientId) {
      return Response.json({ error: "Patient ID is required" }, { status: 400 })
    }

    // Create a new consultation in draft mode
    const { data, error } = await supabase
      .from("consultations")
      .insert({
        user_id: user.id,
        patient_id: patientId,
        consultation_type: consultationType || "in-person",
        status: "in-progress",
        transcript: "",
        duration_seconds: 0,
        last_saved_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Create consultation error:", error)
      return Response.json({ error: "Failed to create consultation" }, { status: 500 })
    }

    return Response.json({ success: true, data })
  } catch (error) {
    console.error("Create consultation error:", error)
    return Response.json({ error: "Failed to create consultation" }, { status: 500 })
  }
}
