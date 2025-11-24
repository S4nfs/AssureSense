export async function generateSOAPNote(transcript: string, patientContext?: string) {
  const response = await fetch("/api/generate-soap", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transcript,
      patientContext,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to generate SOAP note")
  }

  return response.json()
}

export async function generateEmbedding(text: string, patientId: string, consultationId?: string) {
  const response = await fetch("/api/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      patientId,
      consultationId,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to generate embedding")
  }

  return response.json()
}

export async function searchPatientHistory(query: string, patientId: string) {
  const response = await fetch("/api/search-history", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      patientId,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to search history")
  }

  return response.json()
}
