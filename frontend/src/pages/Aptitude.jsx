import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Calculator, Brain, BookOpen, Rocket, Trophy, CheckCircle2, 
  AlertTriangle, ArrowRight, Search, SlidersHorizontal, Building2, 
  Flame, Calendar, RotateCcw, ShieldCheck, Target, Sparkles, Filter, 
  Layers, Check, X, ChevronRight, Activity
} from 'lucide-react';
import API from '../services/api';
import TargetSelectionModal from '../components/aptitude/TargetSelectionModal';
import ExamSimulationModal from '../components/aptitude/ExamSimulationModal';
import { LoadingState } from '../components/ui/States';
import { cn } from '../utils/cn';

export default function Aptitude() {
  const navigate = useNavigate();
  const [hubView, setHubView] = useState("topics"); // 'topics' | 'mistakes' | 'roadmap'
  const [activeCategory, setActiveCategory] = useState("all"); // 'all' | 'quant' | 'reasoning' | 'verbal' | 'data'
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [aptitudeTopics, setAptitudeTopics] = useState([]);
  const [reasoningTopics, setReasoningTopics] = useState([]);
  const [aptitudeProgress, setAptitudeProgress] = useState(null);
  const [reasoningProgress, setReasoningProgress] = useState(null);
  const [activeTarget, setActiveTarget] = useState(null);
  
  // Mistake Notebook & Roadmap State
  const [mistakes, setMistakes] = useState([]);
  const [todaysRevisionQueue, setTodaysRevisionQueue] = useState(null);
  const [roadmapData, setRoadmapData] = useState(null);

  // Modals
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false);

  useEffect(() => {
    fetchHubData();
  }, []);

  const fetchHubData = async () => {
    setLoading(true);
    try {
      const [aptRes, rsnRes, aptProg, rsnProg, targetRes, mistakesRes, revisionRes, roadmapRes] = await Promise.all([
        API.get('/aptitude/topics').catch(() => ({ data: { data: [] } })),
        API.get('/reasoning/topics').catch(() => ({ data: { data: [] } })),
        API.get('/aptitude/progress').catch(() => ({ data: { data: null } })),
        API.get('/reasoning/progress').catch(() => ({ data: { data: null } })),
        API.get('/exam-patterns/targets/active').catch(() => ({ data: { data: null } })),
        API.get('/aptitude/mistakes').catch(() => ({ data: { data: [] } })),
        API.get('/aptitude/mistakes/today').catch(() => ({ data: { data: null } })),
        API.get('/aptitude/roadmap').catch(() => ({ data: { data: null } }))
      ]);

      setAptitudeTopics(aptRes.data?.data || aptRes.data || []);
      setReasoningTopics(rsnRes.data?.data || rsnRes.data || []);
      setAptitudeProgress(aptProg.data?.data || aptProg.data || null);
      setReasoningProgress(rsnProg.data?.data || rsnProg.data || null);
      setActiveTarget(targetRes.data?.data || targetRes.data || null);
      setMistakes(mistakesRes.data?.data || mistakesRes.data || []);
      setTodaysRevisionQueue(revisionRes.data?.data || revisionRes.data || null);
      setRoadmapData(roadmapRes.data?.data || roadmapRes.data || null);
    } catch (err) {
      console.error("Failed to load aptitude hub data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewMistake = async (mistakeId, isCorrect) => {
    try {
      await API.post(`/aptitude/mistakes/${mistakeId}/review`, { isCorrect });
      fetchHubData();
    } catch (err) {
      console.error("Error updating mistake review", err);
    }
  };

  const allTopics = [
    ...(Array.isArray(aptitudeTopics) ? aptitudeTopics : []).map(t => ({ ...t, domainType: "Aptitude" })),
    ...(Array.isArray(reasoningTopics) ? reasoningTopics : []).map(t => ({ ...t, domainType: "Reasoning" }))
  ];

  const filteredTopics = allTopics.filter(t => {
    const matchesSearch = (t.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.subCategory || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.conceptTags || []).some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeCategory === "quant") return t.domainType === "Aptitude" && t.subCategory !== "Data Interpretation";
    if (activeCategory === "reasoning") return t.domainType === "Reasoning";
    if (activeCategory === "data") return t.subCategory === "Data Interpretation" || (t.topicId && t.topicId.includes("data"));
    if (activeCategory === "verbal") return t.subCategory?.includes("Verbal") || (t.topicId && t.topicId.includes("verbal"));
    return true;
  });

  const readiness = {
    accuracy: aptitudeProgress?.overallAccuracy ?? (reasoningProgress?.overallAccuracy ?? 78),
    streakDays: aptitudeProgress?.streakDays ?? (reasoningProgress?.streakDays ?? 3),
    totalSolved: aptitudeProgress?.totalSolved ?? (aptitudeProgress?.solvedQuestions?.length ?? 45)
  };

  const getMasteryBadgeClass = (level, pct) => {
    if (pct >= 85 || level === "Mastered" || level === "Strong") {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }
    if (pct >= 50 || level === "Developing" || level === "Beginner") {
      return "bg-primary-500/10 text-primary-400 border-primary-500/20";
    }
    if (level === "Needs Revision") {
      return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    }
    return "bg-surface-2 text-text-muted border-border";
  };

  const targetReadiness = activeTarget?.targetReadinessScore || 0;

  // Detect weak concept or focus concept
  const weakConcept = allTopics.find(t => t.progress?.status === "Needs Revision") || 
                      allTopics.find(t => t.progress?.masteryPercentage > 0 && t.progress?.masteryPercentage < 60) || 
                      allTopics.find(t => t.topicId === "successive-percentage") ||
                      allTopics[0] || { title: "Successive Percentage", topicId: "successive-percentage", domainType: "Aptitude" };

  const handleStartPractice = () => {
    if (weakConcept) {
      const route = weakConcept.domainType === "Reasoning" ? `/reasoning/${weakConcept.topicId}` : `/aptitude/${weakConcept.topicId}`;
      navigate(route);
    }
  };

  return (
    <div className="page-container space-y-6 pb-20">
      
      {/* Standard Header */}
      <div className="space-y-1 text-left">
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight font-display">
          APTITUDE PRACTICE
        </h1>
        <p className="text-xs text-text-secondary">
          Improve the quantitative and logical skills used in placement tests.
        </p>
      </div>
      
      {/* ── Above the Fold: Placement cockpit ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Pane: Target & Mastery */}
        <div className="lg:col-span-7 rounded-2xl border border-border bg-surface p-6 relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[220px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-2.5 relative z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-primary-400 bg-primary-500/10 px-2.5 py-0.5 rounded-full border border-primary-500/20">
                TARGET IDENTIFIED
              </span>
              {activeTarget?.targetType === "government" ? (
                <span className="text-xs font-mono font-semibold bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                  🏛️ Govt Exam Mode
                </span>
              ) : (
                <span className="text-xs font-mono font-semibold bg-cyan-500/10 text-cyan-400 px-2.5 py-0.5 rounded-full border border-cyan-500/20 flex items-center gap-1">
                  🏢 Corporate Target
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight font-display">
              {activeTarget?.targetName || "TCS NQT — Placement Assessment"}
            </h1>

            <p className="text-text-secondary text-xs sm:text-sm leading-relaxed max-w-xl">
              Target-aware curriculum with previous-year question provenance, formulas, step-by-step solutions, and exam simulations.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 pt-4 border-t border-border mt-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="text-left">
                <span className="text-[10px] text-text-muted uppercase font-mono tracking-wider">CURRENT MASTERY</span>
                <p className="text-2xl font-extrabold font-mono text-emerald-400">{targetReadiness}%</p>
              </div>
              <div className="w-24 bg-bg-base h-2 rounded-full overflow-hidden border border-border">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${targetReadiness}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSimulationModalOpen(true)}
                className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] font-bold rounded-lg shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Rocket className="w-3.5 h-3.5" />
                <span>Simulate Exam</span>
              </button>

              <button
                onClick={() => setIsTargetModalOpen(true)}
                className="px-2.5 py-2 rounded-lg text-[11px] font-semibold text-text-secondary hover:text-text-primary bg-surface-2 hover:bg-surface-hover border border-border transition-colors cursor-pointer"
              >
                Change Target
              </button>
            </div>
          </div>
        </div>

        {/* Right Pane: Today's Challenge */}
        <div className="lg:col-span-5 rounded-2xl border border-border-prominent bg-surface-2 p-6 flex flex-col justify-between min-h-[220px] shadow-lg shadow-primary-500/5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-cyan-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>TODAY'S CHALLENGE</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                Daily Focus
              </span>
            </div>

            <div>
              <span className="text-xs font-mono text-text-muted uppercase">Recommended Topic</span>
              <h3 className="text-lg font-extrabold text-text-primary font-display mt-0.5">
                {weakConcept?.title || "Quantitative & Logic Mastery"}
              </h3>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 py-1 text-center font-mono">
              <div className="p-2 rounded-lg bg-surface border border-border">
                <span className="text-[9px] text-text-muted block">Accuracy</span>
                <span className="text-xs font-bold text-emerald-400">{readiness?.accuracy ?? 78}%</span>
              </div>
              <div className="p-2 rounded-lg bg-surface border border-border">
                <span className="text-[9px] text-text-muted block">Streak</span>
                <span className="text-xs font-bold text-amber-400">{readiness?.streakDays ?? 3} Days</span>
              </div>
              <div className="p-2 rounded-lg bg-surface border border-border">
                <span className="text-[9px] text-text-muted block">Solved</span>
                <span className="text-xs font-bold text-primary-300">{readiness?.totalSolved ?? 45}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleStartPractice}
            className="w-full mt-4 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-primary-600/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>START PRACTICE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* ── Section 2: Hub View Segmented Tabs ── */}
      <div className="flex gap-2 p-1.5 bg-surface rounded-xl border border-border shadow-sm overflow-x-auto no-scrollbar">
        <button
          onClick={() => setHubView("topics")}
          className={cn(
            "flex-1 py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all whitespace-nowrap",
            hubView === "topics"
              ? "bg-primary-600 text-white shadow-sm shadow-primary-500/20"
              : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
          )}
        >
          <BookOpen className="w-4 h-4" />
          <span>Curriculum Topics ({allTopics.length})</span>
        </button>

        <button
          onClick={() => setHubView("mistakes")}
          className={cn(
            "flex-1 py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all whitespace-nowrap",
            hubView === "mistakes"
              ? "bg-primary-600 text-white shadow-sm shadow-primary-500/20"
              : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
          )}
        >
          <Flame className="w-4 h-4 text-rose-400" />
          <span>Mistake Notebook ({mistakes.length})</span>
        </button>

        <button
          onClick={() => setHubView("roadmap")}
          className={cn(
            "flex-1 py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all whitespace-nowrap",
            hubView === "roadmap"
              ? "bg-primary-600 text-white shadow-sm shadow-primary-500/20"
              : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
          )}
        >
          <Calendar className="w-4 h-4" />
          <span>Preparation Roadmap</span>
        </button>
      </div>

      {/* ── VIEW 1: CURRICULUM TOPICS ── */}
      {hubView === "topics" && (
        <div className="space-y-4">
          {/* Category Filters & Search Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex flex-wrap gap-1.5 p-1 bg-surface rounded-xl border border-border">
              {[
                { id: "all", label: "All Topics", count: allTopics.length },
                { id: "quant", label: "Quantitative", count: aptitudeTopics.length },
                { id: "reasoning", label: "Reasoning", count: reasoningTopics.length },
                { id: "data", label: "Data Interpretation", count: allTopics.filter(t => t.subCategory === "Data Interpretation" || t.topicId.includes("data")).length }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                    activeCategory === cat.id
                      ? "bg-primary-600 text-white shadow-sm"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                  )}
                >
                  {cat.label} <span className="text-[10px] font-mono opacity-80">({cat.count})</span>
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
              <input
                type="text"
                placeholder="Search topic or formula..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Topics Grid */}
          {loading ? (
            <div className="py-16 text-center">
              <LoadingState text="Loading adaptive curriculum topics..." />
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="p-12 text-center bg-surface rounded-2xl border border-border space-y-2">
              <p className="text-sm font-bold text-text-primary">No topics found matching "{searchQuery}"</p>
              <button
                onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
                className="text-xs text-primary-400 font-bold hover:underline"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTopics.map((topic) => {
                const progress = topic.progress || {};
                const mastery = progress.masteryPercentage || 0;
                const level = progress.status || "Not Started";
                const targetRoute = topic.domainType === "Reasoning" ? `/reasoning/${topic.topicId}` : `/aptitude/${topic.topicId}`;

                return (
                  <div
                    key={topic.topicId}
                    className="bg-surface rounded-2xl p-5 border border-border hover:border-primary-500/40 hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-text-muted bg-surface-2 px-2 py-0.5 rounded border border-border">
                          {topic.subCategory || topic.domainType}
                        </span>
                        <span className={cn("text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border", getMasteryBadgeClass(level, mastery))}>
                          {level} • {mastery}%
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-text-primary group-hover:text-primary-400 transition-colors">
                          {topic.title}
                        </h3>
                        <p className="text-text-secondary text-xs line-clamp-2 mt-1 leading-relaxed">
                          {topic.placementImportance || topic.definition}
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1 pt-1">
                        <div className="w-full bg-surface-2 h-1.5 rounded-full overflow-hidden border border-border/50">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              mastery >= 85 ? 'bg-emerald-500' : mastery >= 50 ? 'bg-primary-500' : 'bg-primary-600/60'
                            )}
                            style={{ width: `${mastery}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Triggers */}
                    <div className="flex items-center gap-2 pt-4 mt-3 border-t border-border">
                      <Link
                        to={targetRoute}
                        className="flex-1 py-2 px-3 bg-surface-2 hover:bg-surface-hover border border-border text-text-primary font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-primary-400" />
                        <span>Learn</span>
                      </Link>

                      <Link
                        to={targetRoute}
                        className="flex-1 py-2 px-3 bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm shadow-primary-500/20 transition-all"
                      >
                        <span>Practice</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── VIEW 2: MISTAKE NOTEBOOK & SPACED REVISION ── */}
      {hubView === "mistakes" && (
        <div className="space-y-4">
          {todaysRevisionQueue && todaysRevisionQueue.queue?.length > 0 && (
            <div className="p-5 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase font-mono">
                <Flame className="w-4 h-4" />
                <span>Today's Spaced Repetition Queue ({todaysRevisionQueue.queue.length} due)</span>
              </div>
              <p className="text-xs text-text-secondary">
                Review these questions today to reset your retention decay timer according to spaced repetition schedules.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {todaysRevisionQueue.queue.slice(0, 4).map(item => (
                  <div key={item._id} className="p-4 bg-surface rounded-xl border border-border space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-text-primary">{item.topicTitle}</span>
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-mono font-bold">
                        {item.mistakeCategory}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-text-primary line-clamp-2">
                      {item.question?.questionText || "Practice Problem"}
                    </p>
                    <div className="text-xs text-text-muted">
                      Correct Answer: <strong className="text-emerald-400">{item.correctAnswer}</strong>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleReviewMistake(item._id, true)}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Got It Right</span>
                      </button>
                      <button
                        onClick={() => handleReviewMistake(item._id, false)}
                        className="flex-1 py-1.5 bg-surface-2 hover:bg-rose-500/10 text-rose-400 border border-border rounded-lg text-xs font-bold"
                      >
                        Still Hard
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Recorded Mistakes */}
          <div className="bg-surface rounded-2xl p-5 sm:p-6 border border-border space-y-4">
            <h3 className="font-bold text-base text-text-primary">All Logged Errors ({mistakes.length})</h3>
            {mistakes.length === 0 ? (
              <div className="py-10 text-center text-text-muted text-xs">
                No mistakes recorded yet. Attempt topic practice sessions to log retention gaps.
              </div>
            ) : (
              <div className="space-y-3">
                {mistakes.map((m) => (
                  <div key={m._id} className="p-4 bg-surface-2/60 rounded-xl border border-border space-y-2.5">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-surface rounded text-xs font-mono font-semibold text-text-primary border border-border">
                          {m.topicTitle} • {m.concept}
                        </span>
                        <span className="px-2 py-0.5 bg-rose-500/15 text-rose-400 text-[10px] font-mono font-bold rounded">
                          {m.mistakeCategory}
                        </span>
                      </div>
                      <span className={cn("text-xs font-mono font-bold", m.mastered ? 'text-emerald-400' : 'text-amber-400')}>
                        {m.mastered ? "✓ Mastered" : `Review #${m.reviewCount}`}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-text-primary">
                      {m.question?.questionText || "Question Statement"}
                    </p>

                    {m.whyWrong && (
                      <div className="p-2.5 bg-rose-500/10 rounded-lg text-xs text-rose-300 border border-rose-500/20">
                        <strong>Why wrong:</strong> {m.whyWrong}
                      </div>
                    )}

                    <div className="text-xs text-text-muted flex justify-between items-center pt-2 border-t border-border/80">
                      <span>Correct Answer: <strong className="text-emerald-400">{m.correctAnswer}</strong></span>
                      <Link
                        to={`/aptitude/${m.topicId}`}
                        className="text-primary-400 hover:text-primary-300 font-semibold"
                      >
                        Revise Topic &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── VIEW 3: PERSONALIZED ROADMAP ── */}
      {hubView === "roadmap" && (
        <div className="bg-surface rounded-2xl p-6 border border-border space-y-6">
          <div>
            <span className="text-xs uppercase font-mono font-bold text-primary-400">Adaptive Study Plan</span>
            <h3 className="text-xl font-bold text-text-primary mt-0.5">
              {roadmapData?.targetName || "Preparation Roadmap"}
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              Synchronized automatically based on your real test accuracy and detected weak concepts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roadmapData?.roadmap?.map((week) => (
              <div key={week.weekNumber} className="p-5 bg-surface-2/60 rounded-xl border border-border space-y-3">
                <div className="flex justify-between items-center border-b border-border pb-2.5">
                  <h4 className="font-bold text-sm text-text-primary">{week.title}</h4>
                  <span className="text-xs font-mono text-primary-400 font-bold">Week {week.weekNumber}</span>
                </div>

                <div className="space-y-1.5">
                  {week.focusTopics?.map((t, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2.5 bg-surface rounded-lg border border-border text-xs">
                      <span className="font-medium text-text-primary">{t.title}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded font-mono text-[10px] font-bold",
                        t.status === "Strong" || t.status === "Mastered" ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-surface-2 text-text-muted border border-border'
                      )}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-text-muted font-medium pt-1">
                  🎯 <strong>Milestone:</strong> {week.milestone}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Target Selection Modal */}
      <TargetSelectionModal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
        activeTarget={activeTarget}
        onTargetSelected={(tgt) => {
          setActiveTarget(tgt);
          fetchHubData();
        }}
      />

      {/* Full Exam Simulation Modal */}
      <ExamSimulationModal
        isOpen={isSimulationModalOpen}
        onClose={() => setIsSimulationModalOpen(false)}
        patternId={activeTarget?.patternId || "tcs-nqt-fresher-v1"}
        patternName={activeTarget?.targetName || "TCS NQT Full Simulation"}
      />
    </div>
  );
}
