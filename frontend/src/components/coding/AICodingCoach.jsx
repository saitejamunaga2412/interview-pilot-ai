import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Code2, CheckSquare, BrainCircuit, MessageSquare, BookOpen, AlertTriangle } from 'lucide-react';
import { ExecutionStatus } from './ExecutionStatus';

export const AICodingCoach = ({ result, onExplainRequest }) => {
  const [hintLevel, setHintLevel] = useState(0);

  if (!result) return null;

  const { status, aiDebugger, report, aiComplexity } = result;
  const isAccepted = status === 'Accepted';

  const nextHint = () => {
    if (hintLevel < 5) setHintLevel(prev => prev + 1);
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="p-4 border-b border-border flex items-center justify-between bg-indigo-900/10">
        <h3 className="font-bold flex items-center gap-2 text-indigo-400">
          <BrainCircuit className="w-5 h-5" /> AI Coding Coach
        </h3>
        <button 
          onClick={onExplainRequest}
          className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-full flex items-center gap-2 transition"
        >
          <MessageSquare className="w-3 h-3" /> Explain
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Execution Output */}
        <ExecutionStatus result={result.executionResult} />

        {/* AI Complexity Analysis */}
        {aiComplexity && isAccepted && (
          <div className="bg-blue-900/10 border border-blue-900/30 rounded-xl p-4">
            <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <CheckSquare className="w-4 h-4" /> Optimal Complexity Reached
            </h4>
            <p className="text-sm text-text-secondary leading-relaxed">{aiComplexity.explanation}</p>
          </div>
        )}

        {/* AI Debugger - Progressive Disclosure */}
        {!isAccepted && aiDebugger && (
          <div className="space-y-4">
            <div className="bg-red-900/10 border border-red-900/30 rounded-xl p-4">
               <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                 <AlertTriangle className="w-4 h-4" /> What Went Wrong
               </h4>
               <p className="text-sm text-text-secondary mb-2"><strong className="text-text-primary">Intent:</strong> {aiDebugger.intentExplanation}</p>
               <p className="text-sm text-text-secondary"><strong className="text-text-primary">Mistake:</strong> {aiDebugger.mistakeIdentification}</p>
               <p className="text-sm text-red-300 mt-2">{aiDebugger.whyExplanation}</p>
            </div>

            {/* Progressive Hints */}
            <div className="space-y-3">
              {hintLevel >= 1 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-yellow-900/10 border border-yellow-900/30 rounded-xl p-4">
                  <h4 className="font-semibold text-yellow-500 mb-1 flex items-center gap-2"><Lightbulb className="w-4 h-4"/> Hint 1</h4>
                  <p className="text-sm text-text-secondary">{aiDebugger.hint1}</p>
                </motion.div>
              )}
              
              {hintLevel >= 2 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-yellow-900/10 border border-yellow-900/30 rounded-xl p-4">
                  <h4 className="font-semibold text-yellow-500 mb-1 flex items-center gap-2"><Lightbulb className="w-4 h-4"/> Hint 2</h4>
                  <p className="text-sm text-text-secondary">{aiDebugger.hint2}</p>
                </motion.div>
              )}

              {hintLevel >= 3 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-purple-900/10 border border-purple-900/30 rounded-xl p-4">
                  <h4 className="font-semibold text-purple-400 mb-2 flex items-center gap-2"><Code2 className="w-4 h-4"/> Pseudo Code</h4>
                  <pre className="text-xs bg-[#1e1e1e] p-3 rounded-lg font-mono text-purple-300 whitespace-pre-wrap">{aiDebugger.pseudoCode}</pre>
                </motion.div>
              )}

              {hintLevel >= 4 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-900/10 border border-green-900/30 rounded-xl p-4">
                  <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2"><BookOpen className="w-4 h-4"/> Optimal Approach</h4>
                  <p className="text-sm text-text-secondary">{aiDebugger.optimalIdea}</p>
                </motion.div>
              )}

              {hintLevel < 5 && (
                <button 
                  onClick={nextHint}
                  className="w-full py-2 bg-surface hover:bg-bg-base border border-border rounded-lg text-sm font-medium transition"
                >
                  {hintLevel === 0 ? "Give me a Hint" : hintLevel === 1 ? "I need another Hint" : hintLevel === 2 ? "Show Pseudo Code" : hintLevel === 3 ? "Explain Optimal Approach" : "Show Full Solution"}
                </button>
              )}
              
              {hintLevel >= 5 && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1e1e1e] border border-border rounded-xl p-4">
                  <h4 className="font-semibold text-gray-400 mb-2">Optimal Solution</h4>
                  <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap">{"// Full optimal solution logic here..."}</pre>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* AI Report Summary */}
        {report && (
          <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-xl p-5">
             <h4 className="font-bold text-lg text-indigo-300 mb-4">Post-Submission Report</h4>
             
             <div className="grid grid-cols-2 gap-4 mb-4">
               <div>
                 <span className="text-xs text-text-muted uppercase font-bold tracking-wider">Interview Readiness</span>
                 <div className="text-2xl font-black text-indigo-400">{report.interviewReadiness}%</div>
               </div>
               <div>
                 <span className="text-xs text-text-muted uppercase font-bold tracking-wider">Estimated Gain</span>
                 <div className="text-2xl font-black text-green-400">{report.estimatedReadinessGain}</div>
               </div>
             </div>

             <div className="space-y-3">
               <div>
                 <span className="text-xs font-semibold text-green-400 block mb-1">Strengths</span>
                 <ul className="list-disc pl-4 text-sm text-text-secondary">
                   {report.strengths.map((s,i) => <li key={i}>{s}</li>)}
                 </ul>
               </div>
               {report.weaknesses.length > 0 && (
                 <div>
                   <span className="text-xs font-semibold text-yellow-400 block mb-1">Areas to Improve</span>
                   <ul className="list-disc pl-4 text-sm text-text-secondary">
                     {report.weaknesses.map((w,i) => <li key={i}>{w}</li>)}
                   </ul>
                 </div>
               )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
