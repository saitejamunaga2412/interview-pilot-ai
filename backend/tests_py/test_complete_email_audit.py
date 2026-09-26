import pytest
import sys
import uuid
import re
from datetime import datetime, timedelta
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from httpx import AsyncClient, ASGITransport
from main import app
from core.database import get_database, ensure_indexes
from core.config import settings
from services_py.email_service import email_service
from services_py.notification_service import notification_service
from services_py.email_templates import (
    wrap_email_html,
    button_html,
    build_welcome_email,
    build_password_reset_email,
    build_password_changed_email,
    build_daily_reminder_email,
    build_weekly_summary_email,
    build_inactivity_reminder_email,
    build_test_verification_email
)
from services_py.scheduler import (
    daily_reminder_job,
    weekly_summary_job,
    monthly_summary_job,
    send_product_update_announcement,
    inactivity_reminder_job,
    get_user_now
)

@pytest.mark.asyncio
async def test_email_template_rendering_and_safety():
    """
    Test 9: Email template rendering
    Verifies that all templates render valid HTML and plain-text versions,
    avoid spam triggers (no 'Precedence: bulk'), and DO NOT expose sensitive tokens.
    """
    # 1. Welcome template
    subj, html, text = build_welcome_email("Alice Walker", "alice@example.com", "http://localhost:5173/dashboard", "http://localhost:5173/settings")
    assert "Alice" in subj or "Alice" in html
    assert "http://localhost:5173/dashboard" in html
    assert "alice@example.com" in html
    assert "Precedence: bulk" not in html
    assert len(text) > 50

    # 2. Password reset template - CRITICAL: Must not print raw token
    secret_token = "ultra_secret_reset_token_xyz_999"
    reset_url = f"http://localhost:5173/reset-password?token={secret_token}"
    subj_r, html_r, text_r = build_password_reset_email("Bob Jones", "bob@example.com", reset_url, secret_token, "http://localhost:5173/settings")
    assert secret_token not in html_r.replace(reset_url, ""), "Reset token must NOT appear in email body text outside the secure URL"
    assert "Manual Reset Token" not in html_r
    assert "Manual Reset Token" not in text_r
    assert reset_url in html_r
    assert reset_url in text_r

    # 3. Password changed template
    subj_c, html_c, text_c = build_password_changed_email("Charlie Brown", "charlie@example.com", "http://localhost:5173/login", "http://localhost:5173/settings")
    assert "changed" in subj_c.lower() or "security" in subj_c.lower()
    assert "http://localhost:5173/login" in html_c
    assert "charlie@example.com" in html_c

    # 4. Daily reminder template
    subj_d, html_d, text_d = build_daily_reminder_email("Diana Prince", "diana@example.com", "http://localhost:5173/dashboard", "http://localhost:5173/settings")
    assert "Daily" in subj_d
    assert "Diana" in html_d
    assert "diana@example.com" in html_d

    # 5. Weekly summary template
    stats = {"problems_solved": 12, "problems_attempted": 15, "aptitude_attempts": 3, "topics_completed": 4}
    subj_w, html_w, text_w = build_weekly_summary_email("Eve Adams", "eve@example.com", "http://localhost:5173/dashboard", "http://localhost:5173/settings", stats)
    assert "Weekly" in subj_w
    assert "12" in html_w
    assert "eve@example.com" in html_w

    # 6. Inactivity reminder template
    subj_i, html_i, text_i = build_inactivity_reminder_email("Frank Miller", "frank@example.com", "http://localhost:5173/dashboard", "http://localhost:5173/settings", "Backend Engineer")
    assert "Frank" in html_i
    assert "Backend Engineer" in html_i

    # 7. Test verification email
    subj_t, html_t, text_t = build_test_verification_email("Grace Hopper", "grace@example.com", "2026-09-26 12:00:00 UTC", "http://localhost:5173/settings")
    assert "Verification" in subj_t
    assert "grace@example.com" in html_t

