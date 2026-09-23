import React from "react";

/**
 * Reusable profile progress bar.
 * Renders completion percentage and status color.
 */
function ProfileProgressBar({ percentage }) {
  // Determine color theme based on progress
  let colorClass = "bg-red-500";
  let textClass = "text-red-600";
  if (percentage >= 80) {
    colorClass = "bg-emerald-500";
    textClass = "text-emerald-600 font-semibold";
  } else if (percentage >= 40) {
    colorClass = "bg-amber-500";
    textClass = "text-amber-600 font-semibold";
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1 text-sm font-medium">
        <span className="text-gray-700">Profile Completion</span>
        <span className={textClass}>{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ease-out ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default ProfileProgressBar;
