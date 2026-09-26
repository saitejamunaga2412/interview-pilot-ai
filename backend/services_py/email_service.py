import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any, Optional
from core.config import settings

logger = logging.getLogger("uvicorn.error")

import sys
if not hasattr(sys, "_interviewpilot_email_outbox"):
    sys._interviewpilot_email_outbox = []

class EmailService:
    def __init__(self):
        if not hasattr(sys, "_interviewpilot_email_outbox"):
            sys._interviewpilot_email_outbox = []
        self.outbox = sys._interviewpilot_email_outbox

    def clear_outbox(self):
        if hasattr(sys, "_interviewpilot_email_outbox"):
            sys._interviewpilot_email_outbox.clear()
        self.outbox = sys._interviewpilot_email_outbox

    def get_latest_email(self, to_email: Optional[str] = None) -> Optional[Dict[str, Any]]:
        if not self.outbox:
            return None
        if not to_email:
            return self.outbox[-1]
        target = to_email.strip().lower()
        for msg in reversed(self.outbox):
            if msg.get("to") == target or msg.get("to_email") == target:
                return msg
        return None

    def get_outbox(self, to_email: Optional[str] = None) -> list:
        if not to_email:
            return list(self.outbox)
        target = to_email.strip().lower()
        return [m for m in self.outbox if m.get("to") == target or m.get("to_email") == target]

    @property
    def is_configured(self) -> bool:
        from pathlib import Path
        from dotenv import dotenv_values
        env_path = Path(__file__).resolve().parent.parent / ".env"
        env_vals = dotenv_values(env_path) if env_path.exists() else {}
        pwd = env_vals.get("SMTP_PASS") or settings.SMTP_PASS
        usr = env_vals.get("SMTP_USER") or settings.SMTP_USER
        return bool(pwd and usr)

    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
        unsubscribe_url: Optional[str] = None,
        is_security: bool = False,
        recipient_name: Optional[str] = None,
        live_smtp: bool = False
    ) -> Dict[str, Any]:
        if not to_email or not isinstance(to_email, str):
            return {"success": False, "status": "failed", "error": "Invalid recipient: missing email address"}

        lower_email = to_email.strip().lower()
        import re
        import sys
        import os
        from datetime import datetime
        if not re.match(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$", lower_email):
            logger.warning(f"[EmailService] Rejected invalid email address: {to_email}")
            return {"success": False, "status": "failed", "error": "Invalid recipient email format"}

        outbox_entry = {
            "to": lower_email,
            "to_email": lower_email,
            "subject": subject,
            "html_content": html_content,
            "text_content": text_content,
            "unsubscribe_url": unsubscribe_url,
            "is_security": is_security,
            "recipient_name": recipient_name,
            "timestamp": datetime.utcnow().isoformat()
        }

        # Synthetic / Placeholder domain suppression to prevent internet dispatches to invalid/test inboxes
        PLACEHOLDER_DOMAINS = [
            "@example.com", "@example.org", "@example.net",
            "@test.com", "@localhost", "@fake.com", "@mailinator.com"
        ]
        if any(lower_email.endswith(d) for d in PLACEHOLDER_DOMAINS):
            logger.info(f"[EmailService] [DRY RUN] Suppressed real SMTP dispatch to placeholder address: {lower_email} | Subject: '{subject}'")
            res = {"success": True, "status": "suppressed", "reason": "placeholder_domain", "mode": "dry_run", "to": lower_email}
            outbox_entry.update(res)
            self.outbox.append(outbox_entry)
            return res

        is_test_run = bool("pytest" in sys.modules or os.getenv("PYTEST_CURRENT_TEST"))
        if (settings.EMAIL_TEST_MODE or not self.is_configured or is_test_run) and not live_smtp:
            logger.info(f"[EmailService] [DRY RUN / TEST SUITE] Suppressed live dispatch: {lower_email} | Subject: '{subject}'")
            res = {"success": True, "status": "dry_run", "mode": "dry_run", "to": lower_email}
            outbox_entry.update(res)
            self.outbox.append(outbox_entry)
            return res

        try:
            import os
            import email.utils
            from pathlib import Path
            from dotenv import dotenv_values
            env_path = Path(__file__).resolve().parent.parent / ".env"
            env_vals = dotenv_values(env_path) if env_path.exists() else {}

            smtp_host = (env_vals.get("SMTP_HOST") or os.getenv("SMTP_HOST") or settings.SMTP_HOST or "smtp.gmail.com").strip()
            smtp_port = int(env_vals.get("SMTP_PORT") or os.getenv("SMTP_PORT") or settings.SMTP_PORT or 587)
            smtp_user = (env_vals.get("SMTP_USER") or os.getenv("SMTP_USER") or settings.SMTP_USER or "").strip()
            raw_pass = env_vals.get("SMTP_PASS") or os.getenv("SMTP_PASS") or settings.SMTP_PASS or ""
            smtp_pass = raw_pass.strip().strip("'\"").replace(" ", "")

            sender_email = smtp_user if smtp_user else "interviewpilotai.notify@gmail.com"
            sender_name = "InterviewPilot AI"
            sender = f"{sender_name} <{sender_email}>"

            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = sender
            if recipient_name and recipient_name.strip():
                clean_name = recipient_name.strip().replace("\n", "").replace("\r", "")
                msg["To"] = email.utils.formataddr((clean_name, lower_email))
            else:
                msg["To"] = lower_email
            msg["Reply-To"] = f"{sender_name} Support <{sender_email}>"
            msg["Date"] = email.utils.formatdate(localtime=True)
            msg["Message-ID"] = email.utils.make_msgid(domain="gmail.com")
            msg["MIME-Version"] = "1.0"
            msg["X-Mailer"] = "InterviewPilot AI Placement OS"

            # Anti-spam header configuration:
            # 1. Do NOT set "Precedence: bulk" (causes modern Gmail spam classification).
            # 2. For security alerts, set high priority.
            # 3. For notifications, provide RFC-compliant unsubscribe headers.
            if is_security:
                msg["X-Priority"] = "1"
                msg["Importance"] = "high"
            else:
                msg["Auto-Submitted"] = "auto-generated"
                unsub_headers = [f"<mailto:{sender_email}?subject=unsubscribe>"]
                if unsubscribe_url and (unsubscribe_url.startswith("https://") or unsubscribe_url.startswith("http://")):
                    unsub_headers.append(f"<{unsubscribe_url}>")
                    msg["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click"
                msg["List-Unsubscribe"] = ", ".join(unsub_headers)

            # Plain text part attached first, HTML second (RFC 2046 standard)
            if text_content:
                msg.attach(MIMEText(text_content, "plain", "utf-8"))
            msg.attach(MIMEText(html_content, "html", "utf-8"))

            server = smtplib.SMTP(smtp_host, smtp_port, timeout=15.0)
            try:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(smtp_user, smtp_pass)
                server.sendmail(sender_email, lower_email, msg.as_string())
                try:
                    server.quit()
                except Exception:
                    pass
                logger.info(f"[EmailService] Email accepted by SMTP server for dispatch to {lower_email} | Subject: '{subject}'")
                res = {"success": True, "status": "accepted_by_smtp", "mode": "live_smtp"}
                outbox_entry.update(res)
                self.outbox.append(outbox_entry)
                return res
            except Exception as send_err:
                try:
                    server.close()
                except Exception:
                    pass
                err_clean = str(send_err)
                if smtp_pass:
                    err_clean = err_clean.replace(smtp_pass, "[REDACTED]")
                if raw_pass:
                    err_clean = err_clean.replace(raw_pass, "[REDACTED]")
                logger.error(f"[EmailService] SMTP error during dispatch to {to_email}: {type(send_err).__name__} - {err_clean[:120]}")
                res = {"success": False, "status": "failed", "error": f"{type(send_err).__name__}: {err_clean[:120]}"}
                outbox_entry.update(res)
                self.outbox.append(outbox_entry)
                return res
        except Exception as e:
            err_str = str(e)
            logger.error(f"[EmailService] Failed to send email to {to_email}: {type(e).__name__}")
            res = {"success": False, "status": "failed", "error": f"{type(e).__name__}: {err_str[:120]}"}
            outbox_entry.update(res)
            self.outbox.append(outbox_entry)
            return res

    def get_status(self) -> Dict[str, Any]:
        return {
            "configured": self.is_configured,
            "host": settings.SMTP_HOST or None,
            "from": settings.SMTP_FROM,
            "testMode": settings.EMAIL_TEST_MODE
        }

email_service = EmailService()
