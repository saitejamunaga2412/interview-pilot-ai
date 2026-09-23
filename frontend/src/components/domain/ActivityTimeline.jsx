import React from 'react';
import { cn } from '../../utils/cn';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { EmptyState, ErrorState } from '../ui/States';
import { Skeleton } from '../ui/Skeleton';
import { motion } from 'framer-motion';

export const ActivityFeed = ({ activities = [], isLoading, isError, onRetry, className }) => {
  if (isError) return <ErrorState onRetry={onRetry} className={className} />;
  if (isLoading) return <Card className={className}><CardContent className="p-6"><Skeleton className="h-10 w-full mb-4" /><Skeleton className="h-10 w-full mb-4" /></CardContent></Card>;
  if (!activities.length) return <EmptyState title="No Recent Activity" className={className} />;

  return (
    <div className={cn("space-y-4", className)}>
      {activities.map((activity, idx) => (
        <motion.div 
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05, duration: 0.2 }}
          className="flex gap-4 p-4 rounded-lg border border-border bg-surface hover:shadow-sm transition-shadow"
        >
          {activity.icon && (
            <div className="shrink-0 mt-0.5">
              <div className="p-2 rounded-full bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                <activity.icon className="h-4 w-4" />
              </div>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h5 className="font-semibold text-text-primary text-sm">{activity.title}</h5>
            <p className="text-sm text-text-secondary mt-0.5">{activity.description}</p>
            <span className="text-xs text-text-muted mt-2 block">{activity.timestamp}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export const RecentActivityCard = ({ title = "Recent Activity", ...props }) => (
  <Card className={props.className}>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <ActivityFeed {...props} />
    </CardContent>
  </Card>
);

export const NotificationTimeline = (props) => (
  <ActivityFeed {...props} />
);

export const SessionTimeline = (props) => (
  <ActivityFeed {...props} />
);

export const AchievementTimeline = (props) => (
  <ActivityFeed {...props} />
);
