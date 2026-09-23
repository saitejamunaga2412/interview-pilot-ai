import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { FaCog, FaSignOutAlt, FaUserCircle, FaBell, FaBookmark, FaStickyNote, FaTrophy } from "react-icons/fa";

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([{ id: 1, text: "Welcome to InterviewPilot AI!", read: false }]);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    return parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0][0];
  };

  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm transition ${
      isActive
        ? "bg-indigo-700 text-white"
        : "text-indigo-200 hover:text-white hover:bg-indigo-700"
    }`;

  return (
    <nav className="bg-indigo-900 px-6 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-2 text-white font-medium text-lg">
        <span>🧠</span>
        <span>InterviewPilot AI</span>
      </div>

      <div className="flex items-center gap-2">
        <NavLink to="/" end className={linkClass}>
          🏠 Home
        </NavLink>
        <NavLink to="/interview" className={linkClass}>
          💬 Interview
        </NavLink>
        <NavLink to="/arena" className={linkClass}>
          💻 Arena
        </NavLink>
        <NavLink to="/learning" className={linkClass}>
          🎓 Learning
        </NavLink>
        <NavLink to="/advisor" className={linkClass}>
          🧭 Advisor
        </NavLink>
        <NavLink to="/history" className={linkClass}>
          📋 History
        </NavLink>
        <NavLink to="/resume" className={linkClass}>
          📄 Resume
        </NavLink>
        <NavLink to="/profile" className={linkClass}>
          👤 Profile
        </NavLink>

        {/* Notifications */}
        <div className="relative ml-2 mr-2" ref={notificationRef}>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); setNotificationsOpen(!notificationsOpen); setDropdownOpen(false); }}
            className="text-indigo-200 hover:text-white transition relative p-2 rounded-full hover:bg-indigo-800 cursor-pointer"
          >
            <FaBell size={20} />
            {notifications.some(n => !n.read) && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-indigo-900"></span>
            )}
          </button>
          
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fadeIn">
              <div className="p-3 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
                <span className="font-semibold text-indigo-900">Notifications</span>
                <button className="text-xs text-indigo-600 hover:text-indigo-800">Mark all as read</button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? notifications.map(n => (
                  <div key={n.id} className={`p-4 border-b border-gray-50 text-sm ${!n.read ? 'bg-indigo-50/30' : ''}`}>
                    {n.text}
                  </div>
                )) : (
                  <div className="p-4 text-sm text-gray-500 text-center">No notifications</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* AI Provider Status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-indigo-800 rounded-full border border-indigo-700 mr-2">
           <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
           <span className="text-xs font-semibold text-indigo-100">Gemini Online</span>
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen); setNotificationsOpen(false); }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-indigo-800 transition cursor-pointer"
          >
            {user?.profilePhoto && !user.profilePhoto.includes("default-avatar") ? (
              <img 
                src={user.profilePhoto} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full object-cover border-2 border-indigo-500" 
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) {
                    e.target.nextSibling.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div 
              className={`w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm ${user?.profilePhoto && !user.profilePhoto.includes("default-avatar") ? "hidden" : ""}`}
            >
              {getInitials(user?.name).toUpperCase()}
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fadeIn">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-900 truncate">{user?.name || "User"}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || "No email"}</p>
              </div>
              
              <div className="py-2">
                <button 
                  onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 transition-colors"
                >
                  <FaUserCircle className="text-gray-400" /> Profile
                </button>
                <button 
                  onClick={() => { setDropdownOpen(false); navigate('/settings'); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 transition-colors"
                >
                  <FaCog className="text-gray-400" /> Settings
                </button>
                <button 
                  onClick={() => { setDropdownOpen(false); navigate('/bookmarks'); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 transition-colors"
                >
                  <FaBookmark className="text-gray-400" /> Bookmarks
                </button>
                <button 
                  onClick={() => { setDropdownOpen(false); navigate('/notes'); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 transition-colors"
                >
                  <FaStickyNote className="text-gray-400" /> Notes
                </button>
                <button 
                  onClick={() => { setDropdownOpen(false); navigate('/achievements'); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 transition-colors"
                >
                  <FaTrophy className="text-gray-400" /> Achievements
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button 
                  onClick={() => { setDropdownOpen(false); handleLogout(); }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <FaSignOutAlt className="text-red-400" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;