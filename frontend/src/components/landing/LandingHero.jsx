import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowRight, ShieldCheck, Target, Zap, 
  Bot, Code2, Sparkles, CheckCircle2, ChevronRight, Terminal, BookOpen, Layers
} from "lucide-react";

export default function LandingHero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 20 } }
  };

  return (
    <section className="relative min-h-[94vh] pt-32 pb-20 flex flex-col justify-center items-center overflow-hidden bg-[#070A13]">
      {/* Background glow ambiance */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1100px] h-[500px] bg-gradient-to-tr from-indigo-600/15 via-cyan-500/10 to-purple-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 -left-32 w-[450px] h-[450px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(#182238_1px,transparent_1px)] [background-size:32px_32px] opacity-35 -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Narrative */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-6 text-center lg:text-left space-y-6"
          >
            {/* Eyebrow */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111728]/90 border border-cyan-500/30 backdrop-blur-md shadow-lg shadow-cyan-950/20">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[11px] font-mono font-semibold text-cyan-300 tracking-wider uppercase">
                AI-Powered Placement Operating System
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              variants={itemVariants} 
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]"
            >
              Your Personal AI Partner for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-200 to-purple-400">
                Placement Preparation
              </span>
            </motion.h1>

            {/* Supporting Text */}
            <motion.p 
              variants={itemVariants} 
              className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal"
            >
              Assess your skills, build a personalized preparation plan, practice coding, improve your resume, and prepare for interviews with AI-powered guidance.
            </motion.p>

            {/* CTAs */}
            <motion.div 
              variants={itemVariants} 
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <Link
                to="/register"
                className="px-7 py-3.5 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:opacity-95 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-600/25 flex items-center gap-2 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Start Your Preparation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#features"
                className="px-7 py-3.5 bg-[#101626]/90 hover:bg-[#161F36] border border-border/80 text-slate-300 hover:text-white rounded-xl font-bold text-sm transition-all cursor-pointer"
              >
                Explore Features
              </a>
            </motion.div>

            {/* Trust highlights */}
            <motion.div 
              variants={itemVariants} 
              className="pt-6 border-t border-border/40 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0"
            >
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Zero Fake Metrics</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Real Code Sandbox</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Adaptive Roadmaps</span>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT COLUMN: Realistic Platform Interactive Window */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative rounded-2xl border border-cyan-500/20 bg-[#0E1322]/90 shadow-2xl shadow-indigo-950/40 backdrop-blur-xl p-5 overflow-hidden">
              {/* Top Window Bar */}
              <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-slate-400">interviewpilot-workspace // active-session</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  LIVE AI EVALUATOR
                </span>
              </div>

              {/* IDE & Teacher Split Preview */}
              <div className="space-y-4">
                {/* Code execution sample */}
                <div className="rounded-xl bg-[#090D18] border border-border/60 p-4 font-mono text-xs">
                  <div className="flex items-center justify-between text-text-muted mb-2 text-[11px]">
                    <span className="flex items-center gap-1.5 text-cyan-400">
                      <Terminal className="w-3.5 h-3.5" /> two_sum.py
                    </span>
                    <span className="text-emerald-400">Judge0: Execution Success (48ms)</span>
                  </div>
                  <pre className="text-slate-300 leading-relaxed overflow-x-auto no-scrollbar">
                    <code>
                      <span className="text-purple-400">def</span>{" "}
                      <span className="text-cyan-300">two_sum</span>(nums: List[int], target: int):<br />
                      {"    "}seen = &#123;&#125;<br />
                      {"    "}<span className="text-purple-400">for</span> i, num <span className="text-purple-400">in</span> enumerate(nums):<br />
                      {"        "}diff = target - num<br />
                      {"        "}<span className="text-purple-400">if</span> diff <span className="text-purple-400">in</span> seen:<br />
                      {"            "}<span className="text-purple-400">return</span> [seen[diff], i]<br />
                      {"        "}seen[num] = i
                    </code>
                  </pre>
                </div>

                {/* AI Teacher structured response card */}
                <div className="rounded-xl bg-[#111728]/90 border border-indigo-500/30 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-white">AI Placement Teacher &middot; Analysis</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Optimal <strong className="text-cyan-300">O(N) time</strong> & <strong className="text-cyan-300">O(N) space</strong>. Hash table lookup eliminates the brute-force nested loop. Next step: practice the <em>Two Pointers</em> pattern on sorted arrays.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2 text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Passed 5/5 Hidden Cases
                    </span>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      Time Complexity: O(N)
                    </span>
                  </div>
                </div>

                {/* ATS Resume Diagnostic mini-card */}
                <div className="rounded-xl bg-[#0F1424] border border-border/60 p-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-xs">ATS Resume Analyzer</p>
                      <p className="text-[11px] text-slate-400">Target Role: Full Stack Software Engineer</p>
                    </div>
                  </div>
                  <Link
                    to="/resume"
                    className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    Scan &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
