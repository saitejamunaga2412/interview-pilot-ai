import React from "react";
import { motion } from "framer-motion";
import { 
  Bot, Sparkles, Brain, Cpu, Database, 
  ArrowRight, ShieldCheck, Zap, GitBranch, Layers 
} from "lucide-react";

export default function LandingAIPipeline() {
  const pipelineNodes = [
    {
      id: "input",
      title: "Practice Actions",
      icon: Layers,
      items: ["Aptitude Quiz Attempt", "Code Editor Submissions", "AI Mock Interview Audio"],
      badge: "Real-time Progress"
    },
    {
      id: "diag",
      title: "Diagnostic Engine",
      icon: Cpu,
      items: ["Error Taxonomy Classification", "Time & Space Profiling", "Rubric Multi-Axis Analysis"],
      badge: "Pattern Diagnosis"
    },
    {
      id: "memory",
      title: "Global AI Memory Graph",
      icon: Database,
      items: ["Weak Concept Clustering", "Spaced Repetition Scheduler (1d, 3d, 7d)", "Target Role Skill Graph"],
      badge: "Persistent Memory"
    },
    {
      id: "output",
      title: "Adaptive Daily Plan",
      icon: Brain,
      items: ["Personalized Daily Study Plan", "Instant Mistake Revision Queue", "Readiness Progress Tracking"],
      badge: "Dynamic Guidance"
    }
  ];

  return (
    <section id="ai-pipeline" className="py-24 bg-bg-base relative overflow-hidden">
      
      {/* Background Neural Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e2c44_1px,transparent_1px)] [background-size:28px_28px] opacity-30 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-2 border border-border text-xs font-mono text-primary-400 mb-4">
            <Bot className="w-3.5 h-3.5" />
            <span>Autonomous Intelligence Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary mb-4">
            Your Preparation Gets Smarter as You Practice.
          </h2>
          <p className="text-text-secondary text-base sm:text-lg">
            Unlike static question banks, InterviewPilot maintains a synchronized memory graph of every concept you touch, 
            identifying exactly why you missed a problem and adapting your daily plan.
          </p>
        </div>

        {/* ── Visual Architecture Pipeline Flow ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative mb-16">
          {pipelineNodes.map((node, idx) => {
            const Icon = node.icon;
            return (
              <div
                key={node.id}
                className="p-6 rounded-2xl border border-border bg-surface/90 backdrop-blur-md relative flex flex-col justify-between group hover:border-primary-500/50 hover:shadow-lg transition-all"
              >
                {/* Node Connector Line for Desktop */}
                {idx < pipelineNodes.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-primary-400/60 font-bold">
                    <ArrowRight className="w-5 h-5 animate-pulse" />
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-primary-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-primary-500/10 text-primary-400 border border-primary-500/20 font-bold">
                      {node.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-text-primary mb-3">
                    {node.title}
                  </h3>

                  <ul className="space-y-2">
                    {node.items.map((item) => (
                      <li key={item} className="text-xs text-text-secondary flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-400/80 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-text-muted">
                  <span>Stage 0{idx + 1}</span>
                  <span className="text-emerald-400">Live Synced</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Strict AI Teacher Sequence Callout ── */}
        <div className="p-6 sm:p-8 rounded-2xl border border-primary-500/30 bg-surface-2/70 backdrop-blur-md">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-400 animate-ping" />
                <span className="text-xs font-mono font-bold text-primary-400 uppercase tracking-wider">
                  The AI Teacher Pedagogical Framework
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-text-primary">
                Strict 13-Point Teaching Sequence for Every Concept
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                When you ask a question or review a mistake, the AI Teacher never gives vague summaries. It follows a disciplined sequence:
                <strong className="text-text-primary"> Definition → Why it Matters → Real-World Analogy → Step-by-Step Logic → Visual Dry Run → Code Implementation → Complexity Proof → Common Interview Pitfalls.</strong>
              </p>
            </div>

            <div className="px-4 py-3 rounded-xl bg-surface border border-border text-center shrink-0 w-full lg:w-auto">
              <span className="text-xs font-mono text-text-muted block">Debugging Assistant Rule</span>
              <span className="text-sm font-bold text-text-primary mt-0.5 block">Progressive Hints First</span>
              <span className="text-[11px] text-text-secondary mt-1 block">Forces active problem solving</span>
            </div>
          </div>
        </div>

      </div>

    </section>
  );
}
