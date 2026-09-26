"""
InterviewPilot AI — Professional Email Templates
Engineered for maximum inbox deliverability, spam avoidance, and cross-client compatibility.
"""

from typing import Optional, Tuple, Dict, Any

def wrap_email_html(
    title: str,
    preheader: str,
    content_html: str,
    recipient_email: str,
    settings_link: str,
    is_security: bool = False,
    category_label: str = "Placement Preparation"
) -> str:
    """
    Wraps content in a bulletproof, RFC-compliant, responsive HTML email template.
    Avoids spam triggers: uses standard table layout, balanced contrast, valid DOCTYPE,
    preheader preview text, clear organizational identity, and preference/unsubscribe footer.
    """
    safe_preheader = preheader.strip() if preheader else title
    
    footer_action_html = ""
    if is_security:
        footer_action_html = f"""
        <p style="margin: 0 0 6px 0; color: #475569; font-size: 12px; line-height: 1.5;">
            <strong>Security Notice:</strong> Sent to <strong style="color: #334155;">{recipient_email}</strong>. This is a mandatory account security notification. If you did not initiate this action, please secure your account immediately.
        </p>
        """
    else:
        footer_action_html = f"""
        <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px; line-height: 1.5;">
            You are receiving this preparation update at <strong style="color: #334155;">{recipient_email}</strong> based on your active notification preferences.
        </p>
        <p style="margin: 0; font-size: 12px;">
            <a href="{settings_link}" style="color: #4f46e5; text-decoration: underline; font-weight: 600;">Manage Notification Preferences</a> &nbsp;&bull;&nbsp; 
            <a href="{settings_link}" style="color: #64748b; text-decoration: underline;">Unsubscribe from optional digests</a>
        </p>
        """

    return f"""<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="format-detection" content="telephone=no" />
    <title>{title}</title>
    <style type="text/css">
        body {{ margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }}
        table {{ border-spacing: 0; border-collapse: collapse; }}
        td {{ padding: 0; }}
        img {{ border: 0; }}
        a {{ color: #4f46e5; text-decoration: none; }}
        @media only screen and (max-width: 620px) {{
            .wrapper-table {{ width: 100% !important; padding: 12px !important; }}
            .card-content {{ padding: 24px 18px !important; }}
            .metric-col {{ display: block !important; width: 100% !important; margin-bottom: 10px !important; }}
        }}
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; color: #334155;">
    <!-- Hidden Preheader Preview Text -->
    <div style="display: none; font-size: 1px; color: #f1f5f9; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        {safe_preheader} &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
    </div>

    <!-- Main Container Table -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; width: 100%; margin: 0; padding: 32px 12px;" class="wrapper-table">
        <tr>
            <td align="center">
                <!-- Inner Card (600px Max) -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 580px; width: 100%; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);">
                    <!-- Brand Header Bar -->
                    <tr>
                        <td style="padding: 24px 32px 20px 32px; border-bottom: 1px solid #f1f5f9; background: #ffffff;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td>
                                        <span style="font-size: 18px; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; display: inline-block;">InterviewPilot <span style="color: #4f46e5;">AI</span></span>
                                        <span style="display: block; font-size: 11px; color: #64748b; font-weight: 500; margin-top: 2px;">Placement Operating System</span>
                                    </td>
                                    <td align="right">
                                        <span style="display: inline-block; padding: 4px 10px; background-color: #eef2ff; border: 1px solid #e0e7ff; border-radius: 9999px; font-size: 11px; font-weight: 600; color: #4338ca; text-transform: uppercase; letter-spacing: 0.04em;">
                                            {category_label}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 32px; color: #334155; font-size: 14px; line-height: 1.6;" class="card-content">
                            {content_html}
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 32px 28px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                            {footer_action_html}
                            <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 11px; line-height: 1.5;">
                                <span>InterviewPilot AI &bull; AI-Powered Campus & Experienced Placement OS</span><br />
                                <span>Official notification from interviewpilotai.notify@gmail.com</span>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""

def button_html(text: str, url: str, color: str = "#4f46e5") -> str:
    """Bulletproof email button compatible with Gmail and Outlook"""
    return f"""
    <table cellpadding="0" cellspacing="0" border="0" style="margin: 24px auto;">
        <tr>
            <td align="center" style="border-radius: 8px; background-color: {color};">
                <a href="{url}" target="_blank" style="display: inline-block; padding: 13px 28px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 8px; border: 1px solid {color};">
                    {text} &rarr;
                </a>
            </td>
        </tr>
    </table>
    """

# ---------------------------------------------------------------------------
# Template Builders
# ---------------------------------------------------------------------------

def build_welcome_email(user_name: str, recipient_email: str, dashboard_link: str, settings_link: str) -> Tuple[str, str, str]:
    first_name = (user_name or "Candidate").strip().split()[0]
    subject = "Welcome to InterviewPilot AI — Your Placement Preparation Journey Starts Here"
    preheader = f"Welcome {first_name}, your AI-powered placement preparation workspace is ready."

    content = f"""
    <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Welcome to InterviewPilot AI, {first_name}</h1>
    <p style="font-size: 14px; color: #475569; margin: 0 0 20px 0; line-height: 1.6;">
        Welcome to your unified AI placement preparation operating system. InterviewPilot AI is engineered to guide engineering students and candidates through every step of campus and off-campus recruitment drives.
    </p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 700; color: #1e293b; text-transform: uppercase; letter-spacing: 0.04em;">Key Capabilities Included in Your Workspace:</h3>
        <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 13px; line-height: 1.8;">
            <li><strong>Personalized Learning Roadmaps:</strong> Step-by-step conceptual walkthroughs with live diagrams and dry-runs.</li>
            <li><strong>Coding Arena:</strong> Live compiler and test execution covering top campus interview DSA patterns.</li>
            <li><strong>AI Mock Interviews:</strong> Real-time technical and behavioral simulation rounds with comprehensive scoring.</li>
            <li><strong>Resume ATS Preparation:</strong> Automated resume grading and role-targeted keyword enhancement.</li>
        </ul>
    </div>

    {button_html("Launch Your Placement Dashboard", dashboard_link)}

    <p style="font-size: 12px; color: #64748b; margin: 16px 0 0 0; text-align: center;">
        Direct link: <a href="{dashboard_link}" style="color: #4f46e5; word-break: break-all;">{dashboard_link}</a>
    </p>

    <p style="font-size: 13px; color: #475569; margin-top: 24px; line-height: 1.5;">
        Best regards,<br />
        <strong>The InterviewPilot AI Team</strong>
    </p>
    """

    html = wrap_email_html(
        title=subject,
        preheader=preheader,
        content_html=content,
        recipient_email=recipient_email,
        settings_link=settings_link,
        is_security=False,
        category_label="Account Setup"
    )

    text = f"""Welcome to InterviewPilot AI, {first_name}!

