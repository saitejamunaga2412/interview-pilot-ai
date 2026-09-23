import React, { Suspense } from 'react';
import { LoadingState } from '../ui/States';
import { cn } from '../../utils/cn';
import { Select } from '../ui/Select';

const Editor = React.lazy(() => import('@monaco-editor/react'));

export const CodeEditorPanel = ({ code, onChange, className }) => {
  // Hardcoded to dark theme and javascript for now as requested
  return (
    <div className={cn("flex flex-col h-full bg-[#1e1e1e] border-l border-border", className)}>
      <div className="h-10 bg-surface border-b border-border flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">JavaScript (Node.js)</span>
        <span className="text-xs text-text-muted">Auto-saved</span>
      </div>
      
      <div className="flex-1 relative">
        <Suspense fallback={
          <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e]">
            <LoadingState text="Initializing Editor..." className="text-text-muted" />
          </div>
        }>
          <Editor
            height="100%"
            theme="vs-dark"
            language="javascript"
            value={code}
            onChange={(val) => onChange(val || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: "smooth",
            }}
          />
        </Suspense>
      </div>
    </div>
  );
};
