import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from services_py.email_service import email_service
from core.config import settings

def main():
    print("Testing Live SMTP Authentication & Real Mailbox Delivery...")
    if not email_service.is_configured:
        print("FAIL: SMTP is not configured in backend/.env")
        sys.exit(1)

    # Allow passing explicit recipient mailbox via CLI argument or env var
    import os
    from pathlib import Path
    from dotenv import dotenv_values
    env_path = Path(__file__).resolve().parent.parent / ".env"
    env_vals = dotenv_values(env_path) if env_path.exists() else {}
    
    if len(sys.argv) > 1 and "@" in sys.argv[1]:
        real_recipient = sys.argv[1].strip()
    else:
        real_recipient = os.getenv("TEST_RECIPIENT_EMAIL") or env_vals.get("TEST_RECIPIENT_EMAIL") or (env_vals.get("SMTP_USER") or settings.SMTP_USER or "").strip()

    if not real_recipient or "@" not in real_recipient:
        print("FAIL: Valid real recipient email not found in configuration.")
        sys.exit(1)

    print(f"Target real mailbox: {real_recipient}")
    from datetime import datetime
    from services_py.email_templates import build_test_verification_email
    subject, html_content, text_content = build_test_verification_email(
        user_name="Placement Candidate",
        recipient_email=real_recipient,
        timestamp_str=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        settings_link=f"{settings.get_frontend_url()}/settings"
    )

    res = email_service.send_email(
        to_email=real_recipient,
        subject=subject,
        html_content=html_content,
        text_content=text_content,
        live_smtp=True
    )

    print(f"Dispatch Result: {res}")
    if res.get("success") and res.get("mode") != "dry_run":
        print("SUCCESS: Email was authenticated and accepted by Gmail SMTP server for real delivery!")
    else:
        print(f"FAILED or Dry Run: {res}")
        sys.exit(1)

if __name__ == "__main__":
    main()
