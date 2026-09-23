import React from 'react';
import { Button } from '../ui/Button';
import { Save, XCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export const GlobalSaveBar = ({ hasUnsavedChanges, isSaving, onSave, onDiscard }) => {
  if (!hasUnsavedChanges) return null;

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 transition-transform duration-300 ease-in-out transform translate-y-0",
      "flex justify-center pointer-events-none"
    )}>
      <div className="bg-surface border border-border shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-6 pointer-events-auto max-w-2xl w-full">
        <div className="flex flex-col">
          <span className="font-bold text-text-primary">Unsaved Changes</span>
          <span className="text-xs text-text-secondary">You have modified your profile. Save before leaving.</span>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onDiscard} disabled={isSaving} leftIcon={<XCircle className="w-4 h-4" />}>
            Discard
          </Button>
          <Button variant="primary" onClick={onSave} isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};
