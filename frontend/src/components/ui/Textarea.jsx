import React from 'react';
import { cn } from '../../utils/cn';
import { Label } from './Label';

export const Textarea = React.forwardRef(({
  className,
  label,
  error,
  helperText,
  id,
  required,
  ...props
}, ref) => {
  const textareaId = id || React.useId();
  const errorId = `${textareaId}-error`;
  const helperId = `${textareaId}-helper`;

  return (
    <div className="w-full">
      {label && <Label htmlFor={textareaId} required={required}>{label}</Label>}
      <textarea
        ref={ref}
        id={textareaId}
        required={required}
        aria-invalid={!!error}
        aria-errormessage={error ? errorId : undefined}
        aria-describedby={!error && helperText ? helperId : undefined}
        className={cn(
          "flex min-h-[80px] w-full rounded-md border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 resize-y",
          error ? "border-error-500 focus:border-error-500 focus:ring-error-500" : "border-border focus:border-primary-500 focus:ring-primary-500",
          className
        )}
        {...props}
      />
      {error && <p id={errorId} className="mt-1.5 text-sm text-error-500" role="alert">{error}</p>}
      {!error && helperText && <p id={helperId} className="mt-1.5 text-sm text-text-muted">{helperText}</p>}
    </div>
  );
});

Textarea.displayName = "Textarea";
