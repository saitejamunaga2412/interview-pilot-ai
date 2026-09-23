import React from 'react';
import { LearningProgressCard } from '../domain/AIPerformanceCards';

export const LearningProgress = ({ studyPlan, className }) => {
  const hasPlan = studyPlan?.length > 0;
  
  const completed = studyPlan?.filter(p => p.status === 'Completed')?.length || 0;
  const total = studyPlan?.length || 0;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const metrics = [
    { label: 'Modules Completed', value: completed, max: Math.max(total, 1), suffix: ` / ${total}` },
    { label: 'Completion Rate', value: percentage, suffix: '%' }
  ];

  return (
    <div className={className}>
      <LearningProgressCard 
        metrics={metrics}
        isEmpty={!hasPlan}
      />
    </div>
  );
};
