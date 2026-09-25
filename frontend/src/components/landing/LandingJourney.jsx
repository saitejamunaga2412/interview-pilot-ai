import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ClipboardCheck, Calendar, BookOpen, FolderGit2, Bot, 
  TrendingUp, ArrowRight, CheckCircle2, ChevronRight, Sparkles, Target, Clock, ShieldAlert, Cpu
} from "lucide-react";

const journeySteps = [
  {
    step: "01",
    title: "Assess Your Skills",
    subtitle: "Baseline Assessment",
    icon: ClipboardCheck,
    desc: "Take an optional baseline skill check or select your target engineering role. The system identifies your starting proficiency without fabricating baseline scores.",
    color: "from-cyan-500 to-blue-500"
  },
  {
    step: "02",
    title: "Get a Personalized Plan",
    subtitle: "Adaptive Roadmap",
    icon: Calendar,
    desc: "Receive an automatically calculated preparation roadmap configured to your graduation timeline, daily study target, and target company tier.",
    color: "from-blue-500 to-indigo-500"
  },
  {
    step: "03",
    title: "Learn and Practice",
    subtitle: "Interactive Lessons & Coding",
    icon: BookOpen,
    desc: "Study conceptual lessons with real-world analogies and visualizers. Solve algorithmic problems in the sandbox with hidden test-case validation.",
    color: "from-indigo-500 to-purple-500"
  },
  {
    step: "04",
    title: "Build Projects & Improve Resume",
    subtitle: "Portfolio & ATS Scan",
    icon: FolderGit2,
    desc: "Track portfolio milestones with tech stack checklists. Scan your resume through the ATS analyzer for missing keywords and quantifiable improvements.",
    color: "from-purple-500 to-pink-500"
  },
  {
    step: "05",
    title: "Practice Interviews",
    subtitle: "AI Mock Interviews",
    icon: Bot,
    desc: "Engage in technical and behavioral mock interview sessions. Receive structured multi-point evaluations with strengths, weaknesses, and revision topics.",
    color: "from-pink-500 to-rose-500"
  },
  {
    step: "06",
    title: "Track Your Readiness",
    subtitle: "Placement Readiness Index",
    icon: TrendingUp,
    desc: "Monitor your placement readiness computed strictly from verified code submissions, quiz attempts, completed project tasks, and interview scores.",
    color: "from-emerald-500 to-teal-500"
  }
];

const personalizationDimensions = [
  {
    title: "Target Role Alignment",
    desc: "Select SDE, Frontend, Backend, Full Stack, DevOps, or ML. Roadmaps adjust core topics and algorithmic patterns to match real industry expectations.",
    icon: Target,
    tag: "Role-Specific"
  },
  {
    title: "Current Skill Level",
    desc: "Whether you're starting from fundamental recursion or brushing up on dynamic programming, topic pacing calibrates to your verified baseline.",
    icon: Cpu,
    tag: "Adaptive Difficulty"
  },
  {
    title: "Daily Study Target",
    desc: "Set 1, 2, or 3+ hours daily. The study planner schedules manageable daily tasks with milestone reminders so you never burn out.",
    icon: Clock,
    tag: "Pacing Engine"
  },
  {
    title: "Real Performance Tracking",
    desc: "No fake completion scores. Coding accuracy, test execution times, and interview rubrics dynamically recalculate your readiness.",
    icon: CheckCircle2,
    tag: "Zero-Fake Metric"
  },
  {
    title: "Weak Area Remediation",
    desc: "Every failed test case and weak interview answer is automatically routed to your Mistake Book with step-by-step revision flashcards.",
    icon: ShieldAlert,
    tag: "Targeted Revision"
  }
];

export default function LandingJourney() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="how-it-works" className="py-24 bg-[#070A13] border-t border-border/60 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section 4: How It Works */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111728] border border-cyan-500/30 text-xs font-mono text-cyan-400 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>How It Works</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            The Complete Placement Journey
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-4 leading-relaxed">
            From your first diagnostic assessment to final company offer letter, follow a disciplined, data-driven preparation methodology.
          </p>
        </div>

        {/* 6-step Journey Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {journeySteps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="group relative p-6 rounded-2xl bg-[#0E1322]/70 hover:bg-[#11182B] border border-border/70 hover:border-cyan-500/40 transition-all duration-300 shadow-md hover:shadow-xl backdrop-blur-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xl font-extrabold text-slate-500 group-hover:text-cyan-400 transition-colors">
                      {item.step}
                    </span>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-sm`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400 font-semibold uppercase tracking-wider block mb-1">
                    {item.subtitle}
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Section 5: Personalized Learning Section */}
        <div id="journey" className="mt-28 pt-16 border-t border-border/50">
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111728] border border-indigo-500/30 text-xs font-mono text-indigo-400 mb-3">
              <Cpu className="w-3.5 h-3.5" />
              <span>Adaptive Intelligence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              How InterviewPilot AI Adapts to You
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 leading-relaxed">
              No generic static playlists. The placement operating system adjusts continuously across five real-time dimensions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personalizationDimensions.map((dim, i) => {
              const Icon = dim.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-[#0E1322]/80 border border-border/70 hover:border-indigo-500/40 transition-all p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-surface text-slate-300 border border-border/60">
                      {dim.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{dim.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{dim.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
