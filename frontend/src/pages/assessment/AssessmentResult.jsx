import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useToast } from '../../components/ui/Toast';

const AssessmentResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchResult();
  }, [id]);

  const fetchResult = async () => {
    try {
      const res = await API.get(`/assessments/attempt/${id}`);
      const data = res.data?.data || res.data;
      setResult(data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load results', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !result) return <div className="p-8">Loading results...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Assessment Report</h1>
        <button 
          onClick={() => navigate('/assessment')}
          className="px-4 py-2 bg-bg-card border border-border-color rounded hover:bg-bg-base transition-colors"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-bg-card p-6 rounded-lg border border-border-color shadow-sm flex flex-col items-center justify-center">
          <p className="text-sm text-text-muted mb-2">Overall Score</p>
          <p className="text-4xl font-bold text-primary">{result.overallScore} <span className="text-lg text-text-muted font-normal">/ {result.maxScore}</span></p>
        </div>
        <div className="bg-bg-card p-6 rounded-lg border border-border-color shadow-sm flex flex-col items-center justify-center">
          <p className="text-sm text-text-muted mb-2">Accuracy</p>
          <p className="text-4xl font-bold text-accent">{result.accuracy.toFixed(1)}%</p>
        </div>
        <div className="bg-bg-card p-6 rounded-lg border border-border-color shadow-sm flex flex-col items-center justify-center">
          <p className="text-sm text-text-muted mb-2">Time Taken</p>
          <p className="text-4xl font-bold text-white">{Math.floor(result.duration / 60)}m {result.duration % 60}s</p>
        </div>
        <div className="bg-bg-card p-6 rounded-lg border border-border-color shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-sm text-text-muted mb-2">Verdict</p>
          <p className="text-xl font-medium text-emerald-400">
            {result.accuracy > 80 ? 'Excellent' : result.accuracy > 50 ? 'Needs Practice' : 'Requires Revision'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-bg-card p-6 rounded-lg border border-border-color">
          <h2 className="text-xl font-semibold mb-4">AI Analysis</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm text-text-muted mb-1">Feedback</h3>
              <p className="text-white">{result.aiFeedback}</p>
            </div>
            <div>
              <h3 className="text-sm text-text-muted mb-1">Topic Analysis</h3>
              <p className="text-white">{result.topicAnalysis}</p>
            </div>
            <div>
              <h3 className="text-sm text-text-muted mb-1">Difficulty Analysis</h3>
              <p className="text-white">{result.difficultyAnalysis}</p>
            </div>
          </div>
        </div>

        <div className="bg-bg-card p-6 rounded-lg border border-border-color space-y-6">
          <div>
             <h2 className="text-xl font-semibold mb-4 text-emerald-400">Strong Topics</h2>
             {result.strongTopics?.length > 0 ? (
               <div className="flex flex-wrap gap-2">
                 {result.strongTopics.map(t => (
                   <span key={t} className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-sm">{t}</span>
                 ))}
               </div>
             ) : <p className="text-text-muted text-sm">Not enough data.</p>}
          </div>

          <div>
             <h2 className="text-xl font-semibold mb-4 text-rose-400">Weak Topics</h2>
             {result.weakTopics?.length > 0 ? (
               <div className="flex flex-wrap gap-2">
                 {result.weakTopics.map(t => (
                   <span key={t} className="px-3 py-1 bg-rose-500/10 text-rose-400 rounded-full text-sm">{t}</span>
                 ))}
               </div>
             ) : <p className="text-text-muted text-sm">No significant weak areas detected.</p>}
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-bg-card p-6 rounded-lg border border-border-color space-y-6">
        <h2 className="text-xl font-semibold mb-2 text-primary">AI Recommendations & Next Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-bg-base border border-border-color rounded-lg">
            <h3 className="text-sm text-text-muted mb-2 uppercase tracking-wide font-semibold">Company Readiness</h3>
            <p className="text-white text-sm">{result.companyReadinessImpact || "No direct company readiness impact data provided for this assessment."}</p>
          </div>
          
          <div className="p-4 bg-bg-base border border-border-color rounded-lg">
            <h3 className="text-sm text-text-muted mb-2 uppercase tracking-wide font-semibold">Recommended Learning</h3>
            <ul className="list-disc list-inside text-sm text-white space-y-1">
              {result.recommendedLearningTopics?.length > 0 
                ? result.recommendedLearningTopics.map(t => <li key={t}>{t}</li>)
                : <li>Review weak topics in the Learning Module</li>}
            </ul>
          </div>
          
          <div className="p-4 bg-bg-base border border-border-color rounded-lg">
            <h3 className="text-sm text-text-muted mb-2 uppercase tracking-wide font-semibold">Recommended Coding</h3>
            <ul className="list-disc list-inside text-sm text-white space-y-1">
              {result.recommendedCodingProblems?.length > 0 
                ? result.recommendedCodingProblems.map(t => <li key={t}>{t}</li>)
                : <li>Practice problems related to your weak areas</li>}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-bg-card p-6 rounded-lg border border-border-color">
        <h2 className="text-xl font-semibold mb-6">Detailed Review</h2>
        <div className="space-y-6">
          {result.sections.map((section, sIdx) => (
            <div key={sIdx}>
              <h3 className="text-lg font-medium text-text-muted mb-4 border-b border-border-color pb-2">{section.name} Section</h3>
              <div className="space-y-4">
                {section.questions.map((q, qIdx) => (
                  <div key={q._id} className="p-4 bg-bg-base rounded border border-border-color flex justify-between items-start">
                    <div className="max-w-3xl">
                      <p className="font-medium mb-2"><span className="text-primary mr-2">Q{qIdx + 1}.</span>{q.questionId.questionText}</p>
                      <div className="text-sm space-y-1">
                        <p className="text-text-muted">Your Answer: <span className="text-white">{q.userAnswer || 'Skipped'}</span></p>
                        {q.questionId.correctAnswer && (
                           <p className="text-text-muted">Correct Answer: <span className="text-emerald-400">{q.questionId.correctAnswer}</span></p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        q.status === 'Correct' ? 'bg-emerald-500/10 text-emerald-400' :
                        q.status === 'Incorrect' ? 'bg-rose-500/10 text-rose-400' :
                        'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {q.status}
                      </span>
                      <span className="mt-2 text-sm text-text-muted">{q.score} / {q.maxScore} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssessmentResult;
