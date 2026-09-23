import React from 'react';
import { cn } from '../../utils/cn';
import { Spinner } from './Spinner';

export const Button = React.forwardRef(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  ...props
}, ref) => {
  const baseStyles = [
    'inline-flex items-center justify-center font-medium transition-all duration-200',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'rounded-lg active:scale-[0.97]',
  ].join(' ');

  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500 shadow-sm hover:shadow-md',
    secondary: 'bg-surface-hover text-text-primary border border-border hover:border-border-strong hover:bg-surface-hover focus-visible:ring-primary-500',
    outline: 'border border-border bg-transparent hover:bg-surface-hover text-text-primary focus-visible:ring-primary-500',
    ghost: 'bg-transparent hover:bg-surface-hover text-text-primary focus-visible:ring-primary-500',
    danger: 'bg-error-500 text-white hover:bg-error-600 focus-visible:ring-error-500 shadow-sm',
    success: 'bg-success-500 text-white hover:bg-success-600 focus-visible:ring-success-500 shadow-sm',
    gradient: 'text-white focus-visible:ring-primary-500 btn-glow shadow-sm',
  };

  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs gap-1',
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-5 py-3 text-base gap-2',
    xl: 'px-7 py-4 text-base gap-2.5',
    'icon-sm': 'p-1.5',
    'icon-md': 'p-2',
    'icon-lg': 'p-3',
  };

  const gradientStyle = variant === 'gradient'
    ? { background: 'var(--gradient-brand)' }
    : {};

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      style={gradientStyle}
      {...props}
    >
      {isLoading && <Spinner className="w-4 h-4" />}
      {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';
