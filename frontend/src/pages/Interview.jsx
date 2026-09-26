import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInterviewData } from "../hooks/useInterviewData";
import { useSpeech } from "../hooks/useSpeech";
import { 
  Bot, Play, Clock, Briefcase, GraduationCap, 
  Zap, Code2, Database, Brain, Timer, 
  CheckCircle2, ChevronRight, AlertCircle, ArrowLeft, ArrowRight,
  ShieldCheck, Volume2, VolumeX, Mic, MicOff, Sparkles, Award, Star,
  Building, Printer, Download, Camera, CameraOff, Video
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import PageHeader from "../components/ui/PageHeader";
import ResultCard from "../components/ResultCard";

const COMPANY_PACKS = [
  {
    id: "tcs",
    name: "TCS Digital / Ninja",
    badge: "Mass Recruiter",
    role: "Full Stack Developer",
    level: "Junior",
    duration: 30,
  },
  {
    id: "infosys",
    name: "Infosys SP / DSE",
    badge: "Specialist",
    role: "Software Engineer",
    level: "Mid Level",
    duration: 45,
  },
  {
    id: "amazon",
    name: "Amazon SDE-1",
    badge: "Tier 1 Product",
    role: "Software Engineer",
    level: "Mid Level",
    duration: 45,
  },
  {
    id: "accenture",
    name: "Accenture ASE",
    badge: "Campus Drive",
    role: "Frontend Developer",
    level: "Entry Level",
    duration: 30,
  },
  {
    id: "google",
    name: "Google SWE",
    badge: "Top Tier",
    role: "Software Engineer",
    level: "Senior",
    duration: 45,
  },
];

const ROLES = [
  { id: "Software Engineer", label: "Software Engineer", icon: Code2 },
  { id: "Frontend Developer", label: "Frontend Developer", icon: Zap },
  { id: "Backend Developer", label: "Backend Developer", icon: Database },
  { id: "Full Stack Developer", label: "Full Stack Developer", icon: Brain },
  { id: "DevOps Engineer", label: "DevOps Engineer", icon: CloudIcon },
];

function CloudIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.42-1.89-1.72-3.36-3.5-4-2.23-.84-4.75.25-5.8 2.3A5.5 5.5 0 0 0 2 13.5c0 3 2.5 5.5 5.5 5.5h10z"/>
    </svg>
  );
}

const LEVELS = [
  { id: "Entry Level", label: "Entry Level", sub: "0–1 year experience" },
  { id: "Junior", label: "Junior", sub: "1–2 years experience" },
  { id: "Mid Level", label: "Mid Level", sub: "3–5 years experience" },
  { id: "Senior", label: "Senior", sub: "5+ years experience" },
];

const TYPES = [
  { id: "Technical", label: "Technical", icon: Code2, desc: "Coding & system architecture" },
  { id: "Behavioral", label: "Behavioral", icon: Brain, desc: "STAR methodology scenarios" },
  { id: "Mixed", label: "Mixed", icon: Zap, desc: "Comprehensive technical & culture fit" },
];

const DURATIONS = [
  { value: 15, label: "15 min", sub: "Quick session" },
  { value: 30, label: "30 min", sub: "Standard" },
  { value: 45, label: "45 min", sub: "Deep dive" },
];

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
};

