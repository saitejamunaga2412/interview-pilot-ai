import React from "react";
import { useCareerData } from "../hooks/useCareerData";
import { LoadingState } from "../components/ui/States";
import { Progress } from "../components/ui/Progress";
import PageHeader from "../components/ui/PageHeader";
import { Briefcase, Target, TrendingUp, BookOpen, Star, Sparkles, AlertTriangle, Zap, CheckCircle2 } from "lucide-react";

function SkillBar({ skill, level }) {
  const pct = { Beginner: 25, Intermediate: 55, Advanced: 80, Expert: 95 }[level] || 40;
  return (
    <div className="space-y-1.5 p-3 rounded-xl border border-border bg-bg-base/40">
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold text-text-primary">{skill}</span>
        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
          pct >= 75 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
          pct >= 45 ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
          "bg-amber-500/10 text-amber-400 border border-amber-500/20"
        }`}>
          {level}
        </span>
      </div>
      <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden border border-border">
        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function CareerAdvisor() {
  const { data, loading, handleSeed } = useCareerData();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-16 rounded-xl bg-surface animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map(i => <div key={i} className="h-48 rounded-xl bg-surface animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Career Advisor" icon={Briefcase} subtitle="Personalized skill insights and target role alignment" />
        <div className="bg-surface rounded-xl border border-border p-12 text-center max-w-2xl mx-auto space-y-4">
          <Briefcase className="w-12 h-12 text-text-muted mx-auto" />
          <h3 className="font-bold text-text-primary text-lg">No career data recorded yet</h3>
          <p className="text-sm text-text-secondary">
            Set your target role and complete practice tasks to build your personalized career advisor dashboard.
          </p>
          <button
            onClick={handleSeed}
            className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-md shadow-primary-500/20 transition-all cursor-pointer"
          >
            Load Career Insights
          </button>
        </div>
      </div>
    );
  }

  const { careerGoal, skillAssessment, roadmap, recommendedRoles, studyPlan } = data;
  const targetRole = careerGoal?.targetRole || "Software Engineer";
  const readinessScore = careerGoal?.readinessScore ?? 0;

  // Filter skills list for gaps (Intermediate/Beginner)
  const skillsList = skillAssessment?.skills || [];
  const skillGaps = skillsList.filter(s => s.level === "Beginner" || s.level === "Intermediate");
  const strongSkills = skillsList.filter(s => s.level === "Advanced" || s.level === "Expert");

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      
      {/* ── 1. Career Constellation Hero Header ── */}
      <div className="relative rounded-2xl border border-border bg-surface overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-8">
          
          {/* Left: Intelligence Context */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/15 text-primary-300 border border-primary-500/30 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>CAREER ADVISOR INSIGHTS</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary font-display">
              Career Advisor
            </h1>

            <p className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-xl">
              Understand how your current skills align with actual target placement thresholds. Identify keyword and practical capability gaps immediately.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-border">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                <span>Target: <strong className="text-text-primary">{targetRole}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-border">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Readiness: <strong className="text-text-primary">{readinessScore}%</strong></span>
              </div>
            </div>
          </div>

          {/* Right: Constellation Artwork Visual */}
          <div className="lg:col-span-5 relative">
            <div className="rounded-2xl border border-border bg-surface-2/60 overflow-hidden shadow-xl relative aspect-[16/10]">
              <img
                src="/assets/anime/career_constellation.jpg"
                alt="AI Career Constellation Mapping"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080A12] via-transparent to-transparent opacity-75" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-mono px-3 py-1.5 rounded-lg bg-surface/90 backdrop-blur-md border border-border">
                <span className="text-text-primary font-semibold">Active Node: Placement Ready</span>
                <span className="text-primary-400 font-bold">[RADAR LIVE]</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── 2. Skills Calibration & Gap Analysis ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Current profile skills */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border p-5 space-y-4">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-mono text-primary-400 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary-400" />
            <span>Profile Skills Assessment</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {skillsList.length > 0 ? (
              skillsList.map((s, i) => (
                <SkillBar key={i} skill={s.name || s.skill} level={s.level || s.proficiency} />
              ))
            ) : (
              <p className="text-xs text-text-muted">No skills assessed yet. Complete practice sessions or configure profile.</p>
            )}
          </div>
        </div>

        {/* Skill gaps */}
        <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-mono text-primary-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Identified Skill Gaps</span>
          </h3>

          <div className="space-y-3">
            {skillGaps.length > 0 ? (
              skillGaps.map((s, i) => (
                <div key={i} className="p-3 rounded-xl bg-surface-2 border border-border/80 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <span className="text-[10px] text-amber-400 font-mono font-bold">!</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">{s.name || s.skill}</h4>
                    <p className="text-[10px] text-text-secondary mt-0.5">Proficiency: {s.level}. Requires study plan acceleration.</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center border border-dashed border-border rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-text-primary">No severe gaps detected</p>
                <p className="text-[10px] text-text-muted mt-0.5">Your core skills meet current benchmark SDE thresholds.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── 3. Recommended Actions (Study plan) ── */}
      {studyPlan?.length > 0 && (
        <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-mono text-primary-400 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Recommended AI Action Roadmap</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {studyPlan.slice(0, 6).map((plan, i) => (
              <div 
                key={i} 
                className={`p-4 rounded-xl border flex flex-col justify-between h-36 ${
                  plan.status === 'Completed' 
                    ? 'border-emerald-500/35 bg-emerald-500/5' 
                    : 'border-border bg-surface-2'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-text-primary">{plan.topic}</h4>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      plan.priority === 'High' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      plan.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-surface text-text-muted border border-border'
                    }`}>
                      {plan.priority} Priority
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary mt-1.5 line-clamp-2 leading-relaxed">
                    {plan.recommendedResources?.[0] || plan.description || "Study target topic resources."}
                  </p>
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono text-text-muted pt-2 border-t border-border/40 mt-2">
                  <span>Status: {plan.status}</span>
                  {plan.status !== 'Completed' && (
                    <span className="text-primary-400 font-bold hover:underline">Complete Module</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
