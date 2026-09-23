import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, Code, Database, Server, Laptop, 
  CheckCircle, ArrowRight, Play, Sparkles, Target, Layers
} from "lucide-react";
import FlashcardDeck from "../../components/learning/FlashcardDeck";

const TRACKS = [
  {
    id: "dsa-linear",
    title: "Stage 01: Linear structures",
    desc: "Contiguous memory, pointer structures, LIFO/FIFO stacks and queues.",
    topics: ["arrays", "strings", "linked-lists", "stack", "queue", "hashing"]
  },
  {
    id: "dsa-nonlinear",
    title: "Stage 02: Non-Linear & Trees",
    desc: "Hierarchical data representation, binary search trees, search structures.",
    topics: ["recursion", "trees", "bst", "heaps", "graphs"]
  },
  {
    id: "algorithms",
    title: "Stage 03: Algorithmic Paradigms",
    desc: "Sorting, space reduction, greedy strategies, backtracking, and optimization.",
    topics: ["sorting", "binary-search", "greedy", "backtracking", "dynamic-programming"]
  },
  {
    id: "development",
    title: "Stage 04: Language Runtimes",
    desc: "Execution environments, JVM mechanics, ES6+ event loops, memory models.",
    topics: ["python-programming", "java-programming", "javascript-core"]
  },
  {
    id: "system-design",
    title: "Stage 05: CS Core & Architecture",
    desc: "Relational constraints, indexing structures, network frames, scaling strategies.",
    topics: ["sql-relations", "db-indexing", "system-design-intro"]
  }
];

const TOPIC_DETAILS_MAP = {
  "arrays": { title: "Arrays & Memory Contiguity", duration: "30 mins", progress: 85, status: "Mastered", summary: "Master O(1) index math, sub-arrays, and contiguous memory scanning." },
  "strings": { title: "Strings & Pattern Matching", duration: "35 mins", progress: 70, status: "Strong", summary: "Immutability, pattern scans, KMP structures, and palindromes." },
  "linked-lists": { title: "Linked Lists & Pointers", duration: "35 mins", progress: 60, status: "Practicing", summary: "Non-contiguous nodes, pointer manipulation, and cycle detection." },
  "stack": { title: "Stack (LIFO) & Monotonic Stacks", duration: "30 mins", progress: 75, status: "Strong", summary: "LIFO execution, call stacks, and monotonic stack optimizations." },
  "queue": { title: "Queue (FIFO) & Deque", duration: "30 mins", progress: 65, status: "Practicing", summary: "FIFO scheduling, circular buffers, and sliding window maximums." },
  "hashing": { title: "Hashing & Hash Tables", duration: "35 mins", progress: 90, status: "Mastered", summary: "Collision resolution, O(1) lookup strategies, and frequency tables." },
  "recursion": { title: "Recursion & Call Stack", duration: "35 mins", progress: 80, status: "Mastered", summary: "Base cases, recursive subproblem frames, and call stacks." },
  "trees": { title: "Binary Trees & Traversals", duration: "45 mins", progress: 40, status: "Learning", summary: "DFS/BFS tree traversals and hierarchical sub-tree divisions." },
  "bst": { title: "Binary Search Trees (BST)", duration: "45 mins", progress: 55, status: "Practicing", summary: "Sorted property validation, tree insertions, and self-balancing." },
  "heaps": { title: "Heaps & Priority Queues", duration: "40 mins", progress: 50, status: "Practicing", summary: "Min/Max complete trees, scheduling, and Top-K algorithms." },
  "graphs": { title: "Graphs (BFS, DFS & Route Find)", duration: "55 mins", progress: 35, status: "Learning", summary: "Adjacency structures, path explorations, and Dijkstra rules." },
  "sorting": { title: "Sorting Algorithms", duration: "45 mins", progress: 85, status: "Mastered", summary: "MergeSort, QuickSort partition schemes, and stability." },
  "binary-search": { title: "Binary Search Space", duration: "30 mins", progress: 100, status: "Mastered", summary: "Halving search spaces and monotonic range reductions." },
  "greedy": { title: "Greedy Algorithms", duration: "40 mins", progress: 60, status: "Practicing", summary: "Local optimizations, scheduling, and interval fits." },
  "backtracking": { title: "Backtracking Patterns", duration: "50 mins", progress: 30, status: "Learning", summary: "State space trees, recursive undo paths, and pruning." },
  "dynamic-programming": { title: "Dynamic Programming (DP)", duration: "60 mins", progress: 20, status: "Learning", summary: "Memoization caches, tabulation matrices, and state updates." },
  "python-programming": { title: "Python Core & Generators", duration: "40 mins", progress: 95, status: "Mastered", summary: "GIL mechanics, dynamic typing, and advanced generators." },
  "java-programming": { title: "Java JVM Architecture", duration: "45 mins", progress: 80, status: "Strong", summary: "JVM bytecode, Stack/Heap memory, and multi-threading." },
  "javascript-core": { title: "JavaScript ES6+ & Event Loop", duration: "40 mins", progress: 92, status: "Mastered", summary: "Microtask queues, closures, and async event execution loops." },
  "sql-relations": { title: "SQL & Relational Constraints", duration: "40 mins", progress: 50, status: "Practicing", summary: "Normalization rules, transaction blocks, and joint queries." },
  "db-indexing": { title: "Database Indexing Structures", duration: "45 mins", progress: 30, status: "Learning", summary: "B-Trees, Hash indices, scan optimizations, and query plans." },
  "system-design-intro": { title: "System Design Foundations", duration: "50 mins", progress: 15, status: "Learning", summary: "Load balancers, sharding, caching tiers, and CDN replication." }
};