Your placement preparation workspace is ready.

Key modules to get started:
1. Learning Roadmaps: Conceptual walkthroughs and interactive visualizations
2. Coding Arena: Top campus practice problems with real-time test runs
3. AI Mock Interviews: Real-time placement simulations with comprehensive feedback
4. Resume Preparation: ATS keyword optimization and placement scoring

Launch your dashboard: {dashboard_link}
Manage notification preferences: {settings_link}

Best regards,
The InterviewPilot AI Team
Sent to: {recipient_email}
"""
    return subject, html, text

def build_password_reset_email(user_name: str, recipient_email: str, reset_link: str, reset_token: Optional[str] = None, settings_link: str = "") -> Tuple[str, str, str]:
    first_name = (user_name or "Candidate").strip().split()[0]
    display_name = user_name.strip() if user_name and user_name.strip() else "Candidate"
    subject = "Reset Your InterviewPilot AI Password"
    preheader = f"Hello {display_name}, follow this secure link to reset your InterviewPilot AI password."

    content = f"""
    <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Reset Your Password</h1>
    <p style="font-size: 14px; color: #475569; margin: 0 0 16px 0; line-height: 1.6;">
        Hello {display_name},
    </p>
    <p style="font-size: 14px; color: #475569; margin: 0 0 16px 0; line-height: 1.6;">
        We received a request to reset the password for your InterviewPilot AI account.
    </p>
    <p style="font-size: 14px; color: #475569; margin: 0 0 20px 0; line-height: 1.6;">
        Click the button below to securely create a new password.
    </p>

    {button_html("Reset Password", reset_link, color="#4f46e5")}

    <p style="font-size: 12px; color: #64748b; line-height: 1.6; margin: 16px 0 0 0; text-align: center;">
        Direct link: <a href="{reset_link}" style="color: #4f46e5; word-break: break-all;">{reset_link}</a>
    </p>

    <div style="margin-top: 24px; padding: 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
        <p style="font-size: 12px; color: #475569; line-height: 1.6; margin: 0 0 8px 0;">
            For your security, this link expires after a short period (15 minutes) and can only be used once.
        </p>
        <p style="font-size: 12px; color: #64748b; line-height: 1.6; margin: 0;">
            If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>
    </div>

    <p style="font-size: 13px; color: #475569; margin-top: 24px; line-height: 1.5;">
        Best regards,<br />
        <strong>InterviewPilot AI Support</strong>
    </p>
    """

    html = wrap_email_html(
        title=subject,
        preheader=preheader,
        content_html=content,
        recipient_email=recipient_email,
        settings_link=settings_link,
        is_security=True,
        category_label="Security Alert"
    )

    text = f"""Hello {display_name},

