import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Bot, ShieldCheck, Mail, FolderGit2 } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer id="about" className="bg-[#060911] border-t border-border/80 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-indigo-500/20">
                IP
              </div>
              <div>
                <span className="font-bold text-sm text-white tracking-tight">InterviewPilot AI</span>
                <span className="block text-[10px] text-slate-500 font-mono uppercase">AI Placement Operating System</span>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed max-w-sm text-xs">
              Unified AI-powered placement platform providing structured CS curriculum, algorithmic sandbox practice, portfolio project management, ATS resume intelligence, and live AI mock interviews.
            </p>

            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational (FastAPI &middot; Judge0 &middot; Gemini)</span>
            </div>
          </div>

          {/* Col 2: Core Platform Navigation */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] font-mono">
              Features
            </h4>
            <ul className="space-y-2">
              <li><Link to="/learning" className="hover:text-cyan-400 transition-colors">Personalized Roadmaps</Link></li>
              <li><Link to="/arena" className="hover:text-cyan-400 transition-colors">Coding Practice Sandbox</Link></li>
              <li><Link to="/projects" className="hover:text-cyan-400 transition-colors">Project Management</Link></li>
              <li><Link to="/resume" className="hover:text-cyan-400 transition-colors">Resume ATS Scanner</Link></li>
              <li><Link to="/interview" className="hover:text-cyan-400 transition-colors">AI Mock Interviews</Link></li>
            </ul>
          </div>

          {/* Col 3: Product Navigation */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] font-mono">
              Product Navigation
            </h4>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">Features Overview</a></li>
              <li><a href="#how-it-works" className="hover:text-cyan-400 transition-colors">How It Works</a></li>
              <li><a href="#journey" className="hover:text-cyan-400 transition-colors">Preparation Journey</a></li>
              <li><Link to="/mistakes" className="hover:text-cyan-400 transition-colors">Mistake Book</Link></li>
              <li><Link to="/history" className="hover:text-cyan-400 transition-colors">Placement Analytics</Link></li>
            </ul>
          </div>

          {/* Col 4: Account & Support */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] font-mono">
              Candidate Access
            </h4>
            <ul className="space-y-2">
              <li><Link to="/login" className="hover:text-cyan-400 transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-cyan-400 transition-colors">Get Started</Link></li>
              <li><Link to="/forgot-password" className="hover:text-cyan-400 transition-colors">Reset Password</Link></li>
              <li><a href="mailto:support@interviewpilot.ai" className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> support@interviewpilot.ai</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} InterviewPilot AI. All rights reserved. Zero data fabrication.
          </div>

          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
