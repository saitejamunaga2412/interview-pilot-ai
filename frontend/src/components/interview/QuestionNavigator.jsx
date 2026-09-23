import React from 'react';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';

export const QuestionNavigator = ({ questions = [], answers = {}, currentIndex, setCurrentIndex, className }) => {
  return (
    <div className={cn("bg-surface border border-border rounded-xl p-4 flex flex-col gap-3", className)}>
      <h3 className="font-semibold text-text-primary text-sm uppercase tracking-wider mb-2">Questions</h3>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {questions.map((_, idx) => {
          const isCurrent = idx === currentIndex;
          const isAnswered = answers[idx]?.trim().length > 0;
          
          return (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "h-10 w-full flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 border",
                isCurrent 
                  ? "bg-primary-600 text-white border-primary-600 shadow-md transform scale-105" 
                  : isAnswered 
                    ? "bg-success-50 text-success-700 border-success-200 hover:bg-success-100 dark:bg-success-900/20 dark:border-success-800"
                    : "bg-surface-hover text-text-secondary border-transparent hover:border-border hover:bg-secondary-100 dark:hover:bg-secondary-800"
              )}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};
