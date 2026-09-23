import React from 'react';
import { BrainCircuit, Code2, CheckCircle, FileText } from 'lucide-react';

export default function TopicTheory({ lesson, cheatSheet }) {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {lesson && (
        <>
          <section className="bg-primary-50 dark:bg-primary-900/10 p-6 md:p-8 rounded-2xl border border-primary-100 dark:border-primary-800/30">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <BrainCircuit className="text-primary-600" />
              Intuition
            </h2>
            <p className="text-lg leading-relaxed">{lesson.beginnerExplanation}</p>
            {lesson.realLifeAnalogy && (
              <div className="mt-6 p-4 bg-white dark:bg-surface rounded-xl border border-border shadow-sm">
                <h3 className="font-semibold text-primary-600 mb-2">Real Life Analogy</h3>
                <p className="text-text-secondary leading-relaxed">{lesson.realLifeAnalogy}</p>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Step-by-Step Breakdown</h2>
            <div className="space-y-4">
              {lesson.stepByStep?.map((step, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-surface border border-border rounded-xl shadow-sm">
                  <div className="shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded-full flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <p className="pt-1 text-text-primary leading-relaxed">{step.replace(/^\d+\.\s*/, '')}</p>
                </div>
              ))}
            </div>
          </section>

          {lesson.dryRun && (
            <section className="bg-surface-hover p-6 rounded-2xl border border-border">
              <h2 className="text-2xl font-semibold mb-4">Dry Run</h2>
              <pre className="font-mono text-sm whitespace-pre-wrap text-text-secondary bg-surface p-4 rounded-xl border border-border">
                {lesson.dryRun}
              </pre>
            </section>
          )}

          {lesson.codeExamples?.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Code2 className="text-secondary-500" />
                Code Implementation
              </h2>
              {lesson.codeExamples.map((ex, idx) => (
                <div key={idx} className="overflow-hidden rounded-xl border border-border shadow-sm mb-6">
                  <div className="bg-surface-hover px-4 py-2 border-b border-border flex justify-between items-center">
                    <span className="font-mono text-sm font-semibold text-text-secondary">{ex.language}</span>
                  </div>
                  <div className="p-4 bg-bg-base overflow-x-auto">
                    <pre className="font-mono text-sm text-text-primary"><code>{ex.code}</code></pre>
                  </div>
                  <div className="p-4 bg-surface border-t border-border text-sm text-text-secondary">
                    {ex.explanation}
                  </div>
                </div>
              ))}
            </section>
          )}
        </>
      )}

      {cheatSheet && (
        <section className="mt-12 bg-success-50 dark:bg-success-900/10 p-6 md:p-8 rounded-2xl border border-success-200 dark:border-success-800/30">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-success-700 dark:text-success-400">
            <FileText />
            Revision Cheat Sheet
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-text-primary mb-3">Key Notes</h3>
              <ul className="space-y-2">
                {cheatSheet.revisionNotes?.map((note, idx) => (
                  <li key={idx} className="flex gap-2 text-text-secondary">
                    <CheckCircle size={16} className="text-success-500 shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {cheatSheet.formulas?.length > 0 && (
              <div>
                <h3 className="font-semibold text-text-primary mb-3">Formulas / Shortcuts</h3>
                <div className="space-y-2">
                  {cheatSheet.formulas.map((form, idx) => (
                    <div key={idx} className="font-mono text-sm bg-surface px-3 py-2 rounded-lg border border-success-200 dark:border-success-800/30 text-text-primary shadow-sm">
                      {form}
                    </div>
                  ))}
                  {cheatSheet.shortcuts?.map((short, idx) => (
                    <div key={idx} className="text-sm bg-surface px-3 py-2 rounded-lg border border-success-200 dark:border-success-800/30 text-text-primary shadow-sm">
                      {short}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
