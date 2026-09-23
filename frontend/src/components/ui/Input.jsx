import React from 'react';
import { cn } from '../../utils/cn';
import { Label } from './Label';

export const Input = React.forwardRef(({
  className,
  type = 'text',
  label,
  error,
  helperText,
  id,
  required,
  leftIcon,
  rightIcon,
  ...props
}, ref) => {
  const inputId = id || React.useId();
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className="w-full">
      {label && <Label htmlFor={inputId} required={required}>{label}</Label>}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          aria-invalid={!!error}
          aria-errormessage={error ? errorId : undefined}
          aria-describedby={!error && helperText ? helperId : undefined}
          className={cn(
            "flex w-full rounded-md border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-error-500 focus:border-error-500 focus:ring-error-500" : "border-border focus:border-primary-500 focus:ring-primary-500",
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-text-muted">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p id={errorId} className="mt-1.5 text-sm text-error-500" role="alert">{error}</p>}
      {!error && helperText && <p id={helperId} className="mt-1.5 text-sm text-text-muted">{helperText}</p>}
    </div>
  );
});

Input.displayName = "Input";
