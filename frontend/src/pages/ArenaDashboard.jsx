import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { codingService } from '../services/codingService';
import { LoadingState, ErrorState } from '../components/ui/States';
import { Skeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import PageHeader from '../components/ui/PageHeader';
import { Code2, Target, CheckCircle, ChevronRight, Activity, Zap, BookOpen } from 'lucide-react';

const DIFFICULTY_CONFIG = {
  easy: { label: 'Easy', color: 'success' },
  medium: { label: 'Medium', color: 'warning' },
  hard: { label: 'Hard', color: 'error' },
};

export default function ArenaDashboard() {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatterns = async () => {
      try {
        const res = await codingService.getPatterns();
        let fetchedPatterns = [];
        if (Array.isArray(res)) fetchedPatterns = res;
        else if (Array.isArray(res?.data)) fetchedPatterns = res.data;
        else if (Array.isArray(res?.data?.patterns)) fetchedPatterns = res.data.patterns;
        else if (Array.isArray(res?.patterns)) fetchedPatterns = res.patterns;
        else if (Array.isArray(res?.data?.questions)) fetchedPatterns = res.data.questions;
        setPatterns(fetchedPatterns);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPatterns();
  }, []);

  if (error) return (
    <div className="page-container">
      <ErrorState message={error} onRetry={() => window.location.reload()} />
    </div>
  );

  return (
    <div className="page-container">
      <PageHeader
        title="Coding Arena"
        subtitle="Master algorithms through pattern-based learning"
        icon={Code2}
        actions={
          <Link to="/learning" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            <BookOpen className="w-4 h-4" /> View Learning
          </Link>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Target, label: 'Attempted', value: '—', color: 'text-text-secondary', bg: 'bg-surface-hover' },
          { icon: CheckCircle, label: 'Solved', value: '—', color: 'text-success-600', bg: 'bg-success-50 dark:bg-success-900/20' },
          { icon: Activity, label: 'Accuracy', value: '—', color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
          { icon: Zap, label: 'Patterns', value: loading ? '…' : patterns.length, color: 'text-warning-600', bg: 'bg-warning-50 dark:bg-warning-900/20' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="metric-card">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4.5 h-4.5 ${color}`} />
            </div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Patterns grid */}
      <h2 className="section-heading">
        <Zap className="w-5 h-5 text-primary-500" />
        Learning Patterns
      </h2>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0,1,2,3,4,5].map(i => <Skeleton key={i} className="h-44 rounded-xl" />)}
        </div>
      ) : patterns.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <Code2 className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="font-semibold text-text-primary">No patterns loaded yet</p>
          <p className="text-sm text-text-muted mt-1">Check back soon or try refreshing</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patterns.map((pattern) => (
            <Link
              key={pattern._id}
              to={`/patterns/${pattern._id}`}
              className="card-interactive flex flex-col h-full p-5 no-underline"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-base font-semibold text-text-primary group-hover:text-primary-600 transition-colors leading-tight">
                  {pattern.name}
                </h3>
                {pattern.difficulty && (
                  <Badge
                    variant={DIFFICULTY_CONFIG[pattern.difficulty?.toLowerCase()]?.color || 'secondary'}
                    pill
                    className="ml-2 shrink-0 text-xs"
                  >
                    {DIFFICULTY_CONFIG[pattern.difficulty?.toLowerCase()]?.label || pattern.difficulty}
                  </Badge>
                )}
              </div>

              <p className="text-sm text-text-secondary line-clamp-2 flex-1 mb-4">
                {pattern.description}
              </p>

              {pattern.problemCount !== undefined && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                    <span>{pattern.solvedCount || 0}/{pattern.problemCount} solved</span>
                    <span>{pattern.problemCount ? Math.round(((pattern.solvedCount || 0) / pattern.problemCount) * 100) : 0}%</span>
                  </div>
                  <Progress
                    value={pattern.solvedCount || 0}
                    max={pattern.problemCount || 1}
                    size="sm"
                    colorAuto
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                <span className="text-xs font-medium text-text-muted">
                  {pattern.totalProblems || pattern.problemCount || 0} problems
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-primary-600">
                  Practice <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
