import React from 'react';
import { cn } from '../../utils/cn';

export const Switch = React.forwardRef(({
  className,
  checked,
  onChange,
  disabled,
  id,
  label,
  ...props
}, ref) => {
  const switchId = id || React.useId();

  return (
    <div className="flex items-center">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={label ? `${switchId}-label` : undefined}
        id={switchId}
        ref={ref}
        disabled={disabled}
        onClick={() => onChange && onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-primary-600" : "bg-border",
          className
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
      {label && (
        <span id={`${switchId}-label`} className={cn("ml-3 text-sm font-medium text-text-primary", disabled && "opacity-50")}>
          {label}
        </span>
      )}
    </div>
  );
});

Switch.displayName = "Switch";