We received a request to reset the password for your InterviewPilot AI account.

Click the link below to securely create a new password:
{reset_link}

For your security, this link expires after a short period and can only be used once.

If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.

Best regards,
InterviewPilot AI Support
Official sender: interviewpilotai.notify@gmail.com
Sent to: {recipient_email}
"""
    return subject, html, text

def build_password_changed_email(user_name: str, recipient_email: str, login_link: str, settings_link: str) -> Tuple[str, str, str]:
    first_name = (user_name or "Candidate").strip().split()[0]
    subject = "Security Notice: Your InterviewPilot AI password was changed"
    preheader = "Your InterviewPilot AI account password was successfully updated."

    content = f"""
    <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Password Changed Successfully</h1>
    <p style="font-size: 14px; color: #475569; margin: 0 0 20px 0; line-height: 1.6;">
        Hello {first_name}, the password for your InterviewPilot AI account was recently updated. You can now use your new password to sign in.
    </p>

    {button_html("Sign In to Your Account", login_link, color="#10b981")}

    <p style="font-size: 12px; color: #b91c1c; background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 6px; padding: 12px; margin: 20px 0; line-height: 1.5;">
        <strong>Important:</strong> If you did not make this change, please contact support immediately or use the Forgot Password workflow to secure your account.
    </p>
    """

    html = wrap_email_html(
        title=subject,
        preheader=preheader,
        content_html=content,
        recipient_email=recipient_email,
        settings_link=settings_link,
        is_security=True,
        category_label="Security Notice"
    )

    text = f"""Hello {first_name},

Your InterviewPilot AI account password was successfully updated.

Sign in to your account: {login_link}

If you did not make this change, please contact support immediately to secure your account.

InterviewPilot AI Security
Sent to: {recipient_email}
"""
    return subject, html, text

def build_daily_reminder_email(first_name: str, recipient_email: str, dashboard_link: str, settings_link: str) -> Tuple[str, str, str]:
    subject = "Your Daily Placement Preparation Plan Is Ready"
    preheader = f"Hello {first_name}, your daily placement preparation mission is ready on your dashboard."

    content = f"""
    <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Daily Placement Preparation Plan</h1>
    <p style="font-size: 14px; color: #475569; margin: 0 0 20px 0; line-height: 1.6;">
        Hello {first_name}, your personalized study plan for today is ready. Consistent daily practice is the single most proven factor in mastering campus placement rounds.
    </p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <h4 style="margin: 0 0 8px 0; font-size: 12px; color: #1e293b; text-transform: uppercase;">Suggested Plan for Today:</h4>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.6;">
            <li>Solve 1 Medium difficulty question in the Coding Arena</li>
            <li>Review 1 key conceptual topic in DBMS, Operating Systems, or System Design</li>
            <li>Keep your placement streak active</li>
        </ul>
    </div>

    {button_html("Continue Preparation", dashboard_link)}

    <p style="font-size: 12px; color: #64748b; margin-top: 20px; text-align: center;">
        Need to adjust your reminder schedule? <a href="{settings_link}" style="color: #4f46e5; text-decoration: underline;">Notification Settings</a>
    </p>
    """

    html = wrap_email_html(
        title=subject,
        preheader=preheader,
        content_html=content,
        recipient_email=recipient_email,
        settings_link=settings_link,
        is_security=False,
        category_label="Daily Mission"
    )

    text = f"""Hello {first_name},

Your customized daily placement preparation plan is ready on your dashboard.
Consistent daily effort builds problem-solving confidence and interview readiness.

Suggested tasks for today:
1. Solve 1 Medium question in the Coding Arena
2. Review 1 core topic in DBMS/OS
3. Maintain your practice streak

