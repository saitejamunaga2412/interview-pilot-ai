import React from 'react';
import { cn } from '../../utils/cn';
import { Label } from './Label';
import { ChevronDown } from 'lucide-react';

export const Select = React.forwardRef(({
  className,
  label,
  error,
  helperText,
  id,
  required,
  options = [],
  placeholder,
  children,
  ...props
}, ref) => {
  const selectId = id || React.useId();
  const errorId = `${selectId}-error`;
  const helperId = `${selectId}-helper`;

  return (
    <div className="w-full">
      {label && <Label htmlFor={selectId} required={required}>{label}</Label>}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={!!error}
          aria-errormessage={error ? errorId : undefined}
          aria-describedby={!error && helperText ? helperId : undefined}
          className={cn(
            "flex w-full appearance-none rounded-md border bg-surface px-3 py-2 pr-10 text-sm text-text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-error-500 focus:border-error-500 focus:ring-error-500" : "border-border focus:border-primary-500 focus:ring-primary-500",
            className
          )}
          {...props}
        >
          {placeholder && <option value="" disabled hidden>{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
          {children}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-text-muted">
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>
      {error && <p id={errorId} className="mt-1.5 text-sm text-error-500" role="alert">{error}</p>}
      {!error && helperText && <p id={helperId} className="mt-1.5 text-sm text-text-muted">{helperText}</p>}
    </div>
  );
});

Select.displayName = "Select";
