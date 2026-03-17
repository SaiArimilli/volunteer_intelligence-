"""AI-specific API routes: skill extraction, dropout prediction, chatbot."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from app.services.ai_service import (
    extract_skills, predict_dropout, chat_with_volunteer
)

router = APIRouter()


class SkillExtractRequest(BaseModel):
    text: str


class DropoutRequest(BaseModel):
    volunteer_id: Optional[str] = None
    tasks_completed: int = 0
    hours_volunteered: float = 0.0
    last_active: Optional[str] = None


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict]] = []


@router.post("/extract-skills", summary="NLP skill extraction from free text")
async def extract_skills_endpoint(payload: SkillExtractRequest):
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    skills = extract_skills(payload.text)
    return {"success": True, "skills": skills, "count": len(skills)}


@router.post("/predict-dropout", summary="Predict volunteer dropout probability")
async def dropout_prediction(payload: DropoutRequest):
    risk = predict_dropout(payload.model_dump())
    level = "High" if risk > 0.65 else "Medium" if risk > 0.35 else "Low"
    return {
        "success": True,
        "dropout_probability": risk,
        "risk_level": level,
        "recommendation": (
            "Reach out immediately with a personalized task" if level == "High"
            else "Send a motivation nudge" if level == "Medium"
            else "Volunteer is engaged — keep up the great work!"
        )
    }


@router.post("/chat", summary="AI chatbot for volunteers")
async def chatbot(payload: ChatRequest):
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    reply = await chat_with_volunteer(payload.message, payload.history)
    return {"success": True, "reply": reply}
