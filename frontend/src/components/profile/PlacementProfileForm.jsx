import React from "react";
import TagInput from "./TagInput";

function PlacementProfileForm({ placementData, onChange, errors }) {
  const handleFieldChange = (field, val) => {
    onChange(field, val);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
        Placement Profile
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Target Year input */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Target Placement Year
          </label>
          <input
            type="number"
            value={placementData?.targetYear || ""}
            onChange={(e) => handleFieldChange("targetYear", e.target.value)}
            placeholder="e.g. 2025"
            className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition ${
              errors.placementTargetYear
                ? "border-red-300 focus:border-red-400 bg-red-50/10"
                : "border-gray-200 focus:border-indigo-400"
            }`}
          />
          {errors.placementTargetYear && (
            <p className="text-xs text-red-500 font-medium mt-1">{errors.placementTargetYear}</p>
          )}
        </div>

        {/* Current Semester input */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Current Semester
          </label>
          <input
            type="number"
            value={placementData?.currentSemester || ""}
            onChange={(e) => handleFieldChange("currentSemester", e.target.value)}
            placeholder="e.g. 7"
            className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition ${
              errors.currentSemester
                ? "border-red-300 focus:border-red-400 bg-red-50/10"
                : "border-gray-200 focus:border-indigo-400"
            }`}
          />
          {errors.currentSemester && (
            <p className="text-xs text-red-500 font-medium mt-1">{errors.currentSemester}</p>
          )}
        </div>

        {/* Dream Companies */}
        <div className="md:col-span-2">
          <TagInput
            label="Dream Companies"
            tags={placementData?.dreamCompanies}
            onChange={(val) => handleFieldChange("dreamCompanies", val)}
            placeholder="Netflix, Amazon, Stripe, Coinbase"
            error={errors.dreamCompanies}
          />
        </div>

        {/* Interested Domains */}
        <div className="md:col-span-2">
          <TagInput
            label="Interested Domains"
            tags={placementData?.interestedDomains}
            onChange={(val) => handleFieldChange("interestedDomains", val)}
            placeholder="Frontend, Systems Engineering, Cybersecurity, AI/ML"
            error={errors.interestedDomains}
          />
        </div>
      </div>
    </div>
  );
}

export default PlacementProfileForm;