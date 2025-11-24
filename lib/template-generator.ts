export type TemplateType =
  | "medical-certificate"
  | "patient-friendly-summary"
  | "mental-health-plan"
  | "referral-letter"
  | "free-form-letter"
  | "issues-list"
  | "smart-goals"
  | "mental-health-consult"
  | "carers-certificate"
  | "letter-to-referring-doctor"
  | "soap-notes"

export interface TemplateContext {
  patientName: string
  patientAge: number
  patientGender: string
  consultationNotes: string
  diagnosis?: string
  medications?: string
  allergies?: string
  medicalHistory?: string
  doctorName?: string
  clinicName?: string
}

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

/**
 * Client-side wrapper to call server API for template generation
 * All actual template generation happens server-side with secure API keys
 */
export async function generateTemplate(templateType: TemplateType, context: TemplateContext): Promise<string> {
  try {
    const response = await fetch("/api/generate-template", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateType,
        patientName: context.patientName,
        patientAge: context.patientAge,
        patientGender: context.patientGender,
        consultationNotes: context.consultationNotes,
        diagnosis: context.diagnosis,
        medications: context.medications,
        allergies: context.allergies,
        medicalHistory: context.medicalHistory,
        doctorName: context.doctorName,
        clinicName: context.clinicName,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to generate template")
    }

    const data = await response.json()
    return data.content
  } catch (error) {
    console.error("Template generation error:", error)
    throw error
  }
}

/**
 * Generate multiple templates at once
 */
export async function generateMultipleTemplates(
  templateTypes: TemplateType[],
  context: TemplateContext,
): Promise<Record<TemplateType, string>> {
  const results: Record<TemplateType, string> = {} as Record<TemplateType, string>

  for (const templateType of templateTypes) {
    try {
      results[templateType] = await generateTemplate(templateType, context)
    } catch (error) {
      console.error(`Error generating ${templateType}:`, error)
      results[templateType] = `Error generating ${templateType}`
    }
  }

  return results
}
