import React from 'react';
import { cn } from '../../utils/cn';

export const Progress = React.forwardRef(({
  className,
  value = 0,
  max = 100,
  size = 'md',
  showLabel = false,
  colorAuto = false,
  color,
  label,
  animated = true,
  ...props
}, ref) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const getAutoColor = (p) => {
    if (p >= 75) return 'bg-success-500';
    if (p >= 45) return 'bg-primary-500';
    if (p >= 25) return 'bg-warning-500';
    return 'bg-error-500';
  };

  const barColor = color || (colorAuto ? getAutoColor(pct) : 'bg-primary-500');

  const sizes = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4',
  };

  return (
    <div ref={ref} className={cn('w-full', className)} {...props}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs font-medium text-text-secondary">{label}</span>}
          {showLabel && <span className="text-xs font-bold text-text-primary">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={cn('w-full rounded-full bg-surface-hover overflow-hidden', sizes[size] || sizes.md)}>
        <div
          className={cn(
            'h-full rounded-full',
            barColor,
            animated && 'progress-bar-animated'
          )}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
});

Progress.displayName = 'Progress';
