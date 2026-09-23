import React from 'react';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';
import { DataStructureVisualizer } from './DataStructureVisualizer';
import { BookOpen, Building2, AlertTriangle, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProblemDescription = ({ problem, className }) => {
  if (!problem) return null;

  return (
    <div className={cn("p-6 overflow-y-auto h-full space-y-6", className)}>
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-3 flex justify-between items-center">
          {problem.title}
          <span className={cn("text-xs px-2 py-1 rounded-full font-bold uppercase", 
            problem.difficulty === 'Easy' ? "bg-green-100 text-green-700" : 
            problem.difficulty === 'Medium' ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700")}>
            {problem.difficulty || 'Medium'}
          </span>
        </h2>
        
        {/* Tags & Companies */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {problem.topics?.map(topic => (
            <Badge key={topic} variant="secondary" size="sm">{topic}</Badge>
          ))}
          {problem.companyTags?.length > 0 && (
            <div className="flex items-center gap-1 ml-4 text-xs text-text-muted">
               <Building2 className="w-3 h-3" /> 
               {problem.companyTags.slice(0, 3).join(", ")} {problem.companyTags.length > 3 && `+${problem.companyTags.length - 3}`}
            </div>
          )}
        </div>

        {/* Real-World Analogy */}
        {problem.analogy && (
          <div className="bg-yellow-900/10 border-l-4 border-yellow-500 p-3 rounded-r-lg mb-4 text-sm text-text-secondary flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
            <p><span className="font-semibold text-text-primary">Real-world Analogy:</span> {problem.analogy}</p>
          </div>
        )}

        <div className="prose dark:prose-invert max-w-none text-text-secondary text-sm leading-relaxed whitespace-pre-wrap font-sans">
          {problem.description}
        </div>
      </div>

      {/* Visual Example (If defined in DB) */}
      {problem.visualType && problem.visualData && (
        <div className="pt-4 border-t border-border">
          <h3 className="font-semibold text-text-primary mb-3">Visual Example</h3>
          <DataStructureVisualizer type={problem.visualType} data={problem.visualData} activeIndices={problem.visualActiveIndices || []} />
        </div>
      )}

      {/* Constraints */}
      {problem.constraints?.length > 0 && (
        <div className="bg-red-900/10 p-4 rounded-xl border border-red-900/30">
          <h3 className="text-sm font-bold text-red-400 mb-2 flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> Constraints</h3>
          <ul className="list-disc pl-5 text-sm font-mono text-text-secondary space-y-1">
             {problem.constraints.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      )}

      {/* Theory Link */}
      {problem.relatedLearningTopic && (
        <Link to={`/learning/${problem.relatedLearningTopic.topicId}`} className="block mt-4 bg-indigo-900/20 hover:bg-indigo-900/30 transition p-4 rounded-xl border border-indigo-500/30 flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-indigo-400" />
          <div>
            <h4 className="text-sm font-bold text-indigo-300">Need a refresher?</h4>
            <p className="text-xs text-text-secondary">Read the lesson on {problem.relatedLearningTopic.title}</p>
          </div>
        </Link>
      )}

      {problem.testCases?.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="font-semibold text-text-primary">Examples</h3>
          {problem.testCases.map((tc, idx) => (
            <div key={idx} className="bg-surface-hover border border-border p-4 rounded-lg font-mono text-sm space-y-2">
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <span className="text-text-muted font-semibold min-w-[60px]">Input:</span>
                <span className="text-text-primary break-all">{tc.input}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <span className="text-text-muted font-semibold min-w-[60px]">Output:</span>
                <span className="text-text-primary break-all">{tc.expectedOutput}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
