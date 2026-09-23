import React from 'react';
import { Link } from 'react-router-dom';
import { Calculator, ArrowRight, ShieldCheck, Target, AlertTriangle } from 'lucide-react';

export const AptitudeReasoningCard = ({ globalDashboard, className = '' }) => {
  const aptStats = globalDashboard?.aptitudeStats || {};
  const rsnStats = globalDashboard?.reasoningStats || {};
  const activeTarget = aptStats.activeTarget || rsnStats.activeTarget;

  const targetName = activeTarget?.targetName || "General Placement Aptitude";
  const readiness = activeTarget?.targetReadinessScore || aptStats.accuracy || 0;
  const weakestApt = aptStats.weakestTopic;

  return (
    <div className={`bg-surface rounded-2xl p-5 border border-border space-y-4 shadow-sm flex flex-col justify-between ${className}`}>
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
              <Calculator size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-text-primary">Aptitude & Reasoning</h3>
              <span className="text-[11px] text-text-muted">Target-Aware Practice</span>
            </div>
          </div>
          <Link 
            to="/aptitude" 
            className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <span>Hub</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* Active Target Banner */}
        <div className="p-3 rounded-xl bg-bg-base border border-border space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-primary-600 flex items-center gap-1">
              <Target size={11} /> Target Goal
            </span>
            <span className="text-[11px] font-black text-emerald-600">{readiness}% Readiness</span>
          </div>
          <strong className="text-xs text-text-primary block truncate">{targetName}</strong>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-2 text-center pt-2">
          <div className="p-2 rounded-xl bg-bg-base border border-border">
            <span className="text-[10px] uppercase font-bold text-text-muted block">Quant Acc</span>
            <span className="text-base font-black text-blue-600">{aptStats.accuracy || 0}%</span>
            <span className="text-[10px] text-text-muted block">{aptStats.questionsSolved || 0} Solved</span>
          </div>

          <div className="p-2 rounded-xl bg-bg-base border border-border">
            <span className="text-[10px] uppercase font-bold text-text-muted block">Reasoning Acc</span>
            <span className="text-base font-black text-purple-600">{rsnStats.accuracy || 0}%</span>
            <span className="text-[10px] text-text-muted block">{rsnStats.questionsSolved || 0} Solved</span>
          </div>
        </div>

        {/* Weak Topic Alert */}
        {weakestApt ? (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 text-xs flex items-center justify-between gap-2">
            <div className="truncate">
              <span className="text-[10px] font-bold text-rose-700 uppercase block">Weak Area:</span>
              <strong className="text-rose-900 dark:text-rose-100 truncate block">{weakestApt.topicId}</strong>
            </div>
            <Link
              to={`/aptitude/${weakestApt.topicId}`}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-lg shrink-0 shadow-sm"
            >
              Revise
            </Link>
          </div>
        ) : (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 text-xs flex items-center justify-between gap-2">
            <div className="truncate">
              <span className="text-[10px] font-bold text-emerald-700 uppercase block">Next Practice:</span>
              <strong className="text-emerald-900 dark:text-emerald-100 truncate block">Percentages & Series</strong>
            </div>
            <Link
              to="/aptitude/percentages"
              className="px-2.5 py-1 bg-primary-600 hover:bg-primary-700 text-white font-bold text-[11px] rounded-lg shrink-0 shadow-sm"
            >
              Start
            </Link>
          </div>
        )}
      </div>

      <Link
        to="/aptitude"
        className="w-full py-2 bg-surface-hover hover:bg-primary-50 dark:hover:bg-primary-950/30 text-primary-600 border border-border font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors mt-2"
      >
        <span>Open Target Arena</span>
        <ArrowRight size={12} />
      </Link>
    </div>
  );
};
