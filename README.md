# InterviewPilot AI 🚀

InterviewPilot AI is a placement operating system designed to take students from foundational concepts to placement-ready competence. The platform integrates an AI Teacher with RAG grounding, a live coding arena powered by Judge0 remote sandbox execution, timed AI mock interviews, curriculum and spaced-repetition flashcards, real placement exam pattern simulations, and ATS-optimized resume analysis.

---

## 🏗 Architecture & Tech Stack

```text
React 19 Frontend
        ↓
Python 3.11 + FastAPI Backend (Uvicorn)
        ↓
MongoDB (Async Motor)
        ↓
Google Gemini 3.8 Flash (Direct REST)
        ↓
Judge0 Remote Execution Engine
```

**Frontend:**
- **React 19** (Vite)
- **TailwindCSS** (Curated dark & light design tokens)
- **Framer Motion** (Micro-animations and layout transitions)
- **Lucide React** (Iconography)
- **React Router Dom v6** (Route-level lazy loading with `<Suspense>`)
- **Axios** (Centralized API client with JWT interceptors)

**Backend:**
- **Python 3.11 + FastAPI**
- **Uvicorn** (Production ASGI server)
- **Motor + PyMongo** (Asynchronous MongoDB driver)
- **PyJWT & Bcrypt** (Secure hashing & token-based authentication)
- **Google Gemini 3.8 Flash** (Primary LLM with verified candidate fallbacks)
- **Judge0 Engine** (Isolated remote execution for Python, Java, C++, JavaScript)
- **pypdf** (Safe ATS resume text extraction)
- **APScheduler** (Background notification tasks)

---

## 🚀 Modules & Capabilities

- **Authentication & Multi-Tenant Isolation**: Secure JWT authentication, Bcrypt password hashing, and user data isolation across all models.
- **AI Teacher / Chatbot**: RAG-grounded tutoring with instant greeting cache (<10ms), structured explanations, dry runs, complexity analysis, and real user learning context.
- **Placement Dashboard**: Data-grounded readiness index (0 base for new users), priority actions, weakness recovery, and activity tracking.
- **Coding Arena**: Integrated Monaco editor supporting Python, Java, C++, and JavaScript running safely in isolated Judge0 sandbox.
- **Aptitude & Reasoning**: Topic-based problem banks with mathematical accuracy scoring and mistake logging.
- **AI Mock Interview Studio**: Timed sessions (15/30/45 mins), role-grounded question generation, and structured rubric scoring.
- **Resume ATS Analyzer**: Multi-page PDF text extraction and ATS keyword matching with notifications.
- **Cascade Account Deletion**: Permanent removal of user-owned records across all collections and upload directories.

---

## 🛠 Local Setup Guide

### 1. Prerequisites
- **Python 3.11+**
- **Node.js 18+**
- **MongoDB** (Local instance on `mongodb://127.0.0.1:27017` or Atlas)

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create `.env` based on `.env.example`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/interview_ai
   JWT_SECRET=your_jwt_secret_here
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-3.8-flash
   JUDGE0_URL=https://ce.judge0.com
   ```
4. Start the FastAPI backend:
   ```bash
   python -m uvicorn main:app --host 0.0.0.0 --port 5000 --reload
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *Frontend runs on http://localhost:5173 (proxies /api to http://localhost:5000).*

---

## 🧪 Testing

### Automated Backend Tests
Run the complete automated pytest suite:
```bash
cd backend
pytest -v tests_py/test_api_endpoints.py
```

### Production Build
Verify the frontend production bundle:
```bash
cd frontend
npm run build
```
