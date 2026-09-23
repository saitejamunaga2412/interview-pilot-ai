import React from 'react';
import { cn } from '../../utils/cn';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Progress } from '../ui/Progress';
import { Skeleton } from '../ui/Skeleton';
import { ErrorState, EmptyState } from '../ui/States';
import { Trophy, Code2, BookOpen, Clock, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const BasePerformanceCard = ({
  title,
  icon: Icon,
  metrics = [],
  isLoading,
  isError,
  isEmpty,
  onRetry,
  className
}) => {
  if (isError) return <ErrorState title="Failed to load performance" onRetry={onRetry} className={cn("border border-border rounded-lg", className)} />;
  if (isEmpty) return <EmptyState title="No Data Available" className={cn("border border-border rounded-lg", className)} />;
  if (isLoading) return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-5 w-32" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2 bg-surface-hover border-b border-border mb-4">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary-500" />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {metrics.map((metric, idx) => (
          <div key={idx}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-text-secondary font-medium">{metric.label}</span>
              <span className="text-text-primary font-bold">{metric.value}{metric.suffix}</span>
            </div>
            <Progress value={metric.value} max={metric.max || 100} variant={metric.variant || 'primary'} size="sm" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export const InterviewScoreCard = (props) => (
  <BasePerformanceCard icon={Trophy} title="Interview Performance" {...props} />
);

export const CodingScoreCard = (props) => (
  <BasePerformanceCard icon={Code2} title="Coding Performance" {...props} />
);

export const LearningProgressCard = (props) => (
  <BasePerformanceCard icon={BookOpen} title="Learning Progress" {...props} />
);

export const RevisionProgressCard = (props) => (
  <BasePerformanceCard icon={Clock} title="Revision Status" {...props} />
);

export const SkillProgressCard = (props) => (
  <BasePerformanceCard icon={Target} title="Skill Progress" {...props} />
);
