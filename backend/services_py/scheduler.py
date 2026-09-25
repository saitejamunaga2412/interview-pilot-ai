import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from core.database import get_database

logger = logging.getLogger("uvicorn.error")

scheduler = AsyncIOScheduler()
is_running = False

from datetime import datetime
from services_py.notification_service import notification_service

async def daily_reminder_job():
    try:
        db = get_database()
        logger.info("[Scheduler] Running daily reminder routine...")
        today_str = datetime.utcnow().strftime("%Y-%m-%d")
        
        # Iterate over users who want inApp notifications
        users_cursor = db["users"].find(
            {"$or": [
                {"settings.notificationPreferences.inApp": True},
                {"settings.notificationPreferences": {"$exists": False}}
            ]},
            {"_id": 1, "name": 1, "email": 1, "career": 1, "settings": 1}
        ).limit(500)
        
        count = 0
        async for user in users_cursor:
            user_id = str(user["_id"])
            user_name = user.get("name", "Candidate")
            dedupe_key = f"daily_reminder_{user_id}_{today_str}"
            
            await notification_service.create_notification({
                "userId": user_id,
                "type": "daily_reminder",
                "title": "🎯 Daily Placement Mission Ready",
                "message": f"Hey {user_name.split()[0]}! Your personalized daily tasks are ready. Keep your streak active today!",
                "priority": "normal",
                "actionLabel": "Open Dashboard",
                "actionRoute": "/dashboard",
                "source": "scheduler",
                "dedupeKey": dedupe_key
            })
            count += 1

            # Dispatch email if user explicitly opted in to email notifications
            if user.get("settings", {}).get("notificationPreferences", {}).get("email") and user.get("email"):
                try:
                    from services_py.email_service import email_service
                    first_name = user_name.split()[0]
                    email_service.send_email(
                        to_email=user["email"],
                        subject="🎯 Your Daily Placement Prep is Ready — InterviewPilot AI",
                        html_content=f"<h3>Keep Your Streak Alive, {first_name}!</h3><p>Your personalized daily placement tasks are ready on your dashboard.</p><p><a href='http://localhost:5174/dashboard'>Open Today's Mission &rarr;</a></p>",
                        text_content=f"Hey {first_name}! Your personalized daily placement tasks are ready on your dashboard: http://localhost:5174/dashboard"
                    )
                except Exception as mail_err:
                    logger.warning(f"[Scheduler] Email dispatch failed for user {user_id}: {mail_err}")
            
        logger.info(f"[Scheduler] Daily reminder routine processed for {count} candidates.")
    except Exception as e:
        logger.warning(f"[Scheduler] Daily reminder job error: {e}")

async def weekly_summary_job():
    try:
        db = get_database()
        logger.info("[Scheduler] Running weekly summary routine...")
        week_str = datetime.utcnow().strftime("%Y-W%W")
        
        users_cursor = db["users"].find({}, {"_id": 1, "name": 1}).limit(500)
        count = 0
        async for user in users_cursor:
            user_id = str(user["_id"])
            dedupe_key = f"weekly_summary_{user_id}_{week_str}"
            
            await notification_service.create_notification({
                "userId": user_id,
                "type": "weekly_summary",
                "title": "📊 Weekly Placement Progress Report",
                "message": "Check your readiness calibration, problem accuracy trends, and updated weak areas for the week.",
                "priority": "normal",
                "actionLabel": "View Analytics",
                "actionRoute": "/analytics",
                "source": "scheduler",
                "dedupeKey": dedupe_key
            })
            count += 1
        logger.info(f"[Scheduler] Weekly summary processed for {count} candidates.")
    except Exception as e:
        logger.warning(f"[Scheduler] Weekly summary job error: {e}")

def start_scheduler():
    global is_running
    if not is_running:
        try:
            scheduler.add_job(daily_reminder_job, "cron", hour=8, minute=0, id="daily_reminder", replace_existing=True)
            scheduler.add_job(weekly_summary_job, "cron", day_of_week="sun", hour=9, minute=0, id="weekly_summary", replace_existing=True)
            scheduler.start()
            is_running = True
            logger.info("[Scheduler] Notification scheduler started successfully.")
        except Exception as e:
            logger.warning(f"[Scheduler] Could not start scheduler: {e}")

def get_scheduler_status():
    return {
        "active": is_running,
        "jobs": [job.id for job in scheduler.get_jobs()] if is_running else []
    }
