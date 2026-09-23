import React from 'react';
import { cn } from '../../utils/cn';
import { Spinner } from './Spinner';

export const IconButton = React.forwardRef(({
  icon,
  className,
  variant = 'ghost',
  size = 'md',
  isLoading = false,
  disabled,
  'aria-label': ariaLabel,
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-full";
  
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm",
    secondary: "bg-secondary-100 text-secondary-900 hover:bg-secondary-200 focus:ring-secondary-500",
    outline: "border border-border bg-transparent hover:bg-surface-hover text-text-primary focus:ring-primary-500",
    ghost: "bg-transparent hover:bg-surface-hover text-text-primary focus:ring-primary-500",
    danger: "bg-error-500 text-white hover:bg-error-600 focus:ring-error-500 shadow-sm",
  };

  const sizes = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-3",
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      aria-label={ariaLabel}
      {...props}
    >
      {isLoading ? <Spinner className="w-4 h-4" /> : icon}
    </button>
  );
});

IconButton.displayName = "IconButton";
