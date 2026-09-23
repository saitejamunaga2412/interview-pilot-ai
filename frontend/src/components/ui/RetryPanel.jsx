import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { Card, CardContent } from './Card';

export const RetryPanel = ({ message = "Failed to load data", onRetry }) => {
  return (
    <Card className="border-error-200 bg-error-50 dark:bg-error-900/10 w-full max-w-md mx-auto my-8">
      <CardContent className="flex flex-col items-center text-center p-6 space-y-4">
        <AlertTriangle className="h-10 w-10 text-error-500" />
        <div>
          <h4 className="font-semibold text-error-900 dark:text-error-100">Connection Error</h4>
          <p className="text-sm text-error-700 dark:text-error-300 mt-1">{message}</p>
        </div>
        {onRetry && (
          <Button variant="danger" onClick={onRetry}>
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
