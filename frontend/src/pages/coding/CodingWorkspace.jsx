import React, { useState } from 'react';
import { CodingHeader } from '../../components/coding/CodingHeader';
import { ProblemDescription } from '../../components/coding/ProblemDescription';
import { CodeEditorPanel } from '../../components/coding/CodeEditorPanel';
import { AICodingCoach } from '../../components/coding/AICodingCoach';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';

export default function CodingWorkspace({ dataHook }) {
  const { 
    activeProblem, 
    code, 
    setCode, 
    loading, 
    submitting, 
    result, 
    handleRunCode, 
    startNewProblem,
    navigateToResults
  } = dataHook;

  // Simple mobile tab state
  const [mobileTab, setMobileTab] = useState('problem');

  if (loading || !activeProblem) {
    return <div className="h-screen bg-bg-base flex items-center justify-center">Loading Workspace...</div>;
  }

  return (
    <div className="h-screen w-full flex flex-col bg-bg-base overflow-hidden">
      <CodingHeader 
        problem={activeProblem} 
        submitting={submitting} 
        onRun={handleRunCode} 
        onBack={startNewProblem}
        onNavigateToResults={navigateToResults}
        hasResult={Boolean(result)}
      />

      {/* Desktop Layout */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* Left Pane */}
        <div className="w-1/2 flex flex-col bg-surface overflow-hidden relative">
          <Tabs defaultValue="description" className="flex-1 flex flex-col h-full">
            <div className="px-4 pt-2 border-b border-border shrink-0 bg-surface">
               <TabsList>
                 <TabsTrigger value="description">Description</TabsTrigger>
                 <TabsTrigger value="solution" disabled>Editorial (Locked)</TabsTrigger>
               </TabsList>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <TabsContent value="description" className="h-full m-0 p-0 border-none outline-none">
                <ProblemDescription problem={activeProblem} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Right Pane */}
        <div className="w-1/2 flex flex-col h-full overflow-hidden bg-bg-base border-l border-border relative">
          <div className="flex-1 overflow-hidden relative min-h-[300px]">
            <CodeEditorPanel code={code} onChange={setCode} />
          </div>
          {/* Execution Status Panel - Stays anchored to bottom if result exists */}
          {result && (
            <div className="shrink-0 max-h-[60%] overflow-y-auto bg-surface relative z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.1)] border-t border-border">
               <AICodingCoach 
                 result={result} 
                 onExplainRequest={() => alert("Explanation module triggered! Connecting to AITutor...")}
               />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col flex-1 overflow-hidden">
        <Tabs value={mobileTab} onValueChange={setMobileTab} className="flex-1 flex flex-col h-full">
          <div className="px-4 pt-2 border-b border-border shrink-0 bg-surface">
            <TabsList className="w-full">
              <TabsTrigger value="problem" className="flex-1">Problem</TabsTrigger>
              <TabsTrigger value="editor" className="flex-1">Code Editor</TabsTrigger>
              {result && <TabsTrigger value="result" className="flex-1">Output</TabsTrigger>}
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-hidden relative">
            <TabsContent value="problem" className="h-full m-0 p-0 overflow-hidden outline-none">
               <ProblemDescription problem={activeProblem} />
            </TabsContent>
            <TabsContent value="editor" className="h-full m-0 p-0 overflow-hidden outline-none flex flex-col">
               <CodeEditorPanel code={code} onChange={setCode} />
            </TabsContent>
            {result && (
              <TabsContent value="result" className="h-full m-0 p-0 overflow-y-auto outline-none bg-surface">
                 <AICodingCoach 
                   result={result} 
                   onExplainRequest={() => alert("Explanation module triggered! Connecting to AITutor...")}
                 />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>

    </div>
  );
}
