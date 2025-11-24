import { Sidebar } from "@/components/sidebar"
import { WorkflowDiagram } from "@/components/workflow-diagram"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function WorkflowPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Assure Sense Workflow</h1>
            <p className="mt-2 text-gray-600">
              Complete clinical documentation workflow with AI-powered template generation
            </p>
          </div>

          <WorkflowDiagram />

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Speech Recognition</CardTitle>
                <CardDescription>Powered by Deepgram</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>Real-time speech-to-text transcription with high accuracy</p>
                <p>Supports multiple languages and medical terminology</p>
                <p>Automatic punctuation and speaker identification</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Template Generation</CardTitle>
                <CardDescription>Powered by Gemini + LangChain JS</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>11 different clinical document templates</p>
                <p>Context-aware generation based on patient data</p>
                <p>Professional formatting and medical compliance</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Document Types</CardTitle>
                <CardDescription>Available Templates</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  <li>• Medical Certificate</li>
                  <li>• Patient Friendly Summary</li>
                  <li>• Mental Health Plan</li>
                  <li>• Referral Letter</li>
                  <li>• SOAP Notes</li>
                  <li>• And 6 more...</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Security</CardTitle>
                <CardDescription>Enterprise Grade</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>Supabase database with Row Level Security</p>
                <p>End-to-end encryption for sensitive data</p>
                <p>HIPAA-compliant architecture</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
