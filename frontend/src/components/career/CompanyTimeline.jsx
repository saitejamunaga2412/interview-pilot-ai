import React from 'react';
import { cn } from '../../utils/cn';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

export const CompanyTimeline = ({ steps = [], className }) => {
  if (!steps || steps.length === 0) return null;

  return (
    <div className={cn("relative pl-4 sm:pl-6 border-l-2 border-primary-200 dark:border-primary-900/50 space-y-8 my-8", className)}>
      {steps.map((step, idx) => {
        // Fallback support for simple string array vs rich objects
        const isString = typeof step === 'string';
        const title = isString ? step : step.title;
        const description = isString ? null : step.description;
        const status = isString ? 'pending' : step.status || 'pending'; // 'completed', 'in-progress', 'pending'
        
        const isCompleted = status === 'completed';
        const isInProgress = status === 'in-progress';

        return (
          <div key={idx} className="relative group">
            {/* Timeline Node */}
            <div className={cn(
              "absolute -left-[25px] sm:-left-[33px] w-6 h-6 rounded-full border-4 border-surface flex items-center justify-center transition-colors duration-300",
              isCompleted ? "bg-success-500 text-white" : 
              isInProgress ? "bg-primary-500 animate-pulse" : 
              "bg-surface-hover border-border border-2"
            )}>
              {isCompleted && <CheckCircle2 className="w-3 h-3 text-white" />}
            </div>

            {/* Content */}
            <div className={cn(
              "bg-surface border rounded-xl p-5 transition-all duration-300 hover:shadow-md",
              isCompleted ? "border-success-200 dark:border-success-900/30 bg-success-50/30 dark:bg-success-900/5" :
              isInProgress ? "border-primary-300 shadow-sm" : "border-border opacity-70"
            )}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <h4 className={cn(
                  "font-bold text-lg",
                  isCompleted ? "text-success-700 dark:text-success-400" :
                  isInProgress ? "text-primary-700 dark:text-primary-400" :
                  "text-text-secondary"
                )}>
                  {title}
                </h4>
                
                {/* Future support for badges/AI recommendations */}
                {!isString && step.aiRecommendation && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning-600 bg-warning-50 px-2 py-1 rounded">
                    <AlertCircle className="w-3 h-3" />
                    AI Suggestion
                  </span>
                )}
              </div>
              
              {description && (
                <p className="text-sm text-text-secondary mt-1">{description}</p>
              )}
              
              {!isString && step.estimatedDays && (
                <p className="text-xs font-mono text-text-muted mt-3 uppercase tracking-wider">
                  Est. {step.estimatedDays} days
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
