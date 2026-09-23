import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, X } from 'lucide-react';

export default function SharedCodeEditor({
  questionId,
  code,
  onChange,
  language,
  onLanguageChange,
  onRun,
  output,
  executing,
  mode = 'arena', // 'arena' or 'assessment'
  onClearOutput
}) {
  const [localCode, setLocalCode] = useState(code || '');

  // Sync external code changes (like on question switch)
  useEffect(() => {
    setLocalCode(code || '');
  }, [code]);

  // Handle local storage auto-save for assessment mode
  useEffect(() => {
    if (mode !== 'assessment' || !questionId) return;
    
    // Auto-save timer
    const interval = setInterval(() => {
      if (localCode) {
        localStorage.setItem(`assessment_draft_${questionId}`, localCode);
      }
    }, 3000); // Save every 3 seconds

    return () => clearInterval(interval);
  }, [localCode, mode, questionId]);

  const handleEditorChange = (val) => {
    setLocalCode(val);
    onChange(val);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-base border border-border-color rounded-lg overflow-hidden">
      <div className="h-10 bg-surface border-b border-border-color flex items-center px-4 justify-between shrink-0">
        <select 
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="bg-bg-base border border-border-color text-sm rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-primary text-text-primary"
        >
          <option value="javascript">JavaScript (Node.js)</option>
          <option value="python">Python 3</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
        
        {/* Run button shown inside editor for Arena, but outside for Assessment (or keep here?) */}
        {mode === 'arena' && onRun && (
          <button 
            onClick={() => onRun(localCode, language)}
            disabled={executing}
            className="flex items-center gap-1.5 px-3 py-1 bg-surface hover:bg-surface-hover border border-border-color text-text-primary rounded text-xs font-medium transition-colors"
          >
            <Play size={12} className={executing ? 'animate-pulse text-success-500' : 'text-success-500'} /> 
            {executing ? 'Running...' : 'Run Code'}
          </button>
        )}
      </div>
      
      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={language === 'cpp' ? 'cpp' : language}
          theme="vs-dark"
          value={localCode}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineHeight: 1.5,
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            readOnly: false
          }}
        />
      </div>

      {output && (
        <div className="h-1/3 border-t border-border-color bg-surface flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border-color bg-bg-base">
            <span className="text-sm font-semibold text-text-primary">Output</span>
            <button onClick={onClearOutput} className="text-text-muted hover:text-text-primary">
              <X size={14}/>
            </button>
          </div>
          <div className="flex-1 p-4 overflow-auto font-mono text-sm">
            <div className={`font-semibold mb-2 flex items-center justify-between ${
              output.status === 'Accepted' ? 'text-success-500' :
              output.status?.includes('Time Limit') || output.status?.includes('Memory') ? 'text-warning-500' :
              output.status?.includes('Unavailable') ? 'text-amber-500' :
              'text-error-500'
            }`}>
              <span>Status: {output.status}</span>
              {output.isUnavailable && onRun && (
                <button 
                  onClick={() => onRun(localCode, language)} 
                  className="text-xs px-2 py-0.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 rounded border border-amber-500/30 transition-colors"
                >
                  Retry Execution
                </button>
              )}
            </div>
            <div className="text-text-secondary whitespace-pre-wrap">
              {output.output}
            </div>
            {output.executionTime && (
              <div className="mt-4 text-xs text-text-muted flex gap-4">
                <span>Time: {output.executionTime}</span>
                {output.memory && <span>Memory: {output.memory}</span>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
