import React from "react";

function AcademicDetailsForm({ academicData, onChange, errors }) {
  const handleFieldChange = (field, val) => {
    onChange(field, val);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
        Academic Details
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* College input */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            College Name
          </label>
          <input
            type="text"
            value={academicData?.college || ""}
            onChange={(e) => handleFieldChange("college", e.target.value)}
            placeholder="e.g. MIT"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 transition"
          />
        </div>

        {/* University input */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            University Name
          </label>
          <input
            type="text"
            value={academicData?.university || ""}
            onChange={(e) => handleFieldChange("university", e.target.value)}
            placeholder="e.g. Massachusetts Institute of Technology"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 transition"
          />
        </div>

        {/* Degree input */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Degree
          </label>
          <input
            type="text"
            value={academicData?.degree || ""}
            onChange={(e) => handleFieldChange("degree", e.target.value)}
            placeholder="e.g. Bachelor of Science"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 transition"
          />
        </div>

        {/* Branch/Specialization input */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Branch / Specialization
          </label>
          <input
            type="text"
            value={academicData?.branch || ""}
            onChange={(e) => handleFieldChange("branch", e.target.value)}
            placeholder="e.g. Computer Science and Engineering"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 transition"
          />
        </div>

        {/* Graduation Year input */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Graduation Year
          </label>
          <input
            type="number"
            value={academicData?.graduationYear || ""}
            onChange={(e) => handleFieldChange("graduationYear", e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="e.g. 2025"
            className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition ${
              errors.graduationYear
                ? "border-red-300 focus:border-red-400 bg-red-50/10"
                : "border-gray-200 focus:border-indigo-400"
            }`}
          />
          {errors.graduationYear && (
            <p className="text-xs text-red-500 font-medium mt-1">{errors.graduationYear}</p>
          )}
        </div>

        {/* CGPA input */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Cumulative GPA (CGPA)
          </label>
          <input
            type="number"
            step="0.01"
            value={academicData?.cgpa || ""}
            onChange={(e) => handleFieldChange("cgpa", e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="e.g. 9.15"
            className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition ${
              errors.cgpa
                ? "border-red-300 focus:border-red-400 bg-red-50/10"
                : "border-gray-200 focus:border-indigo-400"
            }`}
          />
          {errors.cgpa && (
            <p className="text-xs text-red-500 font-medium mt-1">{errors.cgpa}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AcademicDetailsForm;