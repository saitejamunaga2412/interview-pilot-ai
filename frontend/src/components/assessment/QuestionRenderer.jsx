import React from 'react';
import SharedCodeEditor from '../coding/SharedCodeEditor';

export default function QuestionRenderer({ question, answer, onAnswerChange }) {
  if (!question) return null;

  // For Coding questions, use the SharedCodeEditor
  if (question.type === 'Coding') {
    return (
      <div className="h-96 border border-border-color rounded-lg overflow-hidden mt-4">
        <SharedCodeEditor 
          questionId={question._id}
          code={answer?.code || ''}
          onChange={(val) => onAnswerChange({ code: val, language: answer?.language || 'javascript' })}
          language={answer?.language || 'javascript'}
          onLanguageChange={(lang) => onAnswerChange({ ...answer, language: lang })}
          mode="assessment"
          // We disable running code locally during the mock test, 
          // or we can allow it but not save the output as the final evaluation.
          // The prompt says "Reuse editor. No hints." - we'll disable the run button by not passing onRun.
        />
      </div>
    );
  }

  // For MCQ questions
  if (question.type === 'MCQ') {
    return (
      <div className="space-y-3 mt-4">
        {question.options?.map((option, idx) => (
          <label 
            key={idx} 
            className={`block p-4 rounded border cursor-pointer transition-colors ${
              answer === option 
                ? 'border-primary bg-primary/10 text-primary' 
                : 'border-border-color hover:border-text-muted'
            }`}
          >
            <input 
              type="radio" 
              name={`q-${question._id}`}
              value={option}
              checked={answer === option}
              onChange={(e) => onAnswerChange(e.target.value)}
              className="hidden"
            />
            {option}
          </label>
        ))}
      </div>
    );
  }

  // For Subjective / Theory / Fill Blank
  return (
    <div className="mt-4">
      <textarea
        className="w-full h-48 p-4 text-sm bg-bg-base border border-border-color rounded focus:border-primary focus:ring-1 focus:ring-primary text-text-primary"
        placeholder="Write your answer here..."
        value={answer || ''}
        onChange={(e) => onAnswerChange(e.target.value)}
      />
    </div>
  );
}
