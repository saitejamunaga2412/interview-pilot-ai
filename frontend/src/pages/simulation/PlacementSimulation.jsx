import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award, Clock, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft,
  Code2, Calculator, Bot, Users, FileText, Play, RotateCcw,
  Sparkles, Check, ChevronRight, BookmarkCheck, ShieldAlert
} from "lucide-react";
import Editor from "@monaco-editor/react";
import api from "../../services/api";

const ROUNDS = [
  { id: "aptitude", name: "1. Aptitude", icon: Calculator, desc: "Quantitative & Logical Screening" },
  { id: "coding", name: "2. Coding", icon: Code2, desc: "Live Sandboxed Implementation" },
  { id: "technical", name: "3. Technical", icon: Bot, desc: "Architecture & System Trade-offs" },
  { id: "behavioral", name: "4. Behavioral", icon: Users, desc: "STAR Framework Scenario" },
  { id: "resume", name: "5. Resume Defense", icon: FileText, desc: "Project Grounded Defense" }
];

export default function PlacementSimulation() {
  const navigate = useNavigate();

  // Mode: "setup" | "active" | "report"
  const [mode, setMode] = useState("setup");
  const [loading, setLoading] = useState(false);
  const [activeRound, setActiveRound] = useState("aptitude");
  const [activeSim, setActiveSim] = useState(null);
  const [report, setReport] = useState(null);

  // Setup Form State
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [duration, setDuration] = useState(45);

  // Live Timer State
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const timerRef = useRef(null);

  // Round State Tracking
  const [aptitudeAnswers, setAptitudeAnswers] = useState({});
  const [aptitudeIdx, setAptitudeIdx] = useState(0);

  const [code, setCode] = useState("");
  const [languageId, setLanguageId] = useState(63); // JS
  const [codeRunLoading, setCodeRunLoading] = useState(false);
  const [codeOutput, setCodeOutput] = useState(null);

  const [techAnswer, setTechAnswer] = useState("");
  const [techFollowUpAnswer, setTechFollowUpAnswer] = useState("");

  const [behavioralAnswer, setBehavioralAnswer] = useState("");
  const [resumeAnswer, setResumeAnswer] = useState("");

  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Check for existing active or previous simulation
  useEffect(() => {
    async function checkExisting() {
      try {
        const res = await api.get("/simulation/history");
        if (res.data?.data && res.data.data.length > 0) {
          const inProg = res.data.data.find(s => s.status === "in_progress");
          if (inProg) {
            const exp = new Date(inProg.expiresAt).getTime();
            const now = Date.now();
            if (exp > now) {
              initActiveSimulation(inProg);
            }
          }
        }
      } catch (e) {
        console.warn("Simulation history check error:", e);
      }
    }
    checkExisting();
  }, []);

  // Timer Effect
  useEffect(() => {
    if (mode === "active" && activeSim) {
      const expTime = new Date(activeSim.expiresAt).getTime();
      
      timerRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.floor((expTime - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0) {
          clearInterval(timerRef.current);
          handleCompleteSimulation();
        }
      }, 1000);

      return () => clearInterval(timerRef.current);
    }
  }, [mode, activeSim]);

  const initActiveSimulation = (sim) => {
    setActiveSim(sim);
    setCode(sim.rounds.coding?.code || sim.rounds.coding?.codeTemplate || "// Write your solution here\n");
    setLanguageId(sim.rounds.coding?.languageId || 63);
    setTechAnswer(sim.rounds.technical?.answer || "");
    setTechFollowUpAnswer(sim.rounds.technical?.followUpAnswer || "");
    setBehavioralAnswer(sim.rounds.behavioral?.answer || "");
    setResumeAnswer(sim.rounds.resume?.answer || "");

    const existingApt = {};
    sim.rounds.aptitude?.questions?.forEach(q => {
      if (q.userAnswer) existingApt[q.questionId] = q.userAnswer;
    });
    setAptitudeAnswers(existingApt);

    setMode("active");
  };

  // Start New Simulation
  const handleStart = async () => {
    try {
      setLoading(true);
      const res = await api.post("/simulation/start", {
        targetRole,
        difficulty,
        duration: Number(duration)
      });

      if (res.data?.data) {
        initActiveSimulation(res.data.data);
      }
    } catch (err) {
      console.error("Failed to start simulation:", err);
      alert(err.response?.data?.message || "Failed to initialize simulation");
    } finally {
      setLoading(false);
    }
  };

  // Save Current Round Answer
  const saveRoundProgress = async (roundType) => {
    if (!activeSim) return;
    try {
      let payload = {};
      if (roundType === "aptitude") {
        const formatted = Object.entries(aptitudeAnswers).map(([qid, ans]) => ({
          questionId: qid,
          userAnswer: ans
        }));
        payload = { answers: formatted };
      } else if (roundType === "coding") {
        payload = { code, languageId };
      } else if (roundType === "technical") {
        payload = { answer: techAnswer, followUpAnswer: techFollowUpAnswer };
      } else if (roundType === "behavioral") {
        payload = { answer: behavioralAnswer };
      } else if (roundType === "resume") {
        payload = { answer: resumeAnswer };
      }

      await api.post(`/simulation/${activeSim._id}/submit`, {
        roundType,
        data: payload
      });
    } catch (err) {
      console.warn("Save progress warning:", err);
    }
  };

  // Run Code via Judge0
  const handleRunCode = async () => {
    if (!activeSim || !code.trim()) return;
    try {
      setCodeRunLoading(true);
      const res = await api.post(`/simulation/${activeSim._id}/submit`, {
        roundType: "coding",
        data: { code, languageId }
      });
      if (res.data?.data?.rounds?.coding) {
        const c = res.data.data.rounds.coding;
        setCodeOutput({
          status: c.status,
          passedCount: c.passedCount,
          totalTests: c.totalTests,
          score: c.score
        });
      }
    } catch (err) {
      console.error("Code run error:", err);
      setCodeOutput({ status: "Execution Error", passedCount: 0, totalTests: 0, score: 0 });
    } finally {
      setCodeRunLoading(false);
    }
  };

  // Switch Round Tab with Auto-Save
  const handleSwitchRound = async (newRound) => {
    await saveRoundProgress(activeRound);
    setActiveRound(newRound);
  };

  // Complete Simulation
  const handleCompleteSimulation = async () => {
    if (!activeSim) return;
    try {
      setLoading(true);
      // Save current round first
      await saveRoundProgress(activeRound);

      const res = await api.post(`/simulation/${activeSim._id}/complete`);
      if (res.data?.data) {
        setReport(res.data.data);
        setMode("report");
        if (timerRef.current) clearInterval(timerRef.current);
      }
    } catch (err) {
      console.error("Complete simulation error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Format Time Remaining
  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // ──────────────────────────────────────────────
  // 1. SETUP VIEW
  // ──────────────────────────────────────────────
  if (mode === "setup") {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-fade-in text-left">
        
        {/* Header */}
        <div className="space-y-1.5 border-b border-border/60 pb-5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-500/15 border border-primary-500/30 font-mono text-[10px] font-bold text-primary-300 uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-primary-400" />
            END-TO-END EVALUATION
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight font-display">
            REAL PLACEMENT SIMULATION
          </h1>
          <p className="text-xs text-text-secondary">
            Simulate a full corporate placement drive: Aptitude → Coding → Technical → Behavioral → Resume Defense.
          </p>
        </div>

        {/* 5-Round Preview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {ROUNDS.map((r, i) => {
            const Icon = r.icon;
            return (
              <div key={r.id} className="p-4 rounded-xl border border-border bg-surface flex flex-col justify-between space-y-2">
                <div className="w-8 h-8 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-text-muted block">Round {i + 1}</span>
                  <h4 className="text-xs font-bold text-text-primary mt-0.5">{r.name.replace(/^\d+\.\s*/, '')}</h4>
                  <p className="text-[10px] text-text-secondary mt-0.5 line-clamp-2">{r.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Configuration Card */}
        <div className="p-6 rounded-2xl border border-border bg-surface space-y-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-text-primary">
            Simulation Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Role */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-text-muted uppercase">Target Track</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-primary-500 font-medium cursor-pointer"
              >
                <option value="Software Engineer">Software Engineer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="ML Engineer">ML Engineer</option>
              </select>
            </div>

            {/* Difficulty */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-text-muted uppercase">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-primary-500 font-medium cursor-pointer"
              >
                <option value="Beginner">Beginner Tier</option>
                <option value="Intermediate">Intermediate Tier</option>
                <option value="Advanced">Advanced Tier</option>
              </select>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-text-muted uppercase">Drive Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-primary-500 font-medium cursor-pointer"
              >
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes (Recommended)</option>
                <option value={60}>60 Minutes (Comprehensive)</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-2 border border-border/70 text-xs text-text-secondary leading-relaxed space-y-1">
            <span className="font-bold text-text-primary block">Important Assessment Rules:</span>
            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
              <li>Timer runs continuously based on server timestamp.</li>
              <li>Every incorrect answer or failed test case is recorded into your Mistake Book.</li>
              <li>Results update your global Placement Readiness Model in real-time.</li>
            </ul>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              disabled={loading}
              onClick={handleStart}
              className="px-8 py-3 bg-gradient-to-r from-primary-600 via-primary-500 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl font-mono text-xs font-bold shadow-lg shadow-primary-500/25 flex items-center gap-2 cursor-pointer transition-transform hover:-translate-y-0.5"
            >
              <span>{loading ? "INITIALIZING DRIVE..." : "START PLACEMENT SIMULATION"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    );
  }

  // ──────────────────────────────────────────────
  // 2. ACTIVE SIMULATION VIEW
  // ──────────────────────────────────────────────
  if (mode === "active" && activeSim) {
    const aptQuestions = activeSim.rounds?.aptitude?.questions || [];
    const currentAptQ = aptQuestions[aptitudeIdx] || {};
    const codingProblem = activeSim.rounds?.coding || {};

    return (
      <div className="min-h-[85vh] flex flex-col space-y-4 pb-12 text-left max-w-6xl mx-auto">
        
        {/* Top Control Strip */}
        <div className="p-4 rounded-2xl border border-border bg-surface flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">
              PLACEMENT SIMULATION • {activeSim.targetRole}
            </span>
            <h2 className="text-base font-bold text-text-primary font-display capitalize">
              {ROUNDS.find(r => r.id === activeRound)?.name}
            </h2>
          </div>

          {/* Round Selector Tabs */}
          <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-xl border border-border font-mono text-xs overflow-x-auto no-scrollbar">
            {ROUNDS.map((r) => {
              const Icon = r.icon;
              const isSelected = activeRound === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleSwitchRound(r.id)}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-colors cursor-pointer shrink-0 ${
                    isSelected ? "bg-primary-600 text-white shadow-sm" : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{r.name.replace(/^\d+\.\s*/, '')}</span>
                </button>
              );
            })}
          </div>

          {/* Timer & Finish */}
          <div className="flex items-center gap-3">
            <div className={`px-3.5 py-1.5 rounded-xl border font-mono text-xs font-extrabold flex items-center gap-2 ${
              timeLeft < 300 
                ? "bg-rose-500/15 border-rose-500/30 text-rose-400 animate-pulse" 
                : "bg-surface-2 border-border text-primary-300"
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimer(timeLeft)}</span>
            </div>

            <button
              type="button"
              onClick={() => setShowExitConfirm(true)}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-mono text-xs font-bold cursor-pointer shadow-sm"
            >
              FINISH & SUBMIT
            </button>
          </div>
        </div>

        {/* ── ROUND 1: APTITUDE ── */}
        {activeRound === "aptitude" && (
          <div className="p-6 rounded-2xl border border-border bg-surface space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/60 pb-3 font-mono text-xs">
              <span className="text-text-muted">Question {aptitudeIdx + 1} of {aptQuestions.length}</span>
              <span className="text-primary-400 font-bold">{currentAptQ.topic || "Aptitude"}</span>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-bold text-text-primary leading-relaxed">
                {currentAptQ.questionText}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {currentAptQ.options?.map((opt, oIdx) => {
                  const isSelected = aptitudeAnswers[currentAptQ.questionId] === opt;
                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => {
                        setAptitudeAnswers(prev => ({ ...prev, [currentAptQ.questionId]: opt }));
                      }}
                      className={`p-4 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer flex items-center justify-between ${
                        isSelected 
                          ? "border-primary-500 bg-primary-500/15 text-primary-300 shadow-sm" 
                          : "border-border bg-surface-2 hover:border-border-strong text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <Check className="w-4 h-4 text-primary-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/60">
              <button
                type="button"
                disabled={aptitudeIdx === 0}
                onClick={() => setAptitudeIdx(prev => Math.max(0, prev - 1))}
                className="px-4 py-2 border border-border rounded-xl text-xs text-text-secondary hover:bg-surface-hover disabled:opacity-30 cursor-pointer"
              >
                Previous Question
              </button>

              <button
                type="button"
                onClick={() => {
                  if (aptitudeIdx < aptQuestions.length - 1) {
                    setAptitudeIdx(prev => prev + 1);
                  } else {
                    handleSwitchRound("coding");
                  }
                }}
                className="px-5 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <span>{aptitudeIdx < aptQuestions.length - 1 ? "Next Question" : "Proceed to Coding →"}</span>
              </button>
            </div>
          </div>
        )}

        {/* ── ROUND 2: CODING ── */}
        {activeRound === "coding" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Problem Spec */}
            <div className="lg:col-span-5 p-5 rounded-2xl border border-border bg-surface space-y-4 overflow-y-auto max-h-[70vh]">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="text-[10px] font-mono uppercase font-bold text-amber-400">
                  {codingProblem.difficulty || "Medium"} • {codingProblem.topics?.join(", ")}
                </span>
              </div>
              <h3 className="text-base font-bold text-text-primary">{codingProblem.title}</h3>
              <p className="text-xs text-text-secondary whitespace-pre-wrap leading-relaxed">
                {codingProblem.description}
              </p>

              <div className="space-y-2 pt-2">
                <span className="text-xs font-mono font-bold text-text-muted uppercase">Sample Testcases</span>
                {codingProblem.testCases?.slice(0, 2).map((tc, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-bg-base border border-border font-mono text-[11px] space-y-1">
                    <span className="text-text-muted block">Input: {tc.input}</span>
                    <span className="text-emerald-400 block font-bold">Expected Output: {tc.expectedOutput}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monaco Sandbox */}
            <div className="lg:col-span-7 rounded-2xl border border-border bg-surface overflow-hidden flex flex-col justify-between shadow-sm">
              <div className="p-3 border-b border-border bg-surface-2 flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-text-muted">Language:</span>
                  <select
                    value={languageId}
                    onChange={(e) => setLanguageId(Number(e.target.value))}
                    className="bg-surface border border-border rounded-lg px-2.5 py-1 text-xs text-text-primary focus:outline-none"
                  >
                    <option value={63}>JavaScript (Node.js)</option>
                    <option value={71}>Python 3</option>
                    <option value={62}>Java</option>
                    <option value={54}>C++</option>
                  </select>
                </div>

                <button
                  type="button"
                  disabled={codeRunLoading}
                  onClick={handleRunCode}
                  className="px-4 py-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{codeRunLoading ? "Executing..." : "Run Test Cases"}</span>
                </button>
              </div>

              <div className="h-[42vh] w-full">
                <Editor
                  height="100%"
                  theme="vs-dark"
                  language={languageId === 71 ? "python" : languageId === 62 ? "java" : languageId === 54 ? "cpp" : "javascript"}
                  value={code}
                  onChange={(v) => setCode(v || "")}
                  options={{ fontSize: 12, minimap: { enabled: false }, scrollBeyondLastLine: false }}
                />
              </div>

              {/* Output Panel */}
              <div className="p-3.5 border-t border-border bg-bg-base font-mono text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-text-muted block">Execution Report:</span>
                {codeOutput ? (
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${codeOutput.status === "Accepted" ? "text-emerald-400" : "text-amber-400"}`}>
                      {codeOutput.status} ({codeOutput.passedCount}/{codeOutput.totalTests} passed)
                    </span>
                    <span className="text-text-muted">Score: {codeOutput.score}%</span>
                  </div>
                ) : (
                  <span className="text-text-muted italic">Click "Run Test Cases" to evaluate against testcases.</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── ROUND 3: TECHNICAL INTERVIEW ── */}
        {activeRound === "technical" && (
          <div className="p-6 rounded-2xl border border-border bg-surface space-y-6 shadow-sm">
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-primary-400">
                SYSTEM DESIGN & TECHNICAL TRADE-OFFS
              </span>
              <h3 className="text-base font-bold text-text-primary leading-relaxed">
                {activeSim.rounds?.technical?.question}
              </h3>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-text-muted">Your Detailed Answer:</label>
              <textarea
                value={techAnswer}
                onChange={(e) => setTechAnswer(e.target.value)}
                placeholder="Explain the architectural decision, data flow, concurrency, and trade-offs..."
                rows={5}
                className="w-full bg-surface-2 border border-border rounded-xl p-3.5 text-xs text-text-primary focus:outline-none focus:border-primary-500 leading-relaxed font-mono placeholder:text-text-muted"
              />
            </div>

            {/* Dynamic Follow-Up */}
            {activeSim.rounds?.technical?.followUpQuestion && (
              <div className="p-4 rounded-xl border border-indigo-500/25 bg-indigo-500/5 space-y-2">
                <span className="text-[10px] font-mono uppercase font-bold text-indigo-400 block">
                  🎯 AI Follow-Up Probe:
                </span>
                <p className="text-xs font-semibold text-text-primary">
                  {activeSim.rounds.technical.followUpQuestion}
                </p>
                <textarea
                  value={techFollowUpAnswer}
                  onChange={(e) => setTechFollowUpAnswer(e.target.value)}
                  placeholder="Address edge cases, failovers, and latency bottlenecks..."
                  rows={3}
                  className="w-full bg-bg-base border border-border rounded-lg p-2.5 text-xs text-text-primary focus:outline-none font-mono"
                />
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => handleSwitchRound("behavioral")}
                className="px-5 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <span>Proceed to Behavioral Round →</span>
              </button>
            </div>
          </div>
        )}

        {/* ── ROUND 4: BEHAVIORAL INTERVIEW (STAR) ── */}
        {activeRound === "behavioral" && (
          <div className="p-6 rounded-2xl border border-border bg-surface space-y-6 shadow-sm">
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-primary-400">
                BEHAVIORAL COMPETENCY (STAR METHODOLOGY)
              </span>
              <h3 className="text-base font-bold text-text-primary leading-relaxed">
                {activeSim.rounds?.behavioral?.question}
              </h3>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-2 border border-border/80 text-[11px] text-text-secondary leading-relaxed">
              <span className="font-bold text-text-primary block mb-0.5">STAR Framework Tip:</span>
              Explicitly structure your answer: <strong>Situation</strong> (context), <strong>Task</strong> (your responsibility), <strong>Action</strong> (steps you took), and <strong>Result</strong> (quantifiable impact).
            </div>

            <textarea
              value={behavioralAnswer}
              onChange={(e) => setBehavioralAnswer(e.target.value)}
              placeholder="Situation: In my previous team...\nTask: I was responsible for...\nAction: I refactored the pipeline by...\nResult: Reduced latency by 35%..."
              rows={6}
              className="w-full bg-surface-2 border border-border rounded-xl p-3.5 text-xs text-text-primary focus:outline-none focus:border-primary-500 leading-relaxed font-mono"
            />

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => handleSwitchRound("resume")}
                className="px-5 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <span>Proceed to Resume Defense →</span>
              </button>
            </div>
          </div>
        )}

        {/* ── ROUND 5: RESUME DEFENSE ── */}
        {activeRound === "resume" && (
          <div className="p-6 rounded-2xl border border-border bg-surface space-y-6 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-400">
                  RESUME-GROUNDED PROJECT DEFENSE
                </span>
              </div>
              <h3 className="text-base font-bold text-text-primary leading-relaxed">
                {activeSim.rounds?.resume?.question}
              </h3>
            </div>

            <textarea
              value={resumeAnswer}
              onChange={(e) => setResumeAnswer(e.target.value)}
              placeholder="Explain the architectural justification, performance trade-offs, and metrics validation..."
              rows={6}
              className="w-full bg-surface-2 border border-border rounded-xl p-3.5 text-xs text-text-primary focus:outline-none focus:border-primary-500 leading-relaxed font-mono"
            />

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(true)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-mono text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>COMPLETE PLACEMENT SIMULATION</span>
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showExitConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0F1629] border border-border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl"
              >
                <h3 className="text-base font-bold text-text-primary font-display">
                  Submit Placement Simulation?
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Your performance across all 5 rounds will be evaluated and updated in your global readiness profile and Mistake Book.
                </p>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowExitConfirm(false)}
                    className="px-4 py-2 border border-border rounded-xl text-xs text-text-secondary hover:bg-surface-hover cursor-pointer"
                  >
                    Continue Practicing
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowExitConfirm(false);
                      handleCompleteSimulation();
                    }}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-mono text-xs font-bold cursor-pointer"
                  >
                    Confirm & Finish
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    );
  }

  // ──────────────────────────────────────────────
  // 3. FINAL REPORT VIEW
  // ──────────────────────────────────────────────
  if (mode === "report" && report) {
    const { scores = {}, strongestArea, weakestArea, readinessStatus, recommendations = [] } = report;

    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-fade-in text-left">
        
        {/* Report Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-5">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-500/15 border border-primary-500/30 font-mono text-[10px] font-bold text-primary-300 uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-primary-400" />
              OFFICIAL DRIVE REPORT
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight font-display">
              PLACEMENT SIMULATION REPORT
            </h1>
            <p className="text-xs text-text-secondary">
              Target Track: <span className="font-semibold text-text-primary">{report.targetRole}</span>
            </p>
          </div>

          <div className="text-right">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-primary-400">{scores.overall}%</div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 mt-1 rounded-full font-mono text-[10px] font-bold bg-primary-500/15 border border-primary-500/30 text-primary-300">
              {readinessStatus}
            </span>
          </div>
        </div>

        {/* 5-Round Score Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono">
          <div className="p-3.5 rounded-xl border border-border bg-surface space-y-1">
            <span className="text-[10px] text-text-muted uppercase">Coding (30%)</span>
            <div className="text-xl font-bold text-text-primary">{scores.coding}%</div>
          </div>
          <div className="p-3.5 rounded-xl border border-border bg-surface space-y-1">
            <span className="text-[10px] text-text-muted uppercase">Technical (25%)</span>
            <div className="text-xl font-bold text-text-primary">{scores.technical}%</div>
          </div>
          <div className="p-3.5 rounded-xl border border-border bg-surface space-y-1">
            <span className="text-[10px] text-text-muted uppercase">Aptitude (20%)</span>
            <div className="text-xl font-bold text-text-primary">{scores.aptitude}%</div>
          </div>
          <div className="p-3.5 rounded-xl border border-border bg-surface space-y-1">
            <span className="text-[10px] text-text-muted uppercase">Behavioral (15%)</span>
            <div className="text-xl font-bold text-text-primary">{scores.behavioral}%</div>
          </div>
          <div className="p-3.5 rounded-xl border border-border bg-surface space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-text-muted uppercase">Resume (10%)</span>
            <div className="text-xl font-bold text-text-primary">{scores.resume}%</div>
          </div>
        </div>

        {/* Strengths & Weakness Analysis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1">
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>STRONGEST DOMAIN</span>
            </div>
            <p className="text-sm font-bold text-text-primary">{strongestArea}</p>
            <p className="text-xs text-text-secondary">Solid execution and confidence demonstrated during drive.</p>
          </div>

          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-1">
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>PRIMARY BOTTLENECK</span>
            </div>
            <p className="text-sm font-bold text-text-primary">{weakestArea}</p>
            <p className="text-xs text-text-secondary">Logged into your Mistake Book for structured 7-day remediation.</p>
          </div>
        </div>

        {/* Targeted Recommendations */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono uppercase font-bold text-text-muted tracking-wider">
            Placement Recovery Recommendations
          </h4>
          <div className="p-4 rounded-xl border border-border bg-surface space-y-2">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-text-secondary leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 shrink-0" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/60">
          <button
            type="button"
            onClick={() => navigate("/mistakes")}
            className="px-5 py-2.5 bg-surface-2 hover:bg-surface-hover border border-border text-text-primary rounded-xl font-mono text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <BookmarkCheck className="w-4 h-4 text-primary-400" />
            <span>VIEW MISTAKE BOOK</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setMode("setup");
                setActiveSim(null);
                setReport(null);
              }}
              className="px-5 py-2.5 border border-border hover:bg-surface-hover text-text-secondary rounded-xl font-mono text-xs font-bold cursor-pointer"
            >
              RETAKE SIMULATION
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>RETURN TO DASHBOARD</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    );
  }

  return null;
}
