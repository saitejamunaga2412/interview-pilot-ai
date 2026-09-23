import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import ResultCard from "../components/ResultCard";
import { downloadInterviewReport } from "../services/reportService";
import {
  ArrowLeft,
  Trash2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ThumbsUp,
  Lightbulb,
  FileText,
  Calendar,
  XCircle,
  HelpCircle,
  Printer,
  Download
} from "lucide-react";
import { cn } from "../utils/cn";

const formatTimeSpent = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

const getScoreBadgeColor = (score) => {
  if (score >= 90) return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
  if (score >= 70) return "bg-primary-500/15 text-primary-400 border border-primary-500/30";
  if (score >= 40) return "bg-amber-500/15 text-amber-400 border border-amber-500/30";
  return "bg-rose-500/15 text-rose-400 border border-rose-500/30";
};

export default function InterviewDetails() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const showToast = (type, message) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ type, message });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 4000);
  };

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get(`/result/session/${sessionId}`);
      setSession(res.data?.data?.session || res.data?.session || res.data);
      setQuestions(res.data?.data?.questions || res.data?.questions || []);
    } catch (error) {
      console.error("Interview Details Error:", error);
      showToast("error", error?.response?.data?.message || "Failed to load interview details");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleDeleteSession = async () => {
    try {
      setDeleting(true);
      await API.delete(`/result/session/${sessionId}`);
      showToast("success", "Interview session deleted successfully.");
      setTimeout(() => {
        navigate("/history");
      }, 800);
    } catch (err) {
      console.error("Delete session error:", err);
      showToast("error", err?.response?.data?.message || "Failed to delete interview session.");
      setDeleting(false);
    }
  };

  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      await downloadInterviewReport(sessionId, { session, questions });
      showToast("success", "Interview report PDF downloaded successfully.");
    } catch (err) {
      console.error("PDF download error:", err);
      showToast("error", "Failed to download PDF report.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-primary-400 animate-pulse mb-3">
          <Sparkles className="w-5 h-5" />
        </div>
        <p className="text-xs font-mono text-text-muted">Loading interview evaluation...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 space-y-4">
        <p className="text-sm font-semibold text-text-secondary">Interview session not found.</p>
        <button
          onClick={() => navigate("/history")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-500 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to History</span>
        </button>
      </div>
    );
  }

  const overallScore = session.overallScore || 0;

  return (
    <div className="min-h-screen bg-bg-base transition-colors duration-200 pb-20">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-xs font-semibold ${
            toast.type === "success" ? "bg-emerald-600" : "bg-rose-600"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-left">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary">Delete Interview Session?</h3>
                <p className="text-xs text-text-muted mt-0.5">This action will remove all evaluations and question history.</p>
              </div>
            </div>

            <div className="p-4 bg-surface-2 rounded-xl border border-border text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-text-muted">Target Track:</span>
                <span className="font-bold text-text-primary">{session.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Score:</span>
                <span className="font-bold text-emerald-400">{overallScore}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Questions:</span>
                <span className="text-text-primary">{questions.length} answered</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl border border-border bg-surface hover:bg-surface-hover text-xs font-semibold text-text-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteSession}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* Navigation Bar: Back Button + Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => navigate("/history")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary bg-surface hover:bg-surface-hover border border-border transition-all cursor-pointer shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to History</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-text-primary hover:text-primary-400 bg-surface hover:bg-surface-hover border border-border transition-all cursor-pointer shadow-sm disabled:opacity-50"
              title="Download PDF evaluation report"
            >
              <Download className="w-3.5 h-3.5 text-primary-400" />
              <span>{downloading ? "Downloading..." : "Download PDF"}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-text-primary hover:text-primary-400 bg-surface hover:bg-surface-hover border border-border transition-all cursor-pointer shadow-sm"
              title="Download or print evaluation report"
            >
              <Printer className="w-3.5 h-3.5 text-primary-400" />
              <span>Print / Save</span>
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
              title="Remove this interview session"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>
        </div>

        {/* Header Hero Card */}
        <div className="rounded-2xl bg-surface border border-border p-6 sm:p-8 shadow-sm relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary-400 bg-primary-500/10 px-2.5 py-0.5 rounded-full border border-primary-500/20">
                  {session.level || "INTERVIEW"} ROUND
                </span>
                {session.isTimedInterview && (
                  <span className="text-[10px] font-mono font-semibold bg-rose-500/10 text-rose-400 px-2.5 py-0.5 rounded-full border border-rose-500/20 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Timed Session
                  </span>
                )}
                {session.createdAt && (
                  <span className="text-[10px] font-mono text-text-muted flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(session.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    })}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight font-display">
                {session.role} Interview
              </h1>

              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Comprehensive AI evaluation, answer scoring breakdown, and personalized feedback.
              </p>
            </div>

            {/* Overall Score Badge */}
            <div className={cn("p-4 rounded-2xl flex flex-col items-center justify-center min-w-[130px] self-start md:self-auto", getScoreBadgeColor(overallScore))}>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold opacity-80">
                OVERALL SCORE
              </span>
              <span className="text-3xl font-extrabold font-mono mt-0.5">
                {overallScore}%
              </span>
            </div>
          </div>

          {/* Time & Submission Details */}
          {(session.timeSpent > 0 || session.duration || session.startTime) && (
            <div className="flex flex-wrap gap-4 pt-5 mt-5 border-t border-border text-xs text-text-muted font-mono">
              {session.duration && (
                <span>Duration: <strong className="text-text-primary">{session.duration} min</strong></span>
              )}
              {session.timeSpent > 0 && (
                <span>Time Spent: <strong className="text-text-primary">{formatTimeSpent(session.timeSpent)}</strong></span>
              )}
              {session.submissionSource && (
                <span>Submission: <strong className="text-text-primary">{session.submissionSource === "auto" ? "Auto" : "Manual"}</strong></span>
              )}
            </div>
          )}

          {/* Breakdown Stats Grid */}
          {(session.correctCount !== undefined ||
            session.partialCount !== undefined ||
            session.incorrectCount !== undefined ||
            session.notAnsweredCount !== undefined) && (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-center">
                <div className="text-xl font-bold font-mono text-emerald-400">
                  {session.correctCount || 0}
                </div>
                <div className="text-xs text-emerald-300 font-medium mt-0.5">
                  Correct
                </div>
              </div>

              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3.5 text-center">
                <div className="text-xl font-bold font-mono text-amber-400">
                  {session.partialCount || 0}
                </div>
                <div className="text-xs text-amber-300 font-medium mt-0.5">
                  Partial
                </div>
              </div>

              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-center">
                <div className="text-xl font-bold font-mono text-rose-400">
                  {session.incorrectCount || 0}
                </div>
                <div className="text-xs text-rose-300 font-medium mt-0.5">
                  Incorrect
                </div>
              </div>

              <div className="rounded-xl bg-surface-2 border border-border p-3.5 text-center">
                <div className="text-xl font-bold font-mono text-text-muted">
                  {session.notAnsweredCount || 0}
                </div>
                <div className="text-xs text-text-secondary font-medium mt-0.5">
                  Skipped
                </div>
              </div>
            </div>
          )}

          {/* Strong / Weak Topics Pills */}
          {session.strongTopics?.length > 0 && (
            <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <h3 className="mb-2.5 flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Strong Topics</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {session.strongTopics.map((topic, i) => (
                  <span
                    key={`${topic}-${i}`}
                    className="rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-300"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {session.weakTopics?.length > 0 && (
            <div className="mt-3.5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4">
              <h3 className="mb-2.5 flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Areas for Improvement</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {session.weakTopics.map((topic, i) => (
                  <span
                    key={`${topic}-${i}`}
                    className="rounded-lg bg-rose-500/20 border border-rose-500/30 px-2.5 py-1 text-xs font-semibold text-rose-300"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Study Plan */}
          {Boolean(session.studyPlan && (typeof session.studyPlan === 'string' ? session.studyPlan.trim() : (Array.isArray(session.studyPlan) ? session.studyPlan.length : Object.keys(session.studyPlan).length))) && (
            <div className="mt-4 rounded-xl border border-primary-500/20 bg-primary-500/10 p-4">
              <h3 className="mb-2 flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wide text-primary-400">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Recommended Study Plan</span>
              </h3>
              <div className="whitespace-pre-wrap break-words text-xs leading-relaxed text-text-secondary font-medium">
                {typeof session.studyPlan === 'string' 
                  ? session.studyPlan 
                  : (Array.isArray(session.studyPlan) 
                      ? session.studyPlan.map((p, idx) => (typeof p === 'object' ? `${idx + 1}. ${p.topic || p.title || JSON.stringify(p)}` : `${idx + 1}. ${p}`)).join('\n')
                      : JSON.stringify(session.studyPlan, null, 2))}
              </div>
            </div>
          )}
        </div>

        {/* Questions Section */}
        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between text-left">
            <div>
              <h2 className="text-xl font-bold text-text-primary tracking-tight">
                Question Details ({questions.length})
              </h2>
              <p className="text-xs text-text-secondary">
                Review your responses alongside model answers and AI tutor feedback.
              </p>
            </div>
          </div>

          {questions.map((item, index) => (
            <div key={item._id || index} className="space-y-2 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-primary-400">
                  Question {index + 1}
                </span>
                {item.topicCategory && (
                  <span className="text-[10px] font-mono text-text-muted px-2 py-0.5 rounded bg-surface-2 border border-border">
                    {item.topicCategory}
                  </span>
                )}
              </div>
              <ResultCard
                question={item.question}
                answer={item.answer}
                result={item}
              />
            </div>
          ))}
        </div>

        {/* Dedicated Print Media Styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            header, aside, nav, button, .no-print {
              display: none !important;
            }
            body, .min-h-screen {
              background: #ffffff !important;
              color: #000000 !important;
            }
            .border {
              border-color: #e2e8f0 !important;
            }
            .bg-surface, .bg-surface-2, .bg-bg-base {
              background: #ffffff !important;
            }
            .text-text-primary, .text-text-secondary {
              color: #0f172a !important;
            }
          }
        ` }} />

      </div>
    </div>
  );
}