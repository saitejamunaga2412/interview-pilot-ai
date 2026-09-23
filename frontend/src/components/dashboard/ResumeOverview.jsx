import React from 'react';
import { ResumeScoreCard } from '../domain/AIMetrics';

export const ResumeOverview = ({ user, className }) => {
  const hasResume = Boolean(user?.career?.resumeUrl);
  // Defaulting ATS score for the sake of the gauge if a resume exists, or empty if it doesn't
  const atsScore = hasResume ? (user?.career?.atsScore || 75) : undefined;

  return (
    <div className={className}>
      <ResumeScoreCard 
        score={atsScore ?? 0} 
        isEmpty={!hasResume} 
        title="Resume ATS Score"
        label="Score"
      />
    </div>
  );
};
