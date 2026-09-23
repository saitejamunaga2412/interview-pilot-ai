import React from "react";
import { motion } from "framer-motion";

export default function ArrayVisualizer({ stepData, initialData }) {
  const currentArray = stepData?.array || initialData || [10, 20, 30, 40, 50];
  const highlights = stepData?.highlight || [];
  const action = stepData?.action || "normal"; // compare, swap, shift, insert, delete, match
  const pointerLabel = stepData?.pointerLabel;
  const secondaryHighlights = stepData?.secondaryHighlight || [];

  return (
    <div className="flex flex-col items-center justify-center py-4 w-full">
      {/* Array Elements Row */}
      <div className="flex flex-wrap items-end justify-center gap-2 sm:gap-3 max-w-full overflow-x-auto p-2">
        {currentArray.map((val, idx) => {
          const isHighlighted = highlights.includes(idx);
          const isSecondary = secondaryHighlights.includes(idx);
          const isDeleted = val === null || val === undefined;

          let borderColor = "border-border";
          let bgColor = "bg-surface-2/80 text-text-primary";
          let scale = 1;

          if (isHighlighted) {
            if (action === "insert" || action === "inserted") {
              borderColor = "border-emerald-500 ring-2 ring-emerald-500/40";
              bgColor = "bg-emerald-500/20 text-emerald-300 font-bold";
              scale = 1.08;
            } else if (action === "delete" || action === "deleted") {
              borderColor = "border-rose-500 ring-2 ring-rose-500/40";
              bgColor = "bg-rose-500/20 text-rose-300 line-through";
            } else if (action === "shift") {
              borderColor = "border-amber-500 ring-2 ring-amber-500/40";
              bgColor = "bg-amber-500/20 text-amber-300 font-bold";
              scale = 1.05;
            } else {
              borderColor = "border-primary-500 ring-2 ring-primary-500/50";
              bgColor = "bg-primary-500/25 text-primary-200 font-bold";
              scale = 1.08;
            }
          } else if (isSecondary) {
            borderColor = "border-cyan-500/70";
            bgColor = "bg-cyan-500/15 text-cyan-200";
          }

          return (
            <div key={idx} className="flex flex-col items-center">
              {/* Pointer indicator */}
              <div className="h-5 flex items-center justify-center text-[10px] font-mono font-bold text-primary-400 mb-1">
                {isHighlighted && (
                  <motion.div
                    initial={{ y: -4, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex flex-col items-center"
                  >
                    <span>{pointerLabel || "▼"}</span>
                  </motion.div>
                )}
              </div>

              {/* Box container */}
              <motion.div
                layout
                animate={{ scale }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className={`w-11 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-sm sm:text-base font-mono border ${borderColor} ${bgColor} shadow-md select-none transition-colors`}
              >
                {isDeleted ? (
                  <span className="text-text-muted text-xs italic font-sans">[empty]</span>
                ) : (
                  <span>{val}</span>
                )}
              </motion.div>

              {/* Index subscript */}
              <span className="text-[10px] font-mono text-text-muted mt-1.5 font-medium">
                [{idx}]
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
