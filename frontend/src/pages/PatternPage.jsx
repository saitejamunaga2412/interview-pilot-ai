import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { codingService } from '../services/codingService';
import { LoadingState, ErrorState } from '../components/ui/States';
import { BookOpen, CheckCircle, AlertTriangle, Code2 } from 'lucide-react';
import TopicPractice from '../components/learning/TopicPractice';

export default function PatternPage() {
  const { patternId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPattern = async () => {
      setLoading(true);
      try {
        const res = await codingService.getPatternDetails(patternId);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPattern();
  }, [patternId]);

  if (loading) return <LoadingState text="Loading Pattern Details..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!data || !data.pattern) return <ErrorState message="Pattern not found" />;

  const { pattern, problems } = data;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-12 pb-32">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-text-muted font-medium">
          <Link to="/arena" className="hover:text-primary-600 transition-colors">Coding Arena</Link>
          <span>/</span>
          <span className="text-primary-600 dark:text-primary-400">{pattern.name}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">{pattern.name} Pattern</h1>
        <p className="text-xl text-text-secondary max-w-3xl">{pattern.description}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-primary-50 dark:bg-primary-900/10 p-6 md:p-8 rounded-2xl border border-primary-100 dark:border-primary-800/30">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-primary-800 dark:text-primary-300">
              <BookOpen size={24} /> When to Use
            </h2>
            <ul className="space-y-3">
              {pattern.whenToUse?.map((tip, idx) => (
                <li key={idx} className="flex gap-3 text-text-primary leading-relaxed">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0"></span>
                  {tip}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-text-primary">Visual Intuition</h2>
            <div className="bg-surface p-6 rounded-xl border border-border shadow-sm font-mono text-text-secondary overflow-x-auto">
              <pre>{pattern.visualExample}</pre>
            </div>
          </section>

          {/* Practice Section - reuses the TopicPractice component! */}
          <section className="pt-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-text-primary">
              <Code2 className="text-secondary-500" /> Practice Problems
            </h2>
            <TopicPractice questions={problems} />
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
            <h3 className="font-semibold text-text-primary flex items-center gap-2 mb-4">
              <CheckCircle size={18} className="text-success-500" /> Recognition Tips
            </h3>
            <ul className="space-y-3">
              {pattern.recognitionTips?.map((tip, idx) => (
                <li key={idx} className="text-sm text-text-secondary border-b border-border/50 pb-2 last:border-0 last:pb-0">
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-error-50 dark:bg-error-900/10 border border-error-200 dark:border-error-800/30 p-6 rounded-2xl shadow-sm">
            <h3 className="font-semibold text-error-700 dark:text-error-400 flex items-center gap-2 mb-4">
              <AlertTriangle size={18} /> Common Mistakes
            </h3>
            <ul className="space-y-3">
              {pattern.commonMistakes?.map((mistake, idx) => (
                <li key={idx} className="text-sm text-text-secondary">
                  • {mistake}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
