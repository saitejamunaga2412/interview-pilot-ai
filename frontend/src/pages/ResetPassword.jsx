import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { KeyRound, Lock, CheckCircle2, AlertCircle, ArrowLeft, Loader2, Eye, EyeOff, Check, X } from "lucide-react";
import API from "../services/api";
import { useAuth } from "../hooks/useAuth";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const urlToken = searchParams.get("token") || "";

  const [token, setToken] = useState(urlToken);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    if (urlToken) {
      setToken(urlToken);
    }
  }, [urlToken]);

  const isLengthValid = newPassword.length >= 6;
  const isMatchValid = confirmPassword.length > 0 && newPassword === confirmPassword;

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");

    const cleanToken = token.trim();
    if (!cleanToken) {
      setError("Reset token is required. Please check your email link or paste the token.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const response = await API.post("/auth/reset-password", {
        token: cleanToken,
        newPassword,
        confirmPassword
      });

      setSuccess(true);
      if (response.data?.token) {
        login(response.data);
      }

      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.detail?.message || "Password reset failed. The token may be expired or invalid.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex items-center justify-center px-4 py-12 antialiased">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-xl p-8 relative overflow-hidden backdrop-blur-xl">
        {/* Subtle accent glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-primary-500/20">
            <KeyRound size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight font-display text-text-primary">
            Reset Password
          </h1>
          <p className="text-xs text-text-secondary mt-1.5 max-w-xs mx-auto">
            Choose a strong new password for your InterviewPilot AI placement account.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5 animate-fade-in">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-3 animate-fade-in">
            <CheckCircle2 size={18} className="shrink-0" />
            <div>
              <p className="font-semibold">Password reset successfully!</p>
              <p className="text-[11px] text-emerald-400/80 mt-0.5">Redirecting to login with your new password...</p>
            </div>
          </div>
        )}

        {!success && (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Reset Token
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste or verify your reset token"
                  required
                  className="w-full bg-bg-base border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all font-mono"
                />
              </div>
              {urlToken && (
                <span className="inline-block mt-1 text-[10px] text-primary-400 font-mono">
                  ✓ Token auto-detected from email link
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-text-secondary">
                  New Password
                </label>
                <span className={`text-[10px] flex items-center gap-1 ${isLengthValid ? "text-emerald-400" : "text-text-muted"}`}>
                  {isLengthValid ? <Check size={11} /> : null}
                  At least 6 characters
                </span>
              </div>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="w-full bg-bg-base border border-border rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1 cursor-pointer"
                  aria-label="Toggle new password visibility"
                >
                  {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-text-secondary">
                  Confirm New Password
                </label>
                {confirmPassword && (
                  <span className={`text-[10px] flex items-center gap-1 ${isMatchValid ? "text-emerald-400" : "text-red-400"}`}>
                    {isMatchValid ? <Check size={11} /> : <X size={11} />}
                    {isMatchValid ? "Passwords match" : "Does not match"}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full bg-bg-base border border-border rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1 cursor-pointer"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isLengthValid || (confirmPassword && !isMatchValid)}
              className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-primary-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Lock size={14} />
                  <span>Set New Password</span>
                </>
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
