import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowRight, CheckCircle2, Sparkles, AlertCircle, Bot, Target,
  Award, TrendingUp, RefreshCw, Zap, FileText, ChevronRight, BookmarkCheck,
  Building2, Code2, Clock, Check, Flame, ShieldCheck, Layers, BookOpen
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";
import { useAuth } from "../../hooks/useAuth";
import { useDashboardData } from "../../hooks/useDashboardData";
import { ErrorState } from "../../components/ui/States";
import { updateProfile } from "../../services/profileApi";
import api from "../../services/api";
import ReadinessReportModal from "../../components/dashboard/ReadinessReportModal";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, login, refreshProfile, setUser } = useAuth();
  const {
    loading,
    error,
    fetchHistory,
    history,
    memory,
    globalDashboard,
  } = useDashboardData();

  // Intelligence State
  const [dailyPlanData, setDailyPlanData] = useState(null);
  const [weaknessData, setWeaknessData] = useState(null);
  const [adaptiveData, setAdaptiveData] = useState(null);
  const [readinessReport, setReadinessReport] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [mistakeStats, setMistakeStats] = useState(null);
  const [recentMistakes, setRecentMistakes] = useState([]);
  const [latestSimulation, setLatestSimulation] = useState(null);
  const [returnSummary, setReturnSummary] = useState(null);

  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [showBaselinePrompt, setShowBaselinePrompt] = useState(false);
  const [isStartingAssessment, setIsStartingAssessment] = useState(false);

  // Fetch intelligence data
  useEffect(() => {
    async function loadIntelligence() {
      try {
        const [planRes, weakRes, adaptRes, repRes, statsRes, listRes, simRes, returnRes, aiRecRes] = await Promise.all([
          api.get("/dashboard/daily-plan").catch(() => null),
          api.get("/dashboard/weakness-recovery").catch(() => null),
          api.get("/dashboard/adaptive-difficulty").catch(() => null),
          api.get("/dashboard/readiness-report").catch(() => null),
          api.get("/mistakes/stats").catch(() => null),
          api.get("/mistakes?limit=2&status=unresolved").catch(() => null),
          api.get("/simulation/history").catch(() => null),
          api.get("/dashboard/return-summary").catch(() => null),
          api.get("/dashboard/ai-recommendation").catch(() => null)
        ]);

        if (planRes?.data?.data) setDailyPlanData(planRes.data.data);
        if (weakRes?.data?.data) setWeaknessData(weakRes.data.data);
        if (adaptRes?.data?.data) setAdaptiveData(adaptRes.data.data);
        if (repRes?.data?.data) setReadinessReport(repRes.data.data);
        if (statsRes?.data?.data) setMistakeStats(statsRes.data.data);
        if (listRes?.data?.data?.mistakes) setRecentMistakes(listRes.data.data.mistakes);
        if (simRes?.data?.data && simRes.data.data.length > 0) {
          setLatestSimulation(simRes.data.data[0]);
        }
        if (returnRes?.data?.data) setReturnSummary(returnRes.data.data);
        if (aiRecRes?.data?.data) setAiRecommendation(aiRecRes.data.data);
      } catch (err) {
        console.warn("Intelligence load warning:", err);
      }
    }

    loadIntelligence();
  }, []);

  const hasEvaluatedScore = Boolean(
    readinessReport?.hasActivity || 
    (globalDashboard?.codingStats?.problemsSolved > 0) || 
    (history && history.length > 0) || 
    ((readinessReport?.overallReadiness || 0) > 0)
  );
  const readinessScore = hasEvaluatedScore ? (readinessReport?.overallReadiness ?? globalDashboard?.placementReadinessScore ?? 0) : 0;
  const targetRole = user?.targetRole || user?.career?.targetRole || memory?.careerGoal?.targetRole || "Software Engineer";

  // Onboarding Wizard State
  const [onboardStep, setOnboardStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(user?.career?.targetRole || "Software Engineer");
  const [selectedCompanies, setSelectedCompanies] = useState(
    user?.career?.targetCompanies?.length ? user.career.targetCompanies : ["Google", "Amazon", "TCS"]
  );
  const [prepLevel, setPrepLevel] = useState(user?.career?.currentSkillLevel || "Beginner");
  const [selectedLang, setSelectedLang] = useState(user?.career?.preferredLanguage || "Python");
  const [selectedHours, setSelectedHours] = useState(user?.career?.dailyHours || 1);
  const [improveFirst, setImproveFirst] = useState(user?.learningPreferences?.interests?.[0] || "Coding");
  const [isOnboardingSaving, setIsOnboardingSaving] = useState(false);

  const toggleCompany = (company) => {
    setSelectedCompanies(prev =>
      prev.includes(company)
        ? (prev.length > 1 ? prev.filter(c => c !== company) : prev)
        : [...prev, company]
    );
  };

  const isProfileIncomplete = Boolean(
    user && (
      user.onboardingCompleted === false || 
      (!user.career?.targetRole && !user?.targetRole && user.onboardingCompleted !== true)
    )
  );

  const handleOnboardingSubmit = async () => {
    try {
      setIsOnboardingSaving(true);
      const payload = {
        onboardingCompleted: true,
        career: {
          ...user?.career,
          targetRole: selectedRole,
          targetCompanies: selectedCompanies,
          currentSkillLevel: prepLevel,
          preferredLanguage: selectedLang,
          dailyHours: selectedHours
        },
        learningPreferences: {
          ...user?.learningPreferences,
          interests: [improveFirst],
          preferredLanguage: selectedLang
        }
      };
      const response = await updateProfile(payload);
      if (response?.success) {
        if (refreshProfile) {
          await refreshProfile();
        } else if (setUser) {
          setUser(response.data?.user || response.data);
        }
        setShowBaselinePrompt(true);
      }
    } catch (err) {
      console.error("Onboarding Save Error:", err);
    } finally {
      setIsOnboardingSaving(false);
    }
  };

  const handleStartBaselineAssessment = async () => {
    try {
      setIsStartingAssessment(true);
      const res = await api.post("/assessment/start", {
        assessmentType: "Baseline",
        role: selectedRole,
        duration: 15,
        numQuestions: 7
      });
      const attempt = res.data?.data;
      if (attempt?._id) {
        setShowBaselinePrompt(false);
        navigate(`/assessment/test/${attempt._id}`);
      } else {
        setShowBaselinePrompt(false);
        navigate("/assessment");
      }
    } catch (err) {
      console.error("Failed to start baseline assessment:", err);
      setShowBaselinePrompt(false);
      navigate("/assessment");
    } finally {
      setIsStartingAssessment(false);
    }
  };

  // Real history analytics
  const hasHistory = Array.isArray(history) && history.length > 0;

  const trendData = useMemo(() => {
    if (!hasHistory) return [];
    return history.slice(-7).map((h, i) => ({
      name: `S${i + 1}`,
      score: h.overallScore ?? h.score ?? 70,
      date: h.createdAt ? new Date(h.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : `Day ${i + 1}`
    }));
  }, [history, hasHistory]);

  const weeklyActivityData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    if (!hasHistory) {
      return days.map(d => ({ day: d, count: 0 }));
    }
    const counts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    history.forEach(h => {
      if (h.createdAt) {
        const dStr = new Date(h.createdAt).toLocaleDateString(undefined, { weekday: "short" });
        if (counts[dStr] !== undefined) counts[dStr] += 1;
      }
    });
    return days.map(d => ({ day: d, count: counts[d] || 0 }));
  }, [history, hasHistory]);

  const radarData = useMemo(() => {
    if (readinessReport?.dimensions && readinessReport.dimensions.length > 0) {
      return readinessReport.dimensions.map(d => ({
        subject: d.name,
        score: d.score
      }));
    }
    return [
      { subject: "Coding", score: memory?.skillGraph?.coding ?? 0 },
      { subject: "Aptitude", score: memory?.skillGraph?.aptitude ?? 0 },
      { subject: "CS Core", score: memory?.skillGraph?.cs ?? 0 },
      { subject: "Interview", score: memory?.skillGraph?.interview ?? 0 },
      { subject: "Resume", score: memory?.skillGraph?.communication ?? 0 }
    ];
  }, [readinessReport, memory]);

  const priorityTask = dailyPlanData?.priorityTask || {
    title: "Initial Placement Diagnostic",
    why: "Complete your diagnostic baseline to calibrate your target trajectory.",
    action: "Complete 10-min skill baseline",
    estimated: "15 min",
    path: "/assessment",
    domain: "Diagnostic",
    progress: 0
  };

  const sequence = dailyPlanData?.sequence || [
    { step: 1, name: "Coding Arena", task: "Solve 1 practice problem", estimated: "25 min", completed: false, path: "/arena" },
    { step: 2, name: "Aptitude Drill", task: "Solve 10 quantitative questions", estimated: "20 min", completed: false, path: "/aptitude" },
    { step: 3, name: "CS Foundations", task: "Review 1 core OS/DBMS topic", estimated: "15 min", completed: false, path: "/learning" },
    { step: 4, name: "AI Technical Mock", task: "15-min Technical Mock Simulation", estimated: "20 min", completed: false, path: "/interview" }
  ];

  const primaryWeakness = weaknessData?.primaryWeakness || null;
  const recoveryPlan = weaknessData?.recoveryPlan || [];

  if (error) {
    return (
      <div className="py-12 flex justify-center">
        <ErrorState
          title="Unable to load dashboard"
          description={error}
          onRetry={fetchHistory}
          className="max-w-md w-full"
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-primary-400">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <p className="text-xs font-mono text-text-muted">Loading your preparation dashboard...</p>
      </div>
    );
  }

  // Onboarding Screen for first-time incomplete profile
  if (isProfileIncomplete && !showBaselinePrompt) {
    const rolesList = [
      "Software Engineer",
      "Full Stack Developer",
      "AI / ML Engineer",
      "Data Scientist",
      "Backend Engineer",
      "Frontend Developer"
    ];

    const companiesList = [
      "Google", "Amazon", "Microsoft", "Meta",
      "TCS", "Infosys", "Wipro", "Accenture",
      "Cognizant", "Flipkart"
    ];

    const levelsList = [
      { id: "Beginner", label: "Fresher / Beginner", desc: "Foundations, arrays, basic aptitude & core patterns" },
      { id: "Intermediate", label: "Intermediate", desc: "Trees, graphs, DP, recursion & medium problems" },
      { id: "Advanced", label: "Advanced / Product Track", desc: "Complex DSA, hard algorithms & scalable system design" }
    ];

    const languagesList = [
      { id: "Python", label: "Python", icon: "🐍" },
      { id: "Java", label: "Java", icon: "☕" },
      { id: "C++", label: "C++", icon: "⚡" },
      { id: "JavaScript", label: "JavaScript", icon: "🌐" }
    ];

    const studyGoalsList = [
      { hours: 0.5, label: "30 Mins / day", desc: "Steady & consistent daily progress" },
      { hours: 1, label: "1 Hour / day", desc: "Recommended for standard placement prep" },
      { hours: 2, label: "2 Hours / day", desc: "Intensive sprint for upcoming drives" }
    ];

    const focusAreasList = [
      { id: "Coding", label: "Coding & DSA", icon: Code2 },
      { id: "Aptitude", label: "Aptitude & Reasoning", icon: Target },
      { id: "CS Fundamentals", label: "CS Fundamentals (OS/DBMS/CN)", icon: Layers },
      { id: "Interview", label: "Technical Mock Interviews", icon: Bot },
      { id: "Resume", label: "Resume & Placement Review", icon: FileText }
    ];

    return (
      <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6">
        <div className="rounded-3xl border border-border/80 bg-surface/90 backdrop-blur-xl p-6 sm:p-8 text-left space-y-6 shadow-2xl relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Wizard Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
            <div>
              <div className="flex items-center gap-2 text-primary-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>InterviewPilot AI Setup</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-text-primary mt-1">
                Personalize Your Placement Trajectory
              </h2>
            </div>
            {/* Step Indicators */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto font-mono text-xs">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold transition-all ${
                    onboardStep === s
                      ? "bg-primary-600 text-white shadow-md shadow-primary-600/30"
                      : onboardStep > s
                      ? "bg-primary-500/20 text-primary-300 border border-primary-500/30"
                      : "bg-surface-2 text-text-muted border border-border"
                  }`}
                >
                  {onboardStep > s ? <Check className="w-3.5 h-3.5" /> : s}
                </div>
              ))}
            </div>
          </div>

          {/* STEP 1: Track & Companies */}
          {onboardStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-text-muted mb-2 font-bold">
                  1. Target Placement Role
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {rolesList.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRole(r)}
                      className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                        selectedRole === r
                          ? "border-primary-500 bg-primary-500/15 text-primary-300 shadow-sm ring-1 ring-primary-500/40"
                          : "border-border bg-surface-2 hover:border-border-strong text-text-secondary"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-text-muted font-bold">
                    2. Target Companies (Select at least one)
                  </label>
                  <span className="text-[11px] font-mono text-text-muted">
                    {selectedCompanies.length} selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {companiesList.map((comp) => {
                    const isSelected = selectedCompanies.includes(comp);
                    return (
                      <button
                        key={comp}
                        type="button"
                        onClick={() => toggleCompany(comp)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-300 font-semibold shadow-sm"
                            : "border-border bg-surface-2 text-text-secondary hover:border-border-strong"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-cyan-400" />}
                        <span>{comp}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setOnboardStep(2)}
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-primary-600/20 cursor-pointer"
                >
                  <span>Continue to Level & Language</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Level & Coding Stack */}
          {onboardStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-text-muted mb-2 font-bold">
                  1. Preparation Experience Level
                </label>
                <div className="space-y-2.5">
                  {levelsList.map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setPrepLevel(lvl.id)}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        prepLevel === lvl.id
                          ? "border-primary-500 bg-primary-500/15 text-primary-300 shadow-sm ring-1 ring-primary-500/40"
                          : "border-border bg-surface-2 hover:border-border-strong text-text-secondary"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-text-primary">{lvl.label}</div>
                        <div className="text-[11px] text-text-secondary mt-0.5">{lvl.desc}</div>
                      </div>
                      {prepLevel === lvl.id && <Check className="w-4 h-4 text-primary-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-text-muted mb-2 font-bold">
                  2. Primary Coding Language
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {languagesList.map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => setSelectedLang(lang.id)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedLang === lang.id
                          ? "border-primary-500 bg-primary-500/15 text-primary-300 shadow-sm ring-1 ring-primary-500/40"
                          : "border-border bg-surface-2 hover:border-border-strong text-text-secondary"
                      }`}
                    >
                      <div className="text-lg mb-1">{lang.icon}</div>
                      <div className="text-xs font-bold">{lang.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setOnboardStep(1)}
                  className="px-4 py-2 border border-border rounded-xl text-xs text-text-secondary hover:bg-surface-hover cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setOnboardStep(3)}
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-primary-600/20 cursor-pointer"
                >
                  <span>Continue to Daily Goal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Daily Target & First Focus */}
          {onboardStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-text-muted mb-2 font-bold">
                  1. Daily Study Commitment
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {studyGoalsList.map((g) => (
                    <button
                      key={g.hours}
                      type="button"
                      onClick={() => setSelectedHours(g.hours)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedHours === g.hours
                          ? "border-primary-500 bg-primary-500/15 text-primary-300 shadow-sm ring-1 ring-primary-500/40"
                          : "border-border bg-surface-2 hover:border-border-strong text-text-secondary"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
                        <Clock className="w-3.5 h-3.5 text-primary-400" />
                        <span>{g.label}</span>
                      </div>
                      <div className="text-[11px] text-text-secondary mt-1">{g.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-text-muted mb-2 font-bold">
                  2. Priority Focus to Start
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {focusAreasList.map((area) => {
                    const AreaIcon = area.icon;
                    return (
                      <button
                        key={area.id}
                        type="button"
                        onClick={() => setImproveFirst(area.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                          improveFirst === area.id
                            ? "border-primary-500 bg-primary-500/15 text-primary-300 shadow-sm ring-1 ring-primary-500/40"
                            : "border-border bg-surface-2 hover:border-border-strong text-text-secondary"
                        }`}
                      >
                        <AreaIcon className={`w-4 h-4 ${improveFirst === area.id ? "text-primary-400" : "text-text-muted"}`} />
                        <span className="text-xs font-semibold text-text-primary">{area.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setOnboardStep(2)}
                  className="px-4 py-2 border border-border rounded-xl text-xs text-text-secondary hover:bg-surface-hover cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleOnboardingSubmit}
                  disabled={isOnboardingSaving}
                  className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-cyan-600 hover:from-primary-500 hover:to-cyan-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-primary-600/25 cursor-pointer disabled:opacity-50"
                >
                  {isOnboardingSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Calibrating Workspace...</span>
                    </>
                  ) : (
                    <>
                      <span>Launch Placement Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-16 text-left max-w-6xl mx-auto">
      
      {/* ── OPTIONAL BASELINE ASSESSMENT DIALOG (Requirement 3) ── */}
      {showBaselinePrompt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full rounded-3xl border border-primary-500/40 bg-surface p-6 sm:p-8 text-left space-y-5 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                  Setup Complete
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-text-primary">
                  Your profile is ready.
                </h2>
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Take a quick assessment to personalize your preparation.
              </p>
              <div className="p-3.5 rounded-xl bg-surface-2 border border-border/70 text-xs space-y-2">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-text-muted">Estimated time:</span>
                  <span className="text-primary-400 font-bold">10 – 15 minutes</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-text-muted">Skills measured:</span>
                  <span className="text-text-primary">Aptitude, DSA, CS Core, Programming</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-text-muted">Target role:</span>
                  <span className="text-text-primary">{selectedRole}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleStartBaselineAssessment}
                disabled={isStartingAssessment}
                className="w-full sm:flex-1 py-3 px-5 bg-gradient-to-r from-primary-600 to-cyan-600 hover:from-primary-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-primary-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isStartingAssessment ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Preparing Diagnostic...</span>
                  </>
                ) : (
                  <>
                    <span>Start Assessment</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowBaselinePrompt(false)}
                className="w-full sm:w-auto py-3 px-5 border border-border hover:bg-surface-2 text-text-secondary hover:text-text-primary font-semibold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Skip for Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 1. GREETING & WHAT MATTERS TODAY (RETURNING STUDENT SUMMARY) ── */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-sm space-y-4">
        {/* Ambient Subtle Radial Glow (Non-obstructive) */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-br from-primary-500/10 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
              {returnSummary?.greeting || `${new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening"}, ${user?.name ? user.name.split(" ")[0] : "Candidate"} 👋`}
            </h1>
            <p className="text-xs text-text-secondary font-medium">
              {returnSummary?.headline || "Here's what matters today."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Floating Live AI Engine Badge (Smooth Framer Animation) */}
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-2/90 border border-primary-500/25 backdrop-blur-md shadow-sm text-[11px] font-mono text-primary-300"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              <span>AI Engine Active</span>
            </motion.div>

            <div 
              onClick={() => setIsReportOpen(true)}
              className="flex items-center gap-3 bg-surface-2 hover:bg-surface-hover border border-border rounded-xl px-4 py-2 shadow-sm self-start sm:self-auto transition-all cursor-pointer group"
              title="Click to view full Readiness Report"
            >
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-text-muted block">Readiness</span>
                <span className="text-xl font-extrabold font-mono text-primary-400">
                  {hasEvaluatedScore ? `${readinessScore}%` : "0%"}
                </span>
              </div>
              <div className="w-9 h-9 rounded-lg border border-primary-500/30 flex items-center justify-center bg-primary-500/10 text-primary-400 font-mono text-xs font-bold group-hover:scale-105 transition-transform">
                {hasEvaluatedScore ? `${readinessScore}%` : "—"}
              </div>
            </div>
          </div>
        </div>

        {/* 3 Compact What-Matters Items */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-3">
          {(returnSummary?.items || [
            { id: "priority", label: "Today's Priority", text: priorityTask.action },
            { id: "progress", label: "Progress", text: hasEvaluatedScore ? `Placement readiness score is calibrated at ${readinessScore}%.` : "Diagnostic baseline recommended to calibrate trajectory." },
            { id: "focus", label: "Focus Area", text: primaryWeakness ? `${primaryWeakness.topic} remains your primary focus area.` : `Focus on ${targetRole} foundations.` }
          ]).map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-3.5 rounded-xl bg-surface-2/60 border border-border/70 space-y-1"
            >
              <div className="flex items-center gap-1.5 text-primary-400 text-xs font-bold font-mono">
                {idx === 0 && <Target className="w-3.5 h-3.5 text-primary-400" />}
                {idx === 1 && <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />}
                {idx === 2 && <AlertCircle className="w-3.5 h-3.5 text-amber-400" />}
                <span className="uppercase tracking-wider text-[11px]">{item.label}</span>
              </div>
              <p className="text-xs text-text-secondary leading-snug">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Action Bar */}
        <div className="pt-1 flex items-center justify-between">
          <span className="text-xs text-text-muted hidden sm:inline">
            Target Track: <strong className="text-text-primary">{targetRole}</strong>
          </span>
          <button
            type="button"
            onClick={() => navigate(returnSummary?.actionRoute || priorityTask.path || "/arena")}
            className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-primary-600/20 cursor-pointer"
          >
            <span>{returnSummary?.actionLabel || "Start Today's Plan"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── WHILE YOU WERE AWAY (Conditional, only shown when meaningful new info exists) ── */}
      {returnSummary?.whileYouWereAway?.show && returnSummary.whileYouWereAway.bulletPoints?.length > 0 && (
        <div className="p-5 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/20 via-surface to-surface space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>{returnSummary.whileYouWereAway.title || "WHILE YOU WERE AWAY"}</span>
          </div>
          <ul className="space-y-1.5 text-xs text-text-secondary">
            {returnSummary.whileYouWereAway.bulletPoints.map((pt, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">•</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => navigate(returnSummary.whileYouWereAway.actionRoute || "/dashboard")}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{returnSummary.whileYouWereAway.actionLabel || "Continue Preparation"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── 2. DOMINANT SECTION: TODAY'S PLAN (PHASE 1) ── */}
      <div className="rounded-2xl border border-primary-500/30 bg-gradient-to-br from-[#0F1629] via-[#0D1224] to-[#070914] p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-500/15 border border-primary-500/30 font-mono text-[10px] font-bold text-primary-300 uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Today's Priority Focus</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
              TODAY'S PLAN
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsReportOpen(true)}
            className="text-xs font-mono text-primary-400 hover:text-primary-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Report</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Highest Priority Task Card */}
        <div className="p-5 rounded-xl border border-primary-500/30 bg-surface/90 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-primary-400 tracking-wider">
                HIGHEST-PRIORITY ACTION • {priorityTask.domain}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-text-primary mt-0.5">
                {priorityTask.title}
              </h3>
            </div>
            <span className="text-xs font-mono text-text-muted bg-surface-2 px-3 py-1 rounded-lg border border-border self-start sm:self-auto">
              Estimated: {priorityTask.estimated}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-bg-base/60 border border-border/60 space-y-1">
            <span className="text-[10px] font-mono uppercase text-text-muted font-bold block">Why this task was selected:</span>
            <p className="text-xs text-text-secondary leading-relaxed font-medium">
              {priorityTask.why}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="text-xs text-text-secondary">
              Action: <span className="text-text-primary font-bold">{priorityTask.action}</span>
            </div>
            <button
              type="button"
              onClick={() => navigate(priorityTask.path)}
              className="px-8 py-3 bg-gradient-to-r from-primary-600 via-primary-500 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-primary-500/25 inline-flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>START PRACTICE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Compact Daily Sequence */}
        <div className="space-y-2.5 pt-2">
          <span className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider block">
            Recommended Daily Sequence
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {sequence.map((item) => (
              <div
                key={item.step}
                onClick={() => navigate(item.path)}
                className="p-3 rounded-xl border border-border/70 bg-surface/60 hover:bg-surface hover:border-primary-500/30 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
                    <span className="font-mono text-primary-400">{item.step}.</span>
                    <span>{item.name}</span>
                  </div>
                  <span className="text-[11px] text-text-secondary line-clamp-1 mt-0.5">{item.task}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── 3. WEAKNESS RECOVERY ENGINE & ADAPTIVE DIFFICULTY (PHASE 2 & 3) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left (8 cols): Weakness Recovery Roadmap */}
        <div className="lg:col-span-8 rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-amber-400 tracking-wider">
                WEAKNESS RECOVERY ENGINE
              </span>
              <h3 className="text-base font-bold text-text-primary font-display mt-0.5">
                {primaryWeakness ? `${primaryWeakness.topic} Recovery Roadmap` : "Skill Mastery Diagnostics"}
              </h3>
            </div>
            {primaryWeakness && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  Accuracy: {primaryWeakness.accuracy}% ({primaryWeakness.attempts} attempts)
                </span>
              </div>
            )}
          </div>

          {primaryWeakness ? (
            <div className="space-y-2 font-mono text-xs">
              {recoveryPlan.slice(0, 4).map((day) => (
                <div key={day.day} className="flex justify-between items-center p-2.5 rounded-lg bg-bg-base/40 border border-border/60">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-primary-500/15 text-primary-400 flex items-center justify-center text-[10px] font-bold">
                      {day.day}
                    </span>
                    <span className="text-text-primary font-medium">{day.title}</span>
                  </div>
                  <span className="text-[10px] text-text-muted">{day.duration}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 px-4 rounded-xl bg-surface-2/60 border border-dashed border-border/80 flex flex-col items-center text-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-primary-400" />
              <h4 className="text-sm font-bold text-text-primary">No Critical Weakness Detected</h4>
              <p className="text-xs text-text-secondary max-w-md">
                Your performance has not recorded recurring errors. Complete practice challenges or mock interviews to calibrate targeted recovery modules.
              </p>
            </div>
          )}

          <div className="pt-2 flex justify-between items-center">
            <span className="text-xs text-text-secondary">
              {primaryWeakness ? "Structured recovery roadmap active." : "Calibration based on verified test attempts."}
            </span>
            <button
              type="button"
              onClick={() => navigate(weaknessData?.practiceRoute || (primaryWeakness ? "/arena" : "/assessment"))}
              className="px-5 py-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-xl font-bold text-xs cursor-pointer transition-colors"
            >
              {primaryWeakness ? "PRACTICE NOW" : "DIAGNOSTIC TEST"}
            </button>
          </div>
        </div>

        {/* Right (4 cols): Adaptive Difficulty Engine */}
        <div className="lg:col-span-4 rounded-2xl border border-border bg-surface p-6 flex flex-col justify-between space-y-4 shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 tracking-wider">
                ADAPTIVE DIFFICULTY
              </span>
            </div>
            <h4 className="text-sm font-bold text-text-primary font-display">
              Recommended: {adaptiveData?.recommendedDifficulty || "Medium"}
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              {adaptiveData?.explanation || "Difficulty calibrated based on recent pass rates and problem solving speed."}
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-border/60 font-mono text-xs">
            {["Easy", "Medium", "Hard"].map((tier) => {
              const info = adaptiveData?.tiers?.[tier] || { attempts: 0, accuracy: 0 };
              return (
                <div key={tier} className="flex justify-between items-center text-[11px]">
                  <span className="text-text-secondary">{tier}</span>
                  <span className="text-text-primary font-bold">{info.accuracy}% ({info.attempts} tries)</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ── 3.5 COMPACT RECENT MISTAKES STRIP (SECTION 9) ── */}
      <div className="rounded-2xl border border-border/80 bg-surface p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-4 h-4 text-primary-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
              RECENT MISTAKES
            </h3>
            {mistakeStats?.unresolvedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[10px] font-bold">
                {mistakeStats.unresolvedCount} Unresolved
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => navigate("/mistakes")}
            className="text-xs font-mono text-primary-400 hover:text-primary-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>VIEW MISTAKE BOOK</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentMistakes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {recentMistakes.map((m) => (
              <div
                key={m._id}
                onClick={() => navigate(`/mistakes?search=${encodeURIComponent(m.topic)}`)}
                className="p-3 rounded-xl bg-surface-2 border border-border/70 hover:border-primary-500/30 flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-primary">{m.topic}</span>
                    <span className="text-[10px] font-mono text-amber-400 font-bold">
                      {m.attemptCount >= 2 ? `${m.attemptCount} repeated` : "1 unresolved"}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted line-clamp-1">{m.explanation}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-text-muted italic pt-1">
            Your mistake book is empty. Start practicing to build your learning history.
          </p>
        )}
      </div>

      {/* ── 3.8 COMPACT PLACEMENT SIMULATION STRIP (SECTION 16) ── */}
      <div className="rounded-2xl border border-primary-500/25 bg-surface p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/25 flex items-center justify-center text-primary-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary-400">
                REAL PLACEMENT SIMULATION
              </span>
              {latestSimulation && (
                <span className="px-2 py-0.5 rounded bg-surface-2 border border-border font-mono text-[10px] font-bold text-text-muted">
                  Last drive: {latestSimulation.scores?.overall || 0}% ({latestSimulation.readinessStatus || "Completed"})
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary">
              Test your full 5-round readiness under realistic corporate drive conditions.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/simulation")}
          className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl font-mono text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer shrink-0 transition-transform hover:-translate-y-0.5"
        >
          <span>{latestSimulation ? "RETAKE SIMULATION" : "START SIMULATION"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── 4. 7-STAGE PREPARATION PROGRESSION ── */}
      <div className="space-y-3.5 rounded-2xl border border-border/80 bg-surface p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <h2 className="text-sm font-bold uppercase font-mono tracking-wider text-primary-400">
              Placement Preparation Lifecycle
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">Every step connects directly to placement readiness.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-1 font-mono">
          {[
            { step: 1, name: "Learning", path: "/learning", done: true },
            { step: 2, name: "Practice", path: "/arena", done: dailyPlanData?.summaryStats?.codingSolved > 0 },
            { step: 3, name: "Quiz", path: "/aptitude", done: dailyPlanData?.summaryStats?.aptitudeSolved > 0 },
            { step: 4, name: "Flashcards", path: "/learning", done: false },
            { step: 5, name: "Revision", path: "/journey", done: false },
            { step: 6, name: "Mock Interview", path: "/interview", done: dailyPlanData?.summaryStats?.interviewsCompleted > 0 },
            { step: 7, name: "Placement Ready", path: "/history", done: readinessScore >= 80 }
          ].map((st) => (
            <button
              key={st.step}
              type="button"
              onClick={() => navigate(st.path)}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                st.done 
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' 
                  : 'border-border bg-surface-2 hover:border-primary-500/30 text-text-secondary hover:text-text-primary'
              }`}
            >
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold">
                {st.done ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <span>{st.step}</span>}
              </div>
              <span className="text-[11px] font-medium block mt-1 line-clamp-1">{st.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 5. PERFORMANCE ANALYTICS CHARTS ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase font-mono tracking-wider text-text-muted">
              Performance Analytics
            </h2>
            <p className="text-xs text-text-secondary">Measured from real practice and mock attempts.</p>
          </div>
        </div>

        {hasHistory ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Chart 1: Readiness Trend */}
            <div className="rounded-2xl border border-border bg-surface p-5 space-y-3">
              <span className="text-xs font-bold text-text-primary block">Readiness Trend</span>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} tickLine={false} width={25} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0F1629", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#7C5CFC" strokeWidth={2.5} dot={{ r: 3, fill: "#7C5CFC" }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Weekly Activity */}
            <div className="rounded-2xl border border-border bg-surface p-5 space-y-3">
              <span className="text-xs font-bold text-text-primary block">Weekly Activity</span>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyActivityData}>
                    <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis allowDecimals={false} stroke="#64748b" fontSize={10} tickLine={false} width={20} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0F1629", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }}
                    />
                    <Bar dataKey="count" fill="#4EA8FF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Skill Progress */}
            <div className="rounded-2xl border border-border bg-surface p-5 space-y-3">
              <span className="text-xs font-bold text-text-primary block">Skill Competency Radar</span>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
                    <Radar dataKey="score" stroke="#5DE7FF" fill="#5DE7FF" fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Visual Skill Radar */}
            <div className="rounded-2xl border border-border bg-surface p-5 space-y-3">
              <span className="text-xs font-bold text-text-primary block">Skill Benchmark Radar</span>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                    <Radar dataKey="score" stroke="#7C5CFC" fill="#7C5CFC" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Honest Empty State for Trends */}
            <div className="rounded-2xl border border-dashed border-border bg-surface p-6 flex flex-col items-center justify-center text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-text-muted animate-pulse" />
              <h4 className="text-sm font-bold text-text-primary">Not Enough Attempts for Trend Analysis</h4>
              <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
                Complete at least 2 coding sessions or mock interviews to unlock your historical readiness trajectory.
              </p>
              <button
                type="button"
                onClick={() => navigate(priorityTask.path)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Start First Session
              </button>
            </div>

          </div>
        )}
      </div>

      {/* ── 6. AI RECOMMENDATION ── */}
      <div className="rounded-2xl border border-border/80 bg-surface p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-primary-500/10 border border-primary-500/25 flex items-center justify-center text-primary-400 shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-primary-400 block tracking-wider">
              AI RECOMMENDATION
            </span>
            <p className="text-xs sm:text-sm text-text-secondary mt-0.5 leading-relaxed">
              {aiRecommendation?.recommendation || (primaryWeakness ? `Focus on ${primaryWeakness.topic} recovery to address recurring errors and gain up to +8 points in your readiness model.` : "Complete your initial diagnostic assessment or first practice session to calibrate your preparation trajectory.")}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(aiRecommendation?.actionRoute || weaknessData?.practiceRoute || "/arena")}
          className="px-5 py-2.5 bg-surface-2 hover:bg-surface-hover border border-border hover:border-primary-500/40 text-text-primary rounded-xl font-bold text-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
        >
          <span>{aiRecommendation?.actionLabel || "START NOW"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Full Readiness Report Modal */}
      <ReadinessReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        reportData={readinessReport}
      />

    </div>
  );
}
