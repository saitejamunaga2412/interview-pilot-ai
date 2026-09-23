import React from 'react';
import { cn } from '../../utils/cn';

export const Checkbox = React.forwardRef(({
  className,
  id,
  label,
  error,
  ...props
}, ref) => {
  const checkboxId = id || React.useId();

  return (
    <div className="flex items-start">
      <div className="flex h-5 items-center">
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          className={cn(
            "h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-error-500 text-error-600 focus:ring-error-500",
            className
          )}
          {...props}
        />
      </div>
      {label && (
        <div className="ml-2 text-sm leading-5">
          <label htmlFor={checkboxId} className={cn("font-medium text-text-primary cursor-pointer", props.disabled && "cursor-not-allowed opacity-50")}>
            {label}
          </label>
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = "Checkbox";
