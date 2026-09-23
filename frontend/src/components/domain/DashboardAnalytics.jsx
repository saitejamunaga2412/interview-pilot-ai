import React from 'react';
import { cn } from '../../utils/cn';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { ErrorState, EmptyState } from '../ui/States';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Grid, Stack } from '../layout';

export const MetricCard = ({ title, value, prefix, suffix, trend, trendLabel, icon: Icon, isLoading, isError, onRetry, className }) => {
  if (isError) return <ErrorState onRetry={onRetry} className={className} />;
  if (isLoading) return <Card className={className}><CardContent className="p-6 space-y-3"><Skeleton className="h-5 w-24" /><Skeleton className="h-8 w-16" /><Skeleton className="h-4 w-32" /></CardContent></Card>;

  const isPositive = trend > 0;
  const isNegative = trend < 0;
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const trendColor = isPositive ? 'text-success-600' : isNegative ? 'text-error-600' : 'text-text-muted';

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-text-secondary">{title}</h4>
          {Icon && <div className="p-2 rounded-md bg-secondary-100 dark:bg-secondary-800"><Icon className="h-4 w-4 text-text-muted" /></div>}
        </div>
        <div>
          <div className="text-3xl font-bold text-text-primary tracking-tight">
            {prefix}{value}{suffix}
          </div>
          {trend !== undefined && (
            <div className="flex items-center mt-2 text-sm">
              <span className={cn("flex items-center font-medium mr-2", trendColor)}>
                <TrendIcon className="h-3.5 w-3.5 mr-1" />
                {Math.abs(trend)}%
              </span>
              {trendLabel && <span className="text-text-muted">{trendLabel}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const StatsGrid = ({ children, cols = 4, className }) => (
  <Grid cols={cols} gap="md" className={className}>
    {children}
  </Grid>
);

export const KPICard = (props) => (
  <MetricCard {...props} className={cn("border-primary-200 dark:border-primary-900/50 shadow-sm", props.className)} />
);

export const ComparisonCard = ({ title, primaryValue, secondaryValue, primaryLabel, secondaryLabel, className, isLoading }) => {
  if (isLoading) return <Card className={className}><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>;
  const diff = primaryValue - secondaryValue;
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-text-secondary font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-between items-end pb-5">
        <div>
          <div className="text-2xl font-bold text-text-primary">{primaryValue}</div>
          <div className="text-xs text-text-muted mt-1">{primaryLabel}</div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-xl font-semibold text-text-secondary">{secondaryValue}</div>
          <div className="text-xs text-text-muted mt-1">{secondaryLabel}</div>
        </div>
      </CardContent>
      <div className={cn("px-6 py-2 text-xs font-medium border-t border-border", diff > 0 ? "bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-300" : "bg-error-50 text-error-700 dark:bg-error-900/20 dark:text-error-300")}>
        {diff > 0 ? '+' : ''}{diff} Difference
      </div>
    </Card>
  );
};

export const SummaryPanel = ({ title, children, className }) => (
  <Card className={cn("bg-surface-hover", className)}>
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
);
