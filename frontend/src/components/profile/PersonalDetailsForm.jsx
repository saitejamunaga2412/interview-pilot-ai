import React, { useState } from "react";

function PersonalDetailsForm({ formData, onChange, errors }) {
  const handleGenderChange = (e) => {
    onChange("gender", e.target.value);
  };

  // Convert Date object/string to YYYY-MM-DD for input value
  const formatDateValue = (dob) => {
    if (!dob) return "";
    const d = new Date(dob);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().substring(0, 10);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
        Personal Details
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name input */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name || ""}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="John Doe"
            className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition ${
              errors.name
                ? "border-red-300 focus:border-red-400 bg-red-50/10"
                : "border-gray-200 focus:border-indigo-400"
            }`}
          />
          {errors.name && (
            <p className="text-xs text-red-500 font-medium mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email input (Disabled) */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email || ""}
            disabled
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
          />
          <p className="text-[10px] text-gray-400 mt-1">Email address cannot be changed.</p>
        </div>

        {/* Phone input */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phoneNumber || ""}
            onChange={(e) => onChange("phoneNumber", e.target.value)}
            placeholder="+1234567890"
            className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition ${
              errors.phoneNumber
                ? "border-red-300 focus:border-red-400 bg-red-50/10"
                : "border-gray-200 focus:border-indigo-400"
            }`}
          />
          {errors.phoneNumber && (
            <p className="text-xs text-red-500 font-medium mt-1">{errors.phoneNumber}</p>
          )}
        </div>

        {/* Date of Birth input */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Date of Birth
          </label>
          <input
            type="date"
            value={formatDateValue(formData.dateOfBirth)}
            onChange={(e) => onChange("dateOfBirth", e.target.value)}
            max={new Date().toISOString().substring(0, 10)}
            className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition ${
              errors.dateOfBirth
                ? "border-red-300 focus:border-red-400 bg-red-50/10"
                : "border-gray-200 focus:border-indigo-400"
            }`}
          />
          {errors.dateOfBirth && (
            <p className="text-xs text-red-500 font-medium mt-1">{errors.dateOfBirth}</p>
          )}
        </div>

        {/* Gender select */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Gender
          </label>
          <select
            value={formData.gender || ""}
            onChange={handleGenderChange}
            className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition ${
              errors.gender
                ? "border-red-300 focus:border-red-400 bg-red-50/10"
                : "border-gray-200 focus:border-indigo-400 bg-white"
            }`}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
          {errors.gender && (
            <p className="text-xs text-red-500 font-medium mt-1">{errors.gender}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PersonalDetailsForm;
