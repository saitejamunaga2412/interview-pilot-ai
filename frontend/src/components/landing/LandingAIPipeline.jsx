import React from "react";
import { Link } from "react-router-dom";
import { 
  Bot, CheckCircle2, AlertTriangle, ArrowRight, 
  Sparkles, Layers, BookOpen, MessageSquare, Terminal, Award
} from "lucide-react";

export default function LandingAIPipeline() {
  return (
    <section className="py-24 bg-[#090D18] border-t border-border/60 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[600px] h-[400px] bg-purple-600/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111728] border border-purple-500/30 text-xs font-mono text-purple-400 mb-4">
            <Bot className="w-3.5 h-3.5" />
            <span>AI Mock Interview Studio</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Practice Real Technical & Behavioral Rounds
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-4 leading-relaxed">
            Experience role-specific interview simulations with deep technical evaluation. Every response receives structured, actionable feedback designed to help you clear real technical screenings.
          </p>
        </div>

        {/* Two-column layout: Mock interview simulation on left, Structured Feedback Rubric on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT: Interview Dialogue Simulator Card */}
          <div className="lg:col-span-6 rounded-2xl bg-[#0E1322]/90 border border-border/70 p-6 sm:p-8 flex flex-col justify-between shadow-xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">AI Technical Interviewer</h3>
                    <p className="text-[11px] text-slate-400">Target: Backend Engineer &middot; System Design</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  SESSION ACTIVE
                </span>
              </div>

              {/* Chat snippet */}
              <div className="space-y-4 text-xs font-sans">
                {/* AI prompt */}
                <div className="p-4 rounded-xl bg-[#141B2E] border border-border/60 text-slate-200 space-y-1">
                  <p className="text-[11px] font-semibold text-purple-300">Interviewer Question:</p>
                  <p className="leading-relaxed">
                    "How would you handle cache stampede (thundering herd problem) in a high-traffic microservices architecture when a popular Redis key expires?"
                  </p>
                </div>

                {/* Candidate response snippet */}
                <div className="p-4 rounded-xl bg-[#0B0F19] border border-border/40 text-slate-300 space-y-1 ml-4">
                  <p className="text-[11px] font-semibold text-cyan-400">Candidate Response:</p>
                  <p className="leading-relaxed italic text-slate-300">
                    "I would use mutex locking (distributed locks with Redis Redlock) so only one worker thread regenerates the cache from the database, while other requests wait or receive stale data."
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-border/40 flex items-center justify-between">
              <span className="text-xs text-slate-400">Evaluates depth, trade-offs, and communication clarity</span>
              <Link
                to="/interview"
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                Try Interview &rarr;
              </Link>
            </div>
          </div>

          {/* RIGHT: Structured Multi-Point Feedback breakdown */}
          <div className="lg:col-span-6 rounded-2xl bg-[#0E1322]/90 border border-purple-500/30 p-6 sm:p-8 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Structured AI Candidate Feedback
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                Score: 8.5 / 10
              </span>
            </div>

            {/* Structured feedback items */}
            <div className="space-y-4">
              {/* What went well */}
              <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>What You Did Well</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-5">
                  Correctly identified distributed mutex locks as an effective mitigation strategy and mentioned serving stale cache while recomputing.
                </p>
              </div>

              {/* What was missing */}
              <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>What Was Missing</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-5">
                  Did not discuss probabilistic early expiration (XFetch algorithm) or adding random jitter to TTLs to prevent synchronized expirations.
                </p>
              </div>

              {/* Suggested Answer Structure */}
              <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Suggested Answer Structure</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-5">
                  1. Define the risk &rarr; 2. Primary mitigation (TTL jitter + Mutex lock) &rarr; 3. Advanced strategy (probabilistic recomputation) &rarr; 4. Trade-off analysis.
                </p>
              </div>

              {/* Concepts to Revise */}
              <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Recommended Revision Topics</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-5">
                  Distributed Caching Patterns &middot; Redis Locks &middot; Cache-Aside Architecture.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
