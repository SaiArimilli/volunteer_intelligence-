"""Activity log model for tracking volunteer events."""
from datetime import datetime


def activity_entity(doc: dict) -> dict:
    if not doc:
        return {}
    return {
        "id": str(doc["_id"]),
        "volunteer_id": doc.get("volunteer_id", ""),
        "volunteer_name": doc.get("volunteer_name", ""),
        "action": doc.get("action", ""),
        "task_id": doc.get("task_id", ""),
        "task_title": doc.get("task_title", ""),
        "timestamp": doc.get("timestamp", datetime.utcnow()).isoformat(),
    }