Continue preparation: {dashboard_link}
Notification settings: {settings_link}

InterviewPilot AI - Placement Operating System
Sent to: {recipient_email}
"""
    return subject, html, text

def build_weekly_summary_email(
    first_name: str,
    recipient_email: str,
    dashboard_link: str,
    settings_link: str,
    stats: Dict[str, Any]
) -> Tuple[str, str, str]:
    subject = "Your Weekly Placement Progress Report"
    preheader = f"Here is your verified weekly placement preparation progress, {first_name}."

    solved = stats.get("problems_solved", 0)
    attempted = stats.get("problems_attempted", 0)
    aptitude = stats.get("aptitude_attempts", 0)
    topics = stats.get("topics_completed", 0)
    total_activity = solved + attempted + aptitude + topics

    if total_activity == 0:
        metric_block = f"""
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #1e293b; font-weight: 700;">Reporting Period: Past 7 Days</h3>
            <p style="font-size: 13px; color: #475569; margin: 0 0 12px 0; line-height: 1.6;">
                You haven't logged any practice activity over the past week. Consistency is key to standing out during placement season. Here is your targeted plan to get back on track:
            </p>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.6;">
                <li>Solve 1 Medium difficulty question in the Coding Arena</li>
                <li>Review high-frequency interview topics (DBMS, OS, System Design)</li>
                <li>Take a 15-minute quick aptitude assessment</li>
            </ul>
        </div>
        """
    else:
        metric_block = f"""
        <div style="margin: 16px 0 6px 0; font-size: 12px; color: #64748b; font-weight: 600;">
            Reporting Period: Past 7 Days
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 12px 0 20px 0;">
            <tr>
                <td width="48%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; text-align: center;" class="metric-col">
                    <span style="font-size: 24px; font-weight: 800; color: #4f46e5; display: block;">{solved}</span>
                    <span style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase;">Problems Solved</span>
                </td>
                <td width="4%"></td>
                <td width="48%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; text-align: center;" class="metric-col">
                    <span style="font-size: 24px; font-weight: 800; color: #059669; display: block;">{topics}</span>
                    <span style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase;">Topics Completed</span>
                </td>
            </tr>
        </table>
        """

    content = f"""
    <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Your Weekly Placement Progress Report</h1>
    <p style="font-size: 14px; color: #475569; margin: 0 0 20px 0; line-height: 1.6;">
        Hello {first_name}, here is a summary of your verified preparation activity over the past 7 days:
    </p>

    {metric_block}

    {button_html("Open Analytics", dashboard_link)}
    """

    html = wrap_email_html(
        title=subject,
        preheader=preheader,
        content_html=content,
        recipient_email=recipient_email,
        settings_link=settings_link,
        is_security=False,
        category_label="Weekly Digest"
    )

    if total_activity == 0:
        text = f"""Your Weekly Placement Progress Report for {first_name}:
Reporting Period: Past 7 Days

No activity was logged this past week.
Suggested Next Steps:
- Solve 1 Medium question in the Coding Arena
- Review Core CS fundamentals (DBMS / OS)
- Attempt an AI mock interview

Open analytics: {dashboard_link}
Manage preferences: {settings_link}

InterviewPilot AI
Sent to: {recipient_email}
"""
    else:
        text = f"""Your Weekly Placement Progress Report for {first_name}:
Reporting Period: Past 7 Days

Problems Solved: {solved}
Problems Attempted: {attempted}
Aptitude Quizzes: {aptitude}
Topics Completed: {topics}

Open analytics: {dashboard_link}
Manage preferences: {settings_link}

InterviewPilot AI
Sent to: {recipient_email}
"""
    return subject, html, text

def build_inactivity_reminder_email(
    first_name: str,
    recipient_email: str,
    dashboard_link: str,
    settings_link: str,
    target_role: str = "Software Engineering"
) -> Tuple[str, str, str]:
    subject = "Your Placement Preparation Journey Is Waiting"
    preheader = f"Hello {first_name}, pick up where you left off on your placement roadmap."

    content = f"""
    <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Your Placement Preparation Journey Is Waiting</h1>
    <p style="font-size: 14px; color: #475569; margin: 0 0 20px 0; line-height: 1.6;">
        Hello {first_name}, we noticed you haven't practiced on InterviewPilot AI recently. Consistent practice is the most direct path to confidence when preparing for {target_role} placement drives.
    </p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <h4 style="margin: 0 0 8px 0; font-size: 12px; color: #1e293b; text-transform: uppercase;">Suggested Next Action:</h4>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.6;">
            <li>Review 1 key conceptual topic in the AI Teacher</li>
            <li>Practice 1 coding problem in your target topic</li>
        </ul>
    </div>

    {button_html("Resume Preparation", dashboard_link)}
    """

    html = wrap_email_html(
        title=subject,
        preheader=preheader,
        content_html=content,
        recipient_email=recipient_email,
        settings_link=settings_link,
        is_security=False,
        category_label="Study Reminder"
    )

    text = f"""Hello {first_name},

