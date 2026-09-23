import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Map, CheckCircle2, Circle, ArrowRight, Target, 
  Sparkles, BookOpen, Calculator, Code2, Bot, 
  FileText, TrendingUp, Trophy, Compass, ShieldCheck, Flame, Database
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useDashboardData } from "../../hooks/useDashboardData";

const journeyStages = [
  {
    step: "01",
    phase: "FOUNDATION",
    title: "Language & Runtime Foundations",
    desc: "Master execution environments, JVM memory, and event loops.",
    path: "/learning",
    actionText: "Study Foundations",
    icon: BookOpen,
    color: "from-primary-500 to-indigo-500",
    badge: "Language Core",
  },
  {
    step: "02",
    phase: "APTITUDE",
    title: "Adaptive Aptitude & Speed Math",
    desc: "Solve campus & competitive exam questions with formula sheets and adaptive logic.",
    path: "/aptitude",
    actionText: "Practice Quant & Logic",
    icon: Calculator,
    color: "from-cyan-500 to-blue-500",
    badge: "Adaptive Quant",
  },
  {
    step: "03",
    phase: "CODING",
    title: "Algorithmic Arena & Sandbox",
    desc: "Conquer 15+ DSA patterns (Two Pointers, Sliding Window, DP) in the live Monaco sandbox.",
    path: "/arena",
    actionText: "Enter Arena",
    icon: Code2,
    color: "from-secondary-500 to-cyan-500",
    badge: "Judge0 Live",
  },
  {
    step: "04",
    phase: "CS CORE",
    title: "Computer Science Core Curriculum",
    desc: "Understand Database Indexing, SQL relationships, Operating Systems, and System Design.",
    path: "/learning",
    actionText: "Study Core CS",
    icon: Database,
    color: "from-indigo-500 to-purple-500",
    badge: "Systems & Databases",
  },
  {
    step: "05",
    phase: "AI INTERVIEW",
    title: "AI Technical & Behavioral Mock",
    desc: "Simulate speech/text interview rounds evaluated on STAR methodology and SDE metrics.",
    path: "/interview",
    actionText: "Simulate Interview",
    icon: Bot,
    color: "from-purple-500 to-pink-500",
    badge: "Multi-Axis AI",
  },
  {
    step: "06",
    phase: "RESUME",
    title: "ATS Resume Optimization",
    desc: "Audit your resume keyword density and structure against company benchmarks.",
    path: "/resume",
    actionText: "Check ATS Score",
    icon: FileText,
    color: "from-emerald-500 to-teal-500",
    badge: "ATS Screen",
  },
  {
    step: "07",
    phase: "PLACEMENT READY",
    title: "Continuous Placement Readiness",
    desc: "Calibrate readiness metrics above 85% to verify corporate placement capability.",
    path: "/advisor",
    actionText: "Inspect Career Radar",
    icon: TrendingUp,
    color: "from-amber-500 to-primary-500",
    badge: "Placement Verified",
  }
];

export default function MyJourney() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { globalDashboard, memory } = useDashboardData();

  const readiness = globalDashboard?.placementReadinessScore ?? memory?.placementReadinessScore ?? 0;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* ── 1. Journey Hero Header with Career Constellation Visual ── */}
      <div className="relative rounded-2xl border border-border/80 bg-surface overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-8">
          
          {/* Left: Journey Status Context */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/15 text-primary-300 border border-primary-500/30 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized Learning Path</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary font-display">
              My Placement Journey
            </h1>

            <p className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-xl">
              Track your exact progression milestone from core CS foundations to full placement readiness for <strong className="text-text-primary">{user?.targetCompany || user?.targetRole || "Software Engineer"}</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-border">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                <span>Target: <strong className="text-text-primary">{user?.targetRole || "SDE"}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-border">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Streak: <strong className="text-text-primary">{user?.streakDays || 1} Days</strong></span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-border">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Readiness: <strong className="text-text-primary">{readiness}%</strong></span>
              </div>
            </div>
          </div>

          {/* Right: Anime Artwork Inset */}
          <div className="lg:col-span-5 relative">
            <div className="rounded-2xl border border-border/80 bg-surface-2/60 overflow-hidden shadow-xl relative aspect-[16/10]">
              <img
                src="/assets/anime/career_constellation.jpg"
                alt="Candidate exploring career constellation"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080A12] via-transparent to-transparent opacity-75" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-mono px-3 py-1.5 rounded-lg bg-surface/90 backdrop-blur-md border border-border">
                <span className="text-text-primary font-semibold">Active Milestone: Stage 03</span>
                <span className="text-primary-400 font-bold">[IN PROGRESS]</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── 2. Visual Journey Path Map ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 font-display">
            <Map className="w-4 h-4 text-cyan-400" />
            <span>Milestone Progression Beam</span>
          </h2>
          <span className="text-xs font-mono text-text-muted">7 Core Stages</span>
        </div>

        <div className="space-y-4">
          {journeyStages.map((stage, idx) => {
            const Icon = stage.icon;
            const isCompleted = idx < 2;
            const isCurrent = idx === 2;

            return (
              <motion.div
                key={stage.step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                className={`p-5 sm:p-6 rounded-2xl border transition-all relative overflow-hidden ${
                  isCurrent
                    ? "bg-surface-2/90 border-primary-500/60 shadow-xl shadow-primary-500/10"
                    : isCompleted
                    ? "bg-surface border-border/80"
                    : "bg-surface/60 border-border/40 opacity-80"
                }`}
              >
                {/* Active Indicator Strip */}
                {isCurrent && (
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-primary-400 to-cyan-400" />
                )}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Left: Step Details */}
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stage.color} p-[1.5px] shrink-0 shadow-md`}>
                      <div className="w-full h-full bg-bg-base rounded-[10px] flex items-center justify-center text-text-primary">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary-400">
                          STAGE {stage.step} · {stage.phase}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-2 text-text-muted border border-border">
                          {stage.badge}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-text-primary font-display">
                        {stage.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-text-secondary max-w-2xl leading-relaxed">
                        {stage.desc}
                      </p>
                    </div>
                  </div>

                  {/* Right: Action Trigger */}
                  <div className="shrink-0 flex items-center md:justify-end">
                    <button
                      type="button"
                      onClick={() => navigate(stage.path)}
                      className={`px-5 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                        isCurrent
                          ? "bg-gradient-to-r from-primary-600 to-secondary-500 text-white shadow-md shadow-primary-600/25 hover:from-primary-500 hover:to-secondary-400 active:scale-95"
                          : "bg-surface-2 border border-border hover:border-primary-500/40 text-text-primary hover:bg-surface-hover"
                      }`}
                    >
                      <span>{stage.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
