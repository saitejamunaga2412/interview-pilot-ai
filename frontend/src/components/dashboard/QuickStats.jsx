import React from 'react';
import { cn } from '../../utils/cn';
import { MessageSquare, Star, Trophy, Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function StatCard({ title, value, suffix = '', icon: Icon, color = 'primary', trend, onClick, className }) {
  const colorMap = {
    primary: { bg: 'bg-primary-100 dark:bg-primary-900/20', icon: 'text-primary-600 dark:text-primary-400', border: 'hover:border-primary-300 dark:hover:border-primary-700' },
    success: { bg: 'bg-success-50 dark:bg-success-900/20', icon: 'text-success-600 dark:text-success-400', border: 'hover:border-success-300 dark:hover:border-success-700' },
    warning: { bg: 'bg-warning-50 dark:bg-warning-900/20', icon: 'text-warning-600 dark:text-warning-400', border: 'hover:border-warning-300 dark:hover:border-warning-700' },
    info: { bg: 'bg-info-50 dark:bg-info-900/20', icon: 'text-info-600 dark:text-info-400', border: 'hover:border-info-300 dark:hover:border-info-700' },
  };
  const c = colorMap[color] || colorMap.primary;
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? 'text-success-500' : trend < 0 ? 'text-error-500' : 'text-text-muted';

  return (
    <div
      className={cn(
        'metric-card flex flex-col gap-3 transition-all',
        onClick && 'cursor-pointer',
        c.border,
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', c.bg)}>
          <Icon className={cn('w-5 h-5', c.icon)} />
        </div>
        {trend !== undefined && (
          <div className={cn('flex items-center gap-1 text-xs font-medium', trendColor)}>
            <TrendIcon className="w-3.5 h-3.5" />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-medium text-text-muted uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-text-primary mt-0.5">
          {value !== undefined && value !== null ? value : '—'}
          {suffix && <span className="text-sm font-medium text-text-secondary ml-0.5">{suffix}</span>}
        </p>
      </div>
    </div>
  );
}

export const QuickStats = ({ statistics, memory, className }) => {
  const navigate = useNavigate();
  const { totalInterviews = 0, avgScore = 0, bestScore = 0 } = statistics || {};
  const placementReadiness = memory?.placementReadinessScore;

  return (
    <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      <StatCard
        title="Interviews Done"
        value={totalInterviews}
        icon={MessageSquare}
        color="primary"
        onClick={() => navigate('/history')}
      />
      <StatCard
        title="Average Score"
        value={avgScore ? `${avgScore}` : '—'}
        suffix={avgScore ? '%' : ''}
        icon={Star}
        color="info"
        onClick={() => navigate('/history')}
      />
      <StatCard
        title="Best Score"
        value={bestScore ? `${bestScore}` : '—'}
        suffix={bestScore ? '%' : ''}
        icon={Trophy}
        color="success"
        onClick={() => navigate('/history')}
      />
      <StatCard
        title="Placement Score"
        value={placementReadiness !== undefined ? placementReadiness : '—'}
        suffix={placementReadiness !== undefined ? '/100' : ''}
        icon={Target}
        color="warning"
      />
    </div>
  );
};