Your placement preparation journey is waiting on InterviewPilot AI.
Consistent practice is the most direct path to confidence for {target_role} roles.

Suggested next action:
- Review 1 key conceptual topic in the AI Teacher
- Practice 1 coding problem in your target topic

Resume preparation: {dashboard_link}
Manage notification preferences: {settings_link}

InterviewPilot AI
Sent to: {recipient_email}
"""
    return subject, html, text

def build_test_verification_email(
    user_name: str,
    recipient_email: str,
    timestamp_str: str,
    settings_link: str
) -> Tuple[str, str, str]:
    first_name = (user_name or "Candidate").strip().split()[0]
    subject = "InterviewPilot AI Verification Test"
    preheader = f"SMTP mailbox verification test for {recipient_email}."

    content = f"""
    <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Mailbox Delivery Verification</h1>
    <p style="font-size: 14px; color: #475569; margin: 0 0 16px 0; line-height: 1.6;">
        Hello {first_name}, this test email confirms that your InterviewPilot AI account is properly connected to our official notification system.
    </p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 12px; color: #475569; line-height: 1.8;">
            <tr><td width="30%"><strong>Recipient:</strong></td><td>{recipient_email}</td></tr>
            <tr><td><strong>Official Sender:</strong></td><td>interviewpilotai.notify@gmail.com</td></tr>
            <tr><td><strong>Timestamp:</strong></td><td>{timestamp_str}</td></tr>
            <tr><td><strong>Status:</strong></td><td style="color: #059669; font-weight: 600;">Verified Active</td></tr>
        </table>
    </div>

    <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0;">
        If this message was delivered to your Spam or Junk folder, mark it as <strong>"Not Spam"</strong> to teach Gmail filters to deliver future preparation digests and security alerts directly to your Primary Inbox.
    </p>
    """

    html = wrap_email_html(
        title=subject,
        preheader=preheader,
        content_html=content,
        recipient_email=recipient_email,
        settings_link=settings_link,
        is_security=False,
        category_label="System Verification"
    )

    text = f"""InterviewPilot AI Verification Test

Hello {first_name},
This test email confirms that your InterviewPilot AI installation is connected.

Recipient: {recipient_email}
Official Sender: interviewpilotai.notify@gmail.com
Timestamp: {timestamp_str}

If this email arrived in your Spam folder, mark it as "Not Spam" to ensure future notifications reach your Primary Inbox.

InterviewPilot AI
"""
    return subject, html, text

def build_email_verification_email(
    user_name: str,
    recipient_email: str,
    verify_link: str,
    settings_link: str = ""
) -> Tuple[str, str, str]:
    first_name = (user_name or "Candidate").strip().split()[0]
    subject = "Verify Your Email Address - InterviewPilot AI"
    preheader = f"Hello {first_name}, please verify your email address to secure your account."

    content = f"""
    <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Verify Your Email Address</h1>
    <p style="font-size: 14px; color: #475569; margin: 0 0 20px 0; line-height: 1.6;">
        Hello {first_name}, thank you for registering with InterviewPilot AI. To activate all platform features and safeguard your placement progress, please confirm your email address:
    </p>

    {button_html("Verify Email Address", verify_link, color="#4f46e5")}

    <p style="font-size: 12px; color: #64748b; margin: 20px 0 0 0; text-align: center;">
        Direct link: <a href="{verify_link}" style="color: #4f46e5; word-break: break-all;">{verify_link}</a>
    </p>

    <div style="margin-top: 24px; padding: 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
        <p style="font-size: 12px; color: #64748b; line-height: 1.6; margin: 0;">
            This verification link expires in 24 hours. If you did not create an InterviewPilot AI account, you can safely disregard this message.
        </p>
    </div>
    """

    html = wrap_email_html(
        title=subject,
        preheader=preheader,
        content_html=content,
        recipient_email=recipient_email,
        settings_link=settings_link,
        is_security=True,
        category_label="Account Verification"
    )

    text = f"""Hello {first_name},

