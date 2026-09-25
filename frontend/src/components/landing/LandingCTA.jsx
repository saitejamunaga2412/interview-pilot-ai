import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Sparkles, Terminal, Bot } from "lucide-react";

export default function LandingCTA() {
  return (
    <section className="py-28 bg-[#070A13] relative overflow-hidden border-t border-border/80">
      {/* Background glow bloom */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1000px] h-[500px] bg-gradient-to-r from-cyan-600/15 via-indigo-600/15 to-purple-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(#182238_1px,transparent_1px)] [background-size:28px_28px] opacity-35 -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Top Intelligence Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111728] border border-cyan-500/30 text-xs font-mono text-cyan-400 mb-6 shadow-md">
          <Sparkles className="w-3.5 h-3.5" />
          <span>InterviewPilot AI Platform</span>
        </div>

        {/* User Required Headline */}
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
          Start Building Your Placement Readiness Today
        </h2>

        {/* Supporting Statement */}
        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Assess your skills, build a personalized preparation plan, practice coding, improve your resume, and prepare for interviews with AI-powered guidance.
        </p>

        {/* Action Button: "Get Started" */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Link
            to="/register"
            className="w-full sm:w-auto px-9 py-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:opacity-95 shadow-xl shadow-indigo-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/login"
            className="w-full sm:w-auto px-7 py-4 rounded-xl font-semibold text-sm text-slate-300 hover:text-white bg-[#101626] hover:bg-[#161F36] border border-border/80 transition-colors flex items-center justify-center gap-2"
          >
            <span>Sign In</span>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-400">
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
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            Gemini AI Feedback
          </span>
        </div>

      </div>

    </section>
  );
}
