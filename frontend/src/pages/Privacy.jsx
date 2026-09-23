import React from "react";
import { Link } from "react-router-dom";
import { Shield, ArrowLeft, Lock, FileText, Database, Trash2, Cpu } from "lucide-react";

export default function Privacy() {
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
            <Shield className="w-3.5 h-3.5" />
            <span>DATA PRIVACY POLICY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary font-display">
            Privacy Policy — InterviewPilot AI
          </h1>
          <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
            We respect your privacy and provide transparent information on how student information, interview telemetry, practice activity, and resumes are processed and protected within InterviewPilot AI.
          </p>
        </div>

        {/* Content sections */}
        <div className="space-y-8 text-sm text-text-secondary leading-relaxed">
          
          <section className="p-6 rounded-xl border border-border bg-surface space-y-3">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Database className="w-5 h-5 text-primary-400" /> 1. Information We Collect
            </h2>
            <p>InterviewPilot AI collects information you provide directly to facilitate personalized placement preparation:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-text-secondary">
              <li><strong className="text-text-primary">Account Data:</strong> Name, email address, hashed passwords, and authentication credentials.</li>
              <li><strong className="text-text-primary">Student Profile:</strong> College name, graduation year, target roles, target companies, and skill preferences.</li>
              <li><strong className="text-text-primary">Practice & Learning Activity:</strong> DSA progress, quiz answers, aptitude problem attempts, and Mistake Book entries.</li>
              <li><strong className="text-text-primary">Mock Interview Data:</strong> Audio/text responses, time elapsed, AI rubric evaluations, and simulation scores.</li>
              <li><strong className="text-text-primary">Resume Uploads:</strong> PDF resumes provided for ATS scoring and skill extraction.</li>
            </ul>
          </section>

          <section className="p-6 rounded-xl border border-border bg-surface space-y-3">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" /> 2. AI Processing & Third-Party Services
            </h2>
            <p>
              To generate questions, evaluate candidate answers, and analyze resumes, InterviewPilot AI utilizes AI models (such as Google Gemini API) and isolated execution environments (such as Judge0 API for code testing):
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-text-secondary">
              <li>Your prompt requests and candidate answers are submitted to AI services strictly for generating immediate feedback.</li>
              <li>Untrusted code submitted in Coding Arena is executed inside isolated sandboxes without access to your host or private data.</li>
              <li>We do not sell, rent, or monetize your personal candidate data or resumes to third-party recruiters or advertising brokers.</li>
            </ul>
          </section>

          <section className="p-6 rounded-xl border border-border bg-surface space-y-3">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-400" /> 3. Data Isolation & Security
            </h2>
            <p>
              We implement multi-user data isolation. All database queries for interview history, mistakes, career progress, and uploaded resumes are strictly scoped to your authenticated user identity (<code className="font-mono text-xs bg-surface-2 px-1.5 py-0.5 rounded text-primary-400">req.user.id</code>). User B cannot read, alter, or access User A's data.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-border bg-surface space-y-3">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" /> 4. Data Retention & Deletion
            </h2>
            <p>
              You maintain complete ownership of your data. You may permanently delete your account and all associated records (including mock interviews, placement simulations, mistakes, uploaded resumes, and progress records) at any time via <Link to="/settings" className="text-primary-400 hover:underline font-semibold">Profile → Settings → Delete Account</Link>.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-border bg-surface space-y-3">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" /> 5. Contact & Questions
            </h2>
            <p>
              If you have any questions or feedback regarding this Privacy Policy or your data, please contact the InterviewPilot AI team via your institution's administrator or email <span className="font-mono text-primary-400">support@interviewpilot.ai</span>.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-4">
          <p>© {new Date().getFullYear()} InterviewPilot AI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-text-primary transition-colors">Terms of Service</Link>
            <Link to="/login" className="hover:text-text-primary transition-colors">Login</Link>
            <Link to="/register" className="hover:text-text-primary transition-colors">Register</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
