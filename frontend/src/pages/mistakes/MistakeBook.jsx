import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookmarkCheck, AlertTriangle, CheckCircle2, RotateCcw,
  Search, Filter, ArrowRight, X, Sparkles, ExternalLink,
  Code2, Calculator, Bot, BookOpen, Layers, Check, ChevronLeft, ChevronRight
} from "lucide-react";
import api from "../../services/api";

export default function MistakeBook() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [mistakes, setMistakes] = useState([]);
  const [stats, setStats] = useState({
    totalMistakes: 0,
    unresolvedCount: 0,
    resolvedCount: 0,
    repeatedCount: 0,
    byDomain: { coding: 0, aptitude: 0, interview: 0, learning: 0 },
    topRepeatedTopics: []
  });
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Filters & Sorting
  const [domainFilter, setDomainFilter] = useState(searchParams.get("domain") || "all");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [difficultyFilter, setDifficultyFilter] = useState(searchParams.get("difficulty") || "all");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState("recent");

  // Detail Modal State
  const [selectedMistake, setSelectedMistake] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch mistakes & stats
  const fetchMistakesData = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: 20,
        sourceType: domainFilter !== "all" ? domainFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        difficulty: difficultyFilter !== "all" ? difficultyFilter : undefined,
        search: searchQuery.trim() || undefined,
        sort: sortBy
      };

      const [listRes, statsRes] = await Promise.all([
        api.get("/mistakes", { params }).catch(() => ({ data: { data: { mistakes: [], pagination: {} } } })),
        api.get("/mistakes/stats").catch(() => ({ data: { data: {} } }))
      ]);

      if (listRes?.data?.data) {
        setMistakes(listRes.data.data.mistakes || []);
        if (listRes.data.data.pagination) {
          setPagination(listRes.data.data.pagination);
        }
      }

      if (statsRes?.data?.data) {
        setStats(statsRes.data.data);
      }
    } catch (err) {
      console.warn("Failed to load mistake book data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMistakesData();
  }, [domainFilter, statusFilter, difficultyFilter, searchQuery, sortBy, pagination.page]);

  // Handle Mark Resolved
  const handleResolve = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setActionLoading(true);
      await api.patch(`/mistakes/${id}/resolve`);
      // Update local state
      setMistakes(prev => prev.map(m => m._id === id ? { ...m, resolved: true, priority: "LOW" } : m));
      setStats(prev => ({
        ...prev,
        unresolvedCount: Math.max(0, prev.unresolvedCount - 1),
        resolvedCount: prev.resolvedCount + 1
      }));
      if (selectedMistake?._id === id) {
        setSelectedMistake(prev => ({ ...prev, resolved: true, priority: "LOW" }));
      }
    } catch (err) {
      console.error("Resolve error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Retry Action
  const handleRetry = (mistake) => {
    if (!mistake) return;
    const targetRoute = mistake.practiceRoute || (
      mistake.sourceType === "coding" ? `/arena?topic=${encodeURIComponent(mistake.topic)}` :
      mistake.sourceType === "aptitude" ? `/aptitude?topic=${encodeURIComponent(mistake.topic)}` :
      mistake.sourceType === "interview" ? "/interview" :
      "/learning"
    );
    navigate(targetRoute);
  };

  const getDomainIcon = (type) => {
    switch (type) {
      case "coding": return <Code2 className="w-3.5 h-3.5 text-primary-400" />;
      case "aptitude": return <Calculator className="w-3.5 h-3.5 text-cyan-400" />;
      case "interview": return <Bot className="w-3.5 h-3.5 text-indigo-400" />;
      default: return <BookOpen className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const needsAttentionList = useMemo(() => {
    return mistakes.filter(m => !m.resolved && (m.attemptCount >= 2 || m.priority === "HIGH")).slice(0, 3);
  }, [mistakes]);

  return (
    <div className="space-y-8 animate-fade-in pb-16 text-left max-w-6xl mx-auto">
      
      {/* ── 1. HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-500/15 border border-primary-500/30 font-mono text-[10px] font-bold text-primary-300 uppercase tracking-wider">
              <BookmarkCheck className="w-3 h-3 text-primary-400" />
              INTELLIGENT LEARNING DATA
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight font-display">
            MISTAKE BOOK
          </h1>
          <p className="text-xs text-text-secondary">
            Turn mistakes into your strongest preparation.
          </p>
        </div>

        {stats.repeatedCount > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-2.5 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-amber-400 block">Repeated Weakness</span>
              <span className="text-xs text-text-primary font-bold">{stats.repeatedCount} concepts need recovery</span>
            </div>
          </div>
        )}
      </div>

      {/* ── 2. TOP STATISTICS CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        
        <div className="p-4 rounded-2xl border border-border bg-surface flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-text-muted">Total Mistakes</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-text-primary">{stats.totalMistakes}</span>
            <Layers className="w-4 h-4 text-text-muted" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-amber-400">Unresolved</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">{stats.unresolvedCount}</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-emerald-400">Resolved</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{stats.resolvedCount}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-primary-500/20 bg-primary-500/5 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-primary-400">Repeated Mistakes</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-primary-300">{stats.repeatedCount}</span>
            <RotateCcw className="w-4 h-4 text-primary-400" />
          </div>
        </div>

      </div>

      {/* ── 3. NEEDS ATTENTION (CRITICAL UNRESOLVED / REPEATED) ── */}
      {needsAttentionList.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-[#0F1629] via-[#0D1224] to-[#070914] p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-amber-400">
                NEEDS ATTENTION • HIGH PRIORITY
              </h3>
            </div>
            <span className="text-xs font-mono text-text-muted">Requires active concept review</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {needsAttentionList.map((item) => (
              <div
                key={item._id}
                className="p-4 rounded-xl border border-border/80 bg-surface/80 hover:bg-surface flex flex-col justify-between space-y-3 transition-all cursor-pointer"
                onClick={() => setSelectedMistake(item)}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-2 font-mono text-[10px] font-bold text-primary-300 capitalize">
                      {getDomainIcon(item.sourceType)}
                      <span>{item.sourceType}</span>
                    </span>
                    <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      {item.attemptCount} Failed Attempts
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-text-primary line-clamp-1">{item.topic}</h4>
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    "{item.explanation || item.question}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setSelectedMistake(item); }}
                    className="text-xs font-mono text-primary-400 hover:text-primary-300 font-bold cursor-pointer"
                  >
                    [ REVIEW ]
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRetry(item); }}
                    className="px-3 py-1 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-mono text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>RETRY</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. FILTERS & CONTROLS ── */}
      <div className="p-4 rounded-2xl border border-border bg-surface space-y-4 shadow-sm">
        
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, concept, or mistake..."
              className="w-full bg-surface-2 border border-border rounded-xl pl-9 pr-8 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-text-muted shrink-0">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary-500/50 cursor-pointer"
            >
              <option value="recent">Most Recent</option>
              <option value="repeated">Most Repeated</option>
              <option value="priority">Highest Priority</option>
              <option value="unresolvedFirst">Unresolved First</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/60 text-xs font-mono">
          
          {/* Domains */}
          <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-xl border border-border">
            {["all", "coding", "aptitude", "interview", "learning"].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDomainFilter(d)}
                className={`px-2.5 py-1 rounded-lg capitalize text-[11px] font-bold transition-colors cursor-pointer ${
                  domainFilter === d ? "bg-primary-600 text-white shadow-sm" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Status */}
          <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-xl border border-border">
            {["all", "unresolved", "resolved"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-lg capitalize text-[11px] font-bold transition-colors cursor-pointer ${
                  statusFilter === s ? "bg-primary-600 text-white shadow-sm" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Difficulty */}
          <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-xl border border-border">
            {["all", "Easy", "Medium", "Hard"].map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setDifficultyFilter(diff)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  difficultyFilter === diff ? "bg-primary-600 text-white shadow-sm" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* ── 5. MISTAKES LIST ── */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <Sparkles className="w-6 h-6 text-primary-400 animate-pulse" />
          <span className="text-xs font-mono text-text-muted">Loading Mistake Book records...</span>
        </div>
      ) : mistakes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center space-y-3">
          <BookmarkCheck className="w-10 h-10 text-text-muted mx-auto" />
          <h3 className="text-base font-bold text-text-primary font-display">
            Your mistake book is empty.
          </h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
            Start practicing problems, aptitude drills, or AI mock interviews to build your transparent learning history.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/arena")}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Practice Coding
            </button>
            <button
              type="button"
              onClick={() => navigate("/interview")}
              className="px-4 py-2 bg-surface-2 hover:bg-surface-hover border border-border text-text-primary rounded-xl text-xs font-bold cursor-pointer"
            >
              Start AI Mock
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {mistakes.map((m) => (
            <motion.div
              key={m._id}
              layout
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                m.resolved
                  ? "border-border/60 bg-surface/40 opacity-75"
                  : "border-border bg-surface hover:border-primary-500/40 shadow-sm"
              }`}
              onClick={() => setSelectedMistake(m)}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-2 font-bold text-primary-300 capitalize border border-border">
                      {getDomainIcon(m.sourceType)}
                      <span>{m.sourceType}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-surface-2 text-text-muted font-bold border border-border">
                      {m.difficulty || "Medium"}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                      {m.mistakeType}
                    </span>
                    {m.attemptCount >= 2 && !m.resolved && (
                      <span className="px-2 py-0.5 rounded bg-primary-500/15 text-primary-300 font-bold border border-primary-500/30 flex items-center gap-1">
                        <RotateCcw className="w-2.5 h-2.5" />
                        Repeated ({m.attemptCount}x)
                      </span>
                    )}
                    {m.resolved && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" />
                        Resolved
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-text-primary">{m.topic}</h3>
                  <p className="text-xs text-text-secondary line-clamp-1 leading-relaxed">
                    <span className="font-semibold text-text-muted">Question:</span> {m.question}
                  </p>
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    <span className="font-semibold text-amber-400">What went wrong:</span> {m.explanation}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
                  <span className="text-[10px] font-mono text-text-muted">
                    {new Date(m.lastAttemptAt || m.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>

                  <div className="flex items-center gap-2">
                    {!m.resolved && (
                      <button
                        type="button"
                        onClick={(e) => handleResolve(m._id, e)}
                        className="p-1.5 hover:bg-emerald-500/15 text-text-muted hover:text-emerald-400 rounded-lg border border-border text-xs transition-colors cursor-pointer"
                        title="Mark as Resolved"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleRetry(m); }}
                      className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span>RETRY</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── 6. PAGINATION ── */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between font-mono text-xs pt-4 border-t border-border/60">
          <span className="text-text-muted">
            Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              className="p-2 rounded-xl border border-border bg-surface hover:bg-surface-hover disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              className="p-2 rounded-xl border border-border bg-surface hover:bg-surface-hover disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── 7. MISTAKE DETAIL MODAL ── */}
      <AnimatePresence>
        {selectedMistake && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#0F1629] border border-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative my-8"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-border bg-surface-2/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-400">
                    <BookmarkCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      <span className="uppercase font-bold text-primary-300">{selectedMistake.sourceType}</span>
                      <span>&bull;</span>
                      <span className="text-text-muted">{selectedMistake.difficulty || "Medium"}</span>
                      <span>&bull;</span>
                      <span className="text-amber-400 font-bold">{selectedMistake.mistakeType}</span>
                    </div>
                    <h2 className="text-lg font-bold text-text-primary font-display mt-0.5">
                      {selectedMistake.topic}
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMistake(null)}
                  className="p-2 hover:bg-surface-hover rounded-xl text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-xs leading-relaxed">
                
                {/* Question */}
                <div className="space-y-1.5">
                  <span className="font-mono text-[10px] font-bold uppercase text-text-muted tracking-wider block">
                    QUESTION
                  </span>
                  <div className="p-3.5 rounded-xl bg-surface border border-border text-text-primary font-medium">
                    {selectedMistake.question}
                  </div>
                </div>

                {/* Student's Answer */}
                {selectedMistake.studentAnswer && (
                  <div className="space-y-1.5">
                    <span className="font-mono text-[10px] font-bold uppercase text-text-muted tracking-wider block">
                      YOUR ANSWER / ATTEMPT
                    </span>
                    <div className="p-3.5 rounded-xl bg-bg-base border border-border font-mono text-[11px] text-text-secondary whitespace-pre-wrap max-h-36 overflow-y-auto">
                      {selectedMistake.studentAnswer}
                    </div>
                  </div>
                )}

                {/* What Went Wrong */}
                <div className="p-4 rounded-xl border border-amber-500/25 bg-amber-500/5 space-y-1">
                  <span className="font-mono text-[10px] font-bold uppercase text-amber-400 tracking-wider block">
                    WHAT WENT WRONG
                  </span>
                  <p className="text-text-primary font-medium leading-relaxed">
                    {selectedMistake.explanation}
                  </p>
                </div>

                {/* Correct Approach */}
                <div className="p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 space-y-1">
                  <span className="font-mono text-[10px] font-bold uppercase text-emerald-400 tracking-wider block">
                    CORRECT APPROACH
                  </span>
                  <p className="text-text-primary leading-relaxed">
                    {selectedMistake.correctApproach || "Break down the core invariant and solve systematically."}
                  </p>
                </div>

                {/* Key Concept & Common Trap Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
                  <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
                    <span className="font-mono text-[10px] font-bold uppercase text-primary-400 block">
                      KEY CONCEPT
                    </span>
                    <p className="text-text-secondary text-[11px]">
                      {selectedMistake.keyConcept || `${selectedMistake.topic} Principles`}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
                    <span className="font-mono text-[10px] font-bold uppercase text-rose-400 block">
                      COMMON TRAP
                    </span>
                    <p className="text-text-secondary text-[11px]">
                      {selectedMistake.commonTrap || "Rushing test execution before verifying edge conditions."}
                    </p>
                  </div>
                </div>

                {/* How to Avoid Next Time */}
                <div className="p-3.5 rounded-xl bg-surface-2 border border-border text-[11px] space-y-1">
                  <span className="font-mono font-bold text-text-primary block">HOW TO AVOID THIS NEXT TIME:</span>
                  <p className="text-text-secondary">
                    {selectedMistake.howToAvoid || "Review the step-by-step invariant dry run before writing the implementation."}
                  </p>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-border bg-surface-2/60 flex items-center justify-between gap-3">
                {!selectedMistake.resolved ? (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleResolve(selectedMistake._id)}
                    className="px-4 py-2 bg-surface hover:bg-surface-hover border border-border text-emerald-400 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>MARK RESOLVED</span>
                  </button>
                ) : (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Resolved
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const m = selectedMistake;
                    setSelectedMistake(null);
                    handleRetry(m);
                  }}
                  className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>RETRY PRACTICE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
