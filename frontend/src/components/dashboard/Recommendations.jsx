import React from 'react';
import { RecommendationCard } from '../domain/AIInsightCards';
import { RecommendationPanel } from '../domain/DashboardLayout';
import { EmptyState } from '../ui/States';
import { useNavigate } from 'react-router-dom';

export const Recommendations = ({ studyPlan, className }) => {
  const navigate = useNavigate();

  if (!studyPlan || studyPlan.length === 0) {
    return (
      <RecommendationPanel className={className}>
        <EmptyState 
          title="No recommendations yet" 
          description="Complete more activities to receive personalized recommendations." 
          className="border border-border rounded-xl"
        />
      </RecommendationPanel>
    );
  }

  // Filter out completed ones to show actionable ones
  const activePlan = (Array.isArray(studyPlan) ? studyPlan : []).filter(p => p?.status !== 'Completed').slice(0, 3);

  if (activePlan.length === 0) {
    return (
      <RecommendationPanel className={className}>
        <EmptyState 
          title="All caught up!" 
          description="You've completed all your recommended study plans." 
          className="border border-border rounded-xl"
        />
      </RecommendationPanel>
    );
  }

  return (
    <RecommendationPanel className={className}>
      {activePlan.map((plan, idx) => (
        <RecommendationCard 
          key={idx} 
          title={plan.topic} 
          content={`Priority: ${plan.priority}. ${plan.recommendedResources?.[0] || 'Review this topic to improve.'}`} 
          actionText="Study Now"
          onAction={() => navigate('/learning')}
        />
      ))}
    </RecommendationPanel>
  );
};
