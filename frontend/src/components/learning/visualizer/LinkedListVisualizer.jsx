import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function LinkedListVisualizer({ stepData, initialNodes }) {
  const nodes = stepData?.nodes || initialNodes || [
    { id: "n1", val: 10, next: "n2" },
    { id: "n2", val: 20, next: "n3" },
    { id: "n3", val: 30, next: "n4" },
    { id: "n4", val: 40, next: null }
  ];

  const activeNodeId = stepData?.activeNodeId;
  const targetNodeId = stepData?.targetNodeId;
  const action = stepData?.action; // visit, insert, delete

  return (
    <div className="flex flex-col items-center w-full py-4 overflow-x-auto">
      <div className="flex items-center gap-2 sm:gap-3 p-2 min-w-max">
        {/* HEAD pointer tag */}
        <div className="flex flex-col items-center mr-1">
          <span className="text-[10px] font-mono text-primary-400 font-bold">HEAD</span>
          <ArrowRight size={14} className="text-primary-400" />
        </div>

        {nodes.map((node, idx) => {
          const isActive = node.id === activeNodeId;
          const isTarget = node.id === targetNodeId;

          let borderColor = "border-border";
          let bgColor = "bg-surface-2 text-text-primary";

          if (isActive) {
            borderColor = "border-primary-500 ring-2 ring-primary-500/50";
            bgColor = "bg-primary-500/25 text-primary-200 font-bold";
          } else if (isTarget) {
            borderColor = "border-emerald-500 ring-2 ring-emerald-500/50";
            bgColor = "bg-emerald-500/20 text-emerald-200";
          }

          return (
            <React.Fragment key={node.id || idx}>
              {/* Node container */}
              <motion.div
                layout
                animate={{ scale: isActive ? 1.08 : 1 }}
                className={`flex rounded-xl overflow-hidden border ${borderColor} ${bgColor} shadow-md`}
              >
                {/* Data part */}
                <div className="px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-center font-mono text-xs sm:text-sm font-semibold min-w-[42px]">
                  {node.val}
                </div>
                {/* Pointer part */}
                <div className="px-2 py-2 sm:py-2.5 bg-surface-2 border-l border-border/80 flex items-center justify-center text-[10px] font-mono text-text-muted">
                  •
                </div>
              </motion.div>

              {/* Arrow linking to next node */}
              {idx < nodes.length - 1 ? (
                <div className="flex items-center text-primary-400 px-0.5">
                  <ArrowRight size={16} />
                </div>
              ) : (
                <div className="flex items-center gap-1 text-text-muted font-mono text-xs pl-1">
                  <ArrowRight size={14} />
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 border border-border">NULL</span>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
