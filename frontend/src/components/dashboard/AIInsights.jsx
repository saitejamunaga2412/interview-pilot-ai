import React from 'react';
import { InsightPanel } from '../domain/DashboardLayout';
import { AIInsightCard, RecommendationCard, AIWarningCard } from '../domain/AIInsightCards';
import { EmptyState } from '../ui/States';

export const AIInsights = ({ insights, loading, className }) => {
  if (loading) return <InsightPanel className={className}><AIInsightCard isLoading /><AIInsightCard isLoading /><AIInsightCard isLoading /></InsightPanel>;

  if (!insights || (!insights.strengths?.length && !insights.weaknesses?.length)) {
    return (
      <div className={className}>
        <h3 className="text-lg font-semibold text-text-primary mb-4">AI Insights</h3>
        <EmptyState title="No AI insights available yet." description="Complete more interviews to generate insights." className="bg-surface border border-border rounded-xl" />
      </div>
    );
  }

  const { strengths = [], weaknesses = [] } = insights;

  return (
    <InsightPanel className={className}>
      {(strengths ?? []).slice(0, 2).map((strength, idx) => (
        <AIInsightCard key={`s-${idx}`} title="Strength Identified" content={strength} />
      ))}
      {(weaknesses ?? []).slice(0, 2).map((weakness, idx) => (
        <AIWarningCard key={`w-${idx}`} title="Area for Improvement" content={weakness} />
      ))}
      {(strengths.length === 0 && weaknesses.length > 0) && (
        <RecommendationCard title="Keep Practicing" content="Focus on resolving weaknesses in upcoming sessions." />
      )}
    </InsightPanel>
  );
};
