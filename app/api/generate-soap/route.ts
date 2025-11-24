import { generateText } from "ai"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { transcript, patientId, consultationType } = await request.json()

    if (!transcript) {
      return Response.json({ error: "Transcript is required" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch patient data for context
    let patientContext = ""
    if (patientId) {
      const { data: patient } = await supabase.from("patients").select("*").eq("id", patientId).single()

      if (patient) {
        patientContext = `
Patient Information:
- Name: ${patient.name}
- Age: ${patient.age || "Unknown"}
- Gender: ${patient.gender || "Unknown"}
- Medical History: ${patient.medical_history || "None recorded"}
- Allergies: ${patient.allergies || "None recorded"}
- Current Medications: ${patient.current_medications || "None recorded"}
`
      }
    }

    // Generate SOAP note using Gemini via Vercel AI SDK
    const { text } = await generateText({
      model: "google/gemini-2.5-flash-image",
      prompt: `You are a medical documentation assistant. Based on the following consultation transcript, generate a structured SOAP note (Subjective, Objective, Assessment, Plan).

${patientContext}

Consultation Type: ${consultationType}

Transcript:
${transcript}

Generate a SOAP note in the following JSON format:
{
  "subjective": "Patient's reported symptoms and concerns",
  "objective": "Observable findings and measurements",
  "assessment": "Medical assessment and diagnosis",
  "plan": "Treatment plan and follow-up recommendations"
}

Be concise, professional, and medically accurate. Only return the JSON object, no additional text.`,
    })

    // Parse the generated SOAP note
    let soapNote
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        soapNote = JSON.parse(jsonMatch[0])
      } else {
        // Fallback: create structured note from text
        soapNote = {
          subjective: text.split("Subjective:")[1]?.split("Objective:")[0]?.trim() || text,
          objective: text.split("Objective:")[1]?.split("Assessment:")[0]?.trim() || "",
          assessment: text.split("Assessment:")[1]?.split("Plan:")[0]?.trim() || "",
          plan: text.split("Plan:")[1]?.trim() || "",
        }
      }
    } catch (parseError) {
      console.error("Error parsing SOAP note:", parseError)
      // Fallback structure
      soapNote = {
        subjective: "Patient reported symptoms as documented in transcript",
        objective: "Physical examination findings as documented",
        assessment: "Clinical assessment based on consultation",
        plan: "Treatment plan and follow-up as discussed",
      }
    }

    return Response.json({ soapNote })
  } catch (error) {
    console.error("Error generating SOAP note:", error)
    return Response.json({ error: "Failed to generate SOAP note" }, { status: 500 })
  }
}
