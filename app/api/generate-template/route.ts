import { generateText } from "ai"
import { createClient } from "@/lib/supabase/server"
import type { TemplateType } from "@/lib/types"

const templatePrompts: Record<TemplateType, string> = {
  "medical-certificate": `Generate a professional medical certificate based on the provided consultation notes. Include:
- Patient details
- Diagnosis
- Recommended rest period
- Any restrictions
- Doctor's signature line
Format it as an official medical document.`,

  "patient-friendly-summary": `Create a patient-friendly summary of the consultation. Use simple language, avoid medical jargon, and include:
- What was discussed
- Key findings
- Recommended treatments
- Follow-up instructions
Make it easy for the patient to understand.`,

  "mental-health-plan": `Generate a comprehensive mental health treatment plan including:
- Current mental health status
- Identified issues
- Treatment goals
- Therapeutic interventions
- Medication recommendations if applicable
- Follow-up schedule
- Crisis resources`,

  "referral-letter": `Create a professional referral letter to a specialist including:
- Patient demographics
- Reason for referral
- Relevant medical history
- Current medications
- Specific questions for the specialist
- Urgency level`,

  "free-form-letter": `Generate a professional clinical letter based on the consultation notes. Include all relevant clinical information in a narrative format suitable for correspondence.`,

  "issues-list": `Create a structured list of identified health issues from the consultation, organized by:
- Active problems
- Chronic conditions
- Recent concerns
- Risk factors
Each with brief descriptions and status.`,

  "smart-goals": `Generate SMART (Specific, Measurable, Achievable, Relevant, Time-bound) health goals based on the consultation. Include:
- 3-5 specific health goals
- Measurable outcomes
- Timeline for achievement
- Action steps for each goal`,

  "mental-health-consult": `Create a detailed mental health consultation note including:
- Chief complaint
- History of present illness
- Mental status examination
- Assessment and diagnosis
- Treatment plan
- Medications
- Follow-up recommendations`,

  "carers-certificate": `Generate a carer's certificate or support letter including:
- Patient information
- Carer details
- Duration of care needed
- Type of care required
- Any special considerations
- Doctor's recommendation`,

  "letter-to-referring-doctor": `Create a professional letter to the referring doctor including:
- Consultation summary
- Findings and diagnosis
- Treatment provided
- Recommendations
- Follow-up plan
- Any urgent concerns`,

  "soap-notes": `Generate comprehensive SOAP notes (Subjective, Objective, Assessment, Plan) including:
- Subjective: Patient's symptoms and history
- Objective: Examination findings and vital signs
- Assessment: Clinical impression and diagnosis
- Plan: Treatment and follow-up strategy`,
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      templateType,
      patientName,
      patientAge,
      patientGender,
      consultationNotes,
      diagnosis,
      medications,
      allergies,
      medicalHistory,
      doctorName,
      clinicName,
      consultationId,
    } = body

    if (!templateType || !patientName || !consultationNotes) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const contextString = `
Patient Information:
- Name: ${patientName}
- Age: ${patientAge || "Unknown"}
- Gender: ${patientGender || "Not specified"}
- Allergies: ${allergies || "None documented"}
- Medical History: ${medicalHistory || "Not provided"}
- Current Medications: ${medications || "None"}

Consultation Notes:
${consultationNotes}

${diagnosis ? `Diagnosis: ${diagnosis}` : ""}
${doctorName ? `Doctor: ${doctorName}` : ""}
${clinicName ? `Clinic: ${clinicName}` : ""}
    `

    const prompt = `You are a professional medical documentation assistant. Generate accurate, professional clinical documents based on the provided information. 
Ensure all documents are compliant with medical documentation standards and include appropriate clinical detail.

${templatePrompts[templateType as TemplateType]}

Context:
${contextString}

Generate the document content now. Be professional, accurate, and thorough.`

    const { text: content } = await generateText({
      model: "google/gemini-2.5-flash-image",
      prompt,
    })

    const insertData: any = {
      user_id: user.id,
      template_type: templateType,
      content,
    }

    if (consultationId) {
      insertData.consultation_id = consultationId
    }

    const { data, error } = await supabase.from("generated_templates").insert(insertData).select()

    if (error) {
      console.error("Database error:", error)
      throw error
    }

    return Response.json({
      success: true,
      template: data?.[0],
      content,
    })
  } catch (error) {
    console.error("Template generation error:", error)
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate template",
      },
      { status: 500 },
    )
  }
}
