import React from 'react';
import { cn } from '../../utils/cn';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export const Alert = React.forwardRef(({
  className,
  variant = 'info',
  title,
  children,
  icon,
  ...props
}, ref) => {
  const variants = {
    info: "bg-info-50 text-info-800 border-info-200 dark:bg-info-900/30 dark:border-info-800/50 dark:text-info-300",
    success: "bg-success-50 text-success-800 border-success-200 dark:bg-success-900/30 dark:border-success-800/50 dark:text-success-300",
    warning: "bg-warning-50 text-warning-800 border-warning-200 dark:bg-warning-900/30 dark:border-warning-800/50 dark:text-warning-300",
    error: "bg-error-50 text-error-800 border-error-200 dark:bg-error-900/30 dark:border-error-800/50 dark:text-error-300",
  };

  const IconMap = {
    info: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    error: AlertCircle,
  };

  const IconComponent = icon || IconMap[variant];

  return (
    <div
      ref={ref}
      role="alert"
      className={cn("relative w-full rounded-lg border p-4 flex gap-3", variants[variant], className)}
      {...props}
    >
      <IconComponent className="h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        {title && <h5 className="font-semibold leading-none tracking-tight">{title}</h5>}
        <div className="text-sm opacity-90 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
});

Alert.displayName = "Alert";
