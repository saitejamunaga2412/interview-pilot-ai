import React from "react";
import { Link, Globe, Code2 } from 'lucide-react';

function CompetitiveProfilesForm({ formData, onChange, errors }) {
  const urlInputs = [
    { key: "linkedinUrl", label: "LinkedIn URL", icon: Link, placeholder: "https://linkedin.com/in/username" },
    { key: "githubUrl", label: "GitHub URL", icon: Code2, placeholder: "https://github.com/username" },
    { key: "portfolioUrl", label: "Portfolio URL", icon: Globe, placeholder: "https://myportfolio.com" },
    { key: "leetcodeUrl", label: "LeetCode URL", icon: Code2, placeholder: "https://leetcode.com/username" },
    { key: "hackerrankUrl", label: "HackerRank URL", icon: Code2, placeholder: "https://hackerrank.com/username" },
    { key: "codechefUrl", label: "CodeChef URL", icon: Code2, placeholder: "https://codechef.com/users/username" },
    { key: "codeforcesUrl", label: "Codeforces URL", icon: Code2, placeholder: "https://codeforces.com/profile/username" },
    { key: "geeksforgeeksUrl", label: "GeeksforGeeks URL", icon: Code2, placeholder: "https://auth.geeksforgeeks.org/user/username" },
  ];

  return (
    <div className="space-y-4 mt-8">
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
        Online Profiles & Competitive Programming
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {urlInputs.map((input) => (
          <div key={input.key}>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <input.icon className="w-3.5 h-3.5" />
              {input.label}
            </label>
            <input
              type="url"
              value={formData.career?.[input.key] || formData?.[input.key] || ""}
              onChange={(e) => onChange(input.key, e.target.value)}
              placeholder={input.placeholder}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition ${
                errors[input.key]
                  ? "border-red-300 focus:border-red-400 bg-red-50/10"
                  : "border-gray-200 focus:border-indigo-400"
              }`}
            />
            {errors[input.key] && (
              <p className="text-xs text-red-500 font-medium mt-1">{errors[input.key]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CompetitiveProfilesForm;
