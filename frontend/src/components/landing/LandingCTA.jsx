import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Sparkles, Terminal, Bot } from "lucide-react";

export default function LandingCTA() {
  return (
    <section className="py-28 bg-bg-base relative overflow-hidden border-t border-border/80">
      
      {/* Background Radial Light Bloom */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1000px] h-[500px] bg-gradient-to-b from-cyan-600/15 via-primary-600/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e2c44_1px,transparent_1px)] [background-size:28px_28px] opacity-30 -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Top Intelligence Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-2 border border-border text-xs font-mono text-cyan-400 mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>InterviewPilot AI Platform</span>
        </div>

        {/* Editorial Grand Closing Headline */}
        <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-text-primary leading-[1.06] mb-6 font-display">
          Your preparation is not random. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-400">
            Build a system that adapts to you.
          </span>
        </h2>

        {/* Supporting Statement */}
        <p className="text-text-secondary text-base sm:text-lg lg:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          One intelligent platform for CS fundamentals, adaptive aptitude, live algorithmic execution, and real-time AI mock interviews.
        </p>

        {/* Action Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Link
            to="/register"
            className="w-full sm:w-auto px-9 py-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-700 hover:from-primary-500 hover:to-indigo-500 shadow-xl shadow-primary-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Start Preparing Free</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/login"
            className="w-full sm:w-auto px-7 py-4 rounded-xl font-semibold text-sm text-text-primary bg-surface hover:bg-surface-hover border border-border transition-colors flex items-center justify-center gap-2"
          >
            <span>Sign In to InterviewPilot AI</span>
          </Link>
        </div>

        {/* Trust Telemetry Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-text-muted">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Zero Data Fabrication
          </span>
          <span className="opacity-40">•</span>
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            Judge0 Algorithmic Sandbox
          </span>
          <span className="opacity-40">•</span>
          <span className="flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            AI Mock Evaluation
          </span>
        </div>

      </div>

    </section>
  );
}
