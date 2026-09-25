import pytest
import sys
import uuid
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from httpx import AsyncClient, ASGITransport
from main import app
from core.database import get_database, to_object_id
from services_py.ai_provider import ai_provider
from services_py.ai_teacher import AITeacherService

@pytest.mark.asyncio
async def test_live_gemini_integration():
    """Verify live Gemini AI provider generation."""
    res = await ai_provider.generate("Explain QuickSort in 1 sentence for an interview.")
    assert "text" in res, "Gemini must return text field"
    assert len(res["text"].strip()) > 10, "Gemini generated text must be non-empty"
    assert res.get("provider") == "gemini", "Provider must be gemini"

@pytest.mark.asyncio
async def test_ai_teacher_chat_with_gemini():
    """Verify AI Teacher end-to-end with live Gemini provider."""
    chat_res = await AITeacherService.chat(
        topic_id="two-pointers",
        history=[],
        current_message="How does two pointers optimize from O(N^2) to O(N)?",
        step="general",
        context_meta={"userName": "Candidate"}
    )
    assert chat_res["status"] == "ready"
    assert len(chat_res["reply"]) > 20
    assert chat_res.get("timing", {}).get("provider") == "gemini"

@pytest.mark.asyncio
async def test_account_deletion_and_data_isolation():
    """Verify that DELETE /api/profile permanently cascade-deletes candidate data."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        rand_id = uuid.uuid4().hex[:8]
        email = f"delete_me_{rand_id}@example.com"
        password = "Password123!"

        # 1. Register
        reg = await client.post("/api/auth/register", json={
            "name": f"Delete Candidate {rand_id}",
            "email": email,
            "password": password
        })
        assert reg.status_code in (200, 201)
        token = reg.json().get("token") or reg.json().get("data", {}).get("token")
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Create sample project
        proj = await client.post("/api/projects", json={
            "title": "Temporary Project To Delete",
            "techStack": ["Python", "FastAPI"],
            "status": "In Progress"
        }, headers=headers)
        assert proj.status_code == 201
        proj_id = proj.json()["project"]["id"]

        db = get_database()
        # Verify project exists
        p_doc = await db["projects"].find_one({"_id": to_object_id(proj_id)})
        assert p_doc is not None

        # 3. Call Account Deletion
        del_res = await client.delete("/api/profile", headers=headers)
        assert del_res.status_code == 200

        # 4. Verify cascade delete in DB
        u_doc = await db["users"].find_one({"email": email})
        assert u_doc is None, "User document must be deleted"

        p_deleted = await db["projects"].find_one({"_id": to_object_id(proj_id)})
        assert p_deleted is None, "User project must be cascade deleted"

        # 5. Verify user cannot login anymore
        login_again = await client.post("/api/auth/login", json={"email": email, "password": password})
        assert login_again.status_code == 401, "Deleted user should not be able to log in"
