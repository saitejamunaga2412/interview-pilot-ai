import React from 'react';
import { cn } from '../../utils/cn';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { ErrorState, EmptyState } from '../ui/States';
import { TrendingUp, TrendingDown, Activity, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '../ui/Badge';

export const TopicStrengthCard = ({ topics = [], isLoading, isError, onRetry, className }) => {
  if (isError) return <ErrorState onRetry={onRetry} className={className} />;
  if (isLoading) return <Card className={className}><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>;
  if (!topics.length) return <EmptyState title="No Topic Strengths" className={className} />;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-success-500" />
          <CardTitle className="text-base">Top Strengths</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {topics.map(t => (
            <Badge key={t} variant="success">{t}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const TopicWeaknessCard = ({ topics = [], isLoading, isError, onRetry, className }) => {
  if (isError) return <ErrorState onRetry={onRetry} className={className} />;
  if (isLoading) return <Card className={className}><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>;
  if (!topics.length) return <EmptyState title="No Weaknesses Found" className={className} />;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-error-500" />
          <CardTitle className="text-base">Areas for Improvement</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {topics.map(t => (
            <Badge key={t} variant="error">{t}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Skill Radar placeholder since we don't have Recharts/Chart.js setup explicitly required here yet. 
// We will build a UI placeholder that looks like a radar chart.
export const SkillRadar = ({ isLoading, isError, onRetry, className }) => {
  if (isError) return <ErrorState onRetry={onRetry} className={className} />;
  if (isLoading) return <Card className={className}><CardContent className="p-6"><Skeleton className="h-48 w-48 rounded-full mx-auto" /></CardContent></Card>;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary-500" />
          <CardTitle className="text-base">Skill Radar</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex justify-center items-center h-48">
        <div className="text-sm text-text-muted italic border-2 border-dashed border-border rounded-full h-40 w-40 flex items-center justify-center">
          Radar Chart Instance
        </div>
      </CardContent>
    </Card>
  );
};

export const AITimeline = ({ events = [], isLoading, isError, onRetry, className }) => {
  if (isError) return <ErrorState onRetry={onRetry} className={className} />;
  if (isLoading) return <Card className={className}><CardContent className="p-6 space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></CardContent></Card>;
  if (!events.length) return <EmptyState title="No Activity" className={className} />;

  return (
    <div className={cn("relative space-y-4 pl-4 border-l-2 border-border", className)}>
      {events.map((event, idx) => (
        <motion.div 
          key={idx}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.1 }}
          className="relative"
        >
          <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-primary-500 ring-4 ring-bg-base" />
          <div className="bg-surface rounded-lg border border-border p-3 shadow-sm">
            <h5 className="font-semibold text-text-primary text-sm">{event.title}</h5>
            <p className="text-xs text-text-secondary mt-0.5">{event.description}</p>
            <span className="text-[10px] text-text-muted mt-2 block">{event.date}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export const RecommendationTimeline = (props) => (
  <AITimeline {...props} />
);
