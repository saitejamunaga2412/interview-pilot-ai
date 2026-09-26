import pytest
import sys
import uuid
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from httpx import AsyncClient, ASGITransport
from main import app
from core.database import get_database

@pytest.mark.asyncio
async def test_reset_password_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        rand_id = uuid.uuid4().hex[:8]
        test_email = f"candidate_{rand_id}@example.com"
        orig_pw = "InitialSecret123!"

        # 1. Register candidate
        reg_res = await client.post("/api/auth/register", json={
            "name": "Reset Test Candidate",
            "email": test_email,
            "password": orig_pw
        }, headers={"origin": "http://localhost:5173"})
        assert reg_res.status_code in (200, 201)

        # 2. Request forgot password with Origin header http://localhost:5173
        forgot_res = await client.post("/api/auth/forgot-password", json={
            "email": test_email
        }, headers={"origin": "http://localhost:5173"})
        assert forgot_res.status_code == 200
        forgot_data = forgot_res.json()
        assert forgot_data["success"] is True

        db = get_database()
        user_doc = await db["users"].find_one({"email": test_email})
        assert user_doc.get("resetPasswordToken") is None, "Raw reset token must never be stored in database"
        assert user_doc.get("resetPasswordTokenHash") is not None, "Only secure token hash must be stored in database"

        # Token is extracted from the secure test payload or email outbox
        from services_py.email_service import email_service
        last_mail = email_service.get_latest_email(test_email)
        token = forgot_data.get("resetToken")
        if not token and last_mail:
            import re
            m = re.search(r"token=([A-Za-z0-9_-]+)", last_mail.get("text_content", "") or last_mail.get("html_content", ""))
            if m:
                token = m.group(1)
        assert token is not None, "Token must be retrieved from email"

        # 3. Test Reset with Invalid Token -> Fails (400)
        invalid_res = await client.post("/api/auth/reset-password", json={
            "token": "completely_invalid_token",
            "newPassword": "BrandNewPassword123!"
        })
        assert invalid_res.status_code == 400

        # 4. Test Reset with Short Password (< 6 chars) -> Fails (400)
        short_res = await client.post("/api/auth/reset-password", json={
            "token": token,
            "newPassword": "123"
        })
        assert short_res.status_code == 400

        # 5. Test Reset with Valid Token -> Succeeds
        new_pw = "BrandNewPassword123!"
        valid_res = await client.post("/api/auth/reset-password", json={
            "token": token,
            "newPassword": new_pw
        })
        assert valid_res.status_code == 200
        assert valid_res.json()["success"] is True

        # 6. Verify old token hash is UNSET and cannot be reused
        user_after = await db["users"].find_one({"email": test_email})
        assert user_after.get("resetPasswordToken") is None, "Token must be unset after use"
        assert user_after.get("resetPasswordTokenHash") is None, "Token hash must be unset after use"

        reuse_res = await client.post("/api/auth/reset-password", json={
            "token": token,
            "newPassword": "AnotherPassword456!"
        })
        assert reuse_res.status_code == 400, "Reused token must be rejected"

        # 7. Verify login with new password succeeds and old password fails
        login_new = await client.post("/api/auth/login", json={
            "email": test_email,
            "password": new_pw
        })
        assert login_new.status_code == 200

        login_old = await client.post("/api/auth/login", json={
            "email": test_email,
            "password": orig_pw
        })
        assert login_old.status_code == 401
        print("All password reset flow checks passed successfully!")