export default function LearningPlatform() {
  const navigate = useNavigate();
  const [preferredLanguage, setPreferredLanguage] = useState("Python");
  const [activeTab, setActiveTab] = useState("curriculum"); // "curriculum" | "flashcards"

  // Find current active learning focus (first practicing/learning topic with progress > 0 and < 100)
  const currentFocusId = Object.keys(TOPIC_DETAILS_MAP).find(id => {
    const t = TOPIC_DETAILS_MAP[id];
    return t.progress > 0 && t.progress < 100;
  }) || "trees";

  const currentFocus = TOPIC_DETAILS_MAP[currentFocusId];

  const handleStartLesson = (topicId) => {
    navigate(`/learning/${topicId}`);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Mastered": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Strong": return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "Practicing": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default: return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* ── 1. Continue Learning Hero Cockpit ── */}
      <div className="relative rounded-2xl border border-border bg-surface overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-8">
          
          {/* Left: Active Topic details */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/15 text-primary-300 border border-primary-500/30 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>CONTINUE LEARNING</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary font-display animate-fade-in">
              COMPUTER SCIENCE CURRICULUM
            </h1>

            <p className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-xl">
              Master core CS concepts, algorithmic structures, and systems engineering through structured milestone lessons.
            </p>

            <div className="p-4 rounded-xl border border-border bg-bg-base/60 max-w-lg space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono text-text-muted uppercase">CURRENT TOPIC</span>
                  <h3 className="text-base font-bold text-text-primary mt-0.5">{currentFocus.title}</h3>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getStatusBadgeClass(currentFocus.status)}`}>
                  {currentFocus.status}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-text-muted">
                  <span>Progress ({currentFocus.progress}%)</span>
                  <span>Est. Time: ~15 mins</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-surface overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full" style={{ width: `${currentFocus.progress}%` }} />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => handleStartLesson(currentFocusId)}
                className="px-7 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-md shadow-primary-600/25 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <span>CONTINUE</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-lg border border-border">
                {["Python", "Java", "JavaScript"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setPreferredLanguage(lang)}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                      preferredLanguage === lang
                        ? "bg-bg-base text-text-primary shadow-sm"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Anime Artwork Inset */}
          <div className="lg:col-span-5 relative">
            <div className="rounded-2xl border border-border bg-surface-2/60 overflow-hidden shadow-xl relative aspect-[16/10]">
              <img
                src="/assets/anime/learning_hero.jpg"
                alt="CS Curriculum Roadmap"
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080A12] via-transparent to-transparent opacity-75" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-mono px-3 py-1.5 rounded-lg bg-surface/90 backdrop-blur-md border border-border">
                <span className="text-text-primary">Interactive Graph Visuals</span>
                <span className="text-primary-400 font-bold">[ACTIVE]</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── View Switcher: Curriculum vs Spaced Repetition Flashcards ── */}
      <div className="flex items-center justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-surface border border-border gap-1.5 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("curriculum")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "curriculum"
                ? "bg-primary-600 text-white shadow-md shadow-primary-600/20"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Milestone Curriculum</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("flashcards")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "flashcards"
                ? "bg-primary-600 text-white shadow-md shadow-primary-600/20"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Spaced Repetition Flashcards</span>
          </button>
        </div>
      </div>

      {activeTab === "flashcards" ? (
        /* ── 3. Spaced Repetition Flashcards Engine ── */
        <div className="animate-fade-in">
          <FlashcardDeck />
        </div>
      ) : (
        /* ── 2. Stage-by-Stage Curriculum Journey Roadmap ── */
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2 font-display">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Milestone Curriculum Journey</span>
          </h2>

          <div className="relative border-l-2 border-border/60 ml-6 pl-8 space-y-10 py-2">
            {TRACKS.map((stage, sIdx) => (
              <div key={stage.id} className="relative group">
                {/* Outer floating node identifier */}
                <div className="absolute -left-[45px] top-1.5 w-7 h-7 rounded-full bg-bg-base border-2 border-primary-500/60 flex items-center justify-center text-xs font-bold text-primary-400 shadow-sm group-hover:border-primary-400 transition-colors">
                  {sIdx + 1}
                </div>

                <div className="space-y-2">
                  <div>
                    <h3 className="text-lg font-bold text-text-primary tracking-tight font-display">{stage.title}</h3>
                    <p className="text-xs sm:text-sm text-text-secondary max-w-xl mt-0.5">{stage.desc}</p>
                  </div>

                  {/* Sub-roadmaps list */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {stage.topics.map((tKey) => {
                      const topic = TOPIC_DETAILS_MAP[tKey];
                      if (!topic) return null;
                      return (
                        <div
                          key={tKey}
                          onClick={() => handleStartLesson(tKey)}
                          className="p-4 rounded-xl border border-border bg-surface hover:bg-surface-hover hover:border-primary-500/30 transition-all cursor-pointer flex flex-col justify-between h-32 group"
                        >
                          <div className="space-y-1">
                            <div className="flex justify-between items-start">
                              <h4 className="text-sm font-bold text-text-primary group-hover:text-primary-400 transition-colors leading-tight">
                                {topic.title}
                              </h4>
                              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${getStatusBadgeClass(topic.status)}`}>
                                {topic.status}
                              </span>
                            </div>
                            <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                              {topic.summary}
                            </p>
                          </div>

                          <div className="flex justify-between items-center text-[10px] font-mono text-text-muted border-t border-border/40 pt-2 mt-2">
                            <span>{topic.duration}</span>
                            <span className="flex items-center gap-1 text-primary-400 group-hover:translate-x-0.5 transition-transform">
                              Enter Lesson <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
