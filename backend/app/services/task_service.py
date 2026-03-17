"""Task CRUD and seeding service."""
from datetime import datetime
from bson import ObjectId
from app.config.db import get_db
from app.models.task_model import task_entity, tasks_list

# ── Sample tasks for seeding ─────────────────────────────────────────────────
SEED_TASKS = [
    {"title": "Python Workshop Instructor", "description": "Teach beginner Python to underprivileged youth", "category": "Education", "required_skills": ["Programming", "Teaching"], "duration_hours": 4, "impact_points": 30},
    {"title": "Community Website Developer", "description": "Build a website for the local NGO", "category": "Technology", "required_skills": ["Programming", "Design"], "duration_hours": 10, "impact_points": 50},
    {"title": "Data Analysis for Food Bank", "description": "Analyze donation patterns to optimize food distribution", "category": "Data", "required_skills": ["Data"], "duration_hours": 6, "impact_points": 40},
    {"title": "Health Camp Assistant", "description": "Assist doctors at a rural health camp", "category": "Healthcare", "required_skills": ["Healthcare", "Communication"], "duration_hours": 8, "impact_points": 45},
    {"title": "Environmental Awareness Drive", "description": "Lead workshops on sustainability in schools", "category": "Environment", "required_skills": ["Environment", "Teaching", "Communication"], "duration_hours": 3, "impact_points": 25},
    {"title": "Graphic Design for Shelter", "description": "Create branding materials for homeless shelter", "category": "Design", "required_skills": ["Design", "Communication"], "duration_hours": 5, "impact_points": 35},
    {"title": "Legal Aid Volunteer", "description": "Provide basic legal guidance to low-income individuals", "category": "Legal", "required_skills": ["Legal", "Communication"], "duration_hours": 4, "impact_points": 40},
    {"title": "Financial Literacy Coach", "description": "Teach budgeting and savings to rural families", "category": "Finance", "required_skills": ["Finance", "Teaching"], "duration_hours": 3, "impact_points": 30},
    {"title": "Meal Prep Volunteer", "description": "Cook and serve meals at community kitchen", "category": "Food", "required_skills": ["Cooking"], "duration_hours": 4, "impact_points": 20},
    {"title": "Translation Services", "description": "Translate documents and assist migrants", "category": "Language", "required_skills": ["Languages", "Communication"], "duration_hours": 3, "impact_points": 25},
    {"title": "Driving for Elderly Care", "description": "Transport seniors to medical appointments", "category": "Transport", "required_skills": ["Driving"], "duration_hours": 2, "impact_points": 20},
    {"title": "Social Media Manager", "description": "Manage NGO's social media presence", "category": "Marketing", "required_skills": ["Communication", "Design"], "duration_hours": 5, "impact_points": 30},
]


async def seed_tasks():
    """Seed sample tasks if collection is empty."""
    db = get_db()
    count = await db["tasks"].count_documents({})
    if count == 0:
        docs = [{**t, "status": "open", "volunteers_enrolled": 0, "created_at": datetime.utcnow()} for t in SEED_TASKS]
        await db["tasks"].insert_many(docs)
        print(f"🌱 Seeded {len(docs)} tasks")


async def get_all_tasks() -> list:
    db = get_db()
    await seed_tasks()
    cursor = db["tasks"].find({"status": "open"})
    return tasks_list(await cursor.to_list(length=100))


async def get_task(task_id: str) -> dict:
    db = get_db()
    doc = await db["tasks"].find_one({"_id": ObjectId(task_id)})
    return task_entity(doc) if doc else None


async def create_task(data: dict) -> dict:
    db = get_db()
    doc = {**data, "status": "open", "volunteers_enrolled": 0, "created_at": datetime.utcnow()}
    result = await db["tasks"].insert_one(doc)
    created = await db["tasks"].find_one({"_id": result.inserted_id})
    return task_entity(created)
