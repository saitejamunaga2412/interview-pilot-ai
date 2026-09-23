import React, { useState, useRef } from "react";
import { FiX } from "react-icons/fi";

function TagInput({ label, tags = [], onChange, placeholder = "Add new...", error }) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);

  // Ensure tags is always an array
  const safeTags = Array.isArray(tags) ? tags : [];

  const addTag = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    // Prevent duplicates (case-insensitive check)
    if (safeTags.some((tag) => tag.toLowerCase() === trimmed.toLowerCase())) {
      setInputValue("");
      return;
    }

    const updatedTags = [...safeTags, trimmed];
    onChange(updatedTags);
    setInputValue("");
  };

  const handleRemoveTag = (indexToRemove) => {
    const updatedTags = safeTags.filter((_, idx) => idx !== indexToRemove);
    onChange(updatedTags);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;

    // If input contains a comma, we handle comma-separated values (like copy-pasting)
    if (value.includes(",")) {
      const parts = value.split(",");
      const lastPart = parts.pop();
      const currentTags = [...safeTags];
      let updated = false;

      parts.forEach((part) => {
        const trimmed = part.trim();
        if (trimmed && !currentTags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
          currentTags.push(trimmed);
          updated = true;
        }
      });

      if (updated) {
        onChange(currentTags);
      }
      setInputValue(lastPart);
    } else {
      setInputValue(value);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue) {
      if (safeTags.length > 0) {
        handleRemoveTag(safeTags.length - 1);
      }
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <div
        onClick={handleContainerClick}
        className={`flex flex-wrap gap-2 items-center w-full border rounded-xl p-2 text-sm transition min-h-[46px] bg-white cursor-text ${
          error
            ? "border-red-300 focus-within:border-red-400 focus-within:ring-1 focus-within:ring-red-400 bg-red-50/10"
            : "border-gray-200 focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400"
        }`}
      >
        {safeTags.map((tag, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 pl-3 pr-2 py-1 rounded-lg text-xs font-semibold select-none"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveTag(idx);
              }}
              className="text-indigo-400 hover:text-red-500 transition cursor-pointer focus:outline-none"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={safeTags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent outline-none py-0.5 px-2 text-sm text-gray-800 placeholder-gray-400 border-none focus:ring-0"
        />
      </div>
      {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}
    </div>
  );
}

export default TagInput;
