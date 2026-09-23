import React from 'react';
import { CodingScoreCard } from '../domain/AIPerformanceCards';

export const CodingPerformance = ({ history, className }) => {
  // Our backend doesn't explicitly separate coding yet in standard useDashboardData
  // We'll parse history to see if there are coding problems attached
  const codingHistory = history?.filter(h => h.problems && h.problems.length > 0) || [];
  const hasCoding = codingHistory.length > 0;
  
  const overallAvg = hasCoding ? Math.round(codingHistory.reduce((acc, h) => acc + (h.overallScore || 0), 0) / codingHistory.length) : 0;
  
  const metrics = [
    { label: 'Accuracy', value: overallAvg, suffix: '%' },
    { label: 'Problems Solved', value: codingHistory.length, max: 20, suffix: ' / 20' }
  ];

  return (
    <div className={className}>
      <CodingScoreCard 
        metrics={metrics}
        isEmpty={!hasCoding}
      />
    </div>
  );
};
