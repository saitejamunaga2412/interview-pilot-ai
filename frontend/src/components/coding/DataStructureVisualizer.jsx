import React from 'react';
import { motion } from 'framer-motion';

// Reusable Data Structure Visualizer Engine
export const DataStructureVisualizer = ({ type, data, activeIndices = [], pointers = {} }) => {
  if (type === 'Array' || type === 'String') {
    return (
      <div className="flex flex-wrap gap-2 justify-center items-center p-6 bg-slate-900 rounded-xl overflow-x-auto min-h-[120px]">
        {data.map((item, idx) => {
          const isActive = activeIndices.includes(idx);
          // Check for pointers pointing to this index (e.g. { "i": 0, "j": 4 })
          const currentPointers = Object.keys(pointers).filter(p => pointers[p] === idx);
          
          return (
            <div key={idx} className="relative flex flex-col items-center">
              {currentPointers.length > 0 && (
                <div className="absolute -top-8 flex gap-1">
                  {currentPointers.map(p => (
                    <motion.div 
                      key={p}
                      initial={{ y: -5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded"
                    >
                      {p} ↓
                    </motion.div>
                  ))}
                </div>
              )}
              
              <motion.div 
                animate={{ 
                  scale: isActive ? 1.1 : 1,
                  backgroundColor: isActive ? '#4f46e5' : '#1e293b',
                  borderColor: isActive ? '#818cf8' : '#334155'
                }}
                className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 font-mono text-lg font-bold shadow-lg
                  ${isActive ? 'text-white shadow-indigo-500/50 z-10' : 'text-slate-300'}`}
              >
                {item}
              </motion.div>
              
              <div className="text-[10px] text-slate-500 mt-2 font-mono">{idx}</div>
            </div>
          );
        })}
      </div>
    );
  }

  // Placeholder for Trees/Graphs
  return (
    <div className="flex items-center justify-center p-8 bg-slate-900 rounded-xl text-slate-500 font-mono text-sm border border-slate-800 border-dashed">
       {type} Visualizer Engine (Engine Ready for Expansion)
    </div>
  );
};
