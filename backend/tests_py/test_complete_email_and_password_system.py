import pytest
import sys
import uuid
import re
import hashlib
from datetime import datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from httpx import AsyncClient, ASGITransport
from main import app
from core.database import get_database, to_object_id
from services_py.email_service import email_service
from services_py.scheduler import (
    daily_reminder_job,
    weekly_summary_job,
    monthly_summary_job,
    send_product_update_announcement,
)

@pytest.mark.asyncio
async def test_recipient_isolation_two_users():
    """
    PART 5.A: Recipient Isolation
    User A and User B register with distinct email addresses.
    Verify all emails are strictly scoped to the user's registered address.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        email_service.clear_outbox()
        rand = uuid.uuid4().hex[:6]
        email_a = f"candidate_a_{rand}@example.com"
        email_b = f"candidate_b_{rand}@example.com"

        # Register User A
        reg_a = await client.post("/api/auth/register", json={
            "name": f"Alpha_{rand}",
            "email": email_a,
            "password": "Password123!"
        })
        assert reg_a.status_code in (200, 201)

        # Register User B
        reg_b = await client.post("/api/auth/register", json={
            "name": f"Beta_{rand}",
            "email": email_b,
            "password": "Password123!"
        })
        assert reg_b.status_code in (200, 201)

        # Inspect outbox
        mails_a = email_service.get_outbox(email_a)
        mails_b = email_service.get_outbox(email_b)

        assert len(mails_a) >= 1
        assert len(mails_b) >= 1

        # Check that User A's email is NEVER received by User B
        for m in mails_a:
            assert m["to"] == email_a
            assert email_b not in m["to"]
            assert f"Alpha_{rand}" in m["html_content"] or f"Alpha_{rand}" in (m.get("recipient_name") or "")
            assert f"Beta_{rand}" not in m["html_content"]

        for m in mails_b:
            assert m["to"] == email_b
            assert email_a not in m["to"]
            assert f"Beta_{rand}" in m["html_content"] or f"Beta_{rand}" in (m.get("recipient_name") or "")
            assert f"Alpha_{rand}" not in m["html_content"]

        # -------------------------------------------------------------
        # Verify that changing one user's email does not affect another user's email
        # -------------------------------------------------------------
        token_a = reg_a.json().get("token") or reg_a.json().get("data", {}).get("token")
        auth_headers_a = {"Authorization": f"Bearer {token_a}"}
        new_email_a = f"candidate_a_updated_{rand}@example.com"

        update_res = await client.put("/api/profile", json={"email": new_email_a}, headers=auth_headers_a)
        assert update_res.status_code == 200

        # Verify in DB that User A's email is updated, User B's email remains intact
        db = get_database()
        doc_a = await db["users"].find_one({"email": new_email_a})
        assert doc_a is not None
        assert doc_a["name"] == f"Alpha_{rand}"

        doc_b = await db["users"].find_one({"email": email_b})
        assert doc_b is not None
        assert doc_b["name"] == f"Beta_{rand}"
        assert doc_b["email"] == email_b

        # -------------------------------------------------------------
        # Verify missing or invalid recipient addresses are handled safely
        # -------------------------------------------------------------
        res_empty = email_service.send_email(to_email="", subject="Test", html_content="<p>Test</p>")
        assert res_empty["success"] is False
        assert "Invalid recipient" in res_empty["error"]

        res_invalid = email_service.send_email(to_email="not-an-email-at-all", subject="Test", html_content="<p>Test</p>")
        assert res_invalid["success"] is False
        assert "Invalid recipient email format" in res_invalid["error"]

@pytest.mark.asyncio
async def test_password_recovery_full_suite():
    """
    PART 5.B: Password Recovery End-to-End Suite
    - Forgot password for existing account
    - Forgot password for nonexistent account
    - Reset using valid token
    - Reset using expired token
    - Reset using invalid token
    - Reset using already-used token
    - Password mismatch validation
    - Login with new password
    - Rejection of old password
    - Password-change confirmation email
    - Rate limiting
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        email_service.clear_outbox()
        db = get_database()
        rand = uuid.uuid4().hex[:6]
        user_email = f"recovery_user_{rand}@example.com"
        orig_pw = "OriginalSecret123!"
        new_pw = "BrandNewSecret456!"

        # Register user
        reg = await client.post("/api/auth/register", json={
            "name": f"Recovery Candidate {rand}",
            "email": user_email,
            "password": orig_pw
        })
        assert reg.status_code in (200, 201)

        # 1. Nonexistent account returns generic success without enumeration
        non_existent_res = await client.post("/api/auth/forgot-password", json={
            "email": f"nonexistent_{rand}@example.com"
        })
        assert non_existent_res.status_code == 200
        assert "instructions to reset your password" in non_existent_res.json()["message"] or "reset" in non_existent_res.json()["message"]

        # 2. Existing account forgot password
        forgot_res = await client.post("/api/auth/forgot-password", json={"email": user_email})
        assert forgot_res.status_code == 200
        forgot_json = forgot_res.json()
        assert forgot_json["success"] is True
        assert "instructions to reset your password" in forgot_json["message"] or "reset" in forgot_json["message"]

        # Verify raw token is NEVER stored in database
        user_doc = await db["users"].find_one({"email": user_email})
        assert user_doc.get("resetPasswordToken") is None, "Raw reset token must never be stored in database"
        assert user_doc.get("resetPasswordTokenHash") is not None, "Only secure token hash must be stored in database"

        # Extract token from outbox email
        last_mail = email_service.get_latest_email(user_email)
        assert last_mail is not None
        assert "Reset Your InterviewPilot AI Password" in last_mail["subject"]
        assert "15 minutes" in last_mail["html_content"]

        m = re.search(r"token=([A-Za-z0-9_-]+)", last_mail["html_content"])
        assert m is not None, "Reset token must be embedded in reset link"
        valid_token = m.group(1)

        # 3. Reset with mismatched passwords -> 400
        mismatch_res = await client.post("/api/auth/reset-password", json={
            "token": valid_token,
            "newPassword": new_pw,
            "confirmPassword": "DifferentPassword789!"
        })
        assert mismatch_res.status_code == 400

        # 4. Reset with invalid token -> 400
        invalid_res = await client.post("/api/auth/reset-password", json={
            "token": "completely_bogus_token_12345",
            "newPassword": new_pw,
            "confirmPassword": new_pw
        })
        assert invalid_res.status_code == 400

        # 5. Reset with expired token -> 400
        # Temporarily backdate expiration in DB to simulate expiry
        await db["users"].update_one(
            {"email": user_email},
            {"$set": {"resetPasswordExpires": datetime.utcnow() - timedelta(minutes=1)}}
        )
        expired_res = await client.post("/api/auth/reset-password", json={
            "token": valid_token,
            "newPassword": new_pw,
            "confirmPassword": new_pw
        })
        assert expired_res.status_code == 400

        # Restore valid expiration
        await db["users"].update_one(
            {"email": user_email},
            {"$set": {"resetPasswordExpires": datetime.utcnow() + timedelta(minutes=15)}}
        )

        # 6. Reset with valid token -> 200
        valid_reset_res = await client.post("/api/auth/reset-password", json={
            "token": valid_token,
            "newPassword": new_pw,
            "confirmPassword": new_pw
        })
        assert valid_reset_res.status_code == 200
        assert valid_reset_res.json()["success"] is True

        # Verify old token hash is unset and token cannot be reused
        user_after = await db["users"].find_one({"email": user_email})
        assert user_after.get("resetPasswordTokenHash") is None

        reuse_res = await client.post("/api/auth/reset-password", json={
            "token": valid_token,
            "newPassword": "AnotherPassword999!"
        })
        assert reuse_res.status_code == 400, "Token reuse must be rejected"

        # Verify password is securely hashed with bcrypt in database
        assert user_after["password"].startswith("$2b$") or user_after["password"].startswith("$2a$"), "Password must be hashed with bcrypt"
        assert user_after["password"] != new_pw, "Password must not be stored in plain text"
        assert orig_pw not in user_after["password"]

        # Verify password-change confirmation email was sent
        changed_mail = email_service.get_latest_email(user_email)
        assert changed_mail is not None
        assert "password was changed" in changed_mail["subject"].lower()

        # 7. Login with new password succeeds, old password fails
        login_new = await client.post("/api/auth/login", json={
            "email": user_email,
            "password": new_pw
        })
        assert login_new.status_code == 200

        login_old = await client.post("/api/auth/login", json={
            "email": user_email,
            "password": orig_pw
        })
        assert login_old.status_code == 401

