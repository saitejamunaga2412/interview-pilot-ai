import React from "react";
import { motion } from "framer-motion";

export default function SortingVisualizer({ stepData, initialData }) {
  const array = stepData?.array || initialData || [45, 12, 85, 32, 89, 39, 69, 22];
  const comparing = stepData?.comparing || [];
  const swapped = stepData?.swapped || [];
  const sorted = stepData?.sorted || [];
  const maxVal = Math.max(...array, 100);

  return (
    <div className="flex flex-col items-center w-full py-4">
      <div className="flex items-end justify-center gap-2 sm:gap-3 h-36 sm:h-44 w-full px-2">
        {array.map((val, idx) => {
          const isComparing = comparing.includes(idx);
          const isSwapped = swapped.includes(idx);
          const isSorted = sorted.includes(idx);

          let barColor = "bg-primary-500/30 border-primary-500/50 text-primary-200";
          if (isComparing) {
            barColor = "bg-amber-500/40 border-amber-500 text-amber-200 ring-2 ring-amber-500/40";
          } else if (isSwapped) {
            barColor = "bg-rose-500/40 border-rose-500 text-rose-200 ring-2 ring-rose-500/40";
          } else if (isSorted) {
            barColor = "bg-emerald-500/40 border-emerald-500 text-emerald-200";
          }

          const heightPercent = Math.max(18, Math.round((val / maxVal) * 100));

          return (
            <div key={idx} className="flex flex-col items-center flex-1 max-w-[42px] h-full justify-end">
              <span className="text-[10px] font-mono text-text-muted mb-1">{val}</span>
              <motion.div
                layout
                animate={{ height: `${heightPercent}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`w-full rounded-t-lg border ${barColor} flex items-center justify-center shadow`}
              />
              <span className="text-[9px] font-mono text-text-muted mt-1">[{idx}]</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
