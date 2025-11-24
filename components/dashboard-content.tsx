"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AudioWaveform as Waveform, Mic, Calendar, Users, Edit, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"
import type { Profile, Patient } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface DashboardContentProps {
  profile: Profile | null
  stats: {
    consultations: number
    dictations: number
    hoursSaved: number
    activeUsers: number
  }
  recentActivity: any[]
  patients: Patient[]
}

export function DashboardContent({ profile, stats, recentActivity, patients }: DashboardContentProps) {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getPatientName = (patientId?: string) => {
    if (!patientId) return "Untitled Patient"
    const patient = patients.find((p) => p.id === patientId)
    return patient?.name || "Unknown Patient"
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {getGreeting()}, {profile?.full_name || "Doctor"}
        </h1>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <Card className="cursor-pointer transition-shadow hover:shadow-lg">
            <Link href="/consultation/new">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="mb-2 rounded-full bg-blue-100 p-3">
                  <Waveform className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-center text-sm font-medium text-blue-600">New Consultation</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="cursor-pointer transition-shadow hover:shadow-lg">
            <Link href="/dictation/new">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="mb-2 rounded-full bg-orange-100 p-3">
                  <Mic className="h-6 w-6 text-orange-600" />
                </div>
                <p className="text-center text-sm font-medium text-orange-600">New Dictation</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="cursor-pointer transition-shadow hover:shadow-lg">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="mb-2 rounded-full bg-green-100 p-3">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-center text-sm font-medium text-gray-500">Schedule Appointment</p>
              <p className="text-xs text-gray-400">(Coming Soon)</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-shadow hover:shadow-lg">
            <Link href="/patients">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="mb-2 rounded-full bg-purple-100 p-3">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-center text-sm font-medium text-purple-600">Patient Records</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="cursor-pointer transition-shadow hover:shadow-lg">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="mb-2 rounded-full bg-pink-100 p-3">
                <Edit className="h-6 w-6 text-pink-600" />
              </div>
              <p className="text-center text-sm font-medium text-gray-500">Task Management</p>
              <p className="text-xs text-gray-400">(Coming Soon)</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-shadow hover:shadow-lg">
            <Link href="/settings">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="mb-2 rounded-full bg-gray-100 p-3">
                  <Edit className="h-6 w-6 text-gray-600" />
                </div>
                <p className="text-center text-sm font-medium text-gray-600">Settings</p>
              </CardContent>
            </Link>
          </Card>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Today&apos;s Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Consultations</CardTitle>
              <Waveform className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.consultations}</div>
              <p className="mt-1 text-xs text-green-600">
                <TrendingUp className="mr-1 inline h-3 w-3" />
                +100%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Dictations</CardTitle>
              <Mic className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.dictations}</div>
              <p className="mt-1 text-xs text-green-600">
                <TrendingUp className="mr-1 inline h-3 w-3" />
                +100%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Hours Saved</CardTitle>
              <Clock className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.hoursSaved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
              <Users className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeUsers}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Recent Activity</h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivity.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                      No recent activity. Start a consultation or dictation to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentActivity.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="text-sm text-gray-500">{formatDate(activity.created_at)}</TableCell>
                      <TableCell className="font-medium">{getPatientName(activity.patient_id)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            activity.type === "consultation"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {activity.type === "consultation" ? "Consultation" : "Dictation"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
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
      </div>
    </div>
  )
}
