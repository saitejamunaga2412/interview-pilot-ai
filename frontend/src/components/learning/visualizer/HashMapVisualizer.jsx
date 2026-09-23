import React from "react";
import { motion } from "framer-motion";

export default function HashMapVisualizer({ stepData, initialBuckets }) {
  const buckets = stepData?.buckets || initialBuckets || [
    { index: 0, items: [] },
    { index: 1, items: [{ key: "apple", val: 5 }] },
    { index: 2, items: [] },
    { index: 3, items: [{ key: "banana", val: 8 }, { key: "pear", val: 12 }] },
    { index: 4, items: [] }
  ];

  const activeBucket = stepData?.activeBucket;
  const activeKey = stepData?.activeKey;
  const hashCalc = stepData?.hashCalc;

  return (
    <div className="flex flex-col items-center w-full py-3">
      {hashCalc && (
        <div className="mb-3 text-xs font-mono bg-surface-2 px-3 py-1 rounded-full border border-border text-primary-300">
          {hashCalc}
        </div>
      )}

      <div className="w-full max-w-sm flex flex-col gap-1.5 p-2 bg-surface-2/30 rounded-xl border border-border">
        {buckets.map((b) => {
          const isActive = b.index === activeBucket;
          return (
            <div
              key={b.index}
              className={`flex items-center gap-2 p-1.5 rounded-lg border transition-colors ${
                isActive
                  ? "border-primary-500 bg-primary-500/15 ring-2 ring-primary-500/30"
                  : "border-border/60 bg-surface-2/60"
              }`}
            >
              <span className="w-6 text-center text-[10px] font-mono font-bold text-text-muted">
                [{b.index}]
              </span>

              <div className="flex items-center gap-1.5 flex-wrap flex-1">
                {b.items.length === 0 ? (
                  <span className="text-[10px] text-text-muted italic">empty</span>
                ) : (
                  b.items.map((item, idx) => {
                    const isTargetKey = item.key === activeKey;
                    return (
                      <motion.div
                        key={idx}
                        animate={{ scale: isTargetKey ? 1.05 : 1 }}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono border flex items-center gap-1 ${
                          isTargetKey
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                            : "bg-surface-2 border-border text-text-primary"
                        }`}
                      >
                        <span className="text-primary-300">{item.key}</span>:
                        <span>{item.val}</span>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
