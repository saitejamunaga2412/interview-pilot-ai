import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, KeyRound, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import API from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await API.post("/auth/forgot-password", { email: cleanEmail });
      setMessage(
        response.data?.message ||
        "If an account exists with this email address, you will receive instructions to reset your password."
      );
    } catch (err) {
      const msg = err?.response?.data?.detail?.message || err?.response?.data?.message || "Failed to submit request. Please try again.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex items-center justify-center px-4 py-12 antialiased">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-xl p-8 relative overflow-hidden backdrop-blur-xl">
        {/* Subtle accent ambient blur */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-primary-500/20">
            <KeyRound size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight font-display text-text-primary">
            Forgot Password
          </h1>
          <p className="text-xs text-text-secondary mt-1.5 max-w-xs mx-auto">
            Enter your registered email address and we will send you a secure link to reset your password.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5 animate-fade-in">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {message ? (
          <div className="space-y-5 animate-fade-in">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-3">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Reset link dispatched</p>
                <p className="text-[12px] text-emerald-300/90 mt-1 leading-relaxed">{message}</p>
                <p className="text-[11px] text-text-muted mt-2">
                  Didn't receive it? Check your spam folder or ensure the email address is spelled correctly.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => { setMessage(""); setEmail(""); }}
              className="w-full py-2.5 px-4 bg-surface hover:bg-surface-2 border border-border text-text-primary rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Send Another Reset Link
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidate@university.edu"
                  required
                  autoFocus
                  className="w-full bg-bg-base border border-border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-primary-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Sending Reset Link...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 pt-5 border-t border-border flex items-center justify-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-primary-400 transition-colors cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Return to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
