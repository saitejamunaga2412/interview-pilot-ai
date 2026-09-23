import React from "react";
import ProfileProgressBar from "./ProfileProgressBar";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { Link } from "react-router-dom";

function ProfileCompletionCard({ completion, showAction = true }) {
  const percentage = completion?.percentage || 0;
  const missingFields = completion?.missingFields || [];
  const completedFields = completion?.completedFields || [];

  // Limit display of missing fields to first 5, check if there are more
  const displayedMissing = missingFields.slice(0, 5);
  const remainingCount = missingFields.length - displayedMissing.length;

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        📊 Setup Progress
      </h2>

      {/* Progress meter */}
      <ProfileCompletionCard.ProgressBarWrapper percentage={percentage} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* Completed list summary */}
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs uppercase tracking-wider mb-2">
            <FiCheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Completed ({completedFields.length})</span>
          </div>
          {completedFields.length > 0 ? (
            <p className="text-xs text-gray-500 leading-relaxed">
              {completedFields.slice(0, 8).join(", ")}
              {completedFields.length > 8 ? "..." : ""}
            </p>
          ) : (
            <p className="text-xs text-gray-400 italic">No details filled yet.</p>
          )}
        </div>

        {/* Missing fields summary */}
        <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs uppercase tracking-wider mb-2">
            <FiAlertCircle className="w-4 h-4 text-amber-500" />
            <span>Incomplete ({missingFields.length})</span>
          </div>
          {missingFields.length > 0 ? (
            <div>
              <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                {displayedMissing.map((field, idx) => (
                  <li key={idx} className="truncate">{field}</li>
                ))}
              </ul>
              {remainingCount > 0 && (
                <span className="text-[10px] text-amber-600 font-semibold mt-1 block">
                  + {remainingCount} more incomplete field(s)
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs text-emerald-600 font-semibold italic">🎉 Your profile is 100% complete!</p>
          )}
        </div>
      </div>

      {showAction && missingFields.length > 0 && (
        <div className="mt-6 text-center">
          <Link
            to="/profile/edit"
            className="inline-flex items-center justify-center w-full bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-indigo-600 text-xs font-semibold px-4 py-2.5 rounded-2xl transition"
          >
            Complete Missing Fields
          </Link>
        </div>
      )}
    </div>
  );
}

// Attach Sub-component for clean layout
ProfileCompletionCard.ProgressBarWrapper = function ({ percentage }) {
  return <ProfileProgressBar percentage={percentage} />;
};

export default ProfileCompletionCard;
