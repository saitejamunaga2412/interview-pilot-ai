import pytest
import sys
import uuid
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from httpx import AsyncClient, ASGITransport
from main import app
from core.database import get_database

@pytest.mark.asyncio
async def test_dedicated_login_and_auth_lifecycle():
    """
    Dedicated test account verification:
    Registration -> Valid Login -> Invalid Credentials (401) -> Unknown Email (401)
    -> Protected Route -> Tampered Token (401) -> Account Deletion -> Post-Deletion Rejection (401)
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        uid = uuid.uuid4().hex[:8]
        test_email = f"verified_candidate_{uid}@example.com"
        test_password = "CandidateSecurePass987!"

        # 1. Registration
        reg_res = await client.post("/api/auth/register", json={
            "name": f"Verified Candidate {uid}",
            "email": test_email,
            "password": test_password
        })
        assert reg_res.status_code in (200, 201), f"Registration failed: {reg_res.text}"
        reg_json = reg_res.json()
        assert reg_json.get("success") is True
        token = reg_json.get("data", {}).get("token") or reg_json.get("token")
        assert token, "Token missing in registration response"

        # 2. Valid Login with matching credentials
        login_res = await client.post("/api/auth/login", json={
            "email": test_email,
            "password": test_password
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        login_json = login_res.json()
        assert login_json.get("success") is True
        auth_token = login_json.get("data", {}).get("token")
        assert auth_token, "Token missing in login response"
        headers = {"Authorization": f"Bearer {auth_token}"}

        # 3. Invalid Password -> Rejection with HTTP 401
        bad_pwd_res = await client.post("/api/auth/login", json={
            "email": test_email,
            "password": "WrongPassword999!"
        })
        assert bad_pwd_res.status_code == 401
        assert "invalid email or password" in bad_pwd_res.text.lower()

        # 4. Non-existent Email -> Rejection with HTTP 401
        no_user_res = await client.post("/api/auth/login", json={
            "email": f"nonexistent_{uid}@example.com",
            "password": test_password
        })
        assert no_user_res.status_code == 401
        assert "invalid email or password" in no_user_res.text.lower()

        # 5. Access Protected Route (/api/profile) with valid token
        prof_res = await client.get("/api/profile", headers=headers)
        assert prof_res.status_code == 200
        assert prof_res.json().get("data", {}).get("email") == test_email

        # 6. Access Protected Route without token -> Rejection with HTTP 401
        anon_res = await client.get("/api/profile")
        assert anon_res.status_code == 401

        # 7. Access Protected Route with tampered token -> Rejection with HTTP 401
        tampered_headers = {"Authorization": f"Bearer {auth_token[:-8]}tampered"}
        tampered_res = await client.get("/api/profile", headers=tampered_headers)
        assert tampered_res.status_code == 401

        # 8. Clean up: Delete account
        del_res = await client.delete("/api/profile", headers=headers)
        assert del_res.status_code == 200

        # 9. Verify token immediately invalidated after account deletion
        post_del_res = await client.get("/api/profile", headers=headers)
        assert post_del_res.status_code == 401
