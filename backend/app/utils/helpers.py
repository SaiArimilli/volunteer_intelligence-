"""Utility helpers for the backend."""
from datetime import datetime
from bson import ObjectId
import json


class JSONEncoder(json.JSONEncoder):
    """Custom encoder to handle ObjectId and datetime."""
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)


def paginate(data: list, page: int = 1, size: int = 20) -> dict:
    """Simple pagination helper."""
    total = len(data)
    start = (page - 1) * size
    end = start + size
    return {
        "items": data[start:end],
        "total": total,
        "page": page,
        "pages": max(1, (total + size - 1) // size),
    }