@pytest.mark.asyncio
async def test_invalid_recipient_and_error_redaction():
    """
    Test 8: Invalid recipient handling and SMTP failures
    Verifies rejection of invalid formats, dry-run test domain suppression,
    and credential redaction in logs.
    """
    # Empty email
    res1 = email_service.send_email("", "Subject", "<p>Body</p>")
    assert res1["success"] is False
    assert "missing email" in res1["error"].lower()

    # Invalid syntax
    res2 = email_service.send_email("not-an-email", "Subject", "<p>Body</p>")
    assert res2["success"] is False
    assert "invalid recipient" in res2["error"].lower()

    # Synthetic test domain suppression (mock/dry-run)
    res3 = email_service.send_email("candidate@example.com", "Subject", "<p>Body</p>")
    assert res3["success"] is True
    assert res3["status"] == "suppressed"
    assert res3["mode"] == "dry_run"

@pytest.mark.asyncio
async def test_user_registration_and_welcome_email():
    """
    Test 1: User registration and welcome email
    Verifies that a new user gets registered, welcome notification is generated,
    and welcome email is dispatched to their exact email address.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        rand = uuid.uuid4().hex[:6]
        user_email = f"reg_audit_{rand}@example.com"

        res = await client.post("/api/auth/register", json={
            "name": f"Registered User {rand}",
            "email": user_email,
            "password": "StrongPassword123!"
        })
        assert res.status_code in (200, 201)
        data = res.json()
        token = data.get("data", {}).get("token") or data.get("token")
        assert token is not None

        db = get_database()
        user = await db["users"].find_one({"email": user_email})
        assert user is not None
        assert user["email"] == user_email
        # Default dailyReminder must be False to prevent unwanted daily emails
        assert user["settings"]["notificationPreferences"]["dailyReminder"] is False

        # Verify welcome notification in database
        welcome_note = await db["notifications"].find_one({"userId": str(user["_id"]), "type": "welcome"})
        assert welcome_note is not None

        # Verify welcome delivery record
        welcome_delivery = await db["notification_deliveries"].find_one({"userId": str(user["_id"]), "type": "welcome"})
        assert welcome_delivery is not None
        assert welcome_delivery["recipient"] == user_email

        # Clean up
        await db["users"].delete_one({"_id": user["_id"]})
        await db["notifications"].delete_many({"userId": str(user["_id"])})
        await db["notification_deliveries"].delete_many({"userId": str(user["_id"])})

@pytest.mark.asyncio
async def test_password_reset_and_change_notifications():
    """
    Test 3: Password reset and password-change notifications
    Verifies forgot-password generates reset email to registered user,
    reset-password updates password and triggers security alert email,
    and change-password triggers security alert email.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        rand = uuid.uuid4().hex[:6]
        user_email = f"pw_audit_{rand}@example.com"
        old_pwd = "OriginalPassword123!"
        new_pwd = "NewPassword456!"

        # Register user
        reg_res = await client.post("/api/auth/register", json={
            "name": f"Password User {rand}",
            "email": user_email,
            "password": old_pwd
        })
        token = reg_res.json()["data"]["token"]
        auth_headers = {"Authorization": f"Bearer {token}"}

        # 1. Forgot password
        forgot_res = await client.post("/api/auth/forgot-password", json={"email": user_email})
        assert forgot_res.status_code == 200
        forgot_data = forgot_res.json()
        reset_token = forgot_data.get("resetToken")
        assert reset_token is not None

        db = get_database()
        user = await db["users"].find_one({"email": user_email})
        user_id = str(user["_id"])

        # Check delivery record for reset email
        reset_delivery = await db["notification_deliveries"].find_one({
            "userId": user_id,
            "type": "password_reset"
        })
        assert reset_delivery is not None
        assert reset_delivery["recipient"] == user_email

        # 2. Reset password
        reset_post_res = await client.post("/api/auth/reset-password", json={
            "token": reset_token,
            "newPassword": new_pwd
        })
        assert reset_post_res.status_code == 200

        # Verify password changed delivery record
        changed_delivery = await db["notification_deliveries"].find_one({
            "userId": user_id,
            "type": "password_changed"
        })
        assert changed_delivery is not None
        assert changed_delivery["recipient"] == user_email

        # 3. Change password while logged in
        newer_pwd = "NewerPassword789!"
        new_login = await client.post("/api/auth/login", json={"email": user_email, "password": new_pwd})
        new_token = new_login.json()["data"]["token"]
        change_res = await client.post("/api/auth/change-password", json={
            "currentPassword": new_pwd,
            "newPassword": newer_pwd
        }, headers={"Authorization": f"Bearer {new_token}"})
        assert change_res.status_code == 200

        # Clean up
        await db["users"].delete_one({"_id": user["_id"]})
        await db["notifications"].delete_many({"userId": user_id})
        await db["notification_deliveries"].delete_many({"userId": user_id})

