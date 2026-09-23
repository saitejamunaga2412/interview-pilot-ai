import React from 'react';
import { cn } from '../../utils/cn';

export const Container = React.forwardRef(({ className, as: Component = 'div', ...props }, ref) => (
  <Component
    ref={ref}
    className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}
    {...props}
  />
));
Container.displayName = "Container";

export const Section = React.forwardRef(({ className, as: Component = 'section', ...props }, ref) => (
  <Component
    ref={ref}
    className={cn("py-8 md:py-12 lg:py-16", className)}
    {...props}
  />
));
Section.displayName = "Section";

export const Stack = React.forwardRef(({ className, as: Component = 'div', direction = 'col', spacing = 'md', align, justify, ...props }, ref) => {
  const spacings = {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };
  
  return (
    <Component
      ref={ref}
      className={cn(
        "flex",
        direction === 'col' ? 'flex-col' : 'flex-row',
        spacings[spacing],
        align && `items-${align}`,
        justify && `justify-${justify}`,
        className
      )}
      {...props}
    />
  );
});
Stack.displayName = "Stack";

export const Grid = React.forwardRef(({ className, as: Component = 'div', cols = 1, gap = 'md', ...props }, ref) => {
  const gaps = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };
  
  return (
    <Component
      ref={ref}
      className={cn(
        "grid",
        cols === 1 && "grid-cols-1",
        cols === 2 && "grid-cols-1 sm:grid-cols-2",
        cols === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        cols === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        gaps[gap],
        className
      )}
      {...props}
    />
  );
});
Grid.displayName = "Grid";

export const Divider = React.forwardRef(({ className, orientation = 'horizontal', ...props }, ref) => (
  <div
    ref={ref}
    role="separator"
    aria-orientation={orientation}
    className={cn(
      "shrink-0 bg-border",
      orientation === 'horizontal' ? "h-[1px] w-full" : "h-full w-[1px]",
      className
    )}
    {...props}
  />
));
Divider.displayName = "Divider";
