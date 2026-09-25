import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field

from core.security import get_current_user
from core.database import get_database, to_object_id, serialize_doc

router = APIRouter(prefix="/api/projects", tags=["Project Management"])

class MilestoneModel(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    completed: bool = False
    dueDate: Optional[str] = None

class TaskModel(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    completed: bool = False

class ProjectCreateRequest(BaseModel):
    title: str
    description: Optional[str] = ""
    techStack: List[str] = Field(default_factory=list)
    status: str = Field(default="In Progress")  # "Planning", "In Progress", "Completed", "Archived"
    milestones: List[MilestoneModel] = Field(default_factory=list)
    tasks: List[TaskModel] = Field(default_factory=list)
    repoUrl: Optional[str] = None
    liveUrl: Optional[str] = None
    progress: Optional[int] = None

class ProjectUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    techStack: Optional[List[str]] = None
    status: Optional[str] = None
    milestones: Optional[List[MilestoneModel]] = None
    tasks: Optional[List[TaskModel]] = None
    repoUrl: Optional[str] = None
    liveUrl: Optional[str] = None
    progress: Optional[int] = None

def compute_project_progress(milestones: list, tasks: list, explicit_progress: Optional[int] = None) -> int:
    """Calculates progress from completed milestones/tasks or explicit override."""
    total_items = len(milestones) + len(tasks)
    if total_items > 0:
        completed = sum(1 for m in milestones if m.get("completed")) + sum(1 for t in tasks if t.get("completed"))
        return int((completed / total_items) * 100)
    if explicit_progress is not None:
        return max(0, min(100, int(explicit_progress)))
    return 0

@router.get("")
async def list_projects(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Retrieve all projects belonging to the authenticated user."""
    db = get_database()
    query = {"userId": current_user["id"]}
    if status_filter and status_filter.lower() != "all":
        query["status"] = {"$regex": f"^{status_filter}$", "$options": "i"}

    cursor = db["projects"].find(query).sort("createdAt", -1)
    projects = await cursor.to_list(length=200)
    serialized = [serialize_doc(p) for p in projects]

    # Calculate summary metrics
    total = len(serialized)
    completed_count = sum(1 for p in serialized if p.get("status", "").lower() == "completed")
    in_progress_count = sum(1 for p in serialized if p.get("status", "").lower() in ["in progress", "planning"])
    
    return {
        "success": True,
        "count": total,
        "summary": {
            "total": total,
            "completed": completed_count,
            "inProgress": in_progress_count
        },
        "projects": serialized
    }

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_project(
    payload: ProjectCreateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Create a new project for the authenticated user."""
    title = payload.title.strip()
    if not title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": "Project title is required."}
        )

    db = get_database()
    now = datetime.now(timezone.utc)
    
    milestones_data = [m.model_dump() for m in payload.milestones]
    tasks_data = [t.model_dump() for t in payload.tasks]
    calculated_progress = compute_project_progress(milestones_data, tasks_data, payload.progress)

    # Automatically set Completed if progress is 100% and user didn't specify otherwise
    proj_status = payload.status
    if calculated_progress == 100 and proj_status not in ["Completed", "Archived"]:
        proj_status = "Completed"

    doc = {
        "userId": current_user["id"],
        "title": title,
        "description": payload.description.strip() if payload.description else "",
        "techStack": [t.strip() for t in payload.techStack if t.strip()],
        "status": proj_status,
        "milestones": milestones_data,
        "tasks": tasks_data,
        "repoUrl": str(payload.repoUrl).strip() if payload.repoUrl else None,
        "liveUrl": str(payload.liveUrl).strip() if payload.liveUrl else None,
        "progress": calculated_progress,
        "createdAt": now,
        "updatedAt": now
    }

    result = await db["projects"].insert_one(doc)
    doc["_id"] = result.inserted_id
    doc["id"] = str(result.inserted_id)

    return {
        "success": True,
        "message": "Project created successfully.",
        "project": serialize_doc(doc)
    }

@router.get("/{project_id}")
async def get_project(
    project_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get single project detail with user ownership verification."""
    oid = to_object_id(project_id)
    if not oid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": "Invalid project ID format."}
        )

    db = get_database()
    project = await db["projects"].find_one({"_id": oid, "userId": current_user["id"]})
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "message": "Project not found or unauthorized access."}
        )

    return {
        "success": True,
        "project": serialize_doc(project)
    }

@router.put("/{project_id}")
async def update_project(
    project_id: str,
    payload: ProjectUpdateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Update project details, milestones, tasks, and status."""
    oid = to_object_id(project_id)
    if not oid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": "Invalid project ID format."}
        )

    db = get_database()
    existing = await db["projects"].find_one({"_id": oid, "userId": current_user["id"]})
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "message": "Project not found or unauthorized access."}
        )

    update_fields = {}
    if payload.title is not None:
        title = payload.title.strip()
        if not title:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"success": False, "message": "Project title cannot be empty."}
            )
        update_fields["title"] = title

    if payload.description is not None:
        update_fields["description"] = payload.description.strip()

    if payload.techStack is not None:
        update_fields["techStack"] = [t.strip() for t in payload.techStack if t.strip()]

    if payload.status is not None:
        update_fields["status"] = payload.status

    if payload.repoUrl is not None:
        update_fields["repoUrl"] = str(payload.repoUrl).strip() if payload.repoUrl else None

    if payload.liveUrl is not None:
        update_fields["liveUrl"] = str(payload.liveUrl).strip() if payload.liveUrl else None

    # Milestones & Tasks update
    milestones = [m.model_dump() for m in payload.milestones] if payload.milestones is not None else existing.get("milestones", [])
    tasks = [t.model_dump() for t in payload.tasks] if payload.tasks is not None else existing.get("tasks", [])
    
    if payload.milestones is not None:
        update_fields["milestones"] = milestones
    if payload.tasks is not None:
        update_fields["tasks"] = tasks

    # Re-calculate progress
    new_progress = compute_project_progress(milestones, tasks, payload.progress if payload.progress is not None else existing.get("progress"))
    update_fields["progress"] = new_progress

    # Auto-update status if 100% complete
    if new_progress == 100 and update_fields.get("status") not in ["Archived", "Completed"] and existing.get("status") != "Archived":
        update_fields["status"] = "Completed"

    update_fields["updatedAt"] = datetime.now(timezone.utc)

    await db["projects"].update_one({"_id": oid}, {"$set": update_fields})
    updated = await db["projects"].find_one({"_id": oid})

    return {
        "success": True,
        "message": "Project updated successfully.",
        "project": serialize_doc(updated)
    }

@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Delete a project belonging to current user."""
    oid = to_object_id(project_id)
    if not oid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": "Invalid project ID format."}
        )

    db = get_database()
    result = await db["projects"].delete_one({"_id": oid, "userId": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "message": "Project not found or unauthorized access."}
        )

    return {
        "success": True,
        "message": "Project deleted successfully."
    }
