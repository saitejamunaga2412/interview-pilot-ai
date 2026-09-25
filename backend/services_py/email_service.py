import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any, Optional
from core.config import settings

logger = logging.getLogger("uvicorn.error")

class EmailService:
    @property
    def is_configured(self) -> bool:
        from pathlib import Path
        from dotenv import dotenv_values
        env_path = Path(__file__).resolve().parent.parent / ".env"
        env_vals = dotenv_values(env_path) if env_path.exists() else {}
        pwd = env_vals.get("SMTP_PASS") or settings.SMTP_PASS
        usr = env_vals.get("SMTP_USER") or settings.SMTP_USER
        return bool(pwd and usr)

    def send_email(self, to_email: str, subject: str, html_content: str, text_content: Optional[str] = None) -> Dict[str, Any]:
        if not to_email or "@" not in to_email:
            return {"success": False, "error": "Invalid recipient email"}

        if settings.EMAIL_TEST_MODE or not self.is_configured:
            logger.info(f"[EmailService] [DRY RUN] Would send to: {to_email} | Subject: '{subject}'")
            return {"success": True, "mode": "dry_run", "to": to_email}

        try:
            import os
            from pathlib import Path
            from dotenv import dotenv_values
            env_path = Path(__file__).resolve().parent.parent / ".env"
            env_vals = dotenv_values(env_path) if env_path.exists() else {}

            smtp_host = (env_vals.get("SMTP_HOST") or os.getenv("SMTP_HOST") or settings.SMTP_HOST or "smtp.gmail.com").strip()
            smtp_port = int(env_vals.get("SMTP_PORT") or os.getenv("SMTP_PORT") or settings.SMTP_PORT or 587)
            smtp_user = (env_vals.get("SMTP_USER") or os.getenv("SMTP_USER") or settings.SMTP_USER or "").strip()
            raw_pass = env_vals.get("SMTP_PASS") or os.getenv("SMTP_PASS") or settings.SMTP_PASS or ""
            smtp_pass = raw_pass.strip().strip("'\"").replace(" ", "")

            sender = settings.SMTP_FROM
            if smtp_user and ("gmail" in smtp_host.lower() or "@" in smtp_user):
                sender = f"InterviewPilot AI <{smtp_user}>"

            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = sender
            msg["To"] = to_email

            if text_content:
                msg.attach(MIMEText(text_content, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            server = smtplib.SMTP(smtp_host, smtp_port, timeout=15.0)
            try:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(smtp_user, smtp_pass)
                server.sendmail(smtp_user if smtp_user else sender, to_email, msg.as_string())
                try:
                    server.quit()
                except Exception:
                    pass
                logger.info(f"[EmailService] Email sent successfully to {to_email}")
                return {"success": True}
            except Exception as send_err:
                try:
                    server.close()
                except Exception:
                    pass
                logger.error(f"[EmailService] SMTP error during dispatch to {to_email}: {type(send_err).__name__} - {send_err}")
                return {"success": False, "error": f"{type(send_err).__name__}: {send_err}"}
        except Exception as e:
            logger.error(f"[EmailService] Failed to send email to {to_email}: {e}")
            return {"success": False, "error": f"{type(e).__name__}: {e}"}

    def get_status(self) -> Dict[str, Any]:
        return {
            "configured": self.is_configured,
            "host": settings.SMTP_HOST or None,
            "from": settings.SMTP_FROM,
            "testMode": settings.EMAIL_TEST_MODE
        }

email_service = EmailService()
