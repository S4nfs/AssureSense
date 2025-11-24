'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wand2, Download, Copy, Check } from 'lucide-react'
import type { TemplateType } from '@/lib/types'
import type { Patient } from '@/lib/types'

const TEMPLATES: { value: TemplateType; label: string; description: string }[] = [
  {
    value: 'medical-certificate',
    label: 'Medical Certificate',
    description: 'Official medical certificate for work/school',
  },
  {
    value: 'patient-friendly-summary',
    label: 'Patient Friendly Summary',
    description: 'Easy-to-understand summary for patient',
  },
  {
    value: 'mental-health-plan',
    label: 'Mental Health Plan',
    description: 'Comprehensive mental health treatment plan',
  },
  { value: 'referral-letter', label: 'Referral Letter', description: 'Letter to refer patient to specialist' },
  { value: 'free-form-letter', label: 'Free Form Letter', description: 'General clinical correspondence' },
  { value: 'issues-list', label: 'Issues List', description: 'Structured list of health issues' },
  { value: 'smart-goals', label: 'SMART Goals', description: 'Specific, measurable health goals' },
  {
    value: 'mental-health-consult',
    label: 'Mental Health Consult',
    description: 'Detailed mental health consultation note',
  },
  { value: 'carers-certificate', label: 'Carers Certificate', description: 'Certificate for caregivers' },
  {
    value: 'letter-to-referring-doctor',
    label: 'Letter to Referring Doctor',
    description: 'Follow-up letter to referring physician',
  },
  { value: 'soap-notes', label: 'SOAP Notes', description: 'Subjective, Objective, Assessment, Plan notes' },
]

interface TemplateSelectorProps {
  patient: Patient | null
  transcript: string
  diagnosis?: string
  doctorName?: string
  clinicName?: string
  consultationId?: string // Add consultationId prop to link templates to consultations
}

export function TemplateSelector({ patient, transcript, diagnosis, doctorName, clinicName, consultationId }: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isSaved, setIsSaved] = useState(false) // Track if template is saved

  const handleGenerateTemplate = async () => {
    if (!selectedTemplate || !patient) {
      setError('Please select a template and patient')
      return
    }

    setIsGenerating(true)
    setError('')
    setIsSaved(false) // Reset saved state

    try {
      const response = await fetch('/api/generate-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateType: selectedTemplate,
          patientName: patient.name,
          patientAge: patient.age,
          patientGender: patient.gender,
          consultationNotes: transcript,
          diagnosis,
          medications: patient.current_medications,
          allergies: patient.allergies,
          medicalHistory: patient.medical_history,
          doctorName,
          clinicName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate template')
      }

      setGeneratedContent(data.content)

      if (consultationId) {
        try {
          const saveResponse = await fetch('/api/templates/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              consultationId,
              templateType: selectedTemplate,
              content: data.content,
            }),
          })

          if (saveResponse.ok) {
            setIsSaved(true)
            console.log('S4nfs: Template saved to database')
          }
        } catch (saveError) {
          console.error('S4nfs: Failed to save template:', saveError)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate template')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent)
  }

  const handleDownload = () => {
    const element = document.createElement('a')
    const file = new Blob([generatedContent], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${selectedTemplate || 'document'}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle>Generate Clinical Document</CardTitle>
          <CardDescription>Select a template to generate a professional clinical document</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <label className='mb-2 block text-sm font-medium'>Select Template</label>
            <Select value={selectedTemplate || ''} onValueChange={(value) => setSelectedTemplate(value as TemplateType)}>
              <SelectTrigger>
                <SelectValue placeholder='Choose a template...' />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATES.map((template) => (
                  <SelectItem key={template.value} value={template.value}>
                    <div>
                      <div className='font-medium'>{template.label}</div>
                      <div className='text-xs text-gray-500'>{template.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <div className='rounded-md bg-destructive/10 p-3 text-sm text-destructive'>{error}</div>}

          {isSaved && (
            <div className='flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-700'>
              <Check className='h-4 w-4' />
              Template saved to consultation record
            </div>
          )}

          <Button onClick={handleGenerateTemplate} disabled={isGenerating || !selectedTemplate} className='w-full gap-2'>
            <Wand2 className='h-4 w-4' />
            {isGenerating ? 'Generating...' : 'Generate Document'}
          </Button>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Document</CardTitle>
            <div className='flex gap-2'>
              <Button size='sm' variant='outline' onClick={handleCopyToClipboard} className='gap-2 bg-transparent'>
                <Copy className='h-4 w-4' />
                Copy
              </Button>
              <Button size='sm' variant='outline' onClick={handleDownload} className='gap-2 bg-transparent'>
                <Download className='h-4 w-4' />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className='max-h-96 overflow-y-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-4 font-mono text-sm'>{generatedContent}</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
