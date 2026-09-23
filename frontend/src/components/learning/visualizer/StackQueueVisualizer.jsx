import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function StackQueueVisualizer({ stepData, mode = "stack" }) {
  const items = stepData?.items || stepData?.stack || stepData?.queue || [10, 20, 30];
  const operation = stepData?.operation || "idle"; // push, pop, enqueue, dequeue
  const targetVal = stepData?.value;

  if (mode === "queue") {
    return (
      <div className="flex flex-col items-center w-full py-4">
        {/* Operation banner */}
        <div className="mb-3 text-xs font-mono text-text-muted flex items-center gap-2">
          <span>Operation:</span>
          <span className="font-bold text-primary-400 uppercase bg-surface-2 px-2 py-0.5 rounded border border-border">
            {operation} {targetVal !== undefined ? `(${targetVal})` : ""}
          </span>
        </div>

        {/* Queue container pipe */}
        <div className="flex items-center gap-2 max-w-full overflow-x-auto p-2">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-cyan-400 font-bold mb-1">REAR (In)</span>
            <div className="text-cyan-400">→</div>
          </div>

          <div className="flex items-center gap-2 p-2 border-y-2 border-primary-500/40 min-w-[200px] min-h-[60px] bg-surface-2/40 rounded-lg justify-start">
            <AnimatePresence>
              {items.map((item, idx) => (
                <motion.div
                  key={`${item}-${idx}`}
                  initial={{ scale: 0.8, opacity: 0, x: -20 }}
                  animate={{ scale: 1, opacity: 1, x: 0 }}
                  exit={{ scale: 0.8, opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center font-mono font-bold text-sm border shadow ${
                    idx === items.length - 1
                      ? "bg-cyan-500/20 border-cyan-500 text-cyan-200"
                      : idx === 0
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-200"
                        : "bg-surface-2 border-border text-text-primary"
                  }`}
                >
                  {item}
                </motion.div>
              ))}
            </AnimatePresence>
            {items.length === 0 && (
              <span className="text-text-muted text-xs italic font-mono px-4">Queue is empty</span>
            )}
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-emerald-400 font-bold mb-1">FRONT (Out)</span>
            <div className="text-emerald-400">→</div>
          </div>
        </div>
      </div>
    );
  }

  // Stack rendering (LIFO)
  return (
    <div className="flex flex-col items-center w-full py-4">
      <div className="mb-3 text-xs font-mono text-text-muted flex items-center gap-2">
        <span>Operation:</span>
        <span className="font-bold text-primary-400 uppercase bg-surface-2 px-2 py-0.5 rounded border border-border">
          {operation} {targetVal !== undefined ? `(${targetVal})` : ""}
        </span>
      </div>

      {/* Vertical Stack Cup */}
      <div className="relative w-36 sm:w-44 flex flex-col-reverse items-center p-2 border-x-2 border-b-4 border-primary-500/50 rounded-b-xl bg-surface-2/30 min-h-[160px] justify-start gap-2 shadow-inner">
        <AnimatePresence>
          {items.map((val, idx) => {
            const isTop = idx === items.length - 1;
            return (
              <motion.div
                key={`${val}-${idx}`}
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -30, opacity: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className={`w-full py-2.5 rounded-lg flex items-center justify-between px-3 text-xs sm:text-sm font-mono font-bold border shadow ${
                  isTop
                    ? "bg-primary-500/25 border-primary-400 text-primary-200 ring-2 ring-primary-500/30"
                    : "bg-surface-2 border-border text-text-primary"
                }`}
              >
                <span>{val}</span>
                {isTop && (
                  <span className="text-[10px] bg-primary-500 text-white px-1.5 py-0.2 rounded font-sans font-semibold">
                    TOP
                  </span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        {items.length === 0 && (
          <span className="text-text-muted text-xs italic font-mono my-auto">Stack is empty</span>
        )}
      </div>
      <span className="text-[10px] font-mono text-text-muted mt-2 font-medium">LIFO (Last In, First Out)</span>
    </div>
  );
}
