import React from 'react';
import { cn } from '../../utils/cn';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
};

export const TimerDisplay = ({ timeLeft, isTimed, className }) => {
  if (!isTimed) return null;

  const timerUrgent = timeLeft <= 60 && timeLeft > 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xl border shadow-sm transition-colors duration-300",
        timerUrgent 
          ? "bg-error-50 text-error-700 border-error-300 dark:bg-error-900/20 dark:text-error-400 dark:border-error-800 animate-pulse"
          : "bg-surface text-text-primary border-border",
        className
      )}
    >
      <Clock className={cn("w-5 h-5", timerUrgent ? "text-error-500" : "text-primary-500")} />
      {formatTime(timeLeft)}
    </motion.div>
  );
};
