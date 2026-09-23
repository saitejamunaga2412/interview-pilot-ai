import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  User, Mail, Lock, Eye, EyeOff, ArrowRight, 
  ShieldCheck, AlertCircle, Sparkles, CheckCircle2, Target
} from "lucide-react";
import API from "../services/api";
import { useAuth } from "../hooks/useAuth";

const onboardingSteps = [
  { step: "01", title: "Identity", desc: "Target role & profile" },
  { step: "02", title: "Target", desc: "Company & curriculum sync" },
  { step: "03", title: "Diagnostic", desc: "Skill gap baseline" },
  { step: "04", title: "Journey", desc: "Adaptive daily missions" },
];

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pwdStrength = useMemo(() => {
    const p = form.password;
    if (!p) return { score: 0, label: "Empty", color: "bg-border" };
    let score = 0;
    if (p.length >= 6) score += 1;
    if (p.length >= 10) score += 1;
    if (/[A-Z]/.test(p)) score += 1;
    if (/[0-9]/.test(p)) score += 1;

    if (score <= 2) return { label: "Basic", color: "bg-error-500", text: "text-error-400" };
    if (score <= 3) return { label: "Good", color: "bg-warning-500", text: "text-warning-400" };
    return { label: "Strong", color: "bg-emerald-500", text: "text-emerald-400" };
  }, [form.password]);

  const handleRegister = async (e) => {
    e?.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      setLoading(true);
      const res = await API.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password
      });
      login(res.data.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-bg-base text-text-primary font-sans antialiased">
      
      {/* ── Left Cinematic Visual Panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[48%] p-10 relative overflow-hidden bg-surface border-r border-border">
        
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

        {/* Center Artwork Box & Onboarding Roadmap */}
        <div className="relative z-10 my-auto py-6 space-y-6">
          <div className="rounded-2xl border border-border/80 bg-surface-2/60 backdrop-blur-md overflow-hidden shadow-2xl relative">
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src="/assets/anime/career_constellation.jpg"
                alt="Candidate building career journey in InterviewPilot AI"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080A12] via-transparent to-transparent opacity-80" />
            </div>

            <div className="p-4 bg-surface-2/90 border-t border-border/80 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                <span className="text-text-primary font-semibold">Career Mapping:</span>
              </div>
              <span className="text-emerald-400 font-bold">Ready</span>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-text-primary mb-2 font-display">
              Build Your Journey.
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed max-w-md">
              Create your profile and start your personalized preparation path.
            </p>
          </div>

          {/* 4-Stage Progression Roadmap */}
          <div className="grid grid-cols-2 gap-2.5 max-w-md">
            {onboardingSteps.map((s) => (
              <div key={s.step} className="p-2.5 rounded-xl bg-surface-2/60 border border-border/70 text-xs">
                <span className="text-primary-400 font-mono font-bold block text-[10px]">{s.step}. {s.title}</span>
                <span className="text-text-muted text-[11px]">{s.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Meta */}
        <div className="relative z-10 flex items-center gap-4 text-xs text-text-muted font-mono">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Verified Profile
          </span>
          <span className="opacity-40">•</span>
          <span>InterviewPilot AI © 2026</span>
        </div>

      </div>

      {/* ── Right Column: Clean Registration Form ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-16 py-12 relative">
        <div className="w-full max-w-md space-y-6">
          
          {/* Mobile Brand Header */}
          <div className="lg:hidden flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-xs">
              IP
            </div>
            <span className="font-bold text-base tracking-tight text-text-primary font-display">
              InterviewPilot AI
            </span>
          </div>

          {/* Form Header */}
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-text-primary font-display uppercase">
              CREATE YOUR PLACEMENT PROFILE
            </h1>
            <p className="text-text-secondary text-sm mt-1.5 leading-relaxed">
              Your account becomes the foundation for your personalized preparation journey.
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
          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary block">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Bhargav Student"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-border focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm text-text-primary placeholder:text-text-muted outline-none transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary block">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="bhargav.student@test.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-border focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm text-text-primary placeholder:text-text-muted outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-text-secondary">Password</label>
                {form.password && (
                  <span className={`text-[10px] font-mono font-bold ${pwdStrength.text}`}>
                    Strength: {pwdStrength.label}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="At least 6 characters"
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

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Retype password"
                  required
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-surface border border-border focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm text-text-primary placeholder:text-text-muted outline-none transition-all"
                />
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-500 hover:to-secondary-400 shadow-lg shadow-primary-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>CREATE ACCOUNT</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Switch to Login */}
          <div className="text-center pt-2 text-xs text-text-secondary">
            <span>Already have an account? </span>
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
              Sign in here →
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