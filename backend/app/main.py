"""
Volunteer Intelligence System - FastAPI Backend
Main application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config.db import connect_db, disconnect_db
from app.routes import volunteer_routes, task_routes, ai_routes, admin_routes
from app.config.settings import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage app lifecycle - connect/disconnect DB."""
    await connect_db()
    yield
    await disconnect_db()


app = FastAPI(
    title="Volunteer Intelligence System API",
    description="AI-powered volunteer management platform for social impact",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(volunteer_routes.router, prefix="/api/volunteers", tags=["Volunteers"])
app.include_router(task_routes.router,      prefix="/api/tasks",      tags=["Tasks"])
app.include_router(ai_routes.router,        prefix="/api/ai",         tags=["AI"])
app.include_router(admin_routes.router,     prefix="/api/admin",      tags=["Admin"])


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "message": "Volunteer Intelligence System API"}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy", "version": "1.0.0"}
