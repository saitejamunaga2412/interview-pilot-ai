import React from 'react';
import { cn } from '../../utils/cn';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Sparkles, AlertTriangle, Lightbulb, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { ErrorState } from '../ui/States';
import { motion } from 'framer-motion';

const BaseInsightCard = ({
  title,
  content,
  icon: Icon,
  variant = 'default',
  isLoading,
  isError,
  onRetry,
  actionText,
  onAction,
  className
}) => {
  if (isError) return <ErrorState title="Failed to load insight" onRetry={onRetry} className={cn("border border-border rounded-lg", className)} />;
  if (isLoading) return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-5 flex gap-4 items-start">
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        <div className="space-y-3 w-full mt-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </CardContent>
    </Card>
  );

  const variants = {
    default: "border-border",
    insight: "border-primary-200 dark:border-primary-900/50 shadow-glow",
    warning: "border-warning-200 bg-warning-50/50 dark:bg-warning-900/10",
    success: "border-success-200 bg-success-50/50 dark:bg-success-900/10",
  };

  const iconColors = {
    default: "text-primary-500 bg-primary-100 dark:bg-primary-900/50",
    insight: "text-primary-500 bg-primary-100 dark:bg-primary-900/50",
    warning: "text-warning-600 bg-warning-100 dark:bg-warning-900/50",
    success: "text-success-600 bg-success-100 dark:bg-success-900/50",
  };

  return (
    <Card className={cn("relative overflow-hidden transition-all duration-300 hover:shadow-md", variants[variant], className)}>
      <CardContent className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className={cn("p-2.5 rounded-full shrink-0", iconColors[variant])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-text-primary mb-1">{title}</h4>
          <p className="text-sm text-text-secondary leading-relaxed">{content}</p>
        </div>
        {actionText && (
          <Button variant="outline" size="sm" onClick={onAction} rightIcon={<ChevronRight className="h-4 w-4" />} className="shrink-0 mt-2 sm:mt-0">
            {actionText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export const AIInsightCard = (props) => (
  <BaseInsightCard icon={Sparkles} variant="insight" {...props} />
);

export const RecommendationCard = (props) => (
  <BaseInsightCard icon={Lightbulb} variant="default" {...props} />
);

export const AISummaryCard = (props) => (
  <BaseInsightCard icon={CheckCircle2} variant="success" {...props} />
);

export const AIWarningCard = (props) => (
  <BaseInsightCard icon={AlertTriangle} variant="warning" {...props} />
);

export const AISuggestionCard = (props) => (
  <BaseInsightCard icon={Lightbulb} variant="default" {...props} />
);
