"""Volunteer MongoDB document model helpers."""
from datetime import datetime
from typing import Optional
from bson import ObjectId


def volunteer_entity(doc: dict) -> dict:
    """Convert MongoDB document to serializable dict."""
    if not doc:
        return {}
    return {
        "id": str(doc["_id"]),
        "name": doc.get("name", ""),
        "email": doc.get("email", ""),
        "phone": doc.get("phone", ""),
        "skills_raw": doc.get("skills_raw", ""),
        "skills_extracted": doc.get("skills_extracted", []),
        "interests": doc.get("interests", []),
        "availability": doc.get("availability", ""),
        "location": doc.get("location", ""),
        "tasks_completed": doc.get("tasks_completed", 0),
        "hours_volunteered": doc.get("hours_volunteered", 0.0),
        "impact_score": doc.get("impact_score", 0),
        "badge": doc.get("badge", "Bronze"),
        "dropout_risk": doc.get("dropout_risk", 0.0),
        "last_active": doc.get("last_active", datetime.utcnow()).isoformat(),
        "created_at": doc.get("created_at", datetime.utcnow()).isoformat(),
        "notifications": doc.get("notifications", []),
    }


def volunteers_list(docs) -> list:
    return [volunteer_entity(d) for d in docs]
