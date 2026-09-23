import React from 'react';
import { cn } from '../../utils/cn';

export const Badge = React.forwardRef(({
  className,
  variant = 'primary',
  pill = false,
  dot = false,
  glow = false,
  children,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold transition-colors';

  const variants = {
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300',
    secondary: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-700/30 dark:text-secondary-300',
    success: 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400',
    warning: 'bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-400',
    error: 'bg-error-50 text-error-700 dark:bg-error-900/20 dark:text-error-400',
    info: 'bg-info-50 text-info-700 dark:bg-info-900/20 dark:text-info-400',
    outline: 'border border-border text-text-secondary bg-transparent',
    ghost: 'bg-transparent text-text-muted',
  };

  const glowMap = {
    primary: '0 0 10px rgba(99, 102, 241, 0.35)',
    success: '0 0 10px rgba(16, 185, 129, 0.35)',
    warning: '0 0 10px rgba(245, 158, 11, 0.35)',
    error: '0 0 10px rgba(239, 68, 68, 0.35)',
  };

  const dotColors = {
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
    info: 'bg-info-500',
    secondary: 'bg-secondary-500',
  };

  return (
    <span
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant] || variants.primary,
        pill ? 'rounded-full' : 'rounded-md',
        className
      )}
      style={glow ? { boxShadow: glowMap[variant] } : {}}
      {...props}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant] || dotColors.primary)} />
      )}
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';
