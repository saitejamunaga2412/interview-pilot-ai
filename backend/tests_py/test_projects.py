import pytest
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from httpx import AsyncClient, ASGITransport
from main import app
from core.database import get_database, to_object_id
from core.security import create_access_token

@pytest.fixture
async def test_users():
    db = get_database()
    u1 = {
        "name": "Project Builder One",
        "email": "proj_user_one@test.com",
        "career": {"targetRole": "Full Stack Engineer"}
    }
    u2 = {
        "name": "Project Builder Two",
        "email": "proj_user_two@test.com",
        "career": {"targetRole": "DevOps Engineer"}
    }
    res1 = await db["users"].insert_one(u1)
    res2 = await db["users"].insert_one(u2)
    id1 = str(res1.inserted_id)
    id2 = str(res2.inserted_id)

    token1 = create_access_token({"id": id1})
    token2 = create_access_token({"id": id2})

    yield {
        "user1": {"id": id1, "token": token1},
        "user2": {"id": id2, "token": token2}
    }

    # Cleanup
    await db["users"].delete_many({"_id": {"$in": [to_object_id(id1), to_object_id(id2)]}})
    await db["projects"].delete_many({"userId": {"$in": [id1, id2]}})

@pytest.mark.asyncio
async def test_unauthorized_access():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/projects")
        assert res.status_code == 401

@pytest.mark.asyncio
async def test_create_and_get_project(test_users):
    u1 = test_users["user1"]
    transport = ASGITransport(app=app)
    headers = {"Authorization": f"Bearer {u1['token']}"}

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create
        payload = {
            "title": "E-Commerce Microservices",
            "description": "Distributed e-commerce architecture using Docker and Kafka.",
            "techStack": ["React", "FastAPI", "MongoDB", "Docker"],
            "status": "In Progress",
            "milestones": [
                {"title": "Setup Docker Compose", "completed": True},
                {"title": "Implement Auth Gateway", "completed": False}
            ],
            "tasks": [
                {"title": "Create JWT auth middleware", "completed": True},
                {"title": "Add rate limiter", "completed": False}
            ],
            "repoUrl": "https://github.com/example/ecommerce",
            "liveUrl": "https://ecommerce.demo.com"
        }
        res = await client.post("/api/projects", json=payload, headers=headers)
        assert res.status_code == 201
        data = res.json()
        assert data["success"] is True
        proj = data["project"]
        assert proj["title"] == "E-Commerce Microservices"
        assert len(proj["techStack"]) == 4
        # 2 out of 4 items completed = 50%
        assert proj["progress"] == 50
        proj_id = proj["id"]

        # Get single
        get_res = await client.get(f"/api/projects/{proj_id}", headers=headers)
        assert get_res.status_code == 200
        assert get_res.json()["project"]["title"] == "E-Commerce Microservices"

@pytest.mark.asyncio
async def test_user_isolation(test_users):
    u1 = test_users["user1"]
    u2 = test_users["user2"]
    transport = ASGITransport(app=app)
    h1 = {"Authorization": f"Bearer {u1['token']}"}
    h2 = {"Authorization": f"Bearer {u2['token']}"}

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # U1 creates project
        create_res = await client.post(
            "/api/projects",
            json={"title": "U1 Secret Algorithm Project", "techStack": ["Python"]},
            headers=h1
        )
        assert create_res.status_code == 201
        proj_id = create_res.json()["project"]["id"]

        # U2 tries to get U1's project -> 404
        u2_get = await client.get(f"/api/projects/{proj_id}", headers=h2)
        assert u2_get.status_code == 404

        # U2 tries to update U1's project -> 404
        u2_update = await client.put(f"/api/projects/{proj_id}", json={"title": "Hacked"}, headers=h2)
        assert u2_update.status_code == 404

        # U2 tries to delete U1's project -> 404
        u2_delete = await client.delete(f"/api/projects/{proj_id}", headers=h2)
        assert u2_delete.status_code == 404

        # U2 lists projects -> empty
        u2_list = await client.get("/api/projects", headers=h2)
        assert u2_list.status_code == 200
        assert u2_list.json()["count"] == 0

@pytest.mark.asyncio
async def test_update_and_delete_project(test_users):
    u1 = test_users["user1"]
    transport = ASGITransport(app=app)
    headers = {"Authorization": f"Bearer {u1['token']}"}

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        create_res = await client.post(
            "/api/projects",
            json={
                "title": "Initial Project",
                "milestones": [{"title": "Step 1", "completed": False}]
            },
            headers=headers
        )
        proj_id = create_res.json()["project"]["id"]

        # Update milestone to completed -> progress becomes 100%, status becomes Completed
        update_res = await client.put(
            f"/api/projects/{proj_id}",
            json={
                "title": "Renamed Project",
                "milestones": [{"title": "Step 1", "completed": True}]
            },
            headers=headers
        )
        assert update_res.status_code == 200
        updated = update_res.json()["project"]
        assert updated["title"] == "Renamed Project"
        assert updated["progress"] == 100
        assert updated["status"] == "Completed"

        # Delete project
        del_res = await client.delete(f"/api/projects/{proj_id}", headers=headers)
        assert del_res.status_code == 200

        # Verify deletion
        get_res = await client.get(f"/api/projects/{proj_id}", headers=headers)
        assert get_res.status_code == 404

@pytest.mark.asyncio
async def test_validation_errors(test_users):
    u1 = test_users["user1"]
    transport = ASGITransport(app=app)
    headers = {"Authorization": f"Bearer {u1['token']}"}

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Empty title
        res = await client.post("/api/projects", json={"title": "   "}, headers=headers)
        assert res.status_code == 400

        # Invalid ID
        res = await client.get("/api/projects/not-an-oid", headers=headers)
        assert res.status_code == 400
