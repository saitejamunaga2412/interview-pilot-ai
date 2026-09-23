import React from 'react';
import { cn } from '../../utils/cn';

export const Card = React.forwardRef(({ className, variant = 'base', children, ...props }, ref) => {
  const variants = {
    base: 'rounded-xl border border-border bg-surface text-text-primary shadow-sm',
    elevated: 'card-elevated',
    interactive: 'card-interactive',
    glass: 'rounded-xl border border-border/60 bg-surface/70 backdrop-blur-sm text-text-primary shadow-sm',
  };

  return (
    <div
      ref={ref}
      className={cn(variants[variant] || variants.base, className)}
      {...props}
    >
      {children}
    </div>
  );
});
Card.displayName = 'Card';

export const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col space-y-1.5 p-5', className)} {...props} />
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn('font-semibold leading-tight tracking-tight text-text-primary', className)} {...props} />
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-text-secondary leading-relaxed', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-5 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center p-5 pt-0', className)} {...props} />
));
CardFooter.displayName = 'CardFooter';
