import React, { useState } from "react";
import { uploadProfilePhoto } from "../../services/profileApi";
import { FiCamera, FiUploadCloud, FiCheck } from "react-icons/fi";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "") : "");

function PhotoUpload({ currentPhoto, onUploadSuccess, onUploadError }) {
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const profilePhotoUrl = currentPhoto
    ? currentPhoto.startsWith("http")
      ? currentPhoto
      : `${BACKEND_URL}${currentPhoto}`
    : null;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setErrorMsg("");
    setSuccessMsg("");

    // Client-side validations
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedMimeTypes.includes(file.type)) {
      setErrorMsg("Invalid file type. Only JPG, PNG, and WEBP images are supported.");
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      setErrorMsg("File is too large. Maximum photo size is 2 MB.");
      return;
    }

    try {
      setUploading(true);
      const data = await uploadProfilePhoto(file);
      if (data.success) {
        setSuccessMsg("Photo uploaded successfully!");
        if (onUploadSuccess) {
          onUploadSuccess(data.data.user, data.data.completion);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to upload photo";
      setErrorMsg(msg);
      if (onUploadError) onUploadError(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">
        Profile Photo
      </h3>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Photo Preview Container */}
        <div className="relative group">
          <div className="w-24 h-24 rounded-full border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center shadow-inner relative">
            {profilePhotoUrl ? (
              <img
                src={profilePhotoUrl}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl text-gray-300">👤</span>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          <label className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full p-2 cursor-pointer shadow-md transition hover:scale-105">
            <FiCamera className="w-4 h-4" />
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>

        {/* Upload Description / Status */}
        <div className="flex-1 text-center sm:text-left">
          <p className="text-xs text-gray-500 leading-relaxed mb-3">
            Supported formats: JPG, PNG, WEBP. Max size: 2 MB.
            Uploading a new photo replaces the previous one automatically.
          </p>

          {/* Validation and status messages */}
          {errorMsg && (
            <div className="text-xs text-red-600 font-medium bg-red-50 border border-red-100 rounded-xl px-3 py-2 mt-2">
              ⚠️ {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="text-xs text-emerald-600 font-medium bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 mt-2 flex items-center justify-center sm:justify-start gap-1">
              <FiCheck className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PhotoUpload;
