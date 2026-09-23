import React from 'react';
import { EmptyState } from '../ui/States';

export const UpcomingTasks = ({ className }) => {
  // Backend doesn't currently provide explicitly scheduled tasks outside of studyPlan
  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-text-primary mb-4">Upcoming Tasks</h3>
      <EmptyState 
        title="No scheduled tasks" 
        description="Check back later for scheduled mock interviews or peer reviews." 
        className="bg-surface border border-border rounded-xl"
      />
    </div>
  );
};
