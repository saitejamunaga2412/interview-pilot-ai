import React from "react";
import { Link } from "react-router-dom";
import { 
  BarChart3, TrendingUp, CheckCircle2, AlertCircle, 
  Target, ShieldCheck, Layers, BookOpen, Code2, FolderGit2
} from "lucide-react";

export default function LandingCareerVisual() {
  return (
    <section className="py-24 bg-[#070A13] border-t border-border/60 relative overflow-hidden">
      {/* Background glow ambiance */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[400px] bg-cyan-600/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111728] border border-cyan-500/30 text-xs font-mono text-cyan-400 mb-4">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Honest Placement Analytics</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Track Real Preparation Progress. Zero Fabricated Numbers.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-4 leading-relaxed">
            Most prep platforms show inflated 85% readiness scores that crumble during actual interviews. InterviewPilot AI computes readiness strictly from verified database records and code executions.
          </p>
        </div>

        {/* Analytics Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* LEFT: Analytics Engine Pillars */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-5 rounded-2xl bg-[#0E1322]/80 border border-border/70 hover:border-cyan-500/30 transition-all space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Code2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Verified Algorithmic Submissions</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed pl-10">
                Only passing hidden edge cases in the Judge0 sandbox increases your coding accuracy. Failed attempts identify syntax and logic mistakes for targeted review.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0E1322]/80 border border-border/70 hover:border-indigo-500/30 transition-all space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <FolderGit2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Project Milestone Completion</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed pl-10">
                Progress bars on your portfolio projects reflect actual completed milestones, verified repository commits, and active deployment links.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0E1322]/80 border border-border/70 hover:border-purple-500/30 transition-all space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Weak Area Remediation Loop</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed pl-10">
                Weak concepts from quizzes and mock interviews automatically feed into your Mistake Book with spaced repetition review intervals.
              </p>
            </div>
          </div>

          {/* RIGHT: Honest Analytics Dashboard Preview Card */}
          <div className="lg:col-span-6 rounded-2xl bg-[#0E1322]/90 border border-border/80 p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div>
                <span className="text-[11px] font-mono text-cyan-400 font-semibold uppercase tracking-wider block">
                  CANDIDATE INTELLIGENCE
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">Readiness & Skill Breakdown</h3>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-surface border border-border text-slate-300">
                Live DB Sync
              </span>
            </div>

            {/* Skill Bars with Honest Data */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Data Structures & Algorithms</span>
                  <span className="text-cyan-400 font-mono font-semibold">18/25 Solved</span>
                </div>
                <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: "72%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">System Design & DBMS</span>
                  <span className="text-indigo-400 font-mono font-semibold">12 Topics Mastered</span>
                </div>
                <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: "60%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Portfolio Projects</span>
                  <span className="text-emerald-400 font-mono font-semibold">2 Active / 1 Completed</span>
                </div>
                <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: "66%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">ATS Resume Alignment</span>
                  <span className="text-purple-400 font-mono font-semibold">Score: 82 / 100</span>
                </div>
                <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: "82%" }} />
                </div>
              </div>
            </div>

            {/* Bottom notification */}
            <div className="p-3.5 rounded-xl bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-between text-xs">
              <span className="text-slate-300">New users start with a clean baseline, never false statistics.</span>
              <Link to="/history" className="text-cyan-400 hover:text-cyan-300 font-semibold whitespace-nowrap ml-2">
                View Analytics &rarr;
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
