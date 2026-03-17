"""Volunteer API routes."""
from fastapi import APIRouter, HTTPException
from app.schemas.volunteer_schema import VolunteerRegister, VolunteerUpdate
from app.services.volunteer_service import (
    create_volunteer, get_volunteer, get_all_volunteers, update_volunteer_activity
)

router = APIRouter()


@router.post("/register", summary="Register a new volunteer")
async def register_volunteer(payload: VolunteerRegister):
    volunteer = await create_volunteer(payload.model_dump())
    return {"success": True, "data": volunteer}


@router.get("/{volunteer_id}", summary="Get volunteer by ID")
async def get_volunteer_by_id(volunteer_id: str):
    vol = await get_volunteer(volunteer_id)
    if not vol:
        raise HTTPException(status_code=404, detail="Volunteer not found")
    return {"success": True, "data": vol}


@router.get("/", summary="List all volunteers")
async def list_volunteers():
    vols = await get_all_volunteers()
    return {"success": True, "data": vols, "count": len(vols)}


@router.post("/{volunteer_id}/log-activity", summary="Log task completion")
async def log_activity(volunteer_id: str, hours: float = 2.0, task_done: bool = True):
    updated = await update_volunteer_activity(volunteer_id, hours, task_done)
    if not updated:
        raise HTTPException(status_code=404, detail="Volunteer not found")
    return {"success": True, "data": updated}
