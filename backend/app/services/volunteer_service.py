"""Volunteer CRUD and business logic service."""
from datetime import datetime
from bson import ObjectId
from app.config.db import get_db
from app.models.volunteer_model import volunteer_entity, volunteers_list
from app.services.ai_service import (
    extract_skills, predict_dropout, calculate_impact_score, assign_badge
)


async def create_volunteer(data: dict) -> dict:
    """Register a new volunteer, extract skills, compute initial scores."""
    db = get_db()

    # Extract skills via NLP
    skills = extract_skills(data.get("skills_raw", ""))

    doc = {
        **data,
        "skills_extracted": skills,
        "tasks_completed": 0,
        "hours_volunteered": 0.0,
        "impact_score": 0,
        "badge": "Bronze",
        "dropout_risk": 0.3,
        "last_active": datetime.utcnow(),
        "created_at": datetime.utcnow(),
        "notifications": [],
    }

    result = await db["volunteers"].insert_one(doc)
    created = await db["volunteers"].find_one({"_id": result.inserted_id})
    return volunteer_entity(created)


async def get_volunteer(volunteer_id: str) -> dict:
    db = get_db()
    doc = await db["volunteers"].find_one({"_id": ObjectId(volunteer_id)})
    return volunteer_entity(doc) if doc else None


async def get_all_volunteers() -> list:
    db = get_db()
    cursor = db["volunteers"].find().sort("created_at", -1)
    return volunteers_list(await cursor.to_list(length=200))


async def update_volunteer_activity(volunteer_id: str, hours: float = 0, task_done: bool = False):
    """Update volunteer stats after completing a task."""
    db = get_db()
    vol = await db["volunteers"].find_one({"_id": ObjectId(volunteer_id)})
    if not vol:
        return None

    tasks_completed = vol.get("tasks_completed", 0) + (1 if task_done else 0)
    hours_volunteered = vol.get("hours_volunteered", 0.0) + hours
    impact_score = calculate_impact_score(tasks_completed, hours_volunteered)
    badge = assign_badge(impact_score)
    dropout_risk = predict_dropout({
        "tasks_completed": tasks_completed,
        "hours_volunteered": hours_volunteered,
        "last_active": datetime.utcnow().isoformat(),
    })

    update = {
        "tasks_completed": tasks_completed,
        "hours_volunteered": hours_volunteered,
        "impact_score": impact_score,
        "badge": badge,
        "dropout_risk": dropout_risk,
        "last_active": datetime.utcnow(),
    }
    await db["volunteers"].update_one({"_id": ObjectId(volunteer_id)}, {"$set": update})
    updated = await db["volunteers"].find_one({"_id": ObjectId(volunteer_id)})
    return volunteer_entity(updated)
