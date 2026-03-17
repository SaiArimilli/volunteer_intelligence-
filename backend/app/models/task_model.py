"""Task MongoDB document model helpers."""
from datetime import datetime


def task_entity(doc: dict) -> dict:
    if not doc:
        return {}
    return {
        "id": str(doc["_id"]),
        "title": doc.get("title", ""),
        "description": doc.get("description", ""),
        "category": doc.get("category", ""),
        "required_skills": doc.get("required_skills", []),
        "location": doc.get("location", ""),
        "duration_hours": doc.get("duration_hours", 1),
        "impact_points": doc.get("impact_points", 10),
        "status": doc.get("status", "open"),
        "assigned_to": doc.get("assigned_to", None),
        "volunteers_needed": doc.get("volunteers_needed", 1),
        "volunteers_enrolled": doc.get("volunteers_enrolled", 0),
        "created_at": doc.get("created_at", datetime.utcnow()).isoformat(),
    }


def tasks_list(docs) -> list:
    return [task_entity(d) for d in docs]
