import React from 'react';
import { cn } from '../../utils/cn';

export const Spinner = ({ className, size = 'md' }) => {
  const sizes = {
    sm: "w-3 h-3 border-2",
    md: "w-5 h-5 border-2",
    lg: "w-8 h-8 border-3",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-t-transparent border-current text-primary-500",
        sizes[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
