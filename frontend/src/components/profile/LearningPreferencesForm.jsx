import React from "react";
import TagInput from "./TagInput";

function LearningPreferencesForm({ learningData, onChange, errors }) {
  const handleFieldChange = (field, val) => {
    onChange(field, val);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
        Learning Preferences
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Preferred Domains tag input */}
        <div className="md:col-span-2">
          <TagInput
            label="Preferred Domains"
            tags={learningData?.preferredDomains}
            onChange={(val) => handleFieldChange("preferredDomains", val)}
            placeholder="e.g. AI/ML, Frontend, Cybersecurity, Backend"
            error={errors.preferredDomains}
          />
        </div>

        {/* Daily Study Goal input */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Daily Study Goal (Minutes)
          </label>
          <input
            type="number"
            value={learningData?.dailyStudyGoalMinutes || ""}
            onChange={(e) => {
              const val = e.target.value;
              handleFieldChange(
                "dailyStudyGoalMinutes",
                val === "" ? null : Number(val)
              );
            }}
            placeholder="e.g. 45 (between 15 and 1440)"
            className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition ${
              errors.dailyStudyGoalMinutes
                ? "border-red-300 focus:border-red-400 bg-red-50/10"
                : "border-gray-200 focus:border-indigo-400"
            }`}
          />
          {errors.dailyStudyGoalMinutes && (
            <p className="text-xs text-red-500 font-medium mt-1">{errors.dailyStudyGoalMinutes}</p>
          )}
        </div>

        {/* Preferred Programming Language dropdown */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Preferred Programming Language
          </label>
          <select
            value={learningData?.preferredLanguage || ""}
            onChange={(e) => handleFieldChange("preferredLanguage", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-white transition"
          >
            <option value="">Select Language</option>
            <option value="JavaScript">JavaScript</option>
            <option value="Python">Python</option>
            <option value="Java">Java</option>
            <option value="C++">C++</option>
            <option value="Go">Go</option>
          </select>
        </div>

        {/* Preferred Interview Type dropdown */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Preferred Interview Type
          </label>
          <select
            value={learningData?.preferredInterviewType || ""}
            onChange={(e) => handleFieldChange("preferredInterviewType", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-white transition"
          >
            <option value="">Select Interview Type</option>
            <option value="Technical">Technical</option>
            <option value="HR">HR</option>
            <option value="Behavioral">Behavioral</option>
            <option value="Mixed">Mixed</option>
          </select>
        </div>

        {/* Preferred Difficulty dropdown */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Preferred Difficulty
          </label>
          <select
            value={learningData?.preferredDifficulty || ""}
            onChange={(e) => handleFieldChange("preferredDifficulty", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-white transition"
          >
            <option value="">Select Difficulty</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        {/* Daily Study Reminders Toggle */}
        <div className="md:col-span-2 mt-2">
          <div className="flex items-center justify-between p-4 bg-gray-50/50 border border-gray-100 rounded-2xl">
            <div>
              <span className="block text-sm font-semibold text-gray-800">
                Daily Study Reminders
              </span>
              <span className="block text-xs text-gray-400 mt-0.5">
                Receive friendly reminders to keep up with your coding goals
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleFieldChange("dailyReminder", !learningData?.dailyReminder)}
              className={`relative inline-flex h-6.5 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 ${
                learningData?.dailyReminder ? "bg-indigo-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                  learningData?.dailyReminder ? "translate-x-5.5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LearningPreferencesForm;
