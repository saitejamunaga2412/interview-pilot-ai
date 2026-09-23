import React from "react";
import { motion } from "framer-motion";
import { 
  Target, Sparkles, Brain, Cpu, Database, 
  GitBranch, CheckCircle2, Bot, ArrowRight, ShieldCheck, Zap 
} from "lucide-react";

export default function LandingCareerVisual() {
  return (
    <section className="py-24 bg-surface/30 border-t border-border/70 relative overflow-hidden">
      
      {/* Ambient Radial Lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[650px] h-[450px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[350px] bg-primary-600/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-2 border border-border text-xs font-mono text-cyan-400 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Career Intelligence</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text-primary mb-4 font-display">
            A Placement System That Learns How You Think.
          </h2>
          <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
            InterviewPilot does not simply present static questions. It constructs a dynamic skill constellation 
            mapped directly to your target role, diagnosing conceptual gaps and auto-scheduling spaced revision.
          </p>
        </div>

        {/* ── Visual Showcase Grid: Cinematic Visual Left, Skill Constellation System Right ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* LEFT: Cinematic Engineering Atmosphere Visual */}
          <div className="lg:col-span-6 relative">
            <div className="rounded-2xl border border-border/90 bg-surface shadow-2xl overflow-hidden relative group">
              
              {/* Image Asset with Editorial Overlay */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src="/assets/anime/career_constellation.jpg"
                  alt="Candidate exploring career path constellation in InterviewPilot AI"
                  className="w-full h-full object-cover object-center transform group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050811] via-transparent to-transparent opacity-80" />
              </div>

              {/* Floating Overlay Badge on Visual */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-surface/90 backdrop-blur-md border border-border/80 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <div>
                    <span className="text-text-primary font-bold block">Real-Time Progress</span>
                    <span className="text-text-muted text-[10px]">Real-time synchronization</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-primary-500/15 text-primary-300 border border-primary-500/30 text-[10px] font-bold">
                  [PRODUCT VISUAL]
                </span>
              </div>

            </div>
          </div>

          {/* RIGHT: Distinctive Career Intelligence Constellation Graph */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Target Role Anchor Box */}
            <div className="p-5 rounded-2xl border border-border/90 bg-surface/90 backdrop-blur-md shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold font-mono text-text-primary uppercase tracking-wider">
                    Target Role Alignment
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-2 text-text-muted border border-border">
                  SDE Level 1 Benchmark
                </span>
              </div>

              {/* Connected Constellation Nodes */}
              <div className="space-y-3">
                {[
                  { node: "DSA & Algorithms", status: "Mastered (74%)", color: "text-emerald-400", sub: "Sliding Window, Two Pointers, Graph BFS" },
                  { node: "Quantitative & Logic", status: "Active Gap (82%)", color: "text-amber-400", sub: "Speed Math & Successive Percentages" },
                  { node: "CS Core Fundamentals", status: "In Progress (70%)", color: "text-cyan-400", sub: "OS Process Scheduling, DBMS ACID" },
                  { node: "AI Mock Technical Rubric", status: "Calibrated (69%)", color: "text-indigo-400", sub: "Technical Depth & Solution Structure" },
                ].map((item) => (
                  <div key={item.node} className="p-3 rounded-xl bg-surface-2/60 border border-border/70 flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-text-primary block font-medium">{item.node}</strong>
                      <span className="text-text-muted text-[11px] font-mono">{item.sub}</span>
                    </div>
                    <span className={`font-mono font-bold text-[11px] ${item.color}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Dynamic Telemetry Feedback Result */}
              <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-500/5 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-text-secondary text-[11px]">
                    Autonomous Spaced Repetition Queue: <strong className="text-text-primary">14 Min / Day</strong>
                  </span>
                </div>
                <span className="text-cyan-400 font-bold">Live Synced</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
