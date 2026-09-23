import React from 'react';
import { cn } from '../../utils/cn';
import { FileQuestion, AlertTriangle, CheckCircle2, WifiOff } from 'lucide-react';
import { Stack } from '../layout';
import { Button } from './Button';

const BaseState = ({ icon: Icon, title, description, action, className }) => (
  <Stack align="center" justify="center" className={cn("text-center py-12 px-4", className)}>
    <div className="rounded-full bg-secondary-100 dark:bg-secondary-800 p-4 mb-4">
      <Icon className="h-8 w-8 text-text-secondary" />
    </div>
    <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
    {description && <p className="text-sm text-text-secondary max-w-sm mb-6">{description}</p>}
    {action && action}
  </Stack>
);

export const EmptyState = ({ title = "No data found", description, action, className }) => (
  <BaseState icon={FileQuestion} title={title} description={description} action={action} className={className} />
);

export const ErrorState = ({ title = "Something went wrong", description, onRetry, className }) => (
  <BaseState 
    icon={AlertTriangle} 
    title={title} 
    description={description} 
    action={onRetry ? <Button onClick={onRetry} variant="outline">Try Again</Button> : null}
    className={className} 
  />
);

export const SuccessState = ({ title = "Success!", description, action, className }) => (
  <BaseState 
    icon={CheckCircle2} 
    title={title} 
    description={description} 
    action={action}
    className={cn("text-success-600", className)} 
  />
);

export const OfflineState = ({ title = "You are offline", description = "Please check your internet connection.", onRetry, className }) => (
  <BaseState 
    icon={WifiOff} 
    title={title} 
    description={description} 
    action={onRetry ? <Button onClick={onRetry} variant="primary">Refresh</Button> : null}
    className={className} 
  />
);

export const LoadingState = ({ text = "Loading...", className }) => (
  <Stack align="center" justify="center" className={cn("text-center py-12 px-4", className)}>
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mb-4"></div>
    <p className="text-text-secondary">{text}</p>
  </Stack>
);
