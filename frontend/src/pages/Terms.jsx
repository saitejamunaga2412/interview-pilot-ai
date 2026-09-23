import React from "react";
import { Link } from "react-router-dom";
import { FileCheck, ArrowLeft, AlertTriangle, Scale, CheckCircle2, ShieldAlert } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans antialiased py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation back */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary-400 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <span className="text-xs font-mono text-text-muted">Last Updated: August 2026</span>
        </div>

        {/* Header */}
        <div className="border-b border-border/80 pb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20 text-xs font-mono font-bold">
            <Scale className="w-3.5 h-3.5" />
            <span>TERMS OF SERVICE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary font-display">
            Terms of Service — InterviewPilot AI
          </h1>
          <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
            Please review these terms before using the InterviewPilot AI platform for coding practice, aptitude preparation, and mock interview simulations.
          </p>
        </div>

        {/* Content sections */}
        <div className="space-y-8 text-sm text-text-secondary leading-relaxed">
          
          <section className="p-6 rounded-xl border border-border bg-surface space-y-3">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary-400" /> 1. Acceptable Use
            </h2>
            <p>
              InterviewPilot AI is designed for academic, career readiness, and engineering placement practice. By using the platform, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-text-secondary">
              <li>Use the system solely for personal educational and interview training purposes.</li>
              <li>Provide accurate account information and safeguard your login credentials.</li>
              <li>Refrain from submitting malicious scripts, destructive payloads, or exploiting code execution sandboxes.</li>
              <li>Not attempt unauthorized access to other students' interviews, submissions, or profile data.</li>
            </ul>
          </section>

          <section className="p-6 rounded-xl border border-border bg-surface space-y-3">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" /> 2. AI Tutor & Evaluation Limitations
            </h2>
            <p>
              The interview evaluations, rubric assessments, and ATS scoring are powered by generative artificial intelligence models and heuristics:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-text-secondary">
              <li>Evaluations represent simulated training feedback and do not represent formal hiring decisions by actual employers.</li>
              <li>AI responses may occasionally contain inaccuracies or incomplete solutions. Always cross-reference core engineering principles.</li>
              <li><strong className="text-text-primary">No Guarantee of Employment:</strong> Completion of mock interviews or high simulation scores does not guarantee a job offer from any specific corporate hiring team.</li>
            </ul>
          </section>

          <section className="p-6 rounded-xl border border-border bg-surface space-y-3">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-400" /> 3. Code Execution Environment
            </h2>
            <p>
              The Coding Arena provides sandbox execution using the Judge0 infrastructure. Execution time limits (e.g., 10 seconds), memory limits, and process limits are enforced. Excessive submissions or automated denial-of-service attempts will result in automated IP rate limiting and account restriction.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-border bg-surface space-y-3">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-cyan-400" /> 4. Service Availability & Changes
            </h2>
            <p>
              We continually improve InterviewPilot AI. We reserve the right to modify features, update question banks, or schedule necessary maintenance. Users may terminate their account at any time without penalty.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-4">
          <p>© {new Date().getFullYear()} InterviewPilot AI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-text-primary transition-colors">Privacy Policy</Link>
            <Link to="/login" className="hover:text-text-primary transition-colors">Login</Link>
            <Link to="/register" className="hover:text-text-primary transition-colors">Register</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
