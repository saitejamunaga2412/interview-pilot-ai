import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Target, ArrowRight, Sparkles, ShieldAlert, CheckCircle2, Play, BookOpen } from 'lucide-react';
import { cn } from '../../utils/cn';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

function ReadinessRing({ value }) {
  const radius = 38;
  const stroke = 7;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const hasScore = value !== null && value !== undefined && value > 0;
  const score = hasScore ? Math.round(value) : 0;
  const strokeDash = hasScore ? circumference - (score / 100) * circumference : circumference;
  
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#6366f1' : score >= 25 ? '#f59e0b' : '#38bdf8';

  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg width={radius * 2} height={radius * 2} className="-rotate-90">
        <circle
          cx={radius} cy={radius} r={normalizedRadius}
          fill="none" stroke="var(--border)" strokeWidth={stroke}
        />
        {hasScore && (
          <circle
            cx={radius} cy={radius} r={normalizedRadius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDash}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)' }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {hasScore ? (
          <>
            <span className="text-lg font-bold font-mono text-text-primary leading-none">{score}</span>
            <span className="text-[9px] text-text-muted font-mono leading-none mt-1">/ 100</span>
          </>
        ) : (
          <span className="text-[10px] font-mono text-cyan-400 font-semibold leading-tight text-center px-1">
            DIAGNOSTIC
          </span>
        )}
      </div>
    </div>
  );
}

export function DashboardHeader({ user, streak = 0, readiness, nextAction, onTakeAction }) {
  const navigate = useNavigate();
  const greeting = getGreeting();
  const userName = user?.name ? user.name.split(' ')[0] : 'Candidate';
  const targetRole = user?.career?.targetRole || null;

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 relative overflow-hidden shadow-sm">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Left: Greeting & Target Telemetry (WHERE AM I) */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-xl shrink-0 shadow-md shadow-primary-500/20">
            {userName.slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1">
            <p className="text-xs font-mono text-text-muted uppercase tracking-wider">{greeting}, candidate</p>
            <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
              {userName}
            </h1>
            <div className="flex items-center gap-2 flex-wrap pt-0.5">
              {targetRole ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-500/10 text-primary-400 border border-primary-500/20">
                  <Target className="w-3.5 h-3.5" />
                  <span>Target: {targetRole}</span>
                </span>
              ) : (
                <button
                  onClick={() => navigate('/profile')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-2 text-text-muted hover:text-primary-400 border border-border transition-colors"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>+ Set Target Company / Role</span>
                </button>
              )}

              {streak > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{streak} Day Streak</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Readiness Score (HOW READY AM I) */}
        <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-surface-2/60 border border-border shrink-0 self-stretch sm:self-auto">
          <ReadinessRing value={readiness} />
          <div>
            <span className="text-[10px] font-mono uppercase text-text-muted tracking-wider block">Placement Readiness</span>
            <p className="text-sm font-bold text-text-primary">
              {readiness && readiness > 0 ? (
                readiness >= 75 ? 'Tier-1 Placement Ready' : readiness >= 50 ? 'Strong Foundation' : 'Developing Profile'
              ) : (
                'Baseline Assessment'
              )}
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              {readiness && readiness > 0 ? 'Synchronized with target benchmarks' : 'Take assessments to calculate score'}
            </p>
          </div>
        </div>

        {/* Right: Next Best Action (WHAT SHOULD I DO NEXT) */}
        <div className="p-4 rounded-2xl border border-primary-500/30 bg-primary-500/5 max-w-sm w-full lg:w-auto shrink-0 flex flex-col justify-between space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-primary-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NEXT RECOMMENDED ACTION</span>
          </div>
          <p className="text-xs font-medium text-text-primary line-clamp-2">
            {nextAction?.title || "Complete your profile or start adaptive aptitude practice"}
          </p>
          <button
            onClick={() => {
              if (nextAction?.path) navigate(nextAction.path);
              else if (onTakeAction) onTakeAction();
              else navigate('/aptitude');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors pt-1"
          >
            <span>{nextAction?.cta || "Start Practice"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
