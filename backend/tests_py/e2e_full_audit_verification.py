import pytest
import sys
import uuid
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from httpx import AsyncClient, ASGITransport
from main import app
from core.database import get_database, to_object_id
from core.security import create_access_token

@pytest.mark.asyncio
async def test_complete_e2e_user_journey():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Unique test user
        rand_id = uuid.uuid4().hex[:8]
        email = f"e2e_candidate_{rand_id}@example.com"
        password = "SecurePassword123!"

        # -------------------------------------------------------------
        # JOURNEY 1: Registration -> Login -> Dashboard -> Personalized Journey
        # -------------------------------------------------------------
        # 1a. Register
        reg_res = await client.post("/api/auth/register", json={
            "name": f"E2E Candidate {rand_id}",
            "email": email,
            "password": password
        })
        assert reg_res.status_code in (200, 201), f"Registration failed: {reg_res.text}"
        reg_data = reg_res.json()
        token = reg_data.get("token") or reg_data.get("data", {}).get("token")
        assert token, "No token returned upon registration"

        # 1b. Login
        login_res = await client.post("/api/auth/login", json={
            "email": email,
            "password": password
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        auth_headers = {"Authorization": f"Bearer {token}"}

        # 1c. Fetch Dashboard
        dash_res = await client.get("/api/dashboard", headers=auth_headers)
        assert dash_res.status_code == 200
        dash_data = dash_res.json()
        assert "data" in dash_data

        # 1d. Set career target & personalized profile
        target_res = await client.put("/api/profile", json={
            "career": {"targetRole": "Full Stack Engineer", "targetCompanies": ["Google", "Amazon"]},
            "onboardingCompleted": True
        }, headers=auth_headers)
        assert target_res.status_code == 200

        # -------------------------------------------------------------
        # JOURNEY 2: Learning -> Aptitude -> Coding -> Mock Interview
        # -------------------------------------------------------------
        # 2a. Learning dashboard
        learning_res = await client.get("/api/learning/dashboard", headers=auth_headers)
        assert learning_res.status_code == 200
        assert "data" in learning_res.json()

        # 2b. Aptitude topics and roadmap
        apt_topics = await client.get("/api/aptitude/topics", headers=auth_headers)
        assert apt_topics.status_code == 200
        apt_road = await client.get("/api/aptitude/roadmap", headers=auth_headers)
        assert apt_road.status_code == 200

        # 2c. Coding patterns and problems
        code_pat = await client.get("/api/coding/patterns", headers=auth_headers)
        assert code_pat.status_code == 200
        code_prob = await client.get("/api/coding/problems", headers=auth_headers)
        assert code_prob.status_code == 200

        # 2d. Mock interview roles & session history
        roles_res = await client.get("/api/interview/roles", headers=auth_headers)
        assert roles_res.status_code == 200
        int_hist = await client.get("/api/result/history", headers=auth_headers)
        assert int_hist.status_code == 200

        # -------------------------------------------------------------
        # JOURNEY 3: Resume ATS -> Project Management
        # -------------------------------------------------------------
        # 3a. Resume ATS Latest analysis check
        ats_res = await client.get("/api/resume/ats/latest", headers=auth_headers)
        assert ats_res.status_code == 200

        # 3b. Projects CRUD: Create project
        proj_res = await client.post("/api/projects", json={
            "title": "Cloud-Native Microservices Platform",
            "description": "Distributed architecture on Kubernetes with Go & Kafka.",
            "techStack": ["Go", "Kafka", "Docker", "Kubernetes"],
            "status": "In Progress",
            "milestones": [
                {"title": "Deploy Kafka broker cluster", "completed": True},
                {"title": "Implement idempotency middleware", "completed": False}
            ],
            "tasks": [
                {"title": "Benchmark throughput at 100k msg/s", "completed": True}
            ]
        }, headers=auth_headers)
        assert proj_res.status_code == 201, f"Project creation failed: {proj_res.text}"
        proj_id = proj_res.json()["project"]["id"]

        # 3c. Verify project list contains new project
        projs_res = await client.get("/api/projects", headers=auth_headers)
        assert projs_res.status_code == 200
        assert any(p["id"] == proj_id for p in projs_res.json()["projects"])

        # -------------------------------------------------------------
        # JOURNEY 4: Profile Settings -> Notifications -> Test Email
        # -------------------------------------------------------------
        # 4a. Update notification preferences
        settings_res = await client.put("/api/profile", json={
            "settings": {
                "theme": "dark",
                "notificationPreferences": {"email": True, "inApp": True}
            }
        }, headers=auth_headers)
        assert settings_res.status_code == 200

        # 4b. Notification center unread count
        notif_res = await client.get("/api/notifications/unread-count", headers=auth_headers)
        assert notif_res.status_code == 200

        # 4c. Trigger test-email endpoint (verifies safe error handling)
        mail_res = await client.post("/api/misc/send-test-email", headers=auth_headers)
        assert mail_res.status_code == 200
        assert "result" in mail_res.json()

        # -------------------------------------------------------------
        # JOURNEY 5: Relogin & Verify State Persistence
        # -------------------------------------------------------------
        relogin_res = await client.post("/api/auth/login", json={
            "email": email,
            "password": password
        })
        assert relogin_res.status_code == 200
        new_token = relogin_res.json().get("token") or relogin_res.json().get("data", {}).get("token")
        new_headers = {"Authorization": f"Bearer {new_token}"}

        # Check profile persistence
        prof_check = await client.get("/api/profile", headers=new_headers)
        assert prof_check.status_code == 200
        prof_data = prof_check.json()["data"]
        assert prof_data.get("career", {}).get("targetRole") == "Full Stack Engineer"

        # Check project persistence
        proj_check = await client.get(f"/api/projects/{proj_id}", headers=new_headers)
        assert proj_check.status_code == 200
        assert proj_check.json()["project"]["title"] == "Cloud-Native Microservices Platform"
