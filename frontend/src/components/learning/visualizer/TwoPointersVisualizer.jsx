import React from "react";
import { motion } from "framer-motion";

export default function TwoPointersVisualizer({ stepData, initialData, isSlidingWindow = false }) {
  const array = stepData?.array || initialData || [1, 2, 4, 6, 8, 11];
  const left = stepData?.left !== undefined ? stepData.left : 0;
  const right = stepData?.right !== undefined ? stepData.right : array.length - 1;
  const windowStart = stepData?.windowStart !== undefined ? stepData.windowStart : left;
  const windowEnd = stepData?.windowEnd !== undefined ? stepData.windowEnd : right;
  const statusNote = stepData?.statusNote;

  return (
    <div className="flex flex-col items-center w-full py-4">
      {statusNote && (
        <div className="mb-3 px-3 py-1 bg-surface-2 rounded-full border border-border text-xs font-mono text-primary-300">
          {statusNote}
        </div>
      )}

      <div className="flex flex-wrap items-end justify-center gap-2 max-w-full overflow-x-auto p-2">
        {array.map((val, idx) => {
          const isLeft = idx === left;
          const isRight = idx === right;
          const inWindow = isSlidingWindow ? idx >= windowStart && idx <= windowEnd : false;

          let borderColor = "border-border";
          let bgColor = "bg-surface-2 text-text-primary";

          if (isLeft || isRight) {
            borderColor = isLeft ? "border-cyan-400 ring-2 ring-cyan-400/40" : "border-amber-400 ring-2 ring-amber-400/40";
            bgColor = isLeft ? "bg-cyan-500/20 text-cyan-200 font-bold" : "bg-amber-500/20 text-amber-200 font-bold";
          } else if (inWindow) {
            borderColor = "border-primary-500/60";
            bgColor = "bg-primary-500/15 text-primary-200";
          }

          return (
            <div key={idx} className="flex flex-col items-center">
              {/* Pointers row */}
              <div className="h-5 flex items-center justify-center gap-1 text-[10px] font-mono font-bold mb-1">
                {isLeft && <span className="px-1 bg-cyan-500 text-black rounded text-[9px]">L</span>}
                {isRight && <span className="px-1 bg-amber-500 text-black rounded text-[9px]">R</span>}
                {inWindow && !isLeft && !isRight && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400"></span>
                )}
              </div>

              {/* Element box */}
              <motion.div
                animate={{ scale: isLeft || isRight ? 1.08 : 1 }}
                className={`w-11 h-12 sm:w-13 sm:h-14 rounded-xl flex items-center justify-center text-xs sm:text-sm font-mono border ${borderColor} ${bgColor} shadow`}
              >
                {val}
              </motion.div>

              {/* Index */}
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
