"""Task API routes."""
from fastapi import APIRouter, HTTPException
from app.schemas.task_schema import TaskCreate
from app.services.task_service import get_all_tasks, get_task, create_task
from app.services.ai_service import recommend_tasks
from app.services.volunteer_service import get_volunteer

router = APIRouter()


@router.get("/", summary="List all open tasks")
async def list_tasks():
    tasks = await get_all_tasks()
    return {"success": True, "data": tasks, "count": len(tasks)}


@router.get("/recommendations/{volunteer_id}", summary="AI task recommendations for a volunteer")
async def get_recommendations(volunteer_id: str):
    vol = await get_volunteer(volunteer_id)
    if not vol:
        raise HTTPException(status_code=404, detail="Volunteer not found")

    tasks = await get_all_tasks()
    ranked = recommend_tasks(vol.get("skills_extracted", []), tasks)
    return {"success": True, "data": ranked, "volunteer_skills": vol.get("skills_extracted", [])}


@router.get("/{task_id}", summary="Get task by ID")
async def get_task_by_id(task_id: str):
    task = await get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"success": True, "data": task}


@router.post("/", summary="Create a new task (admin)")
async def create_new_task(payload: TaskCreate):
    task = await create_task(payload.model_dump())
    return {"success": True, "data": task}
