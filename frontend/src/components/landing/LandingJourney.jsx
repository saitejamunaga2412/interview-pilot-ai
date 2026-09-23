import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, Calculator, Sparkles, Code2, Bot, 
  TrendingUp, ArrowRight, CheckCircle2, ChevronRight 
} from "lucide-react";

const steps = [
  {
    number: "01",
    phase: "DISCOVER",
    title: "CS Foundations & Exam Syllabus",
    subtitle: "Core Curriculum",
    icon: BookOpen,
    desc: "Target your exact exam pattern (TCS NQT, SSC CGL) or SWE tracks. Study structured lessons covering OS, DBMS, Networks, and System Design with real-world analogies.",
    capability: "Structured Lesson Sequences · Dry Run Visualizations"
  },
  {
    number: "02",
    phase: "DIAGNOSE",
    title: "Diagnostic Ingestion & Weakness Radar",
    subtitle: "Error Taxonomy",
    icon: Sparkles,
    desc: "Every wrong attempt is diagnosed for its root cause (Calculation error, conceptual misunderstanding, or edge-case omission) and logged into your personal Mistake Notebook.",
    capability: "Mistake Notebook · Root Cause Analysis"
  },
  {
    number: "03",
    phase: "PRACTICE",
    title: "Adaptive Aptitude & Quantitative Logic",
    subtitle: "Adaptive Practice",
    icon: Calculator,
    desc: "Solve verified quantitative and logical reasoning questions with step-by-step formula breakdowns. Difficulty continuously scales based on your accuracy.",
    capability: "Campus & SSC Pattern Verification · Instant Formula Cards"
  },
  {
    number: "04",
    phase: "SIMULATE",
    title: "Algorithmic Arena & Sandbox Execution",
    subtitle: "Judge0 Compiler",
    icon: Code2,
    desc: "Write and execute clean code in Python, C++, Java, and JavaScript against hidden test cases. Benchmark time and space complexity with progressive AI hints.",
    capability: "Judge0 Sandbox · 15+ DSA Algorithmic Patterns"
  },
  {
    number: "05",
    phase: "CALIBRATE",
    title: "AI Technical Mock Interview Studio",
    subtitle: "Real-time AI Evaluator",
    icon: Bot,
    desc: "Experience real-time interactive technical interviews with dynamic follow-ups. Receive multi-dimensional rubric scoring on communication clarity, technical depth, and structure.",
    capability: "Multi-Axis Rubric · Voice/Text Simulation"
  },
  {
    number: "06",
    phase: "READY",
    title: "Continuous Placement Readiness Score",
    subtitle: "Holistic Benchmark",
    icon: TrendingUp,
    desc: "Track your real-time 0–100% readiness score measured across aptitude speed, algorithmic accuracy, interview performance, and ATS resume compatibility.",
    capability: "Progress Synthesis · Placement Readiness"
  }
];

export default function LandingJourney() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="placement-journey" className="py-24 bg-surface-subtle/40 border-t border-border/70 relative overflow-hidden">
      
      {/* Visual Ambient Continuity Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Editorial Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-2 border border-border text-xs font-mono text-cyan-400 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Placement Progression Path</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary mb-3 font-display">
            From Fundamental Learning to Placement-Ready.
          </h2>
          <p className="text-text-secondary text-base sm:text-lg">
            No disconnected tools or unorganized PDFs. Every practice problem, coding submission, 
            and mock interview feeds into one unified learning journey.
          </p>
        </div>

        {/* ── Progressive Beam Navigation Tracks ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-8">
          {steps.map((step, idx) => {
            const isActive = activeStep === idx;
            const Icon = step.icon;
            return (
              <button
                key={step.number}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? "bg-surface border-primary-500/80 shadow-md shadow-primary-500/10"
                    : "bg-surface/50 border-border/70 hover:bg-surface hover:border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-text-muted">{step.number}</span>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-primary-400 font-bold">{step.phase}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-primary-400" : "text-text-muted"}`} />
                  <span className="text-xs font-semibold text-text-primary truncate block">{step.subtitle}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Active Stage Spotlight Feature Area ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="p-6 sm:p-8 rounded-2xl border border-border bg-surface shadow-xl relative overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Descriptive Content */}
              <div className="lg:col-span-7 space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-primary-500/15 text-primary-300 border border-primary-500/30">
                    STAGE {steps[activeStep].number}
                  </span>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-text-primary font-display">
                      {steps[activeStep].title}
                    </h3>
                  </div>
                </div>

                <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                  {steps[activeStep].desc}
                </p>

                <div className="pt-2 border-t border-border/70 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono text-text-muted">Highlights:</span>
                  <span className="text-xs font-medium text-text-primary px-2.5 py-1 rounded-md bg-surface-2 border border-border/80">
                    {steps[activeStep].capability}
                  </span>
                </div>
              </div>

              {/* Right Column: Stage Progress Visual */}
              <div className="lg:col-span-5 p-5 rounded-xl border border-border/80 bg-surface-2/60 space-y-3 text-left">
                <div className="flex items-center justify-between text-xs font-mono text-text-muted pb-2 border-b border-border/60">
                  <span>STAGE STATUS</span>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold">
                    [PRODUCT DEMO]
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs">
                      <strong className="text-text-primary block font-medium">Automatic Memory Ingestion</strong>
                      <span className="text-text-secondary text-[11px]">Results immediately update your placement readiness profile.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs">
                      <strong className="text-text-primary block font-medium">Adaptive Practice</strong>
                      <span className="text-text-secondary text-[11px]">Adapts the difficulty curve to push you toward candidate mastery.</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveStep((prev) => (prev + 1) % steps.length)}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Next Phase ({steps[(activeStep + 1) % steps.length].phase})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>

      </div>

    </section>
  );
}
