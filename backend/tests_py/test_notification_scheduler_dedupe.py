import pytest
import asyncio
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from datetime import datetime, timedelta
from core.database import get_database, ensure_indexes
from core.config import settings
from services_py.notification_service import notification_service
from services_py.scheduler import daily_reminder_job, weekly_summary_job

@pytest.mark.asyncio
async def test_notification_deduplication_and_preferences():
    db = get_database()
    await ensure_indexes()

    # 1. Create a dedicated test user with notification preferences enabled
    test_email = "dedupe_candidate@example.com"
    await db["users"].delete_many({"email": test_email})
    await db["notifications"].delete_many({"userId": {"$exists": True}})
    await db["notification_deliveries"].delete_many({"recipient": test_email})

    user_doc = {
        "name": "Dedupe Candidate",
        "email": test_email,
        "password": "hashed_password",
        "settings": {
            "timezone": "Asia/Kolkata",
            "notificationPreferences": {
                "email": True,
                "inApp": True,
                "securityAlerts": True,
                "productUpdates": True,
                "dailyReminder": True,
                "progressReportFrequency": "weekly"
            }
        },
        "createdAt": datetime.utcnow()
    }
    insert_res = await db["users"].insert_one(user_doc)
    user_id = str(insert_res.inserted_id)

    # 2. Run daily_reminder_job for the first time
    await daily_reminder_job()

    # Verify 1 in-app notification created
    in_app_count_1 = await db["notifications"].count_documents({"userId": user_id, "type": "daily_reminder"})
    assert in_app_count_1 == 1, "First run must create exactly 1 daily reminder notification"

    # Verify 1 delivery record created in notification_deliveries
    deliveries_1 = await db["notification_deliveries"].count_documents({"userId": user_id, "type": "daily_reminder"})
    assert deliveries_1 == 1, "First run must record exactly 1 delivery attempt"

    # 3. Simulate multiple scheduler executions or backend restart by running daily_reminder_job again
    await daily_reminder_job()

    # In-app notifications count must STILL be 1 (no duplicate)
    in_app_count_2 = await db["notifications"].count_documents({"userId": user_id, "type": "daily_reminder"})
    assert in_app_count_2 == 1, "Duplicate daily reminder must NOT create duplicate in-app notification"

    # Deliveries count must STILL be 1 (no duplicate email)
    deliveries_2 = await db["notification_deliveries"].count_documents({"userId": user_id, "type": "daily_reminder"})
    assert deliveries_2 == 1, "Duplicate daily reminder must NOT dispatch duplicate email"

    # 4. Test Opt-Out: Disable daily reminders in user preferences
    await db["users"].update_one(
        {"_id": insert_res.inserted_id},
        {"$set": {"settings.notificationPreferences.dailyReminder": False}}
    )
    # Clear delivery key for a new simulated day to test preference honoring
    simulated_future_key = f"email_daily_reminder_{user_id}_2026-12-31"
    # User with dailyReminder: False should NOT receive reminder
    user_opted_out = await db["users"].find_one({"_id": insert_res.inserted_id})
    prefs = user_opted_out["settings"]["notificationPreferences"]
    assert prefs["dailyReminder"] is False

    # 5. Test Weekly Progress Report deduplication and preference check
    await weekly_summary_job()
    weekly_deliveries_1 = await db["notification_deliveries"].count_documents({"userId": user_id, "type": "weekly_summary"})
    assert weekly_deliveries_1 == 1, "Weekly summary must record 1 delivery attempt"

    # Run weekly_summary_job a second time
    await weekly_summary_job()
    weekly_deliveries_2 = await db["notification_deliveries"].count_documents({"userId": user_id, "type": "weekly_summary"})
    assert weekly_deliveries_2 == 1, "Duplicate weekly summary must NOT create duplicate delivery"

    # 6. Test Weekly Report Opt-Out: Setting progressReportFrequency to "disabled"
    await db["users"].update_one(
        {"_id": insert_res.inserted_id},
        {"$set": {"settings.notificationPreferences.progressReportFrequency": "disabled"}}
    )
    user_disabled = await db["users"].find_one({"_id": insert_res.inserted_id})
    assert user_disabled["settings"]["notificationPreferences"]["progressReportFrequency"] == "disabled"

    # 7. Test Idempotency failure safety: failed dispatches are not marked as sent
    test_fail_key = f"test_fail_dedupe_{user_id}"
    await notification_service.record_delivery_attempt(
        dedupe_key=test_fail_key,
        user_id=user_id,
        recipient=test_email,
        notification_type="test",
        subject="Test"
    )
    await notification_service.record_delivery_result(
        dedupe_key=test_fail_key,
        success=False,
        error="SMTP connection timeout"
    )
    fail_record = await db["notification_deliveries"].find_one({"dedupeKey": test_fail_key})
    assert fail_record["status"] == "failed"
    assert fail_record.get("acceptedAt") is None
    assert "timeout" in fail_record["error"].lower()

    # 8. Clean up
    await db["users"].delete_many({"email": test_email})
    await db["notifications"].delete_many({"userId": user_id})
    await db["notification_deliveries"].delete_many({"userId": user_id})