Please verify your email address for InterviewPilot AI:
{verify_link}

This verification link expires in 24 hours. If you did not register, ignore this email.

InterviewPilot AI Support
Official sender: interviewpilotai.notify@gmail.com
Sent to: {recipient_email}
"""
    return subject, html, text

def build_monthly_summary_email(
    first_name: str,
    recipient_email: str,
    dashboard_link: str,
    settings_link: str,
    stats: Dict[str, Any],
    month_str: str
) -> Tuple[str, str, str]:
    subject = "Your Monthly Placement Preparation Report"
    preheader = f"Your verified monthly placement preparation report for {month_str}, {first_name}."

    solved = stats.get("problems_solved", 0)
    attempted = stats.get("problems_attempted", 0)
    topics = stats.get("topics_completed", 0)
    aptitude = stats.get("aptitude_attempts", 0)
    interviews = stats.get("interviews_completed", 0)
    total_activity = solved + attempted + topics + aptitude + interviews

    if total_activity == 0:
        metric_block = f"""
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #1e293b; font-weight: 700;">Reporting Month: {month_str}</h3>
            <p style="font-size: 13px; color: #475569; margin: 0 0 12px 0; line-height: 1.6;">
                You haven't logged any practice activity during {month_str}. To build readiness for upcoming campus placement rounds, here is your practical 30-day preparation plan:
            </p>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.6;">
                <li>Complete 10 Medium Coding Arena problems in your target language</li>
                <li>Review 3 core CS topics (DBMS, Operating Systems, Computer Networks)</li>
                <li>Take 1 full-length AI Technical Mock Interview</li>
            </ul>
        </div>
        """
    else:
        metric_block = f"""
        <div style="margin: 16px 0 6px 0; font-size: 12px; color: #64748b; font-weight: 600;">
            Reporting Month: {month_str}
        </div>
        <table width="100%" cellpadding="8" cellspacing="0" border="0" style="margin-bottom: 20px; font-size: 13px; color: #334155; border: 1px solid #e2e8f0; border-collapse: collapse;">
            <tr style="background-color: #f8fafc;">
                <th align="left" style="border: 1px solid #e2e8f0; padding: 10px;">Placement Preparation Metric</th>
                <th align="right" style="border: 1px solid #e2e8f0; padding: 10px;">Monthly Count</th>
            </tr>
            <tr>
                <td style="border: 1px solid #e2e8f0; padding: 8px;">Coding Problems Solved</td>
                <td align="right" style="border: 1px solid #e2e8f0; padding: 8px; font-weight: bold; color: #4338ca;">{solved}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #e2e8f0; padding: 8px;">Core Topics Completed</td>
                <td align="right" style="border: 1px solid #e2e8f0; padding: 8px; font-weight: bold; color: #059669;">{topics}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #e2e8f0; padding: 8px;">Aptitude Assessments Completed</td>
                <td align="right" style="border: 1px solid #e2e8f0; padding: 8px; font-weight: bold; color: #d97706;">{aptitude}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #e2e8f0; padding: 8px;">AI Mock Interviews Completed</td>
                <td align="right" style="border: 1px solid #e2e8f0; padding: 8px; font-weight: bold; color: #db2777;">{interviews}</td>
            </tr>
        </table>
        """

    content = f"""
    <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Your Monthly Placement Preparation Report</h1>
    <p style="font-size: 14px; color: #475569; margin: 0 0 20px 0; line-height: 1.6;">
        Hello {first_name}, here is your verified 30-day preparation activity report for <strong>{month_str}</strong>:
    </p>

    {metric_block}

    {button_html("Open Analytics Dashboard", dashboard_link)}
    """

    html = wrap_email_html(
        title=subject,
        preheader=preheader,
        content_html=content,
        recipient_email=recipient_email,
        settings_link=settings_link,
        is_security=False,
        category_label="Monthly Digest"
    )

    if total_activity == 0:
        text = f"""Your Monthly Placement Preparation Report - {month_str}
Candidate: {first_name}

No activity recorded during {month_str}.
Recommended Next Steps:
- Complete 10 Medium Coding problems
- Review Core CS fundamentals (DBMS, OS, Networks)
- Schedule an AI Mock Interview

