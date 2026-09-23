import React from 'react';
import { cn } from '../../utils/cn';
import { BrainCircuit, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const AIThinkingIndicator = ({ className, text = "AI is thinking..." }) => {
  return (
    <div className={cn("flex items-center space-x-2 text-primary-600 dark:text-primary-400 font-medium text-sm", className)}>
      <BrainCircuit className="h-4 w-4 animate-pulse-slow" />
      <span className="animate-pulse">{text}</span>
      <span className="flex space-x-0.5">
        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}>.</motion.span>
        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}>.</motion.span>
        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}>.</motion.span>
      </span>
    </div>
  );
};

export const AIStreamingPlaceholder = ({ className }) => {
  return (
    <div className={cn("w-full h-auto p-4 rounded-lg bg-surface border border-primary-200/50 dark:border-primary-900/50 shadow-glow relative overflow-hidden", className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-500/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      <div className="flex space-x-3">
        <Sparkles className="h-5 w-5 text-primary-500 shrink-0" />
        <div className="space-y-3 w-full mt-1">
          <div className="h-2 bg-secondary-200 dark:bg-secondary-800 rounded w-3/4 animate-pulse" />
          <div className="h-2 bg-secondary-200 dark:bg-secondary-800 rounded w-1/2 animate-pulse" />
          <div className="h-2 bg-secondary-200 dark:bg-secondary-800 rounded w-5/6 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export const AIProcessingStatus = ({ className, status = 'processing', message = "Analyzing your response..." }) => {
  const isComplete = status === 'complete';
  return (
    <div className={cn("flex items-center space-x-3 p-3 rounded-lg border", isComplete ? "border-success-200 bg-success-50 dark:bg-success-900/20" : "border-primary-200 bg-primary-50 dark:bg-primary-900/20", className)}>
      {isComplete ? (
        <CheckCircle2 className="h-5 w-5 text-success-500 shrink-0" />
      ) : (
        <Loader2 className="h-5 w-5 text-primary-500 shrink-0 animate-spin" />
      )}
      <span className={cn("text-sm font-medium", isComplete ? "text-success-800 dark:text-success-300" : "text-primary-800 dark:text-primary-300")}>
        {message}
      </span>
    </div>
  );
};

export const AIConfidenceBadge = ({ className, score = 0 }) => {
  let colorClass = "bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-400";
  if (score >= 80) colorClass = "bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400";
  else if (score >= 50) colorClass = "bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400";

  return (
    <span className={cn("inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold space-x-1", colorClass, className)}>
      <Sparkles className="h-3 w-3" />
      <span>{score}% Confidence</span>
    </span>
  );
};