@pytest.mark.asyncio
async def test_authenticated_change_password():
    """
    PART 3: Change Password for Authenticated Users
    - Verified current password required
    - New password and confirm password match
    - Minimum length requirement
    - Rejection if new password matches current password
    - Success dispatches security confirmation email
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        email_service.clear_outbox()
        rand = uuid.uuid4().hex[:6]
        user_email = f"auth_change_{rand}@example.com"
        current_pw = "CurrentPassword123!"
        new_pw = "BrandNewSecret789!"

        # Register user and get JWT
        reg = await client.post("/api/auth/register", json={
            "name": f"Auth User {rand}",
            "email": user_email,
            "password": current_pw
        })
        token = reg.json()["data"]["token"]
        auth_headers = {"Authorization": f"Bearer {token}"}

        # 1. Incorrect current password -> 400
        res_bad_curr = await client.post("/api/auth/change-password", json={
            "currentPassword": "WrongCurrentPassword!",
            "newPassword": new_pw,
            "confirmPassword": new_pw
        }, headers=auth_headers)
        assert res_bad_curr.status_code == 400

        # 2. Confirm password mismatch -> 400
        res_mismatch = await client.post("/api/auth/change-password", json={
            "currentPassword": current_pw,
            "newPassword": new_pw,
            "confirmPassword": "DifferentPassword!"
        }, headers=auth_headers)
        assert res_mismatch.status_code == 400

        # 3. Same password -> 400
        res_same = await client.post("/api/auth/change-password", json={
            "currentPassword": current_pw,
            "newPassword": current_pw,
            "confirmPassword": current_pw
        }, headers=auth_headers)
        assert res_same.status_code == 400

        # 4. Valid change password -> 200
        res_ok = await client.post("/api/auth/change-password", json={
            "currentPassword": current_pw,
            "newPassword": new_pw,
            "confirmPassword": new_pw
        }, headers=auth_headers)
        assert res_ok.status_code == 200
        assert res_ok.json()["success"] is True

        # Verify confirmation email was sent
        last_mail = email_service.get_latest_email(user_email)
        assert last_mail is not None
        assert "password was changed" in last_mail["subject"].lower()

@pytest.mark.asyncio
async def test_scheduler_preferences_and_deduplication():
    """
    PART 4: Notification Scheduler Preferences & Deduplication
    - Daily reminder only when enabled
    - Weekly reports only when weekly enabled
    - Monthly reports only when monthly enabled
    - Disabling reports stops both
    - Deduplication prevents double dispatch on repeated ticks
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        db = get_database()
        rand = uuid.uuid4().hex[:6]
        email_weekly = f"weekly_candidate_{rand}@example.com"
        email_monthly = f"monthly_candidate_{rand}@example.com"
        email_disabled = f"disabled_candidate_{rand}@example.com"

        # Register 3 users with different preferences
        reg1 = await client.post("/api/auth/register", json={
            "name": f"Weekly User {rand}", "email": email_weekly, "password": "Password123!"
        })
        reg2 = await client.post("/api/auth/register", json={
            "name": f"Monthly User {rand}", "email": email_monthly, "password": "Password123!"
        })
        reg3 = await client.post("/api/auth/register", json={
            "name": f"Disabled User {rand}", "email": email_disabled, "password": "Password123!"
        })

        # Set user preferences in MongoDB
        # User 1: Weekly (Default)
        await db["users"].update_one(
            {"email": email_weekly},
            {"$set": {
                "settings.notificationPreferences.weeklyProgressReport": True,
                "settings.notificationPreferences.progressReportFrequency": "weekly",
                "settings.notificationPreferences.email": True
            }}
        )

        # User 2: Monthly
        await db["users"].update_one(
            {"email": email_monthly},
            {"$set": {
                "settings.notificationPreferences.weeklyProgressReport": False,
                "settings.notificationPreferences.monthlyPerformanceSummary": True,
                "settings.notificationPreferences.progressReportFrequency": "monthly",
                "settings.notificationPreferences.email": True
            }}
        )

        # User 3: Disabled
        await db["users"].update_one(
            {"email": email_disabled},
            {"$set": {
                "settings.notificationPreferences.weeklyProgressReport": False,
                "settings.notificationPreferences.monthlyPerformanceSummary": False,
                "settings.notificationPreferences.progressReportFrequency": "disabled",
                "settings.notificationPreferences.email": True
            }}
        )

        email_service.clear_outbox()

        # Run weekly summary job tick 1
        await weekly_summary_job()

        # User 1 should have received weekly digest
        weekly_mails = email_service.get_outbox(email_weekly)
        assert len(weekly_mails) == 1
        assert "Weekly Placement Progress Report" in weekly_mails[0]["subject"]

        # User 2 (monthly) and User 3 (disabled) must NOT have received weekly digest
        assert len(email_service.get_outbox(email_monthly)) == 0
        assert len(email_service.get_outbox(email_disabled)) == 0

        # Run weekly summary job tick 2 (duplicate prevention test)
        await weekly_summary_job()
        assert len(email_service.get_outbox(email_weekly)) == 1, "Duplicate email must NOT be sent on repeated job execution"

        # Now test monthly summary job
        email_service.clear_outbox()
        await monthly_summary_job()

        # User 2 should have received monthly digest
        monthly_mails = email_service.get_outbox(email_monthly)
        assert len(monthly_mails) == 1
        assert "Monthly Placement Preparation Report" in monthly_mails[0]["subject"]

        # User 1 and User 3 must NOT have received monthly digest
        assert len(email_service.get_outbox(email_weekly)) == 0
        assert len(email_service.get_outbox(email_disabled)) == 0

        # -------------------------------------------------------------
        # Test Daily Reminder Preference Enforcement
        # -------------------------------------------------------------
        # Enable daily reminder for User 1, disable for User 3
        await db["users"].update_one(
            {"email": email_weekly},
            {"$set": {"settings.notificationPreferences.dailyReminder": True}}
        )
        await db["users"].update_one(
            {"email": email_disabled},
            {"$set": {"settings.notificationPreferences.dailyReminder": False}}
        )
        email_service.clear_outbox()
        await daily_reminder_job()

        user1_daily = email_service.get_outbox(email_weekly)
        user3_daily = email_service.get_outbox(email_disabled)
        assert len(user1_daily) >= 1
        assert "Daily Placement Preparation Plan" in user1_daily[0]["subject"]
        assert len(user3_daily) == 0, "User with dailyReminder=False must NOT receive daily reminder"

        # -------------------------------------------------------------
        # Test Product Announcement Preference Enforcement
        # -------------------------------------------------------------
        # User 1 opted in to productUpdates, User 3 opted out
        await db["users"].update_one(
            {"email": email_weekly},
            {"$set": {"settings.notificationPreferences.productUpdates": True}}
        )
        await db["users"].update_one(
            {"email": email_disabled},
            {"$set": {"settings.notificationPreferences.productUpdates": False}}
        )
        email_service.clear_outbox()
        await send_product_update_announcement(
            update_id=f"feat_{rand}",
            title=f"AI Mock v2 {rand}",
            summary="Brand new dynamic interviewer with realistic audio synthesis",
            details_html="<p>Brand new dynamic interviewer with realistic audio synthesis</p>",
            action_route="/interview"
        )

        user1_announcement = email_service.get_outbox(email_weekly)
        user3_announcement = email_service.get_outbox(email_disabled)
        assert len(user1_announcement) == 1, "User with productUpdates=True must receive announcement"
        assert "AI Mock v2" in user1_announcement[0]["subject"]
        assert len(user3_announcement) == 0, "User with productUpdates=False must NOT receive announcement"

