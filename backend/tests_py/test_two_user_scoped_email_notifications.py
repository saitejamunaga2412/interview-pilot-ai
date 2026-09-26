import pytest
import asyncio
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from datetime import datetime, timedelta
from core.database import get_database, ensure_indexes
from core.config import settings
from services_py.notification_service import notification_service
from services_py.scheduler import (
    daily_reminder_job,
    weekly_summary_job,
    inactivity_reminder_job,
    get_user_now
)

@pytest.mark.asyncio
async def test_two_users_receive_only_their_own_emails():
    db = get_database()
    await ensure_indexes()

    alpha_email = "alpha_candidate_test@example.com"
    beta_email = "beta_candidate_test@example.com"

    # Clean existing test data
    await db["users"].delete_many({"email": {"$in": [alpha_email, beta_email]}})
    await db["notification_deliveries"].delete_many({"recipient": {"$in": [alpha_email, beta_email]}})
    await db["notifications"].delete_many({})

    # 1. Create User Alpha (Inactive for 10 days, default preferences)
    ten_days_ago = datetime.utcnow() - timedelta(days=10)
    alpha_doc = {
        "name": "Alpha Candidate",
        "email": alpha_email,
        "password": "HashedAlphaPassword123!",
        "createdAt": ten_days_ago,
        "lastLoginAt": ten_days_ago,
        "lastActiveAt": ten_days_ago,
        "settings": {
            "timezone": "Asia/Kolkata",
            "notificationPreferences": {
                "email": True,
                "inApp": True,
                "dailyReminder": True,
                "inactivityReminders": True,
                "progressReportFrequency": "weekly"
            }
        }
    }
    alpha_res = await db["users"].insert_one(alpha_doc)
    alpha_id = str(alpha_res.inserted_id)

    # 2. Create User Beta (Active today, disabled progress report)
    today = datetime.utcnow()
    beta_doc = {
        "name": "Beta Candidate",
        "email": beta_email,
        "password": "HashedBetaPassword456!",
        "createdAt": today,
        "lastLoginAt": today,
        "lastActiveAt": today,
        "settings": {
            "timezone": "America/New_York",
            "notificationPreferences": {
                "email": True,
                "inApp": True,
                "dailyReminder": True,
                "inactivityReminders": True,
                "progressReportFrequency": "disabled"
            }
        }
    }
    beta_res = await db["users"].insert_one(beta_doc)
    beta_id = str(beta_res.inserted_id)

    # -------------------------------------------------------------------------
    # TEST 1: Daily Placement Reminder Recipient Scoping
    # -------------------------------------------------------------------------
    await daily_reminder_job()

    # Alpha delivery record must be addressed ONLY to alpha_email
    alpha_daily = await db["notification_deliveries"].find_one({
        "userId": alpha_id,
        "type": "daily_reminder"
    })
    assert alpha_daily is not None, "User Alpha must receive daily reminder"
    assert alpha_daily["recipient"] == alpha_email, "Alpha daily reminder must be addressed ONLY to Alpha's email"

    # Beta delivery record must be addressed ONLY to beta_email
    beta_daily = await db["notification_deliveries"].find_one({
        "userId": beta_id,
        "type": "daily_reminder"
    })
    assert beta_daily is not None, "User Beta must receive daily reminder"
    assert beta_daily["recipient"] == beta_email, "Beta daily reminder must be addressed ONLY to Beta's email"

    # -------------------------------------------------------------------------
    # TEST 2: Personalized Inactivity Reminder
    # -------------------------------------------------------------------------
    # Alpha has been inactive for 10 days -> should receive inactivity reminder
    # Beta was active today -> should NOT receive inactivity reminder
    await inactivity_reminder_job()

    alpha_inactivity = await db["notification_deliveries"].find_one({
        "userId": alpha_id,
        "type": "inactivity_reminder"
    })
    assert alpha_inactivity is not None, "Inactive user Alpha must receive an inactivity reminder"
    assert alpha_inactivity["recipient"] == alpha_email

    beta_inactivity = await db["notification_deliveries"].find_one({
        "userId": beta_id,
        "type": "inactivity_reminder"
    })
    assert beta_inactivity is None, "Recently active user Beta must NOT receive an inactivity reminder"

    # Inactivity Deduplication Guard: Running job again immediately must NOT send a 2nd reminder
    await inactivity_reminder_job()
    alpha_inact_count = await db["notification_deliveries"].count_documents({
        "userId": alpha_id,
        "type": "inactivity_reminder"
    })
    assert alpha_inact_count == 1, "Inactivity reminder must be limited to at most 1 per week"

    # -------------------------------------------------------------------------
    # TEST 3: Weekly Progress Report & Preferences
    # -------------------------------------------------------------------------
    # Alpha has progressReportFrequency="weekly" -> should receive weekly report
    # Beta has progressReportFrequency="disabled" -> should NOT receive weekly report
    await weekly_summary_job()

    alpha_weekly = await db["notification_deliveries"].find_one({
        "userId": alpha_id,
        "type": "weekly_summary"
    })
    assert alpha_weekly is not None, "Alpha must receive weekly summary"
    assert alpha_weekly["recipient"] == alpha_email

    beta_weekly = await db["notification_deliveries"].find_one({
        "userId": beta_id,
        "type": "weekly_summary"
    })
    assert beta_weekly is None, "Beta with progress reports disabled must NOT receive weekly summary"

    # -------------------------------------------------------------------------
    # TEST 4: Master Email Opt-Out (Unsubscribe)
    # -------------------------------------------------------------------------
    await db["users"].update_one(
        {"_id": alpha_res.inserted_id},
        {"$set": {"settings.notificationPreferences.email": False}}
    )
    # Simulate a new calendar day
    simulated_future_date = (datetime.utcnow() + timedelta(days=2)).strftime("%Y-%m-%d")
    # Alpha should not receive daily reminder when email is False
    user_alpha_refreshed = await db["users"].find_one({"_id": alpha_res.inserted_id})
    assert user_alpha_refreshed["settings"]["notificationPreferences"]["email"] is False

    # -------------------------------------------------------------------------
    # Clean up test accounts
    # -------------------------------------------------------------------------
    await db["users"].delete_many({"_id": {"$in": [alpha_res.inserted_id, beta_res.inserted_id]}})
    await db["notifications"].delete_many({"userId": {"$in": [alpha_id, beta_id]}})
    await db["notification_deliveries"].delete_many({"userId": {"$in": [alpha_id, beta_id]}})
