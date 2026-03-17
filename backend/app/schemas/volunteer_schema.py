"""Pydantic schemas for volunteer request/response validation."""
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime


class VolunteerRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = ""
    skills_raw: str = Field(..., min_length=5, description="Free-text skills/bio")
    interests: Optional[List[str]] = []
    availability: Optional[str] = "weekends"
    location: Optional[str] = ""


class VolunteerUpdate(BaseModel):
    phone: Optional[str] = None
    skills_raw: Optional[str] = None
    interests: Optional[List[str]] = None
    availability: Optional[str] = None
    location: Optional[str] = None


class VolunteerOut(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    skills_raw: str
    skills_extracted: List[str]
    interests: List[str]
    availability: str
    location: str
    badge: str
    impact_score: int
    tasks_completed: int
    hours_volunteered: float
    dropout_risk: float
