import React from 'react';
import { cn } from '../../utils/cn';

export const StatusIndicator = ({ status = 'offline', className }) => {
  const statusConfig = {
    online: { bg: 'bg-success-500', animate: 'animate-pulse' },
    offline: { bg: 'bg-secondary-400', animate: '' },
    busy: { bg: 'bg-error-500', animate: '' },
    away: { bg: 'bg-warning-500', animate: '' },
  };

  const { bg, animate } = statusConfig[status] || statusConfig.offline;

  return (
    <span className={cn("relative flex h-3 w-3", className)} aria-label={`Status: ${status}`}>
      {status === 'online' && (
        <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-75", animate, bg)}></span>
      )}
      <span className={cn("relative inline-flex h-3 w-3 rounded-full border-2 border-surface", bg)}></span>
    </span>
  );
};
