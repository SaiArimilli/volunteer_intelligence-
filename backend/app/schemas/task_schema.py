"""Pydantic schemas for task validation."""
from pydantic import BaseModel, Field
from typing import List, Optional


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str
    category: str
    required_skills: List[str] = []
    location: Optional[str] = ""
    duration_hours: Optional[int] = 2
    impact_points: Optional[int] = 10
    volunteers_needed: Optional[int] = 1


class TaskOut(BaseModel):
    id: str
    title: str
    description: str
    category: str
    required_skills: List[str]
    impact_points: int
    status: str
    match_score: Optional[float] = None
