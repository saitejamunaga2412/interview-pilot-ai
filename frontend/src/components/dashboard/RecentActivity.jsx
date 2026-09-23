import React from 'react';
import { RecentActivityCard } from '../domain/ActivityTimeline';
import { Settings, Play, CheckCircle2 } from 'lucide-react';

function formatDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export const RecentActivity = ({ recentInterviews, className }) => {
  const mappedActivities = (recentInterviews ?? []).map(interview => ({
    title: `Completed Interview: ${interview?.role || 'General'}`,
    description: `Scored ${interview.overallScore || 0}% overall.`,
    timestamp: formatDate(interview.createdAt),
    icon: Play
  }));

  return (
    <div className={className}>
      <RecentActivityCard 
        title="Recent Interviews" 
        activities={mappedActivities} 
        className="border-border shadow-sm"
      />
    </div>
  );
};