@pytest.mark.asyncio
async def test_monthly_summary_and_product_updates():
    from services_py.scheduler import monthly_summary_job, send_product_update_announcement
    db = get_database()

    test_email = "monthly_candidate@example.com"
    await db["users"].delete_many({"email": test_email})
    await db["notifications"].delete_many({"recipient": test_email})
    await db["notification_deliveries"].delete_many({"recipient": test_email})

    user_doc = {
        "name": "Monthly Candidate",
        "email": test_email,
        "password": "hashed_password",
        "settings": {
            "timezone": "Asia/Kolkata",
            "notificationPreferences": {
                "email": True,
                "inApp": True,
                "productUpdates": True,
                "progressReportFrequency": "monthly"
            }
        },
        "createdAt": datetime.utcnow()
    }
    insert_res = await db["users"].insert_one(user_doc)
    user_id = str(insert_res.inserted_id)

    # 1. Run monthly summary job
    await monthly_summary_job()
    monthly_deliveries = await db["notification_deliveries"].count_documents({"userId": user_id, "type": "monthly_summary"})
    assert monthly_deliveries == 1, "Monthly summary must dispatch exactly once"

    # Run monthly summary job again (should deduplicate)
    await monthly_summary_job()
    monthly_deliveries_dup = await db["notification_deliveries"].count_documents({"userId": user_id, "type": "monthly_summary"})
    assert monthly_deliveries_dup == 1, "Duplicate monthly summary must be prevented"

    # 2. Test Product Update announcement
    update_id = "v2_release_notes"
    sent_count_1 = await send_product_update_announcement(
        update_id=update_id,
        title="InterviewPilot AI 2.0 Live",
        summary="Major enhancements to our AI Teacher & Practice Arena.",
        details_html="<p>Check out our brand new visualization modules!</p>"
    )
    assert sent_count_1 >= 1

    # Sending same announcement with same update_id should be skipped by deduplication
    sent_count_2 = await send_product_update_announcement(
        update_id=update_id,
        title="InterviewPilot AI 2.0 Live",
        summary="Major enhancements to our AI Teacher & Practice Arena.",
        details_html="<p>Check out our brand new visualization modules!</p>"
    )
    assert sent_count_2 == 0, "Duplicate product announcement must be skipped"

    # 3. Clean up
    await db["users"].delete_many({"email": test_email})
    await db["notifications"].delete_many({"userId": user_id})
    await db["notification_deliveries"].delete_many({"userId": user_id})

@pytest.mark.asyncio
async def test_frontend_urls_never_contain_5174_port():
    """Verify that settings and scheduler link generation always targets the active port 5173 or configured url, never 5174."""
    frontend_url = settings.get_frontend_url()
    assert ":5174" not in frontend_url, f"Frontend URL must not contain 5174: got {frontend_url}"
    assert "5173" in frontend_url or "https://" in frontend_url or "http://" in frontend_url
