const PYTHON_API_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8000"

export async function transcribeAudio(audioUrl: string, language = "en") {
  const response = await fetch(`${PYTHON_API_URL}/api/transcribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ audio_url: audioUrl, language }),
  })

  if (!response.ok) {
    throw new Error("Failed to transcribe audio")
  }

  return response.json()
}

export async function getMedicalInsights(patientId: string) {
  const response = await fetch(`${PYTHON_API_URL}/api/medical-insights/${patientId}`)

  if (!response.ok) {
    throw new Error("Failed to fetch medical insights")
  }

  return response.json()
}

export async function getProfilePicture(seed: string, style = "avataaars") {
  const response = await fetch(`${PYTHON_API_URL}/api/profile-picture`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ seed, style }),
  })

  if (!response.ok) {
    throw new Error("Failed to generate profile picture")
  }

  return response.json()
}

export async function checkBackendHealth() {
  const response = await fetch(`${PYTHON_API_URL}/health`)

  if (!response.ok) {
    throw new Error("Backend health check failed")
  }

  return response.json()
}
