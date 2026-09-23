import React from 'react';
import { cn } from '../../utils/cn';

export const Skeleton = React.forwardRef(({ className, variant = 'box', ...props }, ref) => {
  const variants = {
    box: 'skeleton',
    text: 'skeleton h-4 rounded-full',
    title: 'skeleton h-7 rounded-full',
    avatar: 'skeleton rounded-full',
    card: 'skeleton rounded-xl',
    button: 'skeleton h-9 rounded-lg',
  };

  return (
    <div
      ref={ref}
      className={cn(variants[variant] || variants.box, className)}
      aria-hidden="true"
      {...props}
    />
  );
});

Skeleton.displayName = 'Skeleton';

// Convenience: multiple text lines
export const SkeletonText = ({ lines = 3, className }) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }, (_, i) => (
      <Skeleton
        key={i}
        variant="text"
        className={i === lines - 1 ? 'w-3/4' : 'w-full'}
      />
    ))}
  </div>
);
