import pytest
import sys
import uuid
from datetime import datetime
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from httpx import AsyncClient, ASGITransport
from main import app
from core.database import get_database, to_object_id
from core.security import create_access_token
from services_py.email_service import email_service
from services_py.scheduler import daily_reminder_job, weekly_summary_job

@pytest.mark.asyncio
async def test_email_feature_suite():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        rand_id = uuid.uuid4().hex[:8]
        test_email = f"test_candidate_{rand_id}@example.com"
        password = "OriginalPassword123!"

        # -------------------------------------------------------------
        # 1. Registration & Welcome Email Flow
        # -------------------------------------------------------------
        reg_res = await client.post("/api/auth/register", json={
            "name": f"Email Candidate {rand_id}",
            "email": test_email,
            "password": password
        })
        assert reg_res.status_code in (200, 201), f"Reg failed: {reg_res.text}"
        reg_data = reg_res.json()
        token = reg_data.get("token") or reg_data.get("data", {}).get("token")
        auth_headers = {"Authorization": f"Bearer {token}"}

        # -------------------------------------------------------------
        # 2. Authenticated Test Email Endpoint
        # -------------------------------------------------------------
        test_mail_res = await client.post("/api/misc/send-test-email", headers=auth_headers)
        assert test_mail_res.status_code == 200
        # Endpoint returns structured output safely
        assert "result" in test_mail_res.json()

        # -------------------------------------------------------------
        # 3. Forgot Password Request & Email Trigger
        # -------------------------------------------------------------
        forgot_res = await client.post("/api/auth/forgot-password", json={
            "email": test_email
        })
        assert forgot_res.status_code == 200
        forgot_data = forgot_res.json()
        assert forgot_data["success"] is True
        reset_token = forgot_data.get("resetToken")
        assert reset_token is not None, "Reset token must be generated"

        # -------------------------------------------------------------
        # 4. Password Reset with Valid Token
        # -------------------------------------------------------------
        new_password = "UpdatedPassword456!"
        reset_res = await client.post("/api/auth/reset-password", json={
            "token": reset_token,
            "newPassword": new_password
        })
        assert reset_res.status_code == 200
        reset_data = reset_res.json()
        assert reset_data["success"] is True

        # Verify login with new password
        login_new = await client.post("/api/auth/login", json={
            "email": test_email,
            "password": new_password
        })
        assert login_new.status_code == 200, "Login with new password should succeed"

        # Verify login with old password fails
        login_old = await client.post("/api/auth/login", json={
            "email": test_email,
            "password": password
        })
        assert login_old.status_code == 401, "Login with old password should fail"

        # -------------------------------------------------------------
        # 5. User Notification Preferences & Opt-In / Opt-Out
        # -------------------------------------------------------------
        # Update settings to opt-out of email
        opt_out_res = await client.put("/api/profile", json={
            "settings": {
                "theme": "dark",
                "notificationPreferences": {"email": False, "inApp": True}
            }
        }, headers=auth_headers)
        assert opt_out_res.status_code == 200

        db = get_database()
        user_in_db = await db["users"].find_one({"email": test_email})
        assert user_in_db["settings"]["notificationPreferences"]["email"] is False

        # Update settings to opt-in to email
        opt_in_res = await client.put("/api/profile", json={
            "settings": {
                "theme": "dark",
                "notificationPreferences": {"email": True, "inApp": True}
            }
        }, headers=auth_headers)
        assert opt_in_res.status_code == 200

        user_in_db_opted = await db["users"].find_one({"email": test_email})
        assert user_in_db_opted["settings"]["notificationPreferences"]["email"] is True

        # -------------------------------------------------------------
        # 6. Scheduler Execution & Duplicate Prevention
        # -------------------------------------------------------------
        # Run daily reminder job once
        await daily_reminder_job()
        today_str = datetime.utcnow().strftime("%Y-%m-%d")
        dedupe_key = f"daily_reminder_{str(user_in_db['_id'])}_{today_str}"

        # Notification should have been recorded with dedupeKey
        notif_1 = await db["notifications"].count_documents({"dedupeKey": dedupe_key})
        assert notif_1 == 1

        # Run daily reminder job a second time immediately - should not create duplicate
        await daily_reminder_job()
        notif_2 = await db["notifications"].count_documents({"dedupeKey": dedupe_key})
        assert notif_2 == 1, "Duplicate reminder must be prevented by dedupeKey"

        # Run weekly summary job once
        await weekly_summary_job()
        week_str = datetime.utcnow().strftime("%Y-W%W")
        weekly_dedupe = f"weekly_summary_{str(user_in_db['_id'])}_{week_str}"
        weekly_notif = await db["notifications"].count_documents({"dedupeKey": weekly_dedupe})
        assert weekly_notif == 1