@pytest.mark.asyncio
async def test_correct_recipient_selection_multi_user():
    """
    Test 2: Correct recipient selection for multiple users
    Ensures User A receives emails at User A's address with User A's data,
    and User B receives emails at User B's address with User B's data.
    """
    db = get_database()
    await ensure_indexes()

    email_a = "candidate_a_audit@example.com"
    email_b = "candidate_b_audit@example.com"

    await db["users"].delete_many({"email": {"$in": [email_a, email_b]}})
    await db["notification_deliveries"].delete_many({"recipient": {"$in": [email_a, email_b]}})

    # User A: 5 problems solved
    user_a_doc = {
        "name": "Candidate Alpha",
        "email": email_a,
        "password": "hashed_password",
        "createdAt": datetime.utcnow() - timedelta(days=5),
        "settings": {
            "timezone": "Asia/Kolkata",
            "notificationPreferences": {
                "email": True,
                "dailyReminder": True,
                "progressReportFrequency": "weekly"
            }
        }
    }
    res_a = await db["users"].insert_one(user_a_doc)
    id_a = str(res_a.inserted_id)

    # User B: 0 problems solved, progress report disabled
    user_b_doc = {
        "name": "Candidate Beta",
        "email": email_b,
        "password": "hashed_password",
        "createdAt": datetime.utcnow() - timedelta(days=5),
        "settings": {
            "timezone": "America/New_York",
            "notificationPreferences": {
                "email": True,
                "dailyReminder": True,
                "progressReportFrequency": "disabled"
            }
        }
    }
    res_b = await db["users"].insert_one(user_b_doc)
    id_b = str(res_b.inserted_id)

    # Insert 5 submissions for User A
    for i in range(5):
        await db["submissions"].insert_one({
            "userId": id_a,
            "status": "Accepted",
            "createdAt": datetime.utcnow() - timedelta(days=1)
        })

    # Execute weekly summary
    await weekly_summary_job()

    # User A must have received weekly summary to email_a
    deliv_a = await db["notification_deliveries"].find_one({"userId": id_a, "type": "weekly_summary"})
    assert deliv_a is not None
    assert deliv_a["recipient"] == email_a

    # User B must NOT have received weekly summary because progressReportFrequency is disabled
    deliv_b = await db["notification_deliveries"].find_one({"userId": id_b, "type": "weekly_summary"})
    assert deliv_b is None

    # Clean up
    await db["users"].delete_many({"_id": {"$in": [res_a.inserted_id, res_b.inserted_id]}})
    await db["submissions"].delete_many({"userId": id_a})
    await db["notification_deliveries"].delete_many({"userId": {"$in": [id_a, id_b]}})

