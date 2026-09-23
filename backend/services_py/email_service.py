import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any, Optional
from core.config import settings

logger = logging.getLogger("uvicorn.error")

class EmailService:
    def __init__(self):
        self.is_configured = bool(settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASS)

    def send_email(self, to_email: str, subject: str, html_content: str, text_content: Optional[str] = None) -> Dict[str, Any]:
        if not to_email or "@" not in to_email:
            return {"success": False, "error": "Invalid recipient email"}

        if settings.EMAIL_TEST_MODE or not self.is_configured:
            logger.info(f"[EmailService] [DRY RUN] Would send to: {to_email} | Subject: '{subject}'")
            return {"success": True, "mode": "dry_run", "to": to_email}

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = settings.SMTP_FROM
            msg["To"] = to_email

            if text_content:
                msg.attach(MIMEText(text_content, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10.0) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASS)
                server.sendmail(settings.SMTP_FROM, to_email, msg.as_string())

            logger.info(f"[EmailService] Email sent successfully to {to_email}")
            return {"success": True}
        except Exception as e:
            logger.error(f"[EmailService] Failed to send email to {to_email}: {e}")
            # Never throw exception to prevent disrupting core operations
            return {"success": False, "error": str(e)}

    def get_status(self) -> Dict[str, Any]:
        return {
            "configured": self.is_configured,
            "host": settings.SMTP_HOST or None,
            "from": settings.SMTP_FROM,
            "testMode": settings.EMAIL_TEST_MODE
        }

email_service = EmailService()
