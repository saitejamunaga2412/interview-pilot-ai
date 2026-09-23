import os
import sys
from pathlib import Path
from contextlib import asynccontextmanager

# Add backend directory to sys.path so modules import seamlessly
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from core.config import settings
from core.database import get_database
from services_py.scheduler import start_scheduler

# Routers
from routers.auth import router as auth_router
from routers.profile import router as profile_router
from routers.dashboard import router as dashboard_router
from routers.learning import router as learning_router
from routers.coding import router as coding_router
from routers.aptitude import aptitude_router, reasoning_router
from routers.interview import interview_router, result_router
from routers.resume import router as resume_router
from routers.company import router as company_router
from routers.career import advisor_router, intel_router
from routers.notifications import router as notifications_router
from routers.mistakes import router as mistakes_router
from routers.assessments import assessment_router, simulation_router
from routers.misc import misc_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: connect DB, verify indexes, and start scheduler
    from core.database import get_database, ensure_indexes
    db = get_database()
    try:
        await db.command("ping")
        print("[InterviewPilot AI] MongoDB connected successfully.")
        await ensure_indexes()
    except Exception as e:
        print(f"[InterviewPilot AI] Warning: MongoDB connection error: {e}")

    start_scheduler()
    yield
    # Shutdown
    print("[InterviewPilot AI] Shutting down.")

app = FastAPI(
    title="InterviewPilot AI API",
    description="Placement Operating System Backend in Python FastAPI",
    version="2.0.0",
    lifespan=lifespan
)

# CORS Configuration
configured_origins = [o.strip().rstrip("/") for o in settings.FRONTEND_URL.split(",") if o.strip()]
origins = list(set(configured_origins + [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000"
]))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from core.rate_limiter import RateLimiterMiddleware
app.add_middleware(RateLimiterMiddleware)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import logging
    logger = logging.getLogger("uvicorn.error")
    logger.error(f"[Unhandled Exception] {request.method} {request.url.path}: {exc}", exc_info=True)
    
    is_prod = settings.ENV.lower() in ("production", "prod")
    safe_message = "An internal server error occurred. Please try again later." if is_prod else (str(exc) or "Internal server error")
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"success": False, "message": safe_message}
    )

# Static file serving for uploads (photos & resumes)
uploads_dir = Path(settings.UPLOAD_DIR)
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# Mount all routers
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(dashboard_router)
app.include_router(learning_router)
app.include_router(coding_router)
app.include_router(aptitude_router)
app.include_router(reasoning_router)
app.include_router(interview_router, prefix="/api/interview")
# Support plural and singular aliases used in frontend
app.include_router(interview_router, prefix="/api/interviews", include_in_schema=False)
app.include_router(result_router)
app.include_router(resume_router)
app.include_router(company_router)
app.include_router(advisor_router)
app.include_router(intel_router)
app.include_router(notifications_router)
app.include_router(mistakes_router)
app.include_router(assessment_router, prefix="/api/assessment")
app.include_router(assessment_router, prefix="/api/assessments", include_in_schema=False)
app.include_router(simulation_router)
app.include_router(misc_router)

@app.get("/")
async def root():
    return {"message": "InterviewPilot AI FastAPI Backend Running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
