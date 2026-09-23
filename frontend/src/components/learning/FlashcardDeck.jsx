import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, RotateCw, CheckCircle2, AlertCircle, 
  Layers, ArrowLeft, ArrowRight, Shuffle, Award, Flame, BookOpen
} from "lucide-react";

const CURATED_FLASHCARDS = [
  {
    id: 1,
    category: "DSA & Algorithms",
    difficulty: "Medium",
    question: "What is the time and space complexity of QuickSort in the average and worst cases?",
    answer: "Average Case: O(N log N) time, O(log N) auxiliary stack space.\nWorst Case (already sorted with poor pivot): O(N²) time, O(N) stack space.\nTip: Use randomized pivot selection or 3-way partitioning to avoid O(N²) worst-case performance.",
    keyConcept: "Divide & Conquer, In-place sorting"
  },
  {
    id: 2,
    category: "Operating Systems",
    difficulty: "Hard",
    question: "What are the four Coffman conditions necessary for a Deadlock to occur?",
    answer: "1. Mutual Exclusion: At least one resource must be held in a non-shareable mode.\n2. Hold and Wait: A process holds at least one resource and requests additional ones.\n3. No Preemption: Resources cannot be forcibly confiscated from a process.\n4. Circular Wait: A closed chain of processes exists where each holds a resource needed by the next.",
    keyConcept: "Concurrency, Deadlock Prevention"
  },
  {
    id: 3,
    category: "Database Management (DBMS)",
    difficulty: "Medium",
    question: "Explain the ACID properties in database transactions with a banking transfer example.",
    answer: "• Atomicity: All parts of transaction succeed, or none do (debit & credit happen together).\n• Consistency: Database moves from one valid state to another satisfying constraints.\n• Isolation: Concurrent transactions execute without interfering with one another.\n• Durability: Once committed, state changes survive system crashes/power cuts.",
    keyConcept: "Transactions, Relational Consistency"
  },
  {
    id: 4,
    category: "Computer Networks",
    difficulty: "Medium",
    question: "Explain the TCP 3-Way Handshake step-by-step.",
    answer: "1. SYN: Client sends SYN packet with an initial sequence number (ISN_c) to server.\n2. SYN-ACK: Server acknowledges client's ISN with ACK (ISN_c + 1) and sends its own SYN (ISN_s).\n3. ACK: Client sends ACK (ISN_s + 1) back to server. Connection is established (ESTABLISHED state).",
    keyConcept: "Transport Layer, Reliable Connection"
  },
  {
    id: 5,
    category: "DSA & Algorithms",
    difficulty: "Easy",
    question: "How does Kadane's Algorithm find the maximum subarray sum in O(N) time?",
    answer: "Maintain two variables: `curr_max` and `max_so_far`.\nFor each element x: `curr_max = max(x, curr_max + x)` and `max_so_far = max(max_so_far, curr_max)`.\nSpace Complexity: O(1) auxiliary memory.",
    keyConcept: "Dynamic Programming, Prefix Optimization"
  },
  {
    id: 6,
    category: "Operating Systems",
    difficulty: "Medium",
    question: "What is the difference between Paging and Segmentation?",
    answer: "• Paging: Divides physical memory into fixed-size blocks (Pages & Frames). Eliminates external fragmentation, but may suffer internal fragmentation.\n• Segmentation: Divides virtual memory into variable-sized logical segments (code, stack, heap). Eliminates internal fragmentation, but can cause external fragmentation.",
    keyConcept: "Virtual Memory, Address Translation"
  },
  {
    id: 7,
    category: "System Design & Web",
    difficulty: "Hard",
    question: "What is the CAP Theorem and why can't a distributed system achieve all three simultaneously?",
    answer: "Consistency (all nodes see same data at same time), Availability (every request receives non-error response), Partition Tolerance (system continues functioning despite network drops).\nIn the presence of a network partition (P), a distributed system must choose between returning stale data (AP) or erroring/waiting for sync (CP).",
    keyConcept: "Distributed Systems, Consistency Tradeoffs"
  },
  {
    id: 8,
    category: "DSA & Algorithms",
    difficulty: "Medium",
    question: "Why is binary search invariant essential, and how do you prevent integer overflow in `mid` calculation?",
    answer: "Invariant: The target element is always guaranteed to be within [low, high].\nTo calculate mid safely without 32-bit integer overflow: use `mid = low + (high - low) / 2` instead of `(low + high) / 2`.",
    keyConcept: "Binary Search, Numeric Safety"
  }
];

