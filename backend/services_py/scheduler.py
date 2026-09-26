import re
import asyncio
import logging
from datetime import datetime, timedelta
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from core.database import get_database, to_object_id
from core.config import settings
from services_py.notification_service import notification_service
from services_py.email_service import email_service
from services_py.email_templates import (
    wrap_email_html,
    button_html,
    build_daily_reminder_email,
    build_weekly_summary_email,
    build_monthly_summary_email,
    build_product_announcement_email,
    build_inactivity_reminder_email,
)

logger = logging.getLogger("uvicorn.error")

scheduler = AsyncIOScheduler()
is_running = False

def is_valid_email(email: str) -> bool:
    if not email or not isinstance(email, str):
        return False
    return bool(re.match(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$", email.strip()))

def get_user_now(user: dict) -> datetime:
    tz_str = user.get("settings", {}).get("timezone") or "Asia/Kolkata"
    try:
        import zoneinfo
        tz = zoneinfo.ZoneInfo(tz_str)
        return datetime.now(tz)
    except Exception:
        return datetime.utcnow()

async def daily_reminder_job():
    """
    Dispatches daily placement preparation missions to eligible candidates.
    Guaranteed at-most-once delivery per user per day via database-backed idempotency keys.
    Uses user-configured timezone for precise scheduling.
    """
    try:
        db = get_database()
        logger.info("[Scheduler] Running daily reminder routine...")
        frontend_base = settings.get_frontend_url()
        dashboard_link = f"{frontend_base}/dashboard"
        settings_link = f"{frontend_base}/settings"

        # Query candidates with valid emails
        users_cursor = db["users"].find(
            {"email": {"$exists": True, "$ne": ""}},
            {"_id": 1, "name": 1, "email": 1, "career": 1, "settings": 1}
        )

        in_app_count = 0
        email_count = 0

        async for user in users_cursor:
            user_id = str(user["_id"])
            user_name = user.get("name", "Candidate")
            first_name = user_name.strip().split()[0] if user_name else "Candidate"
            user_now = get_user_now(user)
            today_str = user_now.strftime("%Y-%m-%d")
            inapp_dedupe_key = f"daily_reminder_{user_id}_{today_str}"
            email_dedupe_key = f"email_daily_reminder_{user_id}_{today_str}"
            prefs = user.get("settings", {}).get("notificationPreferences", {})
            user_email = (user.get("email") or "").strip().lower()

            # 1. In-App Notification (Idempotent by inapp_dedupe_key)
            if prefs.get("inApp", True) is not False:
                await notification_service.create_notification({
                    "userId": user_id,
                    "type": "daily_reminder",
                    "title": "🎯 Daily Placement Mission Ready",
                    "message": f"Hey {first_name}! Your personalized daily tasks are ready. Keep your streak active today!",
                    "priority": "normal",
                    "actionLabel": "Open Dashboard",
                    "actionRoute": "/dashboard",
                    "source": "scheduler",
                    "dedupeKey": inapp_dedupe_key
                })
                in_app_count += 1

            # 2. Email Dispatch with Strict Database-Backed Idempotency & User Preferences
            # Requirement: Daily reminders are disabled by default until user explicitly opts in
            is_email_enabled = (prefs.get("email", True) is not False)
            is_daily_reminder_allowed = bool(prefs.get("dailyReminder", False))

            if is_email_enabled and is_daily_reminder_allowed and is_valid_email(user_email):
                # Avoid sending reminders if the user has already solved/attempted problems today
                user_today_start = datetime(user_now.year, user_now.month, user_now.day)
                already_practiced_today = await db["submissions"].find_one({
                    "userId": user_id,
                    "createdAt": {"$gte": user_today_start}
                })
                if already_practiced_today:
                    logger.info(f"[Scheduler] Candidate {user_id} already practiced today. Skipping daily reminder.")
                    continue

                # Requirement: Do not send daily, weekly, and product update emails together unnecessarily.
                # If today is Sunday and user receives weekly progress report, skip daily reminder
                freq = prefs.get("progressReportFrequency", "weekly")
                if user_now.weekday() == 6 and freq == "weekly":
                    logger.info(f"[Scheduler] Candidate {user_id} scheduled for weekly report today. Suppressing redundant daily reminder.")
                    continue

                # If user registered within the last 24 hours, they already received the Welcome email
                created_at = user.get("createdAt")
                if created_at and (datetime.utcnow() - created_at) < timedelta(hours=24):
                    logger.info(f"[Scheduler] Candidate {user_id} registered recently (<24h). Skipping daily reminder.")
                    continue

                subject, html_content, text_content = build_daily_reminder_email(
                    first_name=first_name,
                    recipient_email=user_email,
                    dashboard_link=dashboard_link,
                    settings_link=settings_link
                )

                # Acquire atomic delivery lock to guarantee at-most-once delivery
                lock_acquired = await notification_service.acquire_delivery_lock(
                    dedupe_key=email_dedupe_key,
                    user_id=user_id,
                    recipient=user_email,
                    notification_type="daily_reminder",
                    subject=subject
                )
                if not lock_acquired:
                    logger.info(f"[Scheduler] Skipped duplicate daily reminder email for {user_id} ({email_dedupe_key})")
                    continue

                # Synchronous / threaded dispatch to ensure reliable delivery tracking
                dispatch_res = await asyncio.to_thread(
                    email_service.send_email,
                    to_email=user_email,
                    subject=subject,
                    html_content=html_content,
                    text_content=text_content,
                    unsubscribe_url=settings_link,
                    is_security=False,
                    recipient_name=user_name
                )

                success = bool(dispatch_res.get("success"))
                error = dispatch_res.get("error")
                mode = dispatch_res.get("mode")

                await notification_service.record_delivery_result(
                    dedupe_key=email_dedupe_key,
                    success=success,
                    error=error,
                    mode=mode,
                    delivery_status=dispatch_res.get("status")
                )
                if success:
                    email_count += 1

        logger.info(f"[Scheduler] Daily reminder routine complete. In-App: {in_app_count}, Emails: {email_count}.")
    except Exception as e:
        logger.error(f"[Scheduler] Daily reminder job error: {e}", exc_info=True)

async def weekly_summary_job():
    """
    Generates and dispatches comprehensive weekly placement progress reports.
    Uses real MongoDB user metrics (submissions, aptitude, topics, mocks).
    Idempotent: at most once per user per calendar week.
    """
    try:
        db = get_database()
        logger.info("[Scheduler] Running weekly summary routine...")
        week_str = datetime.utcnow().strftime("%Y-W%W")
        since_date = datetime.utcnow() - timedelta(days=7)
        frontend_base = settings.get_frontend_url()
        dashboard_link = f"{frontend_base}/dashboard"
        settings_link = f"{frontend_base}/settings"

        users_cursor = db["users"].find(
            {},
            {"_id": 1, "name": 1, "email": 1, "career": 1, "settings": 1}
        )

        in_app_count = 0
        email_count = 0

        async for user in users_cursor:
            user_id = str(user["_id"])
            user_oid = to_object_id(user_id)
            user_name = user.get("name", "Candidate")
            first_name = user_name.strip().split()[0] if user_name else "Candidate"
            user_now = get_user_now(user)
            week_str = user_now.strftime("%Y-W%W")
            inapp_dedupe_key = f"weekly_summary_{user_id}_{week_str}"
            email_dedupe_key = f"email_weekly_summary_{user_id}_{week_str}"

            # 1. In-App Notification
            await notification_service.create_notification({
                "userId": user_id,
                "type": "weekly_summary",
                "title": "📊 Weekly Placement Progress Report",
                "message": "Your weekly preparation metrics, problem accuracy trends, and updated study goals are ready.",
                "priority": "normal",
                "actionLabel": "View Analytics",
                "actionRoute": "/dashboard",
                "source": "scheduler",
                "dedupeKey": inapp_dedupe_key
            })
            in_app_count += 1

            # 2. Email Dispatch with Real Performance Analytics
            prefs = user.get("settings", {}).get("notificationPreferences", {})
            user_email = (user.get("email") or "").strip().lower()

            is_email_enabled = (prefs.get("email", True) is not False)
            freq = prefs.get("progressReportFrequency", "weekly")
            weekly_pref = prefs.get("weeklyProgressReport")
            if weekly_pref is None:
                weekly_pref = prefs.get("weeklyReport")
            if weekly_pref is None:
                weekly_pref = (freq not in ["disabled", "monthly"])
            is_weekly_allowed = is_email_enabled and bool(weekly_pref) and (freq not in ["disabled", "monthly"])

            if is_weekly_allowed and is_valid_email(user_email):
                user_id_filter = {"$in": [user_id, user_oid]} if user_oid else user_id
                problems_solved = await db["submissions"].count_documents({
                    "$or": [{"userId": user_id_filter}, {"user": user_id_filter}],
                    "status": {"$in": ["Accepted", "accepted", "Completed", "completed", "PASS", "passed"]},
                    "createdAt": {"$gte": since_date}
                })
                problems_attempted = await db["submissions"].count_documents({
                    "$or": [{"userId": user_id_filter}, {"user": user_id_filter}],
                    "createdAt": {"$gte": since_date}
                })
                aptitude_attempts = await db["assessmentattempts"].count_documents({
                    "$or": [{"userId": user_id_filter}, {"user": user_id_filter}],
                    "createdAt": {"$gte": since_date}
                })
                interviews_completed = await db["interviewsessions"].count_documents({
                    "$or": [{"userId": user_id_filter}, {"user": user_id_filter}],
                    "createdAt": {"$gte": since_date}
                })
                if interviews_completed == 0:
                    results_sessions = await db["results"].distinct("sessionId", {
                        "$or": [{"userId": user_id_filter}, {"user": user_id_filter}],
                        "createdAt": {"$gte": since_date}
                    })
                    interviews_completed = len(results_sessions)

                topics_completed = await db["learningprogresses"].count_documents({
                    "$or": [{"user": user_id_filter}, {"userId": user_id_filter}],
                    "status": {"$in": ["completed", "Completed"]},
                    "$and": [
                        {"$or": [
                            {"updatedAt": {"$gte": since_date}},
                            {"createdAt": {"$gte": since_date}}
                        ]}
                    ]
                })

                total_activity = problems_attempted + aptitude_attempts + interviews_completed + topics_completed

                subject, html_content, text_content = build_weekly_summary_email(
                    first_name=first_name,
                    recipient_email=user_email,
                    dashboard_link=dashboard_link,
                    settings_link=settings_link,
                    stats={
                        "problems_solved": problems_solved,
                        "problems_attempted": problems_attempted,
                        "aptitude_attempts": aptitude_attempts,
                        "topics_completed": topics_completed
                    }
                )

                lock_acquired = await notification_service.acquire_delivery_lock(
                    dedupe_key=email_dedupe_key,
                    user_id=user_id,
                    recipient=user_email,
                    notification_type="weekly_summary",
                    subject=subject
                )
                if not lock_acquired:
                    logger.info(f"[Scheduler] Skipped duplicate weekly summary email for {user_id} ({email_dedupe_key})")
                    continue

                dispatch_res = await asyncio.to_thread(
                    email_service.send_email,
                    to_email=user_email,
                    subject=subject,
                    html_content=html_content,
                    text_content=text_content,
                    unsubscribe_url=settings_link,
                    is_security=False,
                    recipient_name=user_name
                )

                success = bool(dispatch_res.get("success"))
                error = dispatch_res.get("error")
                mode = dispatch_res.get("mode")

                await notification_service.record_delivery_result(
                    dedupe_key=email_dedupe_key,
                    success=success,
                    error=error,
                    mode=mode,
                    delivery_status=dispatch_res.get("status")
                )
                if success:
                    email_count += 1

        logger.info(f"[Scheduler] Weekly summary complete. In-App: {in_app_count}, Emails: {email_count}.")
    except Exception as e:
        logger.error(f"[Scheduler] Weekly summary job error: {e}", exc_info=True)

async def monthly_summary_job():
    """
    Monthly Placement Progress Digest:
    Dispatched once per calendar month to users who opted for monthly progress reporting.
    Analyzes past 30 days of metrics with strict database idempotency.
    """
    try:
        db = get_database()
        logger.info("[Scheduler] Running monthly summary routine...")
        since_date = datetime.utcnow() - timedelta(days=30)
        frontend_base = settings.get_frontend_url()
        dashboard_link = f"{frontend_base}/dashboard"
        settings_link = f"{frontend_base}/settings"

        users_cursor = db["users"].find(
            {
                "email": {"$exists": True, "$ne": ""},
                "$or": [
                    {"settings.notificationPreferences.monthlyPerformanceSummary": True},
                    {"settings.notificationPreferences.monthlySummary": True},
                    {"settings.notificationPreferences.progressReportFrequency": "monthly"}
                ]
            },
            {"_id": 1, "name": 1, "email": 1, "career": 1, "settings": 1}
        )

        in_app_count = 0
        email_count = 0

        async for user in users_cursor:
            user_id = str(user["_id"])
            user_oid = to_object_id(user_id)
            user_name = user.get("name", "Candidate")
            first_name = user_name.strip().split()[0] if user_name else "Candidate"
            user_now = get_user_now(user)
            month_str = user_now.strftime("%Y-%m")
            inapp_dedupe_key = f"monthly_summary_{user_id}_{month_str}"
            email_dedupe_key = f"email_monthly_summary_{user_id}_{month_str}"

            # 1. In-App Notification
            await notification_service.create_notification({
                "userId": user_id,
                "type": "monthly_summary",
                "title": "📈 Monthly Placement Progress Digest",
                "message": f"Your 30-day preparation recap and readiness score trends for {month_str} are ready.",
                "priority": "normal",
                "actionLabel": "View Monthly Report",
                "actionRoute": "/dashboard",
                "source": "scheduler",
                "dedupeKey": inapp_dedupe_key
            })
            in_app_count += 1

            # 2. Email Dispatch
            prefs = user.get("settings", {}).get("notificationPreferences", {})
            user_email = (user.get("email") or "").strip().lower()

            is_email_enabled = (prefs.get("email", True) is not False)
            freq = prefs.get("progressReportFrequency", "weekly")
            monthly_pref = prefs.get("monthlyPerformanceSummary")
            if monthly_pref is None:
                monthly_pref = prefs.get("monthlySummary")
            if monthly_pref is None:
                monthly_pref = (freq == "monthly")

            is_monthly_allowed = is_email_enabled and bool(monthly_pref) and (freq not in ["disabled", "weekly"])

            if is_monthly_allowed and is_valid_email(user_email):
                user_id_filter = {"$in": [user_id, user_oid]} if user_oid else user_id
                problems_solved = await db["submissions"].count_documents({
                    "$or": [{"userId": user_id_filter}, {"user": user_id_filter}],
                    "status": {"$in": ["Accepted", "accepted", "Completed", "completed", "PASS", "passed"]},
                    "createdAt": {"$gte": since_date}
                })
                problems_attempted = await db["submissions"].count_documents({
                    "$or": [{"userId": user_id_filter}, {"user": user_id_filter}],
                    "createdAt": {"$gte": since_date}
                })
                aptitude_attempts = await db["assessmentattempts"].count_documents({
                    "$or": [{"userId": user_id_filter}, {"user": user_id_filter}],
                    "createdAt": {"$gte": since_date}
                })
                interviews_completed = await db["interviewsessions"].count_documents({
                    "$or": [{"userId": user_id_filter}, {"user": user_id_filter}],
                    "createdAt": {"$gte": since_date}
                })
                if interviews_completed == 0:
                    results_sessions = await db["results"].distinct("sessionId", {
                        "$or": [{"userId": user_id_filter}, {"user": user_id_filter}],
                        "createdAt": {"$gte": since_date}
                    })
                    interviews_completed = len(results_sessions)

                topics_completed = await db["learningprogresses"].count_documents({
                    "$or": [{"user": user_id_filter}, {"userId": user_id_filter}],
                    "status": {"$in": ["completed", "Completed"]},
                    "$and": [
                        {"$or": [
                            {"updatedAt": {"$gte": since_date}},
                            {"createdAt": {"$gte": since_date}}
                        ]}
                    ]
                })

                month_stats = {
                    "problems_solved": problems_solved,
                    "problems_attempted": problems_attempted,
                    "topics_completed": topics_completed,
                    "aptitude_attempts": aptitude_attempts,
                    "interviews_completed": interviews_completed,
                }

                subject, html_content, text_content = build_monthly_summary_email(
                    first_name=first_name,
                    recipient_email=user_email,
                    dashboard_link=dashboard_link,
                    settings_link=settings_link,
                    stats=month_stats,
                    month_str=month_str
                )

                lock_acquired = await notification_service.acquire_delivery_lock(
                    dedupe_key=email_dedupe_key,
                    user_id=user_id,
                    recipient=user_email,
                    notification_type="monthly_summary",
                    subject=subject
                )
                if not lock_acquired:
                    continue

                dispatch_res = await asyncio.to_thread(
                    email_service.send_email,
                    to_email=user_email,
                    subject=subject,
                    html_content=html_content,
                    text_content=text_content,
                    unsubscribe_url=settings_link,
                    is_security=False,
                    recipient_name=user_name
                )

                success = bool(dispatch_res.get("success"))
                error = dispatch_res.get("error")
                mode = dispatch_res.get("mode")

                await notification_service.record_delivery_result(
                    dedupe_key=email_dedupe_key,
                    success=success,
                    error=error,
                    mode=mode,
                    delivery_status=dispatch_res.get("status")
                )
                if success:
                    email_count += 1

        logger.info(f"[Scheduler] Monthly summary complete. In-App: {in_app_count}, Emails: {email_count}.")
    except Exception as e:
        logger.error(f"[Scheduler] Monthly summary job error: {e}", exc_info=True)

async def send_product_update_announcement(update_id: str, title: str, summary: str, details_html: str, action_route: str = "/dashboard"):
    """
    Dispatches a major product update or feature announcement to candidates with productUpdates enabled.
    Idempotent per update_id.
    """
    db = get_database()
    frontend_base = settings.get_frontend_url()
    action_link = f"{frontend_base}{action_route}"
    settings_link = f"{frontend_base}/settings"

    users_cursor = db["users"].find(
        {
            "settings.notificationPreferences.productUpdates": True,
            "settings.notificationPreferences.email": {"$ne": False}
        },
        {"_id": 1, "name": 1, "email": 1, "settings": 1}
    )

    count = 0
    async for user in users_cursor:
        user_id = str(user["_id"])
        user_email = (user.get("email") or "").strip().lower()
        if not is_valid_email(user_email):
            continue
        first_name = (user.get("name") or "Candidate").strip().split()[0]
        dedupe_key = f"email_product_update_{user_id}_{update_id}"

        if user_email:
            subject, html_content, text_content = build_product_announcement_email(
                user_name=first_name,
                recipient_email=user_email,
                feature_title=title,
                description=summary,
                feature_link=action_link,
                settings_link=settings_link
            )

            lock_acquired = await notification_service.acquire_delivery_lock(
                dedupe_key=dedupe_key,
                user_id=user_id,
                recipient=user_email,
                notification_type="product_update",
                subject=subject
            )
            if not lock_acquired:
                continue

            res = await asyncio.to_thread(
                email_service.send_email,
                to_email=user_email,
                subject=subject,
                html_content=html_content,
                text_content=text_content,
                unsubscribe_url=settings_link,
                is_security=False,
                recipient_name=first_name
            )

            await notification_service.record_delivery_result(
                dedupe_key=dedupe_key,
                success=bool(res.get("success")),
                error=res.get("error"),
                mode=res.get("mode"),
                delivery_status=res.get("status")
            )
            count += 1
    return count

async def inactivity_reminder_job():
    """
    Personalized Inactivity Reminder:
    Identifies candidates who have not practiced or logged in for 7 days (configurable).
    Dispatches at most ONCE per week to the candidate's personal registered email address.
    Never sends repeated daily emails to inactive candidates.
    Respects user notificationPreferences.inactivityReminders and notificationPreferences.email.
    """
    try:
        db = get_database()
        logger.info("[Scheduler] Running personalized inactivity reminder routine...")
        now = datetime.utcnow()
        one_week_ago = now - timedelta(days=7)
        frontend_base = settings.get_frontend_url()
        dashboard_link = f"{frontend_base}/dashboard"
        settings_link = f"{frontend_base}/settings"

        users_cursor = db["users"].find(
            {"email": {"$exists": True, "$ne": ""}},
            {
                "_id": 1,
                "name": 1,
                "email": 1,
                "lastLoginAt": 1,
                "lastActiveAt": 1,
                "createdAt": 1,
                "lastInactivityReminderSentAt": 1,
                "settings": 1,
                "career": 1
            }
        )

        in_app_count = 0
        email_count = 0

        async for user in users_cursor:
            user_id = str(user["_id"])
            user_email = (user.get("email") or "").strip().lower()
            if not is_valid_email(user_email):
                continue

            prefs = user.get("settings", {}).get("notificationPreferences", {})
            if prefs.get("inactivityReminders", True) is False or prefs.get("email", True) is False:
                continue

            # 1. Frequency guard: At most 1 inactivity reminder per 7 days
            last_reminder_sent = user.get("lastInactivityReminderSentAt")
            if last_reminder_sent and (now - last_reminder_sent) < timedelta(days=7):
                continue

            user_now = get_user_now(user)
            week_str = user_now.strftime("%Y-W%W")
            email_dedupe_key = f"email_inactivity_{user_id}_{week_str}"
            inapp_dedupe_key = f"inactivity_reminder_{user_id}_{week_str}"

            if not await notification_service.can_send_email(email_dedupe_key):
                continue

            # 2. Activity check: Determine if user was active recently
            last_activity = user.get("lastActiveAt") or user.get("lastLoginAt") or user.get("createdAt")
            if not last_activity:
                continue

            configured_days = user.get("settings", {}).get("inactivityReminderDays", 7)
            inactivity_threshold = timedelta(days=configured_days)

            # Active recently -> skip
            if (now - last_activity) < inactivity_threshold:
                continue

            # Verify no recent coding submissions or assessment attempts
            recent_sub = await db["submissions"].find_one({
                "userId": user_id,
                "createdAt": {"$gte": one_week_ago}
            })
            if recent_sub:
                continue

            recent_attempt = await db["assessmentattempts"].find_one({
                "userId": user_id,
                "createdAt": {"$gte": one_week_ago}
            })
            if recent_attempt:
                continue

            first_name = (user.get("name") or "Candidate").strip().split()[0]
            target_role = user.get("career", {}).get("targetRole") or "Software Engineer"
            target_companies = user.get("career", {}).get("targetCompanies") or []
            target_str = f" for {', '.join(target_companies[:2])}" if target_companies else ""

            # 3. Create In-App Notification
            await notification_service.create_notification({
                "userId": user_id,
                "type": "inactivity_reminder",
                "title": "👋 Keep Your Placement Momentum Going",
                "message": f"Hey {first_name}, you've been away for a few days. Jump back into your {target_role} roadmap!",
                "priority": "normal",
                "actionLabel": "Resume Practice",
                "actionRoute": "/dashboard",
                "source": "scheduler",
                "dedupeKey": inapp_dedupe_key
            })
            in_app_count += 1

            # 4. Dispatch Email
            subject, html_content, text_content = build_inactivity_reminder_email(
                first_name=first_name,
                recipient_email=user_email,
                dashboard_link=dashboard_link,
                settings_link=settings_link,
                target_role=target_role
            )

            lock_acquired = await notification_service.acquire_delivery_lock(
                dedupe_key=email_dedupe_key,
                user_id=user_id,
                recipient=user_email,
                notification_type="inactivity_reminder",
                subject=subject
            )
            if not lock_acquired:
                continue

            dispatch_res = await asyncio.to_thread(
                email_service.send_email,
                to_email=user_email,
                subject=subject,
                html_content=html_content,
                text_content=text_content,
                unsubscribe_url=settings_link,
                is_security=False,
                recipient_name=first_name
            )

            success = bool(dispatch_res.get("success"))
            error = dispatch_res.get("error")
            mode = dispatch_res.get("mode")

            await notification_service.record_delivery_result(
                dedupe_key=email_dedupe_key,
                success=success,
                error=error,
                mode=mode,
                delivery_status=dispatch_res.get("status")
            )

            if success:
                email_count += 1
                await db["users"].update_one(
                    {"_id": user["_id"]},
                    {"$set": {"lastInactivityReminderSentAt": now}}
                )

        logger.info(f"[Scheduler] Inactivity reminder complete. In-App: {in_app_count}, Emails: {email_count}.")
    except Exception as e:
        logger.error(f"[Scheduler] Inactivity reminder job error: {e}", exc_info=True)

def start_scheduler():
    global is_running
    if not is_running:
        try:
            scheduler.add_job(daily_reminder_job, "cron", hour=8, minute=0, id="daily_reminder", replace_existing=True)
            scheduler.add_job(weekly_summary_job, "cron", day_of_week="sun", hour=9, minute=0, id="weekly_summary", replace_existing=True)
            scheduler.add_job(monthly_summary_job, "cron", day=1, hour=10, minute=0, id="monthly_summary", replace_existing=True)
            scheduler.add_job(inactivity_reminder_job, "cron", hour=14, minute=0, id="inactivity_reminder", replace_existing=True)
            scheduler.start()
            is_running = True
            logger.info("[Scheduler] Notification scheduler started successfully with deduplication guards.")
        except Exception as e:
            logger.warning(f"[Scheduler] Could not start scheduler: {e}")

def stop_scheduler():
    global is_running
    if is_running:
        try:
            scheduler.shutdown(wait=False)
            is_running = False
            logger.info("[Scheduler] Notification scheduler shut down cleanly.")
        except Exception as e:
            logger.warning(f"[Scheduler] Error during scheduler shutdown: {e}")

def get_scheduler_status():
    return {
        "active": is_running,
        "jobs": [job.id for job in scheduler.get_jobs()] if is_running else []
    }

