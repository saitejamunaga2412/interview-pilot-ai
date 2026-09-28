# InterviewPilot AI — Production Deployment & Disaster Recovery Guide

## 1. Overview
InterviewPilot AI is a placement preparation system built on Python 3.11/FastAPI, React (Vite), MongoDB, Google Gemini 3.8 Flash, and Judge0 remote code execution.

---

## 2. Environment Configuration
Create a secure `.env` file on your production host with the following variables:

```ini
# Core Configuration
ENVIRONMENT=production
PORT=5000
FRONTEND_URL=https://your-domain.com

# Database
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/interviewpilot?retryWrites=true&w=majority

# Authentication
JWT_SECRET=<strong-random-64-character-secret>

# AI & Execution
GEMINI_API_KEY=<google-ai-studio-api-key>
GEMINI_MODEL=gemini-3.8-flash
JUDGE0_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=<rapidapi-key>

# Email Notifications (Optional / Production Mailer)
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.com
SMTP_PASS=<smtp-password>
SMTP_FROM="InterviewPilot AI <no-reply@your-domain.com>"
EMAIL_TEST_MODE=false

# Notification Scheduler
ENABLE_SCHEDULER=true
DAILY_REMINDER_CRON="0 8 * * *"
WEEKLY_SUMMARY_CRON="0 9 * * 0"
NOTIFICATION_TIMEZONE="UTC"
```

---

## 3. Database Backup Strategy

### Automated Backup Frequency
- **Daily Full Snapshot**: Executed every 24 hours at `02:00 UTC`.
- **Pre-Deployment Backup**: Executed immediately prior to releasing any major database migration or application release.

### Retention Policy
- Daily backups retained for **14 days**.
- Weekly snapshots retained for **60 days**.
- Monthly snapshots archived to cold storage (e.g., AWS S3 Glacier) for **1 year**.

### Automated Backup Command (`mongodump`)
```bash
# Archive database to a compressed timestamped tarball
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mongodump --uri="$MONGODB_URI" --gzip --archive="./backups/interviewpilot_backup_${TIMESTAMP}.archive"
```

---

## 4. Disaster Recovery & Restoration Process

### Step 1: Verify Host Readiness
Ensure target MongoDB instance is accessible and has matching collection indexes:
```bash
mongosh "$TARGET_MONGODB_URI" --eval "db.runCommand({ ping: 1 })"
```

### Step 2: Restore from Compressed Archive (`mongorestore`)
```bash
# Restore collections with drop-existing protection
mongorestore --uri="$TARGET_MONGODB_URI" --gzip --archive="./backups/interviewpilot_backup_<TIMESTAMP>.archive" --drop
```

### Step 3: Verify Integrity & Indexes
Run verification queries:
```javascript
// In mongosh:
use interviewpilot;
db.users.countDocuments();
db.interviewsessions.countDocuments();
db.questions.countDocuments();
db.users.getIndexes();
```

### Step 4: Health Check Verification
After restoring the database and starting the backend server, query the health endpoint:
```bash
curl -i https://your-domain.com/api/health
```

Expected HTTP 200 response:
```json
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "aiProvider": "gemini_configured",
    "sandboxExecution": "judge0_configured",
    "emailNotifications": "configured",
    "scheduler": "active"
  }
}
```

---

## 5. Security Checklist
- Never commit `.env` or credential files into version control.
- Ensure all persistent uploads (`uploads/photos`, `uploads/resumes`) are mounted to durable volumes.
- Maintain least-privilege IAM roles for storage buckets and database users.