export default function FlashcardDeck() {
  const [cards, setCards] = useState(CURATED_FLASHCARDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [reviewedCounts, setReviewedCounts] = useState({ again: 0, hard: 0, good: 0, easy: 0 });
  const [streak, setStreak] = useState(0);

  const categories = ["All", ...new Set(CURATED_FLASHCARDS.map(c => c.category))];

  const filteredCards = selectedCategory === "All"
    ? cards
    : cards.filter(c => c.category === selectedCategory);

  const currentCard = filteredCards[currentIndex] || filteredCards[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setCards(prev => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
  };

  const handleRating = (rating) => {
    setReviewedCounts(prev => ({ ...prev, [rating]: prev[rating] + 1 }));
    setStreak(prev => prev + 1);
    handleNext();
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface p-5 rounded-2xl border border-border">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary-400" />
              <span>Placement Core Flashcards</span>
            </h3>
            <span className="text-[10px] font-mono font-bold bg-primary-500/15 text-primary-300 border border-primary-500/30 px-2 py-0.5 rounded-full">
              Spaced Repetition Active
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Master formulas, complexities, and system concepts with 3D recall cards.
          </p>
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono font-bold">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Streak: {streak}</span>
          </div>

          <button
            type="button"
            onClick={handleShuffle}
            className="p-2 rounded-xl bg-surface-2 hover:bg-surface border border-border text-text-secondary hover:text-text-primary transition-all cursor-pointer"
            title="Shuffle deck"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setSelectedCategory(cat);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              selectedCategory === cat
                ? "bg-primary-600 text-white border-primary-500 shadow-sm"
                : "bg-surface-2 text-text-secondary hover:text-text-primary border-border"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3D Flashcard Container */}
      <div className="max-w-2xl mx-auto">
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="relative min-h-[300px] sm:min-h-[340px] rounded-3xl p-8 border border-border/80 bg-surface shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between hover:border-primary-500/50 select-none group"
          style={{ perspective: 1000 }}
        >
          {/* Card Top Metadata */}
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-surface-2 border border-border text-text-muted">
                {currentCard?.category}
              </span>
              <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${
                currentCard?.difficulty === "Easy"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : currentCard?.difficulty === "Medium"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
              }`}>
                {currentCard?.difficulty}
              </span>
            </div>

            <div className="flex items-center gap-1 text-text-muted text-[11px]">
              <span>{currentIndex + 1} of {filteredCards.length}</span>
              <RotateCw className="w-3.5 h-3.5 ml-1 text-primary-400 group-hover:rotate-180 transition-transform duration-500" />
            </div>
          </div>

          {/* Card Content (Front vs Back) */}
          <div className="py-6 my-auto text-left">
            {!isFlipped ? (
              <div className="space-y-4 animate-fade-in">
                <span className="text-[10px] font-mono text-primary-400 uppercase tracking-widest block font-bold">
                  Question / Concept Challenge
                </span>
                <h4 className="text-lg sm:text-xl font-bold text-text-primary leading-relaxed font-display">
                  {currentCard?.question}
                </h4>
                <p className="text-xs text-text-muted font-mono flex items-center gap-1.5 pt-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary-400" />
                  <span>Click card to reveal model answer and key formulas</span>
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in text-left">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">
                  ✓ Model Answer & Core Principle
                </span>
                <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-sans whitespace-pre-line">
                  {currentCard?.answer}
                </p>
                {currentCard?.keyConcept && (
                  <div className="pt-2">
                    <span className="text-[11px] font-mono text-primary-300 bg-primary-500/10 border border-primary-500/20 px-2.5 py-1 rounded-lg">
                      Key Concept: {currentCard.keyConcept}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Flip Indicator */}
          <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs text-text-muted font-mono">
            <span>{isFlipped ? "Click to flip back" : "Tap card to flip"}</span>
            <span className="text-[10px] opacity-70">InterviewPilot Memory Engine</span>
          </div>
        </div>

        {/* Spaced Repetition Scale Buttons (Shown when flipped) */}
        {isFlipped && (
          <div className="mt-4 p-4 rounded-2xl bg-surface-2 border border-border animate-fade-in space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-text-secondary">
              <span className="font-bold">How well did you recall this?</span>
              <span className="text-[10px] text-text-muted">Rate to schedule next revision</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRating("again"); }}
                className="py-2.5 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer text-center"
              >
                <div>Again</div>
                <div className="text-[9px] font-mono opacity-80">1 day</div>
              </button>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRating("hard"); }}
                className="py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer text-center"
              >
                <div>Hard</div>
                <div className="text-[9px] font-mono opacity-80">3 days</div>
              </button>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRating("good"); }}
                className="py-2.5 px-3 rounded-xl bg-primary-500/15 hover:bg-primary-500/25 text-primary-300 border border-primary-500/30 text-xs font-bold transition-all cursor-pointer text-center"
              >
                <div>Good</div>
                <div className="text-[9px] font-mono opacity-80">7 days</div>
              </button>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRating("easy"); }}
                className="py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer text-center"
              >
                <div>Easy</div>
                <div className="text-[9px] font-mono opacity-80">14 days</div>
              </button>
            </div>
          </div>
        )}

        {/* Prev / Next Pagination Controls */}
        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={handlePrev}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface hover:bg-surface-hover border border-border text-xs font-bold text-text-secondary hover:text-text-primary transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {filteredCards.slice(0, 8).map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentIndex === idx ? "w-5 bg-primary-500" : "bg-border"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface hover:bg-surface-hover border border-border text-xs font-bold text-text-secondary hover:text-text-primary transition-all cursor-pointer shadow-sm"
          >
            <span>Next Card</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
