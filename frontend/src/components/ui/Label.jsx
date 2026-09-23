import React from 'react';
import { cn } from '../../utils/cn';

export const Label = React.forwardRef(({ className, children, required, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn("block text-sm font-medium text-text-primary mb-1.5", className)}
      {...props}
    >
      {children}
      {required && <span className="text-error-500 ml-1" aria-hidden="true">*</span>}
    </label>
  );
});

Label.displayName = "Label";
