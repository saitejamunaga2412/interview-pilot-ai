import React from 'react';
import { TimelineCard } from './TimelineCard';
import { EmptyState } from '../ui/States';
import { Clock } from 'lucide-react';

export const GlobalTimeline = ({ activities, onDelete }) => {
  if (!activities || activities.length === 0) {
    return (
      <EmptyState 
        icon={Clock}
        title="No Activity Found"
        description="We couldn't find any activity matching your filters. Try adjusting your search."
      />
    );
  }

  return (
    <div className="space-y-4">
      {activities.map(activity => (
        <TimelineCard key={activity.id} activity={activity} onDelete={onDelete} />
      ))}
    </div>
  );
};
