# Assure Sense - AI-Powered Clinical Documentation Platform

## Overview

Assure Sense is a comprehensive clinical documentation system that combines speech recognition, AI-powered template generation, and secure patient management to streamline medical documentation workflows.

## Key Features

### 1. Speech Recognition & Transcription

- **Deepgram Integration**: Real-time speech-to-text transcription with high accuracy
- **Multi-language Support**: Supports multiple languages and medical terminology
- **Speaker Identification**: Automatic speaker labeling in consultations
- **Text-to-Speech**: Convert clinical notes to audio for review

### 2. AI-Powered Template Generation

- **LangChain JS Integration**: Uses LangChain JS for intelligent document generation
- **Gemini Model**: Free tier Google Gemini model for content generation
- **11 Document Types**:
  - Medical Certificate
  - Patient Friendly Summary
  - Mental Health Plan
  - Referral Letter
  - Free Form Letter
  - Issues List
  - SMART Goals
  - Mental Health Consult
  - Carers Certificate
  - Letter to Referring Doctor
  - SOAP Notes

### 3. Patient Management

- Complete patient database with medical history
- Allergy tracking and medication management
- Patient search and filtering
- Secure patient records with Row Level Security

### 4. Consultation Interface

- Real-time audio recording with pause/resume
- Live transcription display
- Patient context viewing
- Automatic SOAP note generation
- Template selection and generation
- Timer and consultation type tracking (in-person/telehealth)

### 5. Workflow Visualization

- Interactive SVG workflow diagram
- Shows complete clinical documentation process
- Highlights AI-powered steps
- Available at `/workflow` route

### 6. Security & Compliance

- Supabase database with Row Level Security (RLS)
- Email/password authentication
- User-specific data isolation
- HIPAA-ready architecture

## Technology Stack

### Frontend

- **Framework**: Next.js 16 with TypeScript
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS v4
- **State Management**: React hooks with SWR
- **Speech APIs**: Deepgram SDK

### Backend

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI/ML**:
  - LangChain JS for orchestration
  - Google Gemini API (free tier)
  - Deepgram API for speech services
- **Python Backend**: FastAPI for additional processing

### External APIs

- **Deepgram**: Speech-to-text, text-to-speech, voice agent
- **Google Generative AI**: Gemini model for template generation
- **DiceBear**: Avatar generation for user profiles

## API Endpoints

### Template Generation

\`\`\`
POST /api/generate-template
Body: {
templateType: TemplateType,
patientName: string,
patientAge: number,
patientGender: string,
consultationNotes: string,
diagnosis?: string,
medications?: string,
allergies?: string,
medicalHistory?: string,
doctorName?: string,
clinicName?: string
}
\`\`\`

### SOAP Note Generation

\`\`\`
POST /api/generate-soap
Body: {
transcript: string,
patientId: string,
consultationType: "in-person" | "telehealth"
}
\`\`\`

## Environment Variables Required

\`\`\`

# Supabase

SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=

# Deepgram (Server-side only)

DEEPGRAM_API_KEY=

# Google Generative AI (Server-side only)

GOOGLE_GENERATIVE_AI_API_KEY=

# Python Backend (Optional)

PYTHON_BACKEND_URL=http://localhost:8000
\`\`\`

## Getting Started

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env.local`
4. Run database migrations: `npm run db:migrate`
5. Start development server: `npm run dev`

### First Steps

1. Sign up for an account at `/auth/sign-up`
2. Create a patient record in the Patients section
3. Start a new consultation
4. Record audio or paste transcript
5. Generate SOAP notes and clinical documents
6. Export documents as PDF or TXT

## Workflow

\`\`\`

1. Clinician starts consultation
   ↓
2. Selects patient from database
   ↓
3. Records audio (Deepgram STT)
   ↓
4. Real-time transcription appears
   ↓
5. Reviews and edits transcript
   ↓
6. Generates SOAP notes (AI)
   ↓
7. Selects document template
   ↓
8. AI generates clinical document (Gemini + LangChain)
   ↓
9. Reviews and exports document
   ↓
10. Saves to patient record
    \`\`\`

## Features in Detail

### Deepgram Integration

- Speech-to-text with medical terminology support
- Real-time streaming transcription
- Automatic punctuation and capitalization
- Speaker identification for multi-party conversations
- Text-to-speech for document review

### LangChain JS + Gemini

- Context-aware document generation
- Professional medical formatting
- Compliance with clinical documentation standards
- Support for 11 different document types
- Customizable templates

### Template Types

#### Medical Certificate

- Official medical certificate for work/school
- Includes diagnosis, rest period, restrictions
- Professional formatting

#### Patient Friendly Summary

- Simplified language for patient understanding
- Avoids medical jargon
- Includes key findings and follow-up instructions

#### Mental Health Plan

- Comprehensive treatment plan
- Therapeutic interventions
- Medication recommendations
- Crisis resources

#### Referral Letter

- Professional referral to specialist
- Relevant medical history
- Specific questions for specialist

#### SOAP Notes

- Subjective: Patient symptoms and history
- Objective: Examination findings
- Assessment: Clinical impression
- Plan: Treatment strategy

#### And 6 More...

- Free Form Letter
- Issues List
- SMART Goals
- Mental Health Consult
- Carers Certificate
- Letter to Referring Doctor

## Security Considerations

- All patient data is encrypted at rest
- Row Level Security (RLS) ensures users only access their own data
- Authentication via Supabase Auth
- HIPAA-compliant architecture
- Regular security audits recommended

## Future Enhancements

- Voice agent for interactive consultations
- Multi-language support for templates
- Custom template builder
- Integration with EHR systems
- Advanced analytics and reporting
- Mobile app support
- Video consultation recording

## Support

For issues or feature requests, please contact support or open an issue in the repository.

## License

MIT
