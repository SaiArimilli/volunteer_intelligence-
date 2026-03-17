"""Admin dashboard analytics routes."""
from fastapi import APIRouter
from app.config.db import get_db
from app.models.volunteer_model import volunteers_list
from app.services.task_service import seed_tasks

router = APIRouter()


@router.get("/analytics", summary="Full admin analytics dashboard data")
async def get_analytics():
    db = get_db()
    await seed_tasks()

    # Aggregate volunteer stats
    volunteers = await db["volunteers"].find().to_list(length=1000)
    tasks = await db["tasks"].find().to_list(length=1000)

    total_volunteers = len(volunteers)
    total_tasks = len(tasks)
    open_tasks = sum(1 for t in tasks if t.get("status") == "open")
    total_hours = sum(v.get("hours_volunteered", 0) for v in volunteers)
    avg_impact = (
        sum(v.get("impact_score", 0) for v in volunteers) / total_volunteers
        if total_volunteers else 0
    )

    # Dropout risk breakdown
    high_risk = sum(1 for v in volunteers if v.get("dropout_risk", 0) > 0.65)
    medium_risk = sum(1 for v in volunteers if 0.35 < v.get("dropout_risk", 0) <= 0.65)
    low_risk = total_volunteers - high_risk - medium_risk

    # Badge distribution
    badges = {"Bronze": 0, "Silver": 0, "Gold": 0, "Platinum": 0}
    for v in volunteers:
        b = v.get("badge", "Bronze")
        badges[b] = badges.get(b, 0) + 1

    # Task categories
    categories = {}
    for t in tasks:
        cat = t.get("category", "Other")
        categories[cat] = categories.get(cat, 0) + 1

    # Skills frequency
    skill_freq = {}
    for v in volunteers:
        for s in v.get("skills_extracted", []):
            skill_freq[s] = skill_freq.get(s, 0) + 1
    top_skills = sorted(skill_freq.items(), key=lambda x: x[1], reverse=True)[:10]

    # Recent volunteers
    recent = volunteers_list(
        sorted(volunteers, key=lambda x: x.get("created_at", ""), reverse=True)[:5]
    )

    return {
        "success": True,
        "data": {
            "overview": {
                "total_volunteers": total_volunteers,
                "total_tasks": total_tasks,
                "open_tasks": open_tasks,
                "total_hours": round(total_hours, 1),
                "avg_impact_score": round(avg_impact, 1),
            },
            "dropout_risk": {
                "high": high_risk,
                "medium": medium_risk,
                "low": low_risk,
            },
            "badge_distribution": badges,
            "task_categories": categories,
            "top_skills": [{"skill": k, "count": v} for k, v in top_skills],
            "recent_volunteers": recent,
        }
    }


@router.get("/volunteers/at-risk", summary="List high-risk volunteers")
async def at_risk_volunteers():
    db = get_db()
    cursor = db["volunteers"].find({"dropout_risk": {"$gt": 0.65}}).sort("dropout_risk", -1)
    docs = await cursor.to_list(length=50)
    return {"success": True, "data": volunteers_list(docs), "count": len(docs)}
