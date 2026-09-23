import React from 'react';

export const CodeDiffViewer = ({ userCode, optimalCode }) => {
  return (
    <div className="flex flex-col rounded-xl overflow-hidden border border-border mt-4">
      <div className="flex bg-[#1e1e1e] border-b border-border text-xs text-gray-400 font-semibold uppercase tracking-wider">
        <div className="w-1/2 p-2 border-r border-border text-center">Your Approach</div>
        <div className="w-1/2 p-2 text-center text-green-500">Optimal Approach</div>
      </div>
      <div className="flex bg-[#1e1e1e] max-h-96 overflow-y-auto">
        <div className="w-1/2 p-4 border-r border-border border-opacity-50 text-xs font-mono text-gray-300 whitespace-pre-wrap opacity-70 bg-red-900/10">
          {userCode || "// No code submitted"}
        </div>
        <div className="w-1/2 p-4 text-xs font-mono text-green-300 whitespace-pre-wrap bg-green-900/10">
          {optimalCode || "// Optimal logic..."}
        </div>
      </div>
    </div>
  );
};
