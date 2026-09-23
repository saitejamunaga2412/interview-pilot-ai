import React from "react";
import { motion } from "framer-motion";

export default function TreeVisualizer({ stepData, initialTree }) {
  // Tree representation (3 levels: Root, Left/Right, 4 Leaves)
  const activeNode = stepData?.activeNode; // e.g. "root", "left", "right"
  const visitedNodes = stepData?.visited || [];

  const treeNodes = [
    { id: "root", val: 10, label: "Root", x: 140, y: 25 },
    { id: "left", val: 5, label: "Left", x: 70, y: 85 },
    { id: "right", val: 15, label: "Right", x: 210, y: 85 },
    { id: "left_left", val: 2, label: "L.Left", x: 35, y: 145 },
    { id: "left_right", val: 7, label: "L.Right", x: 105, y: 145 },
    { id: "right_right", val: 20, label: "R.Right", x: 245, y: 145 }
  ];

  const links = [
    { from: "root", to: "left" },
    { from: "root", to: "right" },
    { from: "left", to: "left_left" },
    { from: "left", to: "left_right" },
    { from: "right", to: "right_right" }
  ];

  return (
    <div className="flex flex-col items-center w-full py-2">
      <div className="relative w-[280px] sm:w-[320px] h-[190px] border border-border/50 rounded-xl bg-surface-2/20 p-2">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 280 175">
          {links.map((link, idx) => {
            const source = treeNodes.find(n => n.id === link.from);
            const target = treeNodes.find(n => n.id === link.to);
            if (!source || !target) return null;
            return (
              <line
                key={idx}
                x1={source.x}
                y1={source.y + 12}
                x2={target.x}
                y2={target.y}
                stroke="currentColor"
                className="text-border-strong"
                strokeWidth="2"
              />
            );
          })}
        </svg>

        {treeNodes.map((node) => {
          const isActive = activeNode === node.id || activeNode === node.val;
          const isVisited = visitedNodes.includes(node.id) || visitedNodes.includes(node.val);

          let circleColor = "bg-surface-2 border-border text-text-primary";
          if (isActive) {
            circleColor = "bg-primary-500 text-white border-primary-400 ring-4 ring-primary-500/40 font-bold scale-110";
          } else if (isVisited) {
            circleColor = "bg-emerald-500/25 border-emerald-500 text-emerald-300 font-bold";
          }

          return (
            <motion.div
              key={node.id}
              style={{
                position: "absolute",
                left: `${node.x - 16}px`,
                top: `${node.y - 12}px`
              }}
              animate={{ scale: isActive ? 1.15 : 1 }}
              className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-mono shadow ${circleColor} transition-transform`}
            >
              {node.val}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
