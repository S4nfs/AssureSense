export interface Patient {
  id: string
  user_id: string
  name: string
  age?: number
  date_of_birth?: string
  gender?: string
  phone?: string
  email?: string
  address?: string
  medical_history?: string
  allergies?: string
  current_medications?: string
  created_at: string
  updated_at: string
}

export interface Consultation {
  id: string
  user_id: string
  patient_id: string
  consultation_type: "in-person" | "telehealth"
  status: "in-progress" | "completed" | "cancelled"
  transcript?: string
  soap_note?: {
    subjective?: string
    objective?: string
    assessment?: string
    plan?: string
  }
  duration_seconds: number
  created_at: string
  updated_at: string
  patient?: Patient
  last_saved_at?: string // Add last_saved_at field
  template_data?: Record<string, any> // Add template_data field
  attachments?: any[] // Add attachments field
}

export interface Dictation {
  id: string
  user_id: string
  patient_id?: string
  title?: string
  transcript?: string
  audio_url?: string
  duration_seconds: number
  created_at: string
  updated_at: string
  patient?: Patient
}

export interface Profile {
  id: string
  email: string
  full_name?: string
  role: string
  created_at: string
  updated_at: string
}

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

export interface GeneratedTemplate {
  id: string
  user_id: string
  consultation_id?: string
  template_type: TemplateType
  content: string
  created_at: string
  updated_at: string
}
