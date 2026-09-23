import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';
import { CheckCircle, XCircle } from 'lucide-react';

export const EvaluationPanel = ({ question, answer, result, index, className }) => {
  if (!result) return null;

  return (
    <Card className={cn("border-border overflow-hidden", className)}>
      <div className="bg-surface-hover p-4 border-b border-border">
        <h3 className="font-semibold text-text-primary text-lg mb-2">Q{index + 1}: {question}</h3>
        <div className="bg-surface p-4 rounded-lg border border-border text-text-secondary text-sm">
          <span className="font-medium text-text-primary block mb-1">Your Answer:</span>
          {answer || <span className="italic text-text-muted">No answer provided.</span>}
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text-secondary">Score:</span>
            <span className={cn(
              "text-xl font-bold", 
              result.score >= 80 ? "text-success-600" : result.score >= 50 ? "text-warning-600" : "text-error-600"
            )}>
              {result.score}/100
            </span>
          </div>
          <Badge variant={result.score >= 80 ? 'success' : result.score >= 50 ? 'warning' : 'error'}>
            {result.performanceLevel || "Evaluated"}
          </Badge>
          {result.topicCategory && <Badge variant="outline">{result.topicCategory}</Badge>}
        </div>

        <div className="bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/30 p-4 rounded-lg">
          <h4 className="font-semibold text-text-primary mb-2 text-sm uppercase tracking-wider">AI Feedback</h4>
          <p className="text-sm text-text-secondary leading-relaxed">{result.feedback}</p>
        </div>

        {result.followUpQuestion && (
          <div className="bg-indigo-500/10 border border-indigo-500/25 p-4 rounded-lg">
            <h4 className="font-semibold text-indigo-400 mb-1.5 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
              <span>🎯</span> Adaptive Follow-Up Question
            </h4>
            <p className="text-xs font-medium text-text-primary leading-relaxed">{result.followUpQuestion}</p>
          </div>
        )}

        {result.strengths?.length > 0 && (
          <div>
            <h4 className="font-medium text-success-700 dark:text-success-400 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Strengths
            </h4>
            <ul className="list-disc list-inside text-sm text-text-secondary space-y-1 ml-1">
              {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}

        {result.weaknesses?.length > 0 && (
          <div>
            <h4 className="font-medium text-error-700 dark:text-error-400 mb-2 flex items-center gap-2">
              <XCircle className="w-4 h-4" /> Areas for Improvement
            </h4>
            <ul className="list-disc list-inside text-sm text-text-secondary space-y-1 ml-1">
              {result.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        )}

        {result.correctAnswer && (
          <div className="pt-4 border-t border-border mt-6">
            <h4 className="font-semibold text-text-primary mb-2 text-sm uppercase tracking-wider">Suggested Ideal Answer</h4>
            <div className="bg-surface p-4 rounded-lg border border-border text-sm text-text-secondary leading-relaxed">
              {result.correctAnswer}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
