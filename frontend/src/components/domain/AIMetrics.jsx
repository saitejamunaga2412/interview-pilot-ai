import React, { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { ErrorState, EmptyState } from '../ui/States';
import { motion } from 'framer-motion';

// A generic radial gauge
const RadialGauge = ({ value, max = 100, label, color = "text-primary-500", size = 120, strokeWidth = 12 }) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  useEffect(() => {
    setAnimatedValue(value);
  }, [value]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedValue / max) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          className="text-secondary-200 dark:text-secondary-800"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <motion.circle
          className={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-text-primary">
          {Math.round(animatedValue)}<span className="text-sm text-text-muted">%</span>
        </span>
        {label && <span className="text-xs text-text-secondary mt-1 uppercase tracking-wider">{label}</span>}
      </div>
    </div>
  );
};

const BaseMetricCard = ({
  title,
  score,
  label,
  colorClass,
  isLoading,
  isError,
  onRetry,
  isEmpty,
  className
}) => {
  if (isError) return <ErrorState title="Failed to load metric" onRetry={onRetry} className={cn("border border-border rounded-lg", className)} />;
  if (isEmpty) return <EmptyState title="No Score Available" className={cn("border border-border rounded-lg", className)} />;
  if (isLoading) return (
    <Card className={cn("flex items-center justify-center p-6", className)}>
      <Skeleton className="h-32 w-32 rounded-full" />
    </Card>
  );

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center pb-6">
        <RadialGauge value={score} label={label} color={colorClass} />
      </CardContent>
    </Card>
  );
};

export const ConfidenceMeter = (props) => {
  const color = props.score >= 80 ? "text-success-500" : props.score >= 50 ? "text-warning-500" : "text-error-500";
  return <BaseMetricCard title="AI Confidence" label="Confidence" colorClass={color} {...props} />;
};

export const CareerReadinessGauge = (props) => (
  <BaseMetricCard title="Career Readiness" label="Score" colorClass="text-primary-500" {...props} />
);

export const SkillMatchMeter = (props) => {
  const color = props.score >= 80 ? "text-success-500" : props.score >= 50 ? "text-warning-500" : "text-error-500";
  return <BaseMetricCard title="Skill Match" label="Match" colorClass={color} {...props} />;
};

export const ResumeScoreCard = (props) => (
  <BaseMetricCard title="Resume Score" label="ATS Score" colorClass="text-info-500" {...props} />
);

export const ATSScoreCard = (props) => (
  <BaseMetricCard title="ATS Compatibility" label="Pass Rate" colorClass="text-success-500" {...props} />
);
