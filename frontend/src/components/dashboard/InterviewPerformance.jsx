import React from 'react';
import { InterviewScoreCard } from '../domain/AIPerformanceCards';

export const InterviewPerformance = ({ history, className }) => {
  const hasHistory = history?.length > 0;
  
  // Calculate specific metrics from history if available
  const overallAvg = hasHistory ? Math.round(history.reduce((acc, h) => acc + (h.overallScore || 0), 0) / history.length) : 0;
  
  const metrics = [
    { label: 'Overall Score', value: overallAvg, suffix: '%' },
    { label: 'Interviews Completed', value: history?.length || 0, max: 10, suffix: ' / 10' }
  ];

  return (
    <div className={className}>
      <InterviewScoreCard 
        metrics={metrics}
        isEmpty={!hasHistory}
      />
    </div>
  );
};
