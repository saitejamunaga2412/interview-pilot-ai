import React, { memo } from "react";
import {
  HelpCircle,
  MessageSquare,
  CheckCircle2,
  Lightbulb,
  ThumbsUp,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { cn } from "../utils/cn";

const STATUS_CONFIG = {
  Correct: {
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
  },
  "Partially Correct": {
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/30"
  },
  "Unrelated Answer": {
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
    badge: "bg-orange-500/15 text-orange-400 border-orange-500/30"
  },
  "Evaluation Failed": {
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
    badge: "bg-purple-500/15 text-purple-400 border-purple-500/30"
  },
  Incorrect: {
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
    badge: "bg-rose-500/15 text-rose-400 border-rose-500/30"
  },
  "Not Answered": {
    color: "text-text-muted",
    bg: "bg-surface-2 border-border",
    badge: "bg-surface-2 text-text-muted border-border"
  }
};

const getScoreBadgeClass = (score) => {
  if (score >= 90) return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  if (score >= 70) return "bg-primary-500/20 text-primary-300 border-primary-500/30";
  if (score >= 40) return "bg-amber-500/20 text-amber-300 border-amber-500/30";
  return "bg-rose-500/20 text-rose-300 border-rose-500/30";
};

const ResultCard = memo(function ResultCard({ question, answer, result }) {
  const showCorrectAnswer =
    result?.correctAnswer?.trim() && result?.status !== "Correct";

  const score = result?.score ?? 0;
  const statusCfg = STATUS_CONFIG[result?.status] || STATUS_CONFIG.Incorrect;

  const parseList = (items) => {
    if (Array.isArray(items)) return items;
    if (typeof items === "string") {
      try {
        const parsed = JSON.parse(items);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        if (items.trim()) return [items];
      }
    }
    return [];
  };

  const strengths = parseList(result?.strengths);
  const weaknesses = parseList(result?.weaknesses);
  const suggestions = parseList(result?.suggestions);
  const mistakes = parseList(result?.mistakes);

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden text-left transition-all">
      {/* Header Bar: Status & Score */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-2 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
            Status:
          </span>
          <span className={cn("text-xs font-bold font-mono px-2.5 py-0.5 rounded-full border", statusCfg.badge)}>
            {result?.status || "Evaluated"}
          </span>
        </div>

        <div className={cn("rounded-xl px-3.5 py-1 text-center border font-mono", getScoreBadgeClass(score))}>
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 mr-1.5">
            Score
          </span>
          <span className="text-sm font-extrabold">{score}%</span>
        </div>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        {/* Question Prompt */}
        <div className="rounded-xl bg-surface-2 border border-border p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-primary-400">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Question</span>
          </div>
          <div className="whitespace-pre-wrap break-words text-xs sm:text-sm font-semibold text-text-primary leading-relaxed">
            {question}
          </div>
        </div>

        {/* User's Answer */}
        <div className="rounded-xl border border-primary-500/20 bg-primary-500/5 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-primary-400">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Your Answer</span>
          </div>
          <div className="whitespace-pre-wrap break-words text-xs sm:text-sm text-text-primary leading-relaxed">
            {answer?.trim() || <span className="italic text-text-muted">No response provided for this question.</span>}
          </div>
        </div>

        {/* Model Correct Answer (Shown if answer wasn't 100% correct) */}
        {showCorrectAnswer && (
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Recommended / Model Answer</span>
            </div>
            <div className="whitespace-pre-wrap break-words text-xs sm:text-sm text-text-primary leading-relaxed">
              {result.correctAnswer.trim()}
            </div>
          </div>
        )}

        {/* AI Evaluation Feedback */}
        {result?.feedback && (
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Evaluator Feedback</span>
            </div>
            <div className="whitespace-pre-wrap break-words text-xs sm:text-sm text-text-primary leading-relaxed">
              {result.feedback}
            </div>
          </div>
        )}

        {/* Follow-Up Question */}
        {result?.followUpQuestion && (
          <div className="rounded-xl border border-primary-500/30 bg-primary-500/10 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-primary-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Adaptive Follow-Up Question</span>
            </div>
            <div className="whitespace-pre-wrap break-words text-xs sm:text-sm font-medium text-text-primary leading-relaxed">
              {result.followUpQuestion}
            </div>
          </div>
        )}

        {/* Strengths */}
        {strengths.length > 0 && (
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 space-y-2">
            <h4 className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Key Strengths</span>
            </h4>
            <ul className="list-disc space-y-1 pl-5 text-xs text-text-primary leading-relaxed">
              {strengths.map((item, idx) => (
                <li key={idx} className="break-words">
                  {typeof item === "object" ? JSON.stringify(item) : item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Mistakes */}
        {mistakes.length > 0 && (
          <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-4 space-y-2">
            <h4 className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Mistakes Detected</span>
            </h4>
            <ul className="list-disc space-y-1 pl-5 text-xs text-text-primary leading-relaxed">
              {mistakes.map((item, idx) => (
                <li key={idx} className="break-words">
                  {typeof item === "object" ? JSON.stringify(item) : item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weaknesses */}
        {weaknesses.length > 0 && (
          <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-4 space-y-2">
            <h4 className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Areas to Clarify</span>
            </h4>
            <ul className="list-disc space-y-1 pl-5 text-xs text-text-primary leading-relaxed">
              {weaknesses.map((item, idx) => (
                <li key={idx} className="break-words">
                  {typeof item === "object" ? JSON.stringify(item) : item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="rounded-xl border border-purple-500/25 bg-purple-500/10 p-4 space-y-2">
            <h4 className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Recommendations & Next Steps</span>
            </h4>
            <ul className="list-disc space-y-1 pl-5 text-xs text-text-primary leading-relaxed">
              {suggestions.map((item, idx) => (
                <li key={idx} className="break-words">
                  {typeof item === "object" ? JSON.stringify(item) : item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* If correct and no weaknesses, display positive reinforcement */}
        {score >= 85 && weaknesses.length === 0 && !result?.feedback && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 flex items-center gap-2 text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>High proficiency demonstrated. Core technical distinctions were explained accurately.</span>
          </div>
        )}

      </div>
    </div>
  );
});

export default ResultCard;