Open Analytics: {dashboard_link}
Manage Preferences: {settings_link}

InterviewPilot AI
Sent to: {recipient_email}
"""
    else:
        text = f"""Your Monthly Placement Preparation Report - {month_str}
Candidate: {first_name}

Coding Problems Solved: {solved}
Topics Completed: {topics}
Aptitude Assessments: {aptitude}
Mock Interviews: {interviews}

Open Analytics: {dashboard_link}
Manage Preferences: {settings_link}

InterviewPilot AI
Sent to: {recipient_email}
"""
    return subject, html, text

def build_product_announcement_email(
    user_name: str,
    recipient_email: str,
    feature_title: str,
    description: str,
    feature_link: str,
    settings_link: str
) -> Tuple[str, str, str]:
    first_name = (user_name or "Candidate").strip().split()[0]
    import re
    clean_title = re.sub(r"\b[0-9a-f]{6,}\b", "", feature_title, flags=re.IGNORECASE).strip()
    clean_title = re.sub(r"\s+", " ", clean_title) or "Platform Upgrade"
    subject = f"InterviewPilot AI — Feature Update: {clean_title}"
    preheader = f"Hello {first_name}, discover what's new in InterviewPilot AI: {clean_title}."

    content = f"""
    <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">New Feature Release: {clean_title}</h1>
    <p style="font-size: 14px; color: #475569; margin: 0 0 20px 0; line-height: 1.6;">
        Hello {first_name}, we have released a major platform upgrade designed to accelerate your placement preparation:
    </p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0;">
        <h3 style="margin: 0 0 8px 0; font-size: 15px; color: #1e293b; font-weight: 700;">{feature_title}</h3>
        <p style="font-size: 13px; color: #475569; margin: 0; line-height: 1.6;">
            {description}
        </p>
    </div>

    {button_html(f"Explore {feature_title}", feature_link, color="#4f46e5")}

    <p style="font-size: 12px; color: #64748b; margin: 20px 0 0 0; text-align: center;">
        Direct link: <a href="{feature_link}" style="color: #4f46e5; word-break: break-all;">{feature_link}</a>
    </p>
    """

    html = wrap_email_html(
        title=subject,
        preheader=preheader,
        content_html=content,
        recipient_email=recipient_email,
        settings_link=settings_link,
        is_security=False,
        category_label="Product Update"
    )

    text = f"""New Feature Release: {feature_title}
Hello {first_name},

{description}

Explore the new feature: {feature_link}
Manage notification preferences: {settings_link}

InterviewPilot AI - Placement Operating System
Sent to: {recipient_email}
"""
    return subject, html, text

def build_security_alert_email(
    user_name: str,
    recipient_email: str,
    alert_title: str,
    alert_description: str,
    action_link: str,
    settings_link: str
) -> Tuple[str, str, str]:
    first_name = (user_name or "Candidate").strip().split()[0]
    subject = f"Security Alert: {alert_title} - InterviewPilot AI"
    preheader = f"Important security notification for your InterviewPilot AI account."

    content = f"""
    <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Security Alert: {alert_title}</h1>
    <p style="font-size: 14px; color: #475569; margin: 0 0 20px 0; line-height: 1.6;">
        Hello {first_name}, we detected an important security event on your account:
    </p>

    <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="font-size: 13px; color: #991b1b; margin: 0; line-height: 1.6; font-weight: 500;">
            {alert_description}
        </p>
    </div>

    {button_html("Review Security Settings", action_link, color="#dc2626")}

    <p style="font-size: 12px; color: #64748b; margin: 20px 0 0 0; text-align: center;">
        Direct link: <a href="{action_link}" style="color: #4f46e5; word-break: break-all;">{action_link}</a>
    </p>

    <p style="font-size: 12px; color: #64748b; margin-top: 20px; line-height: 1.5;">
        If you did not authorize this action, please reset your password immediately and contact support.
    </p>
    """

    html = wrap_email_html(
        title=subject,
        preheader=preheader,
        content_html=content,
        recipient_email=recipient_email,
        settings_link=settings_link,
        is_security=True,
        category_label="Security Notice"
    )

    text = f"""Security Alert: {alert_title}
Hello {first_name},

{alert_description}

Review security settings: {action_link}
If you did not authorize this action, please reset your password immediately.

InterviewPilot AI Security
Official sender: interviewpilotai.notify@gmail.com
Sent to: {recipient_email}
"""
    return subject, html, text
