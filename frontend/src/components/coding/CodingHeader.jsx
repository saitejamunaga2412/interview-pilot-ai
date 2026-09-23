import React from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ChevronLeft, Play, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';

export const CodingHeader = ({ problem, submitting, onRun, onBack, onNavigateToResults, hasResult }) => {
  return (
    <header className="bg-surface border-b border-border h-14 px-4 flex items-center justify-between shrink-0 shadow-sm z-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} leftIcon={<ChevronLeft className="w-4 h-4" />}>
          Back
        </Button>
        <div className="h-4 w-px bg-border hidden sm:block" />
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-text-primary text-sm sm:text-base hidden sm:block">{problem?.title}</h1>
          {problem && (
            <Badge variant={
              problem.difficulty === 'Easy' ? 'success' :
              problem.difficulty === 'Medium' ? 'warning' : 'error'
            } size="sm">
              {problem.difficulty}
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {hasResult && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onNavigateToResults}
            leftIcon={<Sparkles className="w-4 h-4 text-primary-500" />}
            className="hidden sm:flex border-primary-200 hover:border-primary-300 dark:border-primary-800"
          >
            AI Review
          </Button>
        )}
        <Button 
          variant="primary" 
          size="sm" 
          onClick={onRun} 
          isLoading={submitting}
          leftIcon={!submitting && <Play className="w-4 h-4" />}
          className="bg-success-600 hover:bg-success-700 text-white"
        >
          Run & Submit
        </Button>
      </div>
    </header>
  );
};
