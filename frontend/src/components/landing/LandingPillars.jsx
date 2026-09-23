import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Code2, Calculator, Bot, BookOpen, FileText, 
  Sparkles, CheckCircle2, ArrowRight, Terminal, 
  Cpu, Layers, Target, ShieldCheck 
} from "lucide-react";

export default function LandingPillars() {
  return (
    <section id="preparation-pillars" className="py-24 bg-surface/30 border-t border-border/60 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Editorial Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-2 border border-border text-xs font-mono text-cyan-400 mb-4">
              <Layers className="w-3.5 h-3.5" />
              <span>Core Modules</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary">
              Five Specialized Engines. <br className="hidden sm:inline" />
              One Unified Ecosystem.
            </h2>
          </div>
          <p className="text-text-secondary text-sm sm:text-base max-w-md">
            Every module is deep enough to replace dedicated standalone tools, yet fully integrated so your performance data is never lost.
          </p>
        </div>

        {/* ── Asymmetric Editorial Layout ── */}
        <div className="space-y-8">
          
          {/* 1. Large Feature Card: Algorithmic Coding Arena */}
          <div className="p-6 sm:p-10 rounded-2xl border border-border bg-surface shadow-xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold block">
                      Pillar 01 · Algorithmic Arena
                    </span>
                    <h3 className="text-2xl font-bold text-text-primary">
                      Production-Grade Code Execution Sandbox
                    </h3>
                  </div>
                </div>

                <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                  Solve curated algorithmic problems across 15+ core patterns (Sliding Window, Two Pointers, Graphs, DP). 
                  Execute code in Python, C++, Java, and JavaScript with instant feedback on hidden edge cases.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-surface-2/70 border border-border/80 text-xs">
                    <span className="font-bold text-text-primary block mb-1">Judge0 Integration</span>
                    <span className="text-text-muted text-[11px]">Real isolated sandbox with standard I/O testcases.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-2/70 border border-border/80 text-xs">
                    <span className="font-bold text-text-primary block mb-1">AI Debugging Hints</span>
                    <span className="text-text-muted text-[11px]">Progressive hints that guide without spoiling the answer.</span>
                  </div>
                </div>
              </div>

              {/* Mini IDE Code Preview */}
              <div className="lg:col-span-6 rounded-xl border border-border/90 bg-[#080d1a] p-4 font-mono text-xs shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60 text-text-muted text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-error-500/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-warning-500/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-success-500/70" />
                    <span className="ml-2 text-text-secondary">two_sum.py</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold">
                    [PRODUCT DEMO UI]
                  </span>
                </div>

                <div className="space-y-1 text-slate-300 overflow-x-auto leading-relaxed">
                  <div><span className="text-purple-400">def</span> <span className="text-blue-400">twoSum</span>(nums: list[int], target: int) -&gt; list[int]:</div>
                  <div className="pl-4 text-text-muted"># Hash map for O(N) lookup</div>
                  <div className="pl-4"><span className="text-cyan-300">seen</span> = {}</div>
                  <div className="pl-4"><span className="text-purple-400">for</span> i, num <span className="text-purple-400">in</span> <span className="text-yellow-300">enumerate</span>(nums):</div>
                  <div className="pl-8"><span className="text-cyan-300">diff</span> = target - num</div>
                  <div className="pl-8"><span className="text-purple-400">if</span> diff <span className="text-purple-400">in</span> seen:</div>
                  <div className="pl-12"><span className="text-purple-400">return</span> [seen[diff], i]</div>
                  <div className="pl-8">seen[num] = i</div>
                  <div className="pl-4"><span className="text-purple-400">return</span> []</div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    All 3 Test Cases Passed
                  </span>
                  <span className="text-text-muted">Execution: 0.038s · Mem: 14.2MB</span>
                </div>
              </div>

            </div>
          </div>

          {/* 2. Split Editorial Cards: Aptitude & AI Mock Interview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Aptitude & Reasoning Pillar */}
            <div className="p-6 sm:p-8 rounded-2xl border border-border bg-surface shadow-lg space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-primary-400 font-bold">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-primary-400 font-semibold block">
                      Pillar 02 · Quantitative & Logic
                    </span>
                    <h3 className="text-xl font-bold text-text-primary">
                      Adaptive Aptitude Engine
                    </h3>
                  </div>
                </div>

                <p className="text-text-secondary text-sm leading-relaxed">
                  Real exam questions from campus drives and government exams. Every topic comes with verified formulas, 
                  solved step-by-step examples, and automated mistake classification.
                </p>

                {/* Aptitude Question Card Preview */}
                <div className="p-4 rounded-xl border border-border/80 bg-surface-2/60 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
                    <span className="font-semibold text-text-primary">Topic: Successive Percentage</span>
                    <span className="text-cyan-400">[DEMO DATA]</span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    "If a price increases by 20% then decreases by 10%, what is the net percentage change?"
                  </p>
                  <div className="p-2 rounded bg-surface border border-border text-[11px] font-mono text-primary-300">
                    Formula: Net Change = a + b + (a * b) / 100 = 20 - 10 - 2 = +8%
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-text-muted font-mono">
                <span>Mistake Notebook Tracking</span>
                <span className="text-emerald-400">Active Spaced Repetition</span>
              </div>
            </div>

            {/* AI Mock Interview Pillar */}
            <div className="p-6 sm:p-8 rounded-2xl border border-border bg-surface shadow-lg space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold block">
                      Pillar 03 · AI Mock Studio
                    </span>
                    <h3 className="text-xl font-bold text-text-primary">
                      Real-Time Technical Interviewer
                    </h3>
                  </div>
                </div>

                <p className="text-text-secondary text-sm leading-relaxed">
                  Practice live behavioral and technical rounds with an AI interviewer that asks smart follow-ups. 
                  Get instant rubric breakdown across Communication, Technical Depth, and Problem Structuring.
                </p>

                {/* Interview Feedback Rubric Preview */}
                <div className="p-4 rounded-xl border border-border/80 bg-surface-2/60 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
                    <span className="font-semibold text-text-primary">AI Evaluation Rubric</span>
                    <span className="text-indigo-400">[DEMO MODEL]</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Communication Clarity</span>
                      <span className="font-mono text-text-primary font-bold">8.5 / 10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Technical Solution Depth</span>
                      <span className="font-mono text-text-primary font-bold">7.8 / 10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Structural Approach</span>
                      <span className="font-mono text-text-primary font-bold">8.0 / 10</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-text-muted font-mono">
                <span>Audio & Text Mode</span>
                <span className="text-primary-400">Context-Aware Prompts</span>
              </div>
            </div>

          </div>

          {/* 3. Bottom Dual Features: CS Fundamentals & ATS Resume Radar */}
          <div className="p-6 sm:p-8 rounded-2xl border border-border bg-surface-2/40 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-base font-bold text-text-primary">Curriculum & CS Fundamentals</h4>
                </div>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Master Operating Systems (Process Scheduling, Deadlocks), Database Systems (Indexing, Normalization, ACID), 
                  Computer Networks (TCP/IP, HTTP), and System Design basics through structured, bite-sized lessons.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-base font-bold text-text-primary">Resume ATS & Target Role Radar</h4>
                </div>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Scan your resume against real target job descriptions. The ATS engine identifies missing technical keywords, 
                  formats bullet points for impact, and aligns your daily study plan to close skill gaps.
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
