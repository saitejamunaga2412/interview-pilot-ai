import React from 'react';
import { cn } from '../../utils/cn';
import { Progress } from '../ui/Progress';
import { Button } from '../ui/Button';
import { LogOut } from 'lucide-react';
import { ConfirmDialog } from '../ui/ConfirmDialog';

export const InterviewHeader = ({ current, total, onExit, submitting }) => {
  const percentage = total > 0 ? Math.round(((current + 1) / total) * 100) : 0;
  
  return (
    <div className="sticky top-0 z-10 bg-surface/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between shadow-sm">
      <div className="flex-1 max-w-xl flex items-center gap-4">
        <span className="text-sm font-semibold text-text-primary w-24">Question {current + 1} / {total}</span>
        <Progress value={percentage} max={100} className="flex-1" />
      </div>
      <div>
        <ConfirmDialog
          title="Exit Interview?"
          message="Are you sure you want to exit? Your progress is auto-saved, but the timer will continue if this is a timed interview."
          confirmText="Exit Session"
          cancelText="Cancel"
          variant="danger"
          onConfirm={onExit}
        >
          <Button variant="outline" size="sm" leftIcon={<LogOut className="w-4 h-4" />} disabled={submitting}>
            Exit Session
          </Button>
        </ConfirmDialog>
      </div>
    </div>
  );
};
