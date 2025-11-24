"use client"

export function WorkflowDiagram() {
  return (
    <div className="w-full overflow-x-auto rounded-lg border bg-white p-8">
      <svg viewBox="0 0 1200 800" className="min-w-full" xmlns="http://www.w3.org/2000/svg">
        {/* Define styles */}
        <defs>
          <style>{`
            .workflow-box { fill: #e0e7ff; stroke: #4f46e5; stroke-width: 2; }
            .workflow-box-active { fill: #c7d2fe; stroke: #4f46e5; stroke-width: 2; }
            .workflow-text { font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; text-anchor: middle; }
            .workflow-arrow { stroke: #4f46e5; stroke-width: 2; fill: none; marker-end: url(#arrowhead); }
            .workflow-label { font-family: Arial, sans-serif; font-size: 12px; fill: #4f46e5; }
          `}</style>
          <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#4f46e5" />
          </marker>
        </defs>

        {/* Title */}
        <text x="600" y="30" className="workflow-text" fontSize="20">
          Assure Sense Clinical Documentation Workflow
        </text>

        {/* Row 1: Start */}
        <rect x="50" y="80" width="150" height="80" rx="10" className="workflow-box" />
        <text x="125" y="125" className="workflow-text">
          Start Consultation
        </text>

        {/* Arrow 1 */}
        <path d="M 200 120 L 280 120" className="workflow-arrow" />

        {/* Row 1: Patient Selection */}
        <rect x="280" y="80" width="150" height="80" rx="10" className="workflow-box" />
        <text x="355" y="125" className="workflow-text">
          Select Patient
        </text>

        {/* Arrow 2 */}
        <path d="M 430 120 L 510 120" className="workflow-arrow" />

        {/* Row 1: Recording */}
        <rect x="510" y="80" width="150" height="80" rx="10" className="workflow-box-active" />
        <text x="585" y="115" className="workflow-text">
          Record Audio
        </text>
        <text x="585" y="135" className="workflow-text" fontSize="12">
          (Deepgram STT)
        </text>

        {/* Arrow 3 */}
        <path d="M 660 120 L 740 120" className="workflow-arrow" />

        {/* Row 1: Transcription */}
        <rect x="740" y="80" width="150" height="80" rx="10" className="workflow-box" />
        <text x="815" y="115" className="workflow-text">
          Transcription
        </text>
        <text x="815" y="135" className="workflow-text" fontSize="12">
          (Real-time)
        </text>

        {/* Arrow 4 */}
        <path d="M 890 120 L 970 120" className="workflow-arrow" />

        {/* Row 1: Review */}
        <rect x="970" y="80" width="150" height="80" rx="10" className="workflow-box" />
        <text x="1045" y="125" className="workflow-text">
          Review & Edit
        </text>

        {/* Arrow down to Row 2 */}
        <path d="M 1045 160 L 1045 240" className="workflow-arrow" />

        {/* Row 2: Template Selection */}
        <rect x="900" y="240" width="150" height="80" rx="10" className="workflow-box" />
        <text x="975" y="275" className="workflow-text">
          Select Template
        </text>
        <text x="975" y="295" className="workflow-text" fontSize="12">
          (11 types)
        </text>

        {/* Arrow left */}
        <path d="M 900 280 L 820 280" className="workflow-arrow" />

        {/* Row 2: AI Generation */}
        <rect x="650" y="240" width="150" height="80" rx="10" className="workflow-box-active" />
        <text x="725" y="275" className="workflow-text">
          Generate with AI
        </text>
        <text x="725" y="295" className="workflow-text" fontSize="12">
          (Gemini + LangChain)
        </text>

        {/* Arrow left */}
        <path d="M 650 280 L 570 280" className="workflow-arrow" />

        {/* Row 2: SOAP Notes */}
        <rect x="400" y="240" width="150" height="80" rx="10" className="workflow-box" />
        <text x="475" y="275" className="workflow-text">
          Generate SOAP
        </text>
        <text x="475" y="295" className="workflow-text" fontSize="12">
          (Structured Notes)
        </text>

        {/* Arrow down */}
        <path d="M 475 320 L 475 400" className="workflow-arrow" />

        {/* Row 3: Document Output */}
        <rect x="350" y="400" width="250" height="80" rx="10" className="workflow-box" />
        <text x="475" y="435" className="workflow-text">
          Clinical Documents
        </text>
        <text x="475" y="455" className="workflow-text" fontSize="12">
          (Medical Certificate, Referral, etc.)
        </text>

        {/* Arrow right */}
        <path d="M 600 440 L 680 440" className="workflow-arrow" />

        {/* Row 3: Save & Export */}
        <rect x="680" y="400" width="150" height="80" rx="10" className="workflow-box" />
        <text x="755" y="435" className="workflow-text">
          Save & Export
        </text>
        <text x="755" y="455" className="workflow-text" fontSize="12">
          (PDF/TXT)
        </text>

        {/* Arrow right */}
        <path d="M 830 440 L 910 440" className="workflow-arrow" />

        {/* Row 3: End */}
        <rect x="910" y="400" width="150" height="80" rx="10" className="workflow-box" />
        <text x="985" y="435" className="workflow-text">
          Complete
        </text>
        <text x="985" y="455" className="workflow-text" fontSize="12">
          (Archive)
        </text>

        {/* Side features box */}
        <rect
          x="50"
          y="240"
          width="280"
          height="240"
          rx="10"
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
        <text x="190" y="265" className="workflow-text" fill="#10b981" fontSize="14">
          Key Features
        </text>

        <text x="70" y="295" className="workflow-label" fontSize="12" textAnchor="start">
          ✓ Deepgram Speech-to-Text
        </text>
        <text x="70" y="320" className="workflow-label" fontSize="12" textAnchor="start">
          ✓ Real-time Transcription
        </text>
        <text x="70" y="345" className="workflow-label" fontSize="12" textAnchor="start">
          ✓ AI Template Generation
        </text>
        <text x="70" y="370" className="workflow-label" fontSize="12" textAnchor="start">
          ✓ 11 Document Types
        </text>
        <text x="70" y="395" className="workflow-label" fontSize="12" textAnchor="start">
          ✓ Patient Context Aware
        </text>
        <text x="70" y="420" className="workflow-label" fontSize="12" textAnchor="start">
          ✓ Export & Archive
        </text>
        <text x="70" y="445" className="workflow-label" fontSize="12" textAnchor="start">
          ✓ Secure & HIPAA Ready
        </text>

        {/* Legend */}
        <rect x="50" y="600" width="1100" height="150" rx="10" fill="#f9fafb" stroke="#d1d5db" strokeWidth="1" />
        <text x="600" y="625" className="workflow-text" fontSize="14">
          Workflow Legend
        </text>

        <rect x="70" y="645" width="30" height="30" rx="5" className="workflow-box" />
        <text x="120" y="665" className="workflow-label" fontSize="12" textAnchor="start">
          Standard Process
        </text>

        <rect x="350" y="645" width="30" height="30" rx="5" className="workflow-box-active" />
        <text x="400" y="665" className="workflow-label" fontSize="12" textAnchor="start">
          AI-Powered Process
        </text>

        <text x="70" y="710" className="workflow-label" fontSize="12" textAnchor="start">
          1. Clinician starts consultation and selects patient from database
        </text>
        <text x="70" y="730" className="workflow-label" fontSize="12" textAnchor="start">
          2. Audio is recorded and transcribed in real-time using Deepgram API
        </text>
        <text x="70" y="750" className="workflow-label" fontSize="12" textAnchor="start">
          3. AI generates clinical documents using Gemini model with LangChain JS
        </text>
      </svg>
    </div>
  )
}
