import React, { useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import TagInput from "./TagInput";

function CareerDetailsForm({ careerData, onChange, errors }) {
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState("Beginner");

  const handleFieldChange = (field, val) => {
    onChange(field, val);
  };

  // Add a skill to the skills array
  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;

    const currentSkills = careerData?.skills || [];
    // Check for duplicates
    if (currentSkills.some((s) => s.name.toLowerCase() === newSkillName.trim().toLowerCase())) {
      return;
    }

    const updatedSkills = [...currentSkills, { name: newSkillName.trim(), level: newSkillLevel }];
    handleFieldChange("skills", updatedSkills);
    setNewSkillName("");
    setNewSkillLevel("Beginner");
  };

  // Remove a skill from the skills array
  const handleRemoveSkill = (indexToRemove) => {
    const updatedSkills = (careerData?.skills || []).filter((_, idx) => idx !== indexToRemove);
    handleFieldChange("skills", updatedSkills);
  };

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
        Career Details
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Target Role input */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Target Job Role
          </label>
          <input
            type="text"
            value={careerData?.targetRole || ""}
            onChange={(e) => handleFieldChange("targetRole", e.target.value)}
            placeholder="e.g. Full Stack Developer"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 transition"
          />
        </div>

        {/* Current Skill Level dropdown */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Overall Skill Level
          </label>
          <select
            value={careerData?.currentSkillLevel || ""}
            onChange={(e) => handleFieldChange("currentSkillLevel", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-white transition"
          >
            <option value="">Select Skill Level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        {/* Target Companies */}
        <div className="md:col-span-2">
          <TagInput
            label="Target Companies"
            tags={careerData?.targetCompanies}
            onChange={(val) => handleFieldChange("targetCompanies", val)}
            placeholder="Google, Microsoft, Meta, Apple"
            error={errors.targetCompanies}
          />
        </div>

        {/* Certifications */}
        <div className="md:col-span-2">
          <TagInput
            label="Certifications"
            tags={careerData?.certifications}
            onChange={(val) => handleFieldChange("certifications", val)}
            placeholder="AWS Certified Developer, Google Cloud Architect"
            error={errors.certifications}
          />
        </div>
      </div>

      {/* Skills dynamic manager */}
      <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Manage Technical Skills
        </label>

        {/* Form to add a new skill */}
        <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
          <input
            type="text"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            placeholder="Skill Name (e.g. React)"
            className="flex-1 min-w-0 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white transition"
          />
          <select
            value={newSkillLevel}
            onChange={(e) => setNewSkillLevel(e.target.value)}
            className="w-full sm:w-40 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white transition"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
          <button
            type="button"
            onClick={handleAddSkill}
            className="flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2 rounded-xl transition"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Skill</span>
          </button>
        </div>

        {/* Inline skills warning error */}
        {errors.skills && (
          <p className="text-xs text-red-500 font-medium mb-3">{errors.skills}</p>
        )}

        {/* Added skills tag list */}
        <div className="flex flex-wrap gap-2">
          {Array.isArray(careerData?.skills) && careerData.skills.length > 0 ? (
            careerData.skills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-semibold"
              >
                <span>{skill.name}</span>
                <span className="text-[9px] bg-indigo-200/50 text-indigo-800 px-1.5 py-0.5 rounded-full">
                  {skill.level}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(idx)}
                  className="text-indigo-400 hover:text-red-500 transition cursor-pointer"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>
              </span>
            ))
          ) : (
            <p className="text-xs text-gray-400 italic">No skills added yet. Add one above.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CareerDetailsForm;