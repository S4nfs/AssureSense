from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import httpx
import os
from datetime import datetime

app = FastAPI(title="Assure Sense API", version="1.0.0")

# CORS middleware to allow Next.js frontend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class HealthCheck(BaseModel):
    status: str
    timestamp: str
    version: str

class TranscriptionRequest(BaseModel):
    audio_url: str
    language: Optional[str] = "en"

class TranscriptionResponse(BaseModel):
    transcript: str
    duration: float
    confidence: Optional[float]

class MedicalInsight(BaseModel):
    patient_id: str
    consultation_count: int
    common_symptoms: list[str]
    last_visit: Optional[str]

class ProfilePictureRequest(BaseModel):
    seed: str
    style: Optional[str] = "avataaars"

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Assure Sense Python Backend API",
        "version": "1.0.0",
        "endpoints": [
            "/health",
            "/api/transcribe",
            "/api/medical-insights/{patient_id}",
            "/api/profile-picture"
        ]
    }

# Health check endpoint
@app.get("/health", response_model=HealthCheck)
async def health_check():
    return HealthCheck(
        status="healthy",
        timestamp=datetime.utcnow().isoformat(),
        version="1.0.0"
    )

# Transcription endpoint (simulated - would integrate with Deepgram in production)
@app.post("/api/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(request: TranscriptionRequest):
    """
    Transcribe audio using Deepgram API
    This is a placeholder - in production, integrate with actual Deepgram API
    """
    try:
        return TranscriptionResponse(
            transcript="This is a simulated transcription. In production, this would use Deepgram API to transcribe the audio.",
            duration=45.5,
            confidence=0.95
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error transcribing audio: {str(e)}")

# Medical insights endpoint
@app.get("/api/medical-insights/{patient_id}", response_model=MedicalInsight)
async def get_medical_insights(patient_id: str):
    """
    Get medical insights for a patient
    This demonstrates a REST endpoint for patient analytics
    """
    try:
        return MedicalInsight(
            patient_id=patient_id,
            consultation_count=5,
            common_symptoms=["headache", "fatigue", "back pain"],
            last_visit="2025-10-20T14:30:00Z"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching medical insights: {str(e)}")

@app.post("/api/profile-picture")
async def get_profile_picture(request: ProfilePictureRequest):
    """
    Generate a profile picture URL using DiceBear API
    DiceBear is a free avatar generation service
    """
    try:
        # DiceBear API endpoint
        # Available styles: avataaars, bottts, identicon, initials, lorelei, micah, etc.
        base_url = "https://api.dicebear.com/7.x"
        
        # Generate the avatar URL
        avatar_url = f"{base_url}/{request.style}/svg?seed={request.seed}"
        
        return {
            "avatar_url": avatar_url,
            "seed": request.seed,
            "style": request.style
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating profile picture: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