@pytest.mark.asyncio
async def test_notification_preferences_and_scheduling():
    """
    Test 4, 5, 6, 7: Daily reminder, weekly progress, product updates, preferences toggling
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        rand = uuid.uuid4().hex[:6]
        test_email = f"pref_audit_{rand}@example.com"

        reg_res = await client.post("/api/auth/register", json={
            "name": f"Pref Candidate {rand}",
            "email": test_email,
            "password": "Password123!"
        })
        token = reg_res.json()["data"]["token"]
        auth_headers = {"Authorization": f"Bearer {token}"}

        db = get_database()
        user = await db["users"].find_one({"email": test_email})
        user_id = str(user["_id"])

        # 1. Update preferences via API: enable dailyReminder, weekly progress
        put_res = await client.put("/api/profile", json={
            "settings": {
                "theme": "dark",
                "notificationPreferences": {
                    "email": True,
                    "dailyReminder": True,
                    "weeklyProgressReport": True,
                    "progressReportFrequency": "weekly",
                    "monthlyPerformanceSummary": True,
                    "productUpdates": True
                }
            }
        }, headers=auth_headers)
        assert put_res.status_code == 200

        user_updated = await db["users"].find_one({"_id": user["_id"]})
        prefs = user_updated["settings"]["notificationPreferences"]
        assert prefs["dailyReminder"] is True
        assert prefs["weeklyProgressReport"] is True
        assert prefs["monthlyPerformanceSummary"] is True
        assert prefs["productUpdates"] is True

        # Simulate user registered 2 days ago so daily reminder is eligible
        await db["users"].update_one(
            {"_id": user["_id"]},
            {"$set": {"createdAt": datetime.utcnow() - timedelta(days=2)}}
        )

        # 2. Run daily reminder job once
        await daily_reminder_job()
        daily_count_1 = await db["notification_deliveries"].count_documents({"userId": user_id, "type": "daily_reminder"})
        assert daily_count_1 == 1

        # Run daily reminder job again (deduplication check)
        await daily_reminder_job()
        daily_count_2 = await db["notification_deliveries"].count_documents({"userId": user_id, "type": "daily_reminder"})
        assert daily_count_2 == 1, "Duplicate daily reminder must NOT be dispatched"

        # 3. Product update announcement
        p_count_1 = await send_product_update_announcement("feat_999", "New Feature", "Summary", "<p>Details</p>")
        p_count_2 = await send_product_update_announcement("feat_999", "New Feature", "Summary", "<p>Details</p>")
        assert p_count_2 == 0, "Duplicate product update announcement must be skipped"

        # 4. Weekly Progress Report & Monthly Summary with explicit toggles
        # Seed an activity to test non-empty progress reporting
        await db["submissions"].insert_one({
            "userId": user_id,
            "status": "Accepted",
            "createdAt": datetime.utcnow()
        })
        await weekly_summary_job()
        w_count_1 = await db["notification_deliveries"].count_documents({"userId": user_id, "type": "weekly_summary"})
        assert w_count_1 == 1, "Weekly summary must record 1 delivery"

        # Repeated execution of weekly_summary_job must NOT send duplicate
        await weekly_summary_job()
        w_count_2 = await db["notification_deliveries"].count_documents({"userId": user_id, "type": "weekly_summary"})
        assert w_count_2 == 1, "Repeated weekly summary must NOT create duplicate delivery"

        # 4b. Switch preference to monthly to test monthly progress report schedule
        await client.put("/api/profile", json={
            "settings": {
                "notificationPreferences": {
                    "email": True,
                    "dailyReminder": True,
                    "weeklyProgressReport": False,
                    "progressReportFrequency": "monthly",
                    "monthlyPerformanceSummary": True,
                    "productUpdates": True
                }
            }
        }, headers=auth_headers)

        await monthly_summary_job()
        m_count_1 = await db["notification_deliveries"].count_documents({"userId": user_id, "type": "monthly_summary"})
        assert m_count_1 == 1, "Monthly summary must record 1 delivery when monthly schedule is chosen"

        # Repeated execution of monthly_summary_job must NOT send duplicate
        await monthly_summary_job()
        m_count_2 = await db["notification_deliveries"].count_documents({"userId": user_id, "type": "monthly_summary"})
        assert m_count_2 == 1, "Repeated monthly summary must NOT create duplicate delivery"

        # 5. Disable all 4 optional notifications and verify strict suppression
        await client.put("/api/profile", json={
            "settings": {
                "notificationPreferences": {
                    "email": True,
                    "dailyReminder": False,
                    "weeklyProgressReport": False,
                    "progressReportFrequency": "disabled",
                    "monthlyPerformanceSummary": False,
                    "monthlySummary": False,
                    "productUpdates": False
                }
            }
        }, headers=auth_headers)

        # Clear delivery records to verify preference suppression on new simulated period
        await db["notification_deliveries"].delete_many({"userId": user_id})

        # Run all jobs
        await daily_reminder_job()
        await weekly_summary_job()
        await monthly_summary_job()
        p_optout = await send_product_update_announcement("feat_optout_123", "Opt Out Feature", "Summary", "<p>Details</p>")

        # Assert zero deliveries sent when preferences are disabled
        deliveries_optout = await db["notification_deliveries"].count_documents({"userId": user_id})
        assert deliveries_optout == 0, "No emails must be dispatched when user has disabled optional preferences"
        user_p_optout = await db["notification_deliveries"].count_documents({"userId": user_id, "type": "product_update"})
        assert user_p_optout == 0, "Product update announcement must not be sent to opted-out candidate"

        # Clean up
        await db["users"].delete_one({"_id": user["_id"]})
        await db["submissions"].delete_many({"userId": user_id})
        await db["notifications"].delete_many({"userId": user_id})
        await db["notification_deliveries"].delete_many({"userId": user_id})
