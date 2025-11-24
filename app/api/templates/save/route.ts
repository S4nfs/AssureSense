import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { consultationId, templateType, content } = await request.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Save generated template
    const { data: templateData, error: templateError } = await supabase
      .from("generated_templates")
      .insert({
        user_id: user.id,
        consultation_id: consultationId,
        template_type: templateType,
        content,
      })
      .select()
      .single()

    if (templateError) {
      console.error("Template save error:", templateError)
      return Response.json({ error: "Failed to save template" }, { status: 500 })
    }

    // Also update consultation with template data
    if (consultationId) {
      await supabase
        .from("consultations")
        .update({
          template_data: {
            [templateType]: content,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", consultationId)
        .eq("user_id", user.id)
    }

    return Response.json({ success: true, data: templateData })
  } catch (error) {
    console.error("Template save error:", error)
    return Response.json({ error: "Failed to save template" }, { status: 500 })
  }
}
