import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, 
  ShieldCheck, AlertCircle, Bot, Target, CheckCircle2
} from "lucide-react";
import API from "../services/api";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError("");
    const cleanEmail = form.email.trim().toLowerCase();
    if (!cleanEmail || !form.password) {
      setError("Please enter your email and password.");
      return;
    }
    try {
      setLoading(true);
      const res = await API.post("/auth/login", {
        email: cleanEmail,
        password: form.password
      });
      login(res.data.data);
      navigate("/dashboard");
    } catch (err) {
      let msg = "Invalid credentials. Please verify and try again.";
      if (err?.response?.data?.detail) {
        if (typeof err.response.data.detail === "string") {
          msg = err.response.data.detail;
        } else if (err.response.data.detail.message) {
          msg = err.response.data.detail.message;
        } else if (Array.isArray(err.response.data.detail) && err.response.data.detail[0]?.msg) {
          msg = err.response.data.detail[0].msg;
        }
      } else if (err?.response?.data?.message) {
        msg = err.response.data.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-bg-base text-text-primary font-sans antialiased">
      
      {/* ── Left Cinematic Visual Panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[48%] p-10 relative overflow-hidden bg-surface border-r border-border">
        
        {/* Background Ambient Glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary-500/20">
              IP
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-text-primary block leading-none font-display">
                InterviewPilot AI
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                Placement Prep
              </span>
            </div>
          </Link>
        </div>

        {/* Center Artwork Box */}
        <div className="relative z-10 my-auto py-6">
          <div className="rounded-2xl border border-border/80 bg-surface-2/60 backdrop-blur-md overflow-hidden shadow-2xl relative mb-6">
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src="/assets/anime/auth_hero.jpg"
                alt="Candidate with AI companion preparing for placement"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080A12] via-transparent to-transparent opacity-80" />
            </div>
            
            <div className="p-4 bg-surface-2/90 border-t border-border/80 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-text-primary font-semibold">Placement Preparation Engine:</span>
                <span className="text-text-muted">Ready to resume</span>
              </div>
              <span className="text-primary-400 font-bold">[ONLINE]</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-text-primary mb-2 font-display">
            Your Placement Journey is Waiting.
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed max-w-md">
            Sign in to continue your personalized practice missions, live Judge0 arena challenges, and calibrated AI mock interviews.
          </p>
        </div>

        {/* Footer Meta */}
        <div className="relative z-10 flex items-center gap-4 text-xs text-text-muted font-mono">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Secure Authentication
          </span>
          <span className="opacity-40">•</span>
          <span>InterviewPilot AI © 2026</span>
        </div>

      </div>

      {/* ── Right Column: Clean Authentication Form ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-16 py-12 relative">
        <div className="w-full max-w-md space-y-7">
          
          {/* Mobile Brand Logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-xs">
              IP
            </div>
            <span className="font-bold text-base tracking-tight text-text-primary font-display">
              InterviewPilot OS
            </span>
          </div>

          {/* Form Header */}
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-text-primary font-display">
              Welcome back
            </h1>
            <p className="text-text-secondary text-sm mt-1.5">
              Enter your credentials to access your placement dashboard.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-error-500/10 border border-error-500/30 text-error-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary block">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="candidate@university.edu"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-border focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm text-text-primary placeholder:text-text-muted outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-text-secondary">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary-400 hover:text-primary-300 transition-colors font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-surface border border-border focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm text-text-primary placeholder:text-text-muted outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-500 hover:to-secondary-400 shadow-lg shadow-primary-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to InterviewPilot AI</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Switch to Register */}
          <div className="text-center pt-2 text-xs text-text-secondary">
            <span>Don't have an account yet? </span>
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
              Create your profile →
            </Link>
          </div>

          {/* Legal Links */}
          <div className="text-center pt-2 text-[11px] text-text-muted flex items-center justify-center gap-3">
            <Link to="/terms" className="hover:text-text-secondary transition-colors underline">Terms of Service</Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-text-secondary transition-colors underline">Privacy Policy</Link>
          </div>

        </div>
      </div>

    </div>
  );
}