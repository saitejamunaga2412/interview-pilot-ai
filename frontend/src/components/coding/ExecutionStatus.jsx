import React from 'react';
import { cn } from '../../utils/cn';
import { CheckCircle2, XCircle, AlertCircle, Clock, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ExecutionStatus = ({ result, className }) => {
  if (!result) return null;

  const isAccepted = result.status === 'Accepted';

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "p-4 border-t",
          isAccepted ? "bg-success-50 dark:bg-success-900/10 border-success-200 dark:border-success-900/30" : "bg-error-50 dark:bg-error-900/10 border-error-200 dark:border-error-900/30",
          className
        )}
      >
        <div className="flex items-center gap-2 mb-3">
          {isAccepted ? (
            <CheckCircle2 className="w-5 h-5 text-success-600 dark:text-success-500" />
          ) : (
            <XCircle className="w-5 h-5 text-error-600 dark:text-error-500" />
          )}
          <h3 className={cn(
            "font-bold text-lg",
            isAccepted ? "text-success-700 dark:text-success-400" : "text-error-700 dark:text-error-400"
          )}>
            {result.status}
          </h3>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
          {result.runtimeMs !== undefined && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-text-muted" />
              <span>Runtime: <strong className="text-text-primary">{result.runtimeMs} ms</strong></span>
            </div>
          )}
          {result.memoryKb !== undefined && (
            <div className="flex items-center gap-1.5">
              <Database className="w-4 h-4 text-text-muted" />
              <span>Memory: <strong className="text-text-primary">{result.memoryKb} KB</strong></span>
            </div>
          )}
        </div>
        
        {!isAccepted && result.consoleOutput && (
          <div className="mt-4">
             <h4 className="text-xs font-semibold uppercase text-error-700 dark:text-error-400 mb-2 flex items-center gap-1">
               <AlertCircle className="w-3 h-3" /> Console Output
             </h4>
             <pre className="bg-error-900/90 text-error-50 p-3 rounded-md text-sm font-mono overflow-x-auto whitespace-pre-wrap shadow-inner">
               {result.consoleOutput}
             </pre>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