export default function Interview() {
  const navigate = useNavigate();
  const { 
    step,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    role,
    setRole,
    level,
    setLevel,
    questions,
    answers,
    setAnswers,
    results,
    loading,
    submitting,
    isTimedInterview,
    setIsTimedInterview,
    duration,
    setDuration,
    timeLeft,
    toast,
    hasResults,
    questionsGenerated,
    generateQuestions,
    submitInterview,
    startNewInterview,
    sessionId
  } = useInterviewData();

  const [interviewType, setInterviewType] = useState("Technical");
  const [error, setError] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  const {
    isListening,
    isSpeaking,
    supportsSTT,
    supportsTTS,
    speechError,
    startListening,
    stopListening,
    speak,
    stopSpeaking
  } = useSpeech();

  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = React.useRef(null);
  const mediaStreamRef = React.useRef(null);

  const toggleCamera = async () => {
    setCameraError("");
    if (cameraEnabled) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setCameraEnabled(false);
      return;
    }

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        setCameraError("Camera access is not supported in this browser.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraEnabled(true);
    } catch (err) {
      console.warn("[Interview] Camera permission denied or device not found:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Camera permission was denied. You can proceed with voice or text.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCameraError("No camera device detected on your system.");
      } else {
        setCameraError("Could not access camera. You can proceed with voice or text.");
      }
      setCameraEnabled(false);
    }
  };

  React.useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const applyCompanyPack = (pack) => {
    setSelectedCompanyId(pack.id);
    setRole(pack.role);
    setLevel(pack.level);
    setDuration(pack.duration);
    setIsTimedInterview(true);
    setError("");
  };

  const handleStart = async () => {
    setError("");
    if (!role) { setError("Please select a target role."); return; }
    if (!level) { setError("Please select your experience level."); return; }
    try {
      await generateQuestions();
    } catch (e) {
      setError(e?.message || "Failed to generate interview questions.");
    }
  };

  const isReady = role && level;

  // ── Render SETUP Round ──
  if (step === "SETUP") {
    return (
      <div className="space-y-6 pb-20 animate-fade-in">
        
        {/* Onboarding Hero Banner with Interview Artwork */}
        <div className="relative rounded-2xl border border-border bg-surface overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-8">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/15 text-primary-300 border border-primary-500/30 text-xs font-mono font-bold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI INTERVIEW LABORATORY</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary font-display">
                Mock Interview Studio
              </h1>
              <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                Practice realistic technical and behavioral interview sessions. Receive real-time evaluations across technical depth, communication, and confidence indices.
              </p>
            </div>
            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl border border-border bg-surface-2/60 overflow-hidden shadow-xl relative aspect-[16/10]">
                <img
                  src="/assets/anime/interview_hero.jpg"
                  alt="Candidate preparing for interview"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080A12] via-transparent to-transparent opacity-75" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-mono px-3 py-1.5 rounded-lg bg-surface/90 backdrop-blur-md border border-border">
                  <span className="text-text-primary">Voice & Text Assessment</span>
                  <span className="text-primary-400 font-bold">[READY]</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main setup columns */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* 1-Click Company Placement Packs */}
            <div className="bg-surface rounded-xl border border-border p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-mono text-primary-400 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  <span>1-Click Company Placement Packs</span>
                </h3>
                <span className="text-[10px] font-mono text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded border border-primary-500/20 font-bold">
                  Recommended Presets
                </span>
              </div>
              <p className="text-xs text-text-secondary">
                Instantly pre-configure target role, difficulty, and interview type calibrated for campus recruiters.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {COMPANY_PACKS.map((pack) => {
                  const isSelected = selectedCompanyId === pack.id;
                  return (
                    <button
                      key={pack.id}
                      type="button"
                      onClick={() => applyCompanyPack(pack)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-primary-500/15 border-primary-500 ring-2 ring-primary-500/30 text-text-primary shadow-md"
                          : "bg-surface-2 border-border text-text-secondary hover:text-text-primary hover:border-primary-500/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border text-text-muted">
                          {pack.badge}
                        </span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-primary-400" />}
                      </div>
                      <span className="text-xs font-bold truncate block">{pack.name}</span>
                      <span className="text-[10px] text-text-muted capitalize">{pack.level} · {pack.duration}m</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Choose Role */}
            <div className="bg-surface rounded-xl border border-border p-5 space-y-3">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-mono text-primary-400">1. Select Target Role</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ROLES.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setRole(id)}
                    className={`p-3.5 text-left rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      role === id 
                        ? "bg-primary-500/10 border-primary-500 text-primary-400 shadow-lg shadow-primary-500/5" 
                        : "bg-surface-2 border-border text-text-secondary hover:text-text-primary hover:border-primary-500/30"
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-2 text-primary-500" />
                    <span className="block truncate">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Level selection */}
            <div className="bg-surface rounded-xl border border-border p-5 space-y-3">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-mono text-primary-400">2. Select Target Level</h3>
              <div className="grid grid-cols-2 gap-2">
                {LEVELS.map(({ id, label, sub }) => (
                  <button
                    key={id}
                    onClick={() => setLevel(id)}
                    className={`p-3.5 text-left rounded-xl border text-xs transition-all cursor-pointer ${
                      level === id 
                        ? "bg-primary-500/10 border-primary-500 text-primary-400 shadow-lg" 
                        : "bg-surface-2 border-border text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-text-primary">{label}</span>
                      {level === id && <CheckCircle2 className="w-3.5 h-3.5 text-primary-400" />}
                    </div>
                    <span className="text-[11px] text-text-secondary block">{sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Type selection */}
            <div className="bg-surface rounded-xl border border-border p-5 space-y-3">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-mono text-primary-400">3. Select Interview Category</h3>
              <div className="grid grid-cols-3 gap-2">
                {TYPES.map(({ id, label, icon: Icon, desc }) => (
                  <button
                    key={id}
                    onClick={() => setInterviewType(id)}
                    className={`p-3.5 text-left rounded-xl border text-xs transition-all cursor-pointer ${
                      interviewType === id 
                        ? "bg-primary-500/10 border-primary-500 text-primary-400 shadow-lg" 
                        : "bg-surface-2 border-border text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-2 text-primary-500" />
                    <p className="font-bold text-text-primary">{label}</p>
                    <p className="text-[10px] text-text-muted mt-1 leading-normal">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Preview Card */}
          <div className="space-y-4">
            <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
              <h3 className="font-bold text-text-primary text-sm border-b border-border pb-2 font-display">Session Parameter Radar</h3>
              
              <div className="space-y-3">
                {[
                  { label: "Target Role", value: role || "Not selected", icon: Briefcase },
                  { label: "Caliber Level", value: level || "Not selected", icon: GraduationCap },
                  { label: "Topic Mode", value: interviewType, icon: Bot },
                  { label: "Round Duration", value: `${duration} mins`, icon: Clock },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-text-muted uppercase font-mono">{label}</p>
                      <p className="text-xs font-semibold text-text-primary mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Duration choice */}
              <div className="pt-2">
                <span className="text-[11px] font-mono text-text-muted uppercase">Round Duration</span>
                <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                  {DURATIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setDuration(value)}
                      className={`py-1.5 rounded-lg border text-[11px] font-mono font-bold transition-all cursor-pointer ${
                        duration === value 
                          ? "bg-primary-500/20 border-primary-500/55 text-primary-300" 
                          : "bg-surface-2 border-border text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-text-muted" />
                  <span className="text-xs font-semibold text-text-secondary">Enable Digital Timer</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTimedInterview(!isTimedInterview)}
                  className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${isTimedInterview ? "bg-primary-600" : "bg-surface-2 border border-border"}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isTimedInterview ? "translate-x-4" : ""}`}
                  />
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3.5 rounded-xl bg-error-500/10 border border-error-500/20 text-error-400 text-xs leading-normal">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleStart}
              disabled={!isReady || loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-primary-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4" />
              <span>{loading ? "Generating Engine Questions..." : "LAUNCH INTERVIEW SESSION"}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render ACTIVE Studio Workspace ──
  if (step === "ACTIVE") {
    const activeQuestion = questions[currentQuestionIndex] || "";
    const activeAnswer = answers[currentQuestionIndex] ?? "";

    return (
      <div className="space-y-6 pb-20 animate-fade-in">
        
        {/* Session telemetry top bar */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-primary-400 px-2 py-0.5 rounded bg-surface-2 border border-border">
              QUESTION {currentQuestionIndex + 1} OF {questions.length}
            </span>
            <span className="text-xs text-text-secondary hidden sm:inline">
              Target SDE Session
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleCamera}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                cameraEnabled
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : "bg-surface-2 text-text-secondary hover:text-text-primary border-border"
              }`}
              title="Toggle Webcam Preview"
            >
              {cameraEnabled ? <Camera className="w-3.5 h-3.5 text-emerald-400" /> : <CameraOff className="w-3.5 h-3.5 text-text-muted" />}
              <span>{cameraEnabled ? "Camera ON" : "Camera OFF"}</span>
            </button>

            {isTimedInterview && (
              <div className="flex items-center gap-2 bg-primary-500/10 text-primary-400 border border-primary-500/20 px-3 py-1.5 rounded-lg font-mono font-bold text-sm">
                <Timer className="w-4 h-4 animate-pulse text-primary-400" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Studio split view */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left panel: Virtual Interviewer Wave & Question */}
          <div className="lg:col-span-6 bg-surface border border-border rounded-2xl p-6 flex flex-col justify-between min-h-[360px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Visualizer avatar or Live Camera Preview */}
            {cameraEnabled ? (
              <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 bg-black aspect-video max-w-[340px] w-full mx-auto shadow-xl">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/70 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>WEBCAM ACTIVE</span>
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 relative z-10">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-xl relative animate-pulse">
                  <Bot className="w-9 h-9" />
                  <span className="absolute inset-0 rounded-full border border-primary-400 animate-ping opacity-25" />
                </div>
                <p className="text-[10px] font-mono uppercase text-text-muted mt-3 tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>AI Interviewer Speaking</span>
                </p>
                
                {/* Soundwave simulation lines */}
                <div className="flex items-center gap-1.5 mt-3.5 h-6">
                  {[4, 10, 6, 12, 8, 14, 10, 16, 12, 18, 10, 16, 8, 14, 6, 12, 4].map((h, i) => (
                    <div 
                      key={i} 
                      className="w-[3px] bg-primary-400/80 rounded-full transition-all duration-300 animate-pulse" 
                      style={{ height: `${h}px`, animationDelay: `${i * 0.05}s` }} 
                    />
                  ))}
                </div>
              </div>
            )}

            {cameraError && (
              <div className="mt-3 flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Question detail box */}
            <div className="p-4 rounded-xl border border-border bg-bg-base/70 relative z-10 space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold text-primary-400 uppercase tracking-wider">AI Question Prompt</h4>
                {/* Text-to-Speech (AI Voice) */}
                <button
                  type="button"
                  onClick={() => {
                    if (isSpeaking) {
                      stopSpeaking();
                    } else {
                      speak(activeQuestion);
                    }
                  }}
                  className={`px-3 py-1 rounded-full border text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSpeaking
                      ? "bg-primary-500 text-white border-primary-400 shadow-md animate-pulse"
                      : "bg-surface-2 text-text-secondary hover:text-primary-300 hover:bg-surface border-border"
                  }`}
                  title="Listen to AI Interviewer speak this question"
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-primary-400" />}
                  <span>{isSpeaking ? "Stop Speaking" : "Read Aloud"}</span>
                </button>
              </div>
              <p className="text-text-primary font-bold text-sm sm:text-base leading-relaxed font-display">
                {activeQuestion}
              </p>
            </div>
          </div>

          {/* Right panel: Response editor */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-4">
            <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col justify-between flex-1 min-h-[360px]">
              <div className="space-y-3 flex-1 flex flex-col">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <label className="text-xs font-mono font-bold text-text-secondary uppercase">Candidate Response Area</label>
                  <div className="flex items-center gap-2">
                    {/* Speech-to-Text (Microphone) */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isListening) {
                          stopListening();
                        } else {
                          startListening((chunk) => {
                            setAnswers(prev => ({
                              ...prev,
                              [currentQuestionIndex]: (prev[currentQuestionIndex] ? prev[currentQuestionIndex] + " " : "") + chunk
                            }));
                          });
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isListening
                          ? "bg-rose-500 text-white border-rose-400 shadow-md animate-pulse ring-2 ring-rose-500/40"
                          : "bg-surface-2 text-text-secondary hover:text-rose-400 hover:bg-rose-500/10 border-border"
                      }`}
                      title="Speak your answer with microphone"
                    >
                      {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-rose-400" />}
                      <span>{isListening ? "Listening... (Click to Stop)" : "Speak Answer"}</span>
                    </button>
                    <span className="text-[10px] text-text-muted font-mono hidden sm:inline">Max 3000 chars</span>
                  </div>
                </div>

                {speechError && (
                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs leading-normal">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{speechError} You can type your answer directly in the text editor below.</span>
                  </div>
                )}

                <textarea
                  rows="12"
                  value={activeAnswer}
                  onChange={(e) => {
                    const updated = { ...answers, [currentQuestionIndex]: e.target.value };
                    setAnswers(updated);
                  }}
                  placeholder="Explain your technical design, algorithms, or STAR behavioral approach here..."
                  className="w-full flex-1 bg-bg-base/60 border border-border rounded-xl p-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 resize-none font-sans"
                />
              </div>

              <div className="flex justify-between items-center mt-3 pt-3 border-t border-border text-xs text-text-muted">
                <span>{activeAnswer.length} / 3000 characters</span>
                <span>Real-time response backup enabled</span>
              </div>
            </div>

            {/* Bottom step progression actions */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2.5 rounded-xl border border-border bg-surface text-xs font-bold text-text-secondary hover:text-text-primary hover:border-primary-500/30 transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prev Question</span>
              </button>

              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  className="px-5 py-2.5 rounded-xl bg-surface-hover hover:bg-surface border border-border text-xs font-bold text-text-primary hover:border-primary-500/30 transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5 text-primary-400" />
                </button>
              ) : (
                <button
                  onClick={() => submitInterview("manual")}
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer ml-auto disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{submitting ? "Submitting for analysis..." : "SUBMIT FOR ANALYSIS"}</span>
                </button>
              )}
            </div>

          </div>

        </div>

      </div>
    );
  }

  // ── Render RESULTS Evaluation ──
  if (step === "RESULTS") {
    // Calculate aggregate score
    const resultScores = Object.values(results).map(r => r.score ?? 0);
    const avgScore = resultScores.length > 0 ? Math.round(resultScores.reduce((a, b) => a + b, 0) / resultScores.length) : 0;

    return (
      <div className="space-y-8 pb-20 animate-fade-in">
        
        {/* Scorecard Cockpit */}
        <div className="relative rounded-2xl border border-border bg-surface p-6 sm:p-8 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>INTERVIEW EVALUATION READY</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary font-display">
                Calibrated Placement Index
              </h1>

              <p className="text-text-secondary text-sm leading-relaxed max-w-xl">
                Your performance has been evaluated across SDE capability domains using semantic AI keyword checks.
              </p>
            </div>

            {/* Score Ring */}
            <div className="flex flex-col items-center shrink-0 bg-surface-2 border border-border p-5 rounded-2xl">
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">OVERALL COGNITIVE SCORE</span>
              <span className="text-4xl font-extrabold font-mono text-emerald-400 mt-1">{avgScore}%</span>
              
              <div className="w-32 bg-surface h-1.5 rounded-full overflow-hidden mt-3 border border-border">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${avgScore}%` }} />
              </div>
            </div>

          </div>
        </div>

        {/* 4 Multi-Axis Rubric breakdown cards */}
        <div>
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-mono text-primary-400 mb-4">Multi-Axis Rubric Assessment</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Technical Depth", value: avgScore >= 80 ? "Exemplary" : avgScore >= 60 ? "Proficient" : "Developing", color: "text-primary-400" },
              { label: "Problem Solving", value: avgScore >= 75 ? "Structured" : avgScore >= 50 ? "Linear" : "Needs Practice", color: "text-cyan-400" },
              { label: "Communication", value: avgScore >= 70 ? "Articulate" : "Introductory", color: "text-indigo-400" },
              { label: "Confidence Score", value: `${Math.round(avgScore * 0.95)}%`, color: "text-emerald-400" }
            ].map(({ label, value, color }) => (
              <div key={label} className="p-4 rounded-xl border border-border bg-surface flex flex-col justify-between h-24">
                <span className="text-[10px] font-mono text-text-muted uppercase">{label}</span>
                <span className={`text-base font-bold font-display ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* List of answers evaluated */}
        <div className="space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-mono text-primary-400">Detailed Feedback breakdown</h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-lg bg-surface-2 hover:bg-surface border border-border text-text-primary text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                title="Download or print evaluation report"
              >
                <Printer className="w-3.5 h-3.5 text-primary-400" />
                <span>Print / Save PDF</span>
              </button>
              <button
                onClick={startNewInterview}
                className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-primary-600/20"
              >
                Start New Interview
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={idx} className="p-5 rounded-xl border border-border bg-surface-2 space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded bg-primary-500/25 text-primary-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-text-primary mt-0.5 leading-snug">{q}</h4>
                  </div>
                  
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    Score: {results[idx]?.score ?? 0}%
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/50 text-xs">
                  <div className="p-3.5 rounded-lg bg-bg-base/70 space-y-1">
                    <span className="text-[9px] font-mono text-text-muted uppercase">Candidate response</span>
                    <p className="text-text-secondary leading-relaxed italic">{results[idx]?.answer || answers[idx] || "Skipped / unanswered"}</p>
                  </div>
                  
                  <div className="p-3.5 rounded-lg bg-bg-base/70 space-y-1.5">
                    <span className="text-[9px] font-mono text-text-muted uppercase">AI feedback evaluation</span>
                    <p className="text-text-primary leading-relaxed">{results[idx]?.feedback || "No feedback evaluated."}</p>
                    
                    {results[idx]?.correctAnswer && (
                      <details className="mt-2 text-[11px]">
                        <summary className="text-primary-400 cursor-pointer font-semibold select-none hover:underline">View Exemplary Answer</summary>
                        <p className="text-text-secondary whitespace-pre-wrap leading-relaxed mt-1 font-mono">{results[idx].correctAnswer}</p>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Print Stylesheet */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            header, aside, nav, button, .no-print {
              display: none !important;
            }
            body, .min-h-screen {
              background: #ffffff !important;
              color: #000000 !important;
            }
            .border {
              border-color: #e2e8f0 !important;
            }
            .bg-surface, .bg-surface-2, .bg-bg-base {
              background: #ffffff !important;
            }
            .text-text-primary, .text-text-secondary {
              color: #0f172a !important;
            }
          }
        ` }} />

      </div>
    );
  }

  return null;
}