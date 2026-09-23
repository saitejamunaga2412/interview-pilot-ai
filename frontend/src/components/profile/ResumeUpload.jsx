import React, { useState } from "react";
import { uploadResume } from "../../services/profileApi";
import { FiFileText, FiUploadCloud, FiCheck, FiDownload } from "react-icons/fi";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "") : "");

function ResumeUpload({ currentResumeUrl, onUploadSuccess, onUploadError }) {
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const resumeFileName = currentResumeUrl
    ? currentResumeUrl.substring(currentResumeUrl.lastIndexOf("/") + 1)
    : "";

  const resumeDownloadUrl = currentResumeUrl
    ? currentResumeUrl.startsWith("http")
      ? currentResumeUrl
      : `${BACKEND_URL}${currentResumeUrl}`
    : null;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setErrorMsg("");
    setSuccessMsg("");

    // Client-side validations
    if (file.type !== "application/pdf") {
      setErrorMsg("Invalid file type. Only PDF documents are supported.");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setErrorMsg("File is too large. Maximum resume size is 5 MB.");
      return;
    }

    try {
      setUploading(true);
      const data = await uploadResume(file);
      if (data.success) {
        setSuccessMsg("Resume uploaded successfully!");
        if (onUploadSuccess) {
          onUploadSuccess(data.data.user, data.data.completion);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to upload resume";
      setErrorMsg(msg);
      if (onUploadError) onUploadError(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">
        Resume Document
      </h3>

      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-6">
        {/* Upload visual card */}
        <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-indigo-400 rounded-2xl p-6 cursor-pointer bg-gray-50/50 hover:bg-indigo-50/10 transition group">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
              <span className="text-xs text-gray-500 font-medium">Uploading document...</span>
            </div>
          ) : (
            <div className="text-center">
              <FiUploadCloud className="w-8 h-8 text-gray-400 group-hover:text-indigo-500 mx-auto mb-2 transition" />
              <span className="text-xs text-indigo-600 font-semibold block group-hover:text-indigo-700">
                Click to upload PDF
              </span>
              <span className="text-[10px] text-gray-400 mt-0.5 block">
                Allowed formats: PDF. Max size: 5 MB
              </span>
            </div>
          )}
        </label>

        {/* Current file status card */}
        {currentResumeUrl ? (
          <div className="flex-1 border border-gray-100 bg-slate-50/50 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FiFileText className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <span className="text-xs font-bold text-gray-700 truncate" title={resumeFileName}>
                  {resumeFileName || "resume.pdf"}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed">
                Resume is uploaded. Re-uploading will replace the existing file.
              </p>
            </div>

            <div className="mt-4">
              <a
                href={resumeDownloadUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 text-xs font-semibold px-4 py-2 rounded-xl transition"
              >
                <FiDownload className="w-3.5 h-3.5" />
                <span>View / Download</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="flex-1 border border-dashed border-gray-200 bg-slate-50/30 rounded-2xl p-4 flex items-center justify-center text-center">
            <p className="text-xs text-gray-400 italic">No resume uploaded yet.</p>
          </div>
        )}
      </div>

      {/* Validation and Status notifications */}
      {errorMsg && (
        <div className="text-xs text-red-600 font-medium bg-red-50 border border-red-100 rounded-xl px-3 py-2 mt-4">
          ⚠️ {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="text-xs text-emerald-600 font-medium bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 mt-4 flex items-center gap-1">
          <FiCheck className="w-4 h-4 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}
    </div>
  );
}

export default ResumeUpload;
