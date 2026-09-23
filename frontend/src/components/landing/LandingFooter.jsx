import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Bot, ShieldCheck } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="bg-surface border-t border-border/80 text-text-secondary text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 to-cyan-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-primary-500/20">
                IP
              </div>
              <div>
                <span className="font-bold text-sm text-text-primary tracking-tight">InterviewPilot AI</span>
                <span className="block text-[10px] text-text-muted font-mono uppercase">AI-powered placement preparation</span>
              </div>
            </div>

            <p className="text-text-muted leading-relaxed max-w-sm text-xs">
              Unified placement preparation system combining Computer Science curriculum, adaptive aptitude, 
              algorithmic arena, and real-time AI mock interviews into one personalized journey.
            </p>

            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational (Judge0 · RAG Engine)</span>
            </div>
          </div>

          {/* Col 2: Core Platform */}
          <div className="space-y-3">
            <h4 className="font-bold text-text-primary uppercase tracking-wider text-[11px] font-mono">
              Preparation Engines
            </h4>
            <ul className="space-y-2">
              <li><Link to="/learning" className="hover:text-text-primary transition-colors">CS Curriculum</Link></li>
              <li><Link to="/aptitude" className="hover:text-text-primary transition-colors">Adaptive Aptitude & Logic</Link></li>
              <li><Link to="/arena" className="hover:text-text-primary transition-colors">Algorithmic Arena (DSA)</Link></li>
              <li><Link to="/interview" className="hover:text-text-primary transition-colors">AI Mock Interview Studio</Link></li>
              <li><Link to="/resume" className="hover:text-text-primary transition-colors">Resume ATS Analyzer</Link></li>
            </ul>
          </div>

          {/* Col 3: Placement Targets */}
          <div className="space-y-3">
            <h4 className="font-bold text-text-primary uppercase tracking-wider text-[11px] font-mono">
              Exam Standards
            </h4>
            <ul className="space-y-2">
              <li className="text-text-muted">Software Engineering (SDE)</li>
              <li className="text-text-muted">TCS NQT & National Drives</li>
              <li className="text-text-muted">Infosys & Wipro Patterns</li>
              <li className="text-text-muted">SSC CGL & Banking Aptitude</li>
              <li className="text-text-muted">GATE CS Core Theory</li>
            </ul>
          </div>

          {/* Col 4: Account Access */}
          <div className="space-y-3">
            <h4 className="font-bold text-text-primary uppercase tracking-wider text-[11px] font-mono">
              Candidate Access
            </h4>
            <ul className="space-y-2">
              <li><Link to="/login" className="hover:text-text-primary transition-colors">Sign In to Dashboard</Link></li>
              <li><Link to="/register" className="hover:text-text-primary transition-colors">Create Candidate Account</Link></li>
              <li><Link to="/forgot-password" className="hover:text-text-primary transition-colors">Reset Password</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-text-muted">
          <div>
            © {new Date().getFullYear()} InterviewPilot AI. All rights reserved. Zero data fabrication guarantee.
          </div>

          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-text-primary transition-colors">Terms of Service</Link>
            <Link to="/login" className="hover:text-text-primary transition-colors">Security Standards</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
