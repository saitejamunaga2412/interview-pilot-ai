import React, { useState, useEffect, useRef } from "react";
import { 
  Play, Pause, SkipBack, SkipForward, RotateCcw, Gauge, Sparkles, Layers
} from "lucide-react";
import ArrayVisualizer from "./ArrayVisualizer";
import BinarySearchVisualizer from "./BinarySearchVisualizer";
import StackQueueVisualizer from "./StackQueueVisualizer";
import LinkedListVisualizer from "./LinkedListVisualizer";
import TwoPointersVisualizer from "./TwoPointersVisualizer";
import SortingVisualizer from "./SortingVisualizer";
import TreeVisualizer from "./TreeVisualizer";
import HashMapVisualizer from "./HashMapVisualizer";

export default function InteractiveVisualizer({ data }) {
  if (!data || typeof data !== "object") return null;

  const type = (data.type || "array_traversal").toLowerCase();
  const title = data.title || formatTypeTitle(type);
  const steps = Array.isArray(data.steps) && data.steps.length > 0 ? data.steps : [
    { description: "Initial State", array: data.initial || data.data || [10, 20, 30, 40] }
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 1x, 1.5x, 2x

  const timerRef = useRef(null);

  // Auto playback
  useEffect(() => {
    if (isPlaying) {
      const delay = Math.round(1800 / speed);
      timerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, delay);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, speed, steps.length]);

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentStep >= steps.length - 1) {
        setCurrentStep(0);
      }
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    setIsPlaying(false);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    setIsPlaying(false);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const toggleSpeed = () => {
    const nextSpeed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1;
    setSpeed(nextSpeed);
  };

  const activeStepData = steps[currentStep] || {};

  // Render the appropriate visual engine
  const renderVisualEngine = () => {
    switch (type) {
      case "array_insertion":
      case "array_deletion":
      case "array_traversal":
      case "linear_search":
        return (
          <ArrayVisualizer 
            stepData={activeStepData} 
            initialData={data.initial || data.data} 
          />
        );

      case "binary_search":
        return (
          <BinarySearchVisualizer 
            stepData={activeStepData} 
            initialData={data.initial || data.data}
            target={data.target}
          />
        );

      case "stack":
        return <StackQueueVisualizer stepData={activeStepData} mode="stack" />;

      case "queue":
        return <StackQueueVisualizer stepData={activeStepData} mode="queue" />;

      case "linked_list":
        return (
          <LinkedListVisualizer 
            stepData={activeStepData} 
            initialNodes={data.initialNodes || data.nodes} 
          />
        );

      case "two_pointers":
        return (
          <TwoPointersVisualizer 
            stepData={activeStepData} 
            initialData={data.initial || data.data} 
            isSlidingWindow={false}
          />
        );

      case "sliding_window":
        return (
          <TwoPointersVisualizer 
            stepData={activeStepData} 
            initialData={data.initial || data.data} 
            isSlidingWindow={true}
          />
        );

      case "sorting":
        return (
          <SortingVisualizer 
            stepData={activeStepData} 
            initialData={data.initial || data.data} 
          />
        );

      case "binary_tree":
        return (
          <TreeVisualizer 
            stepData={activeStepData} 
            initialTree={data.tree} 
          />
        );

      case "hash_map":
        return (
          <HashMapVisualizer 
            stepData={activeStepData} 
            initialBuckets={data.buckets} 
          />
        );

      default:
        return (
          <ArrayVisualizer 
            stepData={activeStepData} 
            initialData={data.initial || data.data} 
          />
        );
    }
  };

  return (
    <div className="my-3 rounded-xl border border-primary-500/30 bg-[#090D1A] overflow-hidden shadow-xl text-text-primary">
      {/* Visualizer Top Bar */}
      <div className="px-3.5 py-2.5 bg-surface-2/70 border-b border-border flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-primary-500/20 text-primary-400 flex items-center justify-center">
            <Layers size={14} />
          </div>
          <span className="text-xs font-semibold text-text-primary tracking-wide">
            {title}
          </span>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-primary-500/15 text-primary-300 border border-primary-500/30">
            Interactive
          </span>
        </div>

        {/* Step progress pills */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-text-muted">
          <span>Step</span>
          <span className="font-bold text-primary-400">{currentStep + 1}</span>
          <span>/</span>
          <span>{steps.length}</span>
        </div>
      </div>

      {/* Main Visualizer Stage */}
      <div className="p-3 sm:p-5 flex flex-col items-center justify-center min-h-[160px] bg-gradient-to-b from-[#090D1A] to-[#0D1326]">
        {renderVisualEngine()}
      </div>

      {/* Step Description Banner */}
      <div className="px-4 py-2.5 bg-surface-2/40 border-t border-border/80 flex items-start sm:items-center gap-2 text-xs leading-relaxed text-text-secondary">
        <Sparkles size={14} className="text-primary-400 mt-0.5 sm:mt-0 flex-shrink-0" />
        <span className="flex-1">
          {activeStepData.description || "Interactive execution step."}
        </span>
      </div>

      {/* Interactive Controls Footer */}
      <div className="px-3 py-2 bg-surface-2/80 border-t border-border flex items-center justify-between flex-wrap gap-2">
        {/* Playback Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleReset}
            title="Reset to beginning"
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw size={14} />
          </button>

          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 0}
            title="Previous step"
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <SkipBack size={14} />
          </button>

          <button
            type="button"
            onClick={handlePlayPause}
            className="px-2.5 py-1 bg-primary-600 hover:bg-primary-500 text-white rounded-lg flex items-center gap-1 text-xs font-semibold shadow transition-colors cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause size={12} />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={12} />
                <span>{currentStep >= steps.length - 1 ? "Replay" : "Animate"}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            title="Next step"
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <SkipForward size={14} />
          </button>
        </div>

        {/* Step click dots */}
        <div className="hidden sm:flex items-center gap-1">
          {steps.map((_, sIdx) => (
            <button
              key={sIdx}
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setCurrentStep(sIdx);
              }}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                sIdx === currentStep 
                  ? "w-5 bg-primary-400" 
                  : "w-2 bg-border-strong hover:bg-text-muted"
              }`}
              title={`Jump to step ${sIdx + 1}`}
            />
          ))}
        </div>

        {/* Speed button */}
        <button
          type="button"
          onClick={toggleSpeed}
          className="flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded bg-surface border border-border text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          title="Playback speed"
        >
          <Gauge size={12} />
          <span>{speed}x</span>
        </button>
      </div>
    </div>
  );
}

function formatTypeTitle(type) {
  switch (type) {
    case "array_insertion": return "Array Insertion";
    case "array_deletion": return "Array Deletion";
    case "array_traversal": return "Array Traversal";
    case "binary_search": return "Binary Search ($O(\\log n)$)";
    case "linear_search": return "Linear Search";
    case "stack": return "Stack (LIFO)";
    case "queue": return "Queue (FIFO)";
    case "linked_list": return "Singly Linked List";
    case "two_pointers": return "Two Pointers Technique";
    case "sliding_window": return "Sliding Window Technique";
    case "sorting": return "Sorting Algorithm Walkthrough";
    case "binary_tree": return "Binary Tree Traversal";
    case "hash_map": return "Hash Map (Key-Value)";
    default: return "Interactive Visualization";
  }
}