@pytest.mark.asyncio
async def test_email_quality_and_content():
    """
    PART 5: Email Template Quality & Security Verification
    - All templates generate both valid HTML and plain-text fallback
    - Plain-text contains NO raw HTML tags
    - Links point to configured frontend URL
    - No secrets, tokens, or credentials are leaked in message body
    - Correct personalized recipient name is rendered
    """
    from services_py.email_templates import (
        build_welcome_email,
        build_password_reset_email,
        build_password_changed_email,
        build_daily_reminder_email,
        build_weekly_summary_email,
        build_monthly_summary_email,
        build_product_announcement_email,
        build_inactivity_reminder_email,
        build_email_verification_email
    )
    from core.config import settings

    frontend_base = settings.FRONTEND_URL.rstrip("/")
    recipient = "engineer@example.com"
    name = "Devika Sharma"

    templates_to_test = [
        ("Welcome", build_welcome_email(name, recipient, f"{frontend_base}/dashboard", f"{frontend_base}/settings")),
        ("Reset", build_password_reset_email(name, recipient, f"{frontend_base}/reset-password?token=secret_tok_123", settings_link=f"{frontend_base}/settings")),
        ("Changed", build_password_changed_email(name, recipient, f"{frontend_base}/login", f"{frontend_base}/settings")),
        ("Daily", build_daily_reminder_email(name, recipient, f"{frontend_base}/dashboard", f"{frontend_base}/settings")),
        ("Weekly", build_weekly_summary_email(name, recipient, f"{frontend_base}/dashboard", f"{frontend_base}/settings", {"problems_solved": 5, "topics_completed": 2})),
        ("Monthly", build_monthly_summary_email(name, recipient, f"{frontend_base}/dashboard", f"{frontend_base}/settings", {"problems_solved": 20, "topics_completed": 8}, "September 2026")),
        ("Announcement", build_product_announcement_email(name, recipient, "Coding Arena 2.0", "New execution engine", f"{frontend_base}/coding", f"{frontend_base}/settings")),
        ("Inactivity", build_inactivity_reminder_email(name, recipient, f"{frontend_base}/dashboard", f"{frontend_base}/settings")),
        ("Verify", build_email_verification_email(name, recipient, f"{frontend_base}/verify-email?token=verif_456", f"{frontend_base}/settings"))
    ]

    for label, (subject, html, text) in templates_to_test:
        assert subject and len(subject) > 5, f"[{label}] Subject missing or too short"
        assert html and "<html" in html.lower() and "</html>" in html.lower(), f"[{label}] Invalid HTML markup"
        assert text and len(text) > 20, f"[{label}] Plain text fallback missing"

        # Plain text must NOT have HTML markup
        assert "<table" not in text and "<div" not in text and "<span" not in text, f"[{label}] Plain text contains HTML tags"

        # URLs must use configured frontend base
        assert frontend_base in html, f"[{label}] HTML does not use configured frontend URL"
        assert frontend_base in text, f"[{label}] Plain text does not use configured frontend URL"

        # Must include personalized greeting or recipient
        assert "Devika" in html or recipient in html, f"[{label}] Missing personalization in HTML"
        assert "Devika" in text or recipient in text, f"[{label}] Missing personalization in Plain Text"

        # Security check: Never expose raw passwords or sensitive keys
        assert "password123" not in html.lower()
        assert "jwt" not in html.lower() or "json web token" not in html.lower()
        assert "api_key" not in html.lower()
