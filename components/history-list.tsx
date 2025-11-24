"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Search, Eye, PlayCircle } from "lucide-react"
import type { Consultation, Dictation } from "@/lib/types"
import { useRouter } from "next/navigation"

interface HistoryListProps {
  consultations: Consultation[]
  dictations: Dictation[]
}

export function HistoryList({ consultations, dictations }: HistoryListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

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

  const filteredConsultations = consultations.filter(
    (c) =>
      c.patient?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.consultation_type.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredDictations = dictations.filter(
    (d) =>
      d.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.patient?.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleResumeConsultation = (consultation: Consultation) => {
    if (consultation.patient?.id) {
      router.push(`/consultation?patientId=${consultation.patient.id}&resumeId=${consultation.id}`)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">History</h1>
        <p className="mt-1 text-sm text-gray-500">View all your consultations and dictations</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="consultations">
        <TabsList>
          <TabsTrigger value="consultations">Consultations ({consultations.length})</TabsTrigger>
          <TabsTrigger value="dictations">Dictations ({dictations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="consultations" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConsultations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                        No consultations found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredConsultations.map((consultation) => (
                      <TableRow key={consultation.id}>
                        <TableCell className="text-sm text-gray-500">{formatDate(consultation.created_at)}</TableCell>
                        <TableCell className="font-medium">{consultation.patient?.name || "Unknown"}</TableCell>
                        <TableCell className="capitalize">{consultation.consultation_type}</TableCell>
                        <TableCell>{formatDuration(consultation.duration_seconds)}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              consultation.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : consultation.status === "in-progress"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {consultation.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {consultation.status === "in-progress" && (
                              <Button
                                variant="default"
                                size="sm"
                                className="gap-2"
                                onClick={() => handleResumeConsultation(consultation)}
                              >
                                <PlayCircle className="h-4 w-4" />
                                Resume
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                              onClick={() => router.push(`/patients/${consultation.patient_id}`)}
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dictations" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDictations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                        No dictations found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDictations.map((dictation) => (
                      <TableRow key={dictation.id}>
                        <TableCell className="text-sm text-gray-500">{formatDate(dictation.created_at)}</TableCell>
                        <TableCell className="font-medium">{dictation.title || "Untitled"}</TableCell>
                        <TableCell>{dictation.patient?.name || "No patient"}</TableCell>
                        <TableCell>{formatDuration(dictation.duration_seconds)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
