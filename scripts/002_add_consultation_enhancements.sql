-- Add columns for incremental saving and template storage
ALTER TABLE public.consultations
ADD COLUMN IF NOT EXISTS template_data JSONB,
ADD COLUMN IF NOT EXISTS last_saved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- Add is_final column to dictations if not exists
ALTER TABLE public.dictations
ADD COLUMN IF NOT EXISTS is_final BOOLEAN DEFAULT false;

-- Create table for storing generated templates
CREATE TABLE IF NOT EXISTS public.generated_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for generated_templates
ALTER TABLE public.generated_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for generated_templates
CREATE POLICY "Users can view their own templates" ON public.generated_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates" ON public.generated_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" ON public.generated_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" ON public.generated_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster consultation lookups
CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON public.consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON public.consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_templates_consultation_id ON public.generated_templates(consultation_id);
