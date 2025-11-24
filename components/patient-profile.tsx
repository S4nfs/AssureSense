"use client"

import { useState } from "react"
import type { Patient, Consultation } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getPatientAvatar, getInitials } from "@/lib/avatar-utils"
import { Calendar, Clock, FileText, Stethoscope, ArrowLeft, PlayCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface PatientProfileProps {
  patient: Patient
  consultations: (Consultation & { generated_templates?: any[] })[]
}

export function PatientProfile({ patient, consultations }: PatientProfileProps) {
  const router = useRouter()
  const [selectedConsultation, setSelectedConsultation] = useState<
    (Consultation & { generated_templates?: any[] }) | null
  >(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const handleResumeConsultation = (consultationId: string) => {
    router.push(`/consultation?patientId=${patient.id}&resumeId=${consultationId}`)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push("/patients")} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Patients
        </Button>

        <div className="flex items-start gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={getPatientAvatar(patient.id, patient.name) || "/placeholder.svg"} alt={patient.name} />
            <AvatarFallback className="text-2xl">{getInitials(patient.name)}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{patient.name}</h1>
              <Badge variant="secondary">Active</Badge>
            </div>
            <p className="mt-1 text-gray-500">
              Patient since{" "}
              {new Date(patient.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>

            <div className="mt-4 flex gap-6 text-sm">
              <div>
                <span className="text-gray-500">Age:</span>{" "}
                <span className="font-medium">{patient.age || "Not specified"} years old</span>
              </div>
              <div>
                <span className="text-gray-500">Gender:</span>{" "}
                <span className="font-medium">{patient.gender || "Not specified"}</span>
              </div>
              {patient.phone && (
                <div>
                  <span className="text-gray-500">Phone:</span> <span className="font-medium">{patient.phone}</span>
                </div>
              )}
              {patient.email && (
                <div>
                  <span className="text-gray-500">Email:</span> <span className="font-medium">{patient.email}</span>
                </div>
              )}
            </div>
          </div>

          <Button onClick={() => router.push(`/consultation?patientId=${patient.id}`)} className="gap-2">
            <Stethoscope className="h-4 w-4" />
            Start Consultation
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-blue-100 p-3">
              <Stethoscope className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{consultations.length}</p>
              <p className="text-sm text-gray-500">Total Consultations</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-green-100 p-3">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {consultations[0] ? formatDate(consultations[0].created_at).split(",")[0] : "N/A"}
              </p>
              <p className="text-sm text-gray-500">Last Visit</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-orange-100 p-3">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {consultations.reduce((acc, c) => acc + (c.generated_templates?.length || 0), 0)}
              </p>
              <p className="text-sm text-gray-500">Generated Documents</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="consultations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="consultations">Consultation History</TabsTrigger>
          <TabsTrigger value="medical-info">Medical Information</TabsTrigger>
        </TabsList>

        <TabsContent value="consultations" className="space-y-4">
          {consultations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No consultations yet. Start a consultation to begin.</p>
              </CardContent>
            </Card>
          ) : (
            consultations.map((consultation) => (
              <Card key={consultation.id} className="cursor-pointer transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {consultation.consultation_type === "in-person" ? "In-Person" : "Telehealth"} Consultation
                      </CardTitle>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(consultation.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDuration(consultation.duration_seconds)}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={consultation.status === "completed" ? "default" : "secondary"}
                      className={
                        consultation.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {consultation.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    {consultation.status === "in-progress" && (
                      <Button
                        variant="default"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleResumeConsultation(consultation.id)}
                      >
                        <PlayCircle className="h-4 w-4" />
                        Resume Consultation
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setSelectedConsultation(consultation)}>
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="medical-info">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Medical History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{patient.medical_history || "No medical history recorded"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Allergies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{patient.allergies || "No known allergies"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Medications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{patient.current_medications || "No current medications"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {patient.phone && (
                  <div>
                    <span className="font-medium">Phone:</span> {patient.phone}
                  </div>
                )}
                {patient.email && (
                  <div>
                    <span className="font-medium">Email:</span> {patient.email}
                  </div>
                )}
                {patient.address && (
                  <div>
                    <span className="font-medium">Address:</span> {patient.address}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Consultation Detail Dialog */}
      <Dialog open={!!selectedConsultation} onOpenChange={(open) => !open && setSelectedConsultation(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Consultation Details</DialogTitle>
          </DialogHeader>

          {selectedConsultation && (
            <div className="space-y-6">
              {/* Consultation Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 font-semibold text-gray-900">Date & Time</h3>
                  <p className="text-sm text-gray-700">{formatDate(selectedConsultation.created_at)}</p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-gray-900">Duration</h3>
                  <p className="text-sm text-gray-700">{formatDuration(selectedConsultation.duration_seconds)}</p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-gray-900">Type</h3>
                  <p className="text-sm text-gray-700">
                    {selectedConsultation.consultation_type === "in-person" ? "In-Person" : "Telehealth"}
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-gray-900">Status</h3>
                  <Badge
                    variant={selectedConsultation.status === "completed" ? "default" : "secondary"}
                    className={
                      selectedConsultation.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {selectedConsultation.status}
                  </Badge>
                </div>
              </div>

              {/* Transcript */}
              {selectedConsultation.transcript && (
                <div>
                  <h3 className="mb-2 font-semibold text-gray-900">Transcript</h3>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="whitespace-pre-wrap font-mono text-sm text-gray-700">
                      {selectedConsultation.transcript}
                    </p>
                  </div>
                </div>
              )}

              {/* SOAP Note */}
              {selectedConsultation.soap_note && (
                <div>
                  <h3 className="mb-4 font-semibold text-gray-900">SOAP Note</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="mb-1 font-medium text-gray-900">Subjective</h4>
                      <p className="text-sm text-gray-700">{selectedConsultation.soap_note.subjective}</p>
                    </div>
                    <div>
                      <h4 className="mb-1 font-medium text-gray-900">Objective</h4>
                      <p className="text-sm text-gray-700">{selectedConsultation.soap_note.objective}</p>
                    </div>
                    <div>
                      <h4 className="mb-1 font-medium text-gray-900">Assessment</h4>
                      <p className="text-sm text-gray-700">{selectedConsultation.soap_note.assessment}</p>
                    </div>
                    <div>
                      <h4 className="mb-1 font-medium text-gray-900">Plan</h4>
                      <p className="text-sm text-gray-700">{selectedConsultation.soap_note.plan}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Generated Templates */}
              {selectedConsultation.generated_templates && selectedConsultation.generated_templates.length > 0 && (
                <div>
                  <h3 className="mb-4 font-semibold text-gray-900">Generated Documents</h3>
                  <div className="space-y-3">
                    {selectedConsultation.generated_templates.map((template: any) => (
                      <Card key={template.id}>
                        <CardHeader>
                          <CardTitle className="text-base">
                            {template.template_type.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="whitespace-pre-wrap text-sm text-gray-700">{template.content}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
