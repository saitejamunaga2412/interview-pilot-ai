import React from "react";
import { motion } from "framer-motion";

export default function BinarySearchVisualizer({ stepData, initialData, target }) {
  const array = initialData || [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
  const targetVal = target !== undefined ? target : (stepData?.target !== undefined ? stepData.target : 23);
  
  const left = stepData?.left !== undefined ? stepData.left : 0;
  const right = stepData?.right !== undefined ? stepData.right : array.length - 1;
  const mid = stepData?.mid !== undefined ? stepData.mid : Math.floor((left + right) / 2);
  const isFound = stepData?.action === "found" || (mid !== null && array[mid] === targetVal);

  return (
    <div className="flex flex-col items-center w-full py-3">
      {/* Target indicator pill */}
      <div className="mb-3 px-3 py-1 bg-surface-2 rounded-full border border-border text-xs font-mono flex items-center gap-2">
        <span className="text-text-muted">Target:</span>
        <span className="font-bold text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded border border-primary-500/20">
          {targetVal}
        </span>
        {mid !== null && mid >= 0 && mid < array.length && (
          <>
            <span className="text-text-muted">|</span>
            <span className="text-text-muted">Mid Val:</span>
            <span className={`font-bold px-2 py-0.5 rounded border ${
              isFound 
                ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" 
                : array[mid] < targetVal 
                  ? "text-amber-400 border-amber-500/30 bg-amber-500/10" 
                  : "text-rose-400 border-rose-500/30 bg-rose-500/10"
            }`}>
              {array[mid]} {isFound ? "== Target (Found!)" : array[mid] < targetVal ? "< Target (Go Right)" : "> Target (Go Left)"}
            </span>
          </>
        )}
      </div>

      {/* Array Elements */}
      <div className="flex flex-wrap items-end justify-center gap-1.5 sm:gap-2.5 max-w-full overflow-x-auto p-2">
        {array.map((val, idx) => {
          const inRange = idx >= left && idx <= right;
          const isMid = idx === mid;
          const isLeft = idx === left;
          const isRight = idx === right;

          let borderColor = "border-border";
          let bgColor = "bg-surface-2 text-text-primary";
          let opacity = inRange ? "opacity-100" : "opacity-30 line-through grayscale";

          if (isMid) {
            if (isFound) {
              borderColor = "border-emerald-500 ring-2 ring-emerald-500/60";
              bgColor = "bg-emerald-500/25 text-emerald-300 font-bold";
            } else {
              borderColor = "border-primary-500 ring-2 ring-primary-500/60";
              bgColor = "bg-primary-500/30 text-primary-200 font-bold";
            }
          } else if (inRange) {
            borderColor = "border-cyan-500/40";
            bgColor = "bg-cyan-500/10 text-cyan-200";
          }

          return (
            <div key={idx} className={`flex flex-col items-center transition-opacity duration-300 ${opacity}`}>
              {/* Pointer tags */}
              <div className="h-6 flex items-center justify-center gap-1 text-[10px] font-mono font-bold mb-1">
                {isLeft && (
                  <span className="px-1 bg-cyan-500 text-black rounded text-[9px]">L</span>
                )}
                {isMid && (
                  <span className="px-1 bg-primary-500 text-white rounded text-[9px]">M</span>
                )}
                {isRight && (
                  <span className="px-1 bg-amber-500 text-black rounded text-[9px]">R</span>
                )}
              </div>

              {/* Box */}
              <motion.div
                animate={{ scale: isMid ? 1.1 : 1 }}
                className={`w-9 h-11 sm:w-12 sm:h-13 rounded-xl flex items-center justify-center text-xs sm:text-sm font-mono border ${borderColor} ${bgColor} shadow transition-colors`}
              >
                {val}
              </motion.div>

              {/* Index */}
              <span className="text-[9px] font-mono text-text-muted mt-1">
                [{idx}]
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
