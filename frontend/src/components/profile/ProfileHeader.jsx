import React from "react";
import { Link } from "react-router-dom";
import { FiEdit3, FiUser } from "react-icons/fi";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "") : "");

function ProfileHeader({ user, showEditButton = true }) {
  const profilePhotoUrl = user?.profilePhoto
    ? user.profilePhoto.startsWith("http")
      ? user.profilePhoto
      : `${BACKEND_URL}${user.profilePhoto}`
    : null;

  return (
    <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
      {/* Decorative backdrop glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full filter blur-3xl opacity-10 -mr-20 -mt-20 pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
        {/* Profile Photo Display */}
        <div className="relative group">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white/20 bg-slate-800 flex items-center justify-center overflow-hidden shadow-lg transition duration-300 group-hover:border-indigo-400">
            {profilePhotoUrl ? (
              <img
                src={profilePhotoUrl}
                alt={user?.name || "Profile"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = "none";
                  e.target.parentNode.innerHTML = "<span className='text-3xl text-indigo-300'>👤</span>";
                }}
              />
            ) : (
              <FiUser className="w-12 h-12 text-indigo-300" />
            )}
          </div>
        </div>

        {/* User Info Details */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 justify-center md:justify-start">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {user?.name || "User Name"}
            </h1>
            {user?.emailVerified && (
              <span className="inline-flex self-center items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Verified
              </span>
            )}
          </div>

          <p className="text-indigo-200 text-sm md:text-base mt-1.5 font-medium">
            {user?.career?.targetRole || "Target Role Not Configured"}
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1.5 mt-3 text-xs md:text-sm text-indigo-300">
            {user?.academic?.college && (
              <span>🏫 {user.academic.college}</span>
            )}
            {user?.academic?.branch && (
              <span>💻 {user.academic.branch}</span>
            )}
          </div>
        </div>

        {/* Edit Button */}
        {showEditButton && (
          <Link
            to="/profile/edit"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-2xl text-sm transition shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5"
          >
            <FiEdit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </Link>
        )}
      </div>
    </div>
  );
}

export default ProfileHeader;
