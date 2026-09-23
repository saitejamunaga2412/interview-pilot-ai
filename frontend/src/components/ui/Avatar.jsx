import React from 'react';
import { cn } from '../../utils/cn';
import { User } from 'lucide-react';

export const Avatar = React.forwardRef(({
  className,
  src,
  alt = "Avatar",
  fallback,
  size = "md",
  ...props
}, ref) => {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base",
    xl: "h-20 w-20 text-xl",
  };

  const [hasError, setHasError] = React.useState(false);

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full bg-secondary-100 dark:bg-secondary-800 flex-align-center justify-center",
        sizes[size],
        className
      )}
      {...props}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          className="aspect-square h-full w-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : fallback ? (
        <span className="flex h-full w-full items-center justify-center font-medium text-text-secondary uppercase">
          {fallback}
        </span>
      ) : (
        <span className="flex h-full w-full items-center justify-center text-text-muted">
          <User className="h-1/2 w-1/2" />
        </span>
      )}
    </div>
  );
});

Avatar.displayName = "Avatar";
