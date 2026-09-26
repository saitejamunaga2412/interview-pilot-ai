import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, Target, Sparkles, Sun, Moon, Bell, LogOut,
  User, Settings, Menu, X, Search, ChevronDown, CheckCircle2,
  Code2, Brain, BookOpen, FileText, Award, Clock, ArrowRight, CheckCheck
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../hooks/useAuth";
import GlobalSearch from "../GlobalSearch";
import { cn } from "../../utils/cn";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead
} from "../../services/notificationApi";

export default function TopProductBar({ onMobileMenuToggle, isMobileMenuOpen }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const loadUnreadCount = useCallback(async () => {
    if (!user || !localStorage.getItem("token")) {
      setUnreadCount(0);
      return;
    }
    try {
      const count = await fetchUnreadCount();
      setUnreadCount(count);
    } catch (e) {
      // silent fallback
    }
  }, [user]);

  const loadLatestNotifications = useCallback(async () => {
    if (!user || !localStorage.getItem("token")) {
      setNotifications([]);
      return;
    }
    try {
      setLoadingNotifs(true);
      const data = await fetchNotifications({ limit: 5 });
      setNotifications(data?.notifications || []);
      if (typeof data?.unreadCount === "number") {
        setUnreadCount(data.unreadCount);
      }
    } catch (e) {
      // silent fallback
    } finally {
      setLoadingNotifs(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 45000);
    return () => clearInterval(interval);
  }, [loadUnreadCount, user]);

  useEffect(() => {
    if (notifOpen) {
      loadLatestNotifications();
    }
  }, [notifOpen, loadLatestNotifications]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      // silent fallback
    }
  };

  const handleNotificationClick = async (notif) => {
    const notifId = notif._id || notif.id;
    if (!notif.read && notifId) {
      markNotificationAsRead(notifId).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) => ((n._id || n.id) === notifId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    if (notif.actionRoute) {
      setNotifOpen(false);
      navigate(notif.actionRoute);
    }
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return "";
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "coding":
        return <Code2 className="w-3.5 h-3.5 text-indigo-400" />;
      case "aptitude":
        return <Brain className="w-3.5 h-3.5 text-amber-400" />;
      case "interview":
        return <Sparkles className="w-3.5 h-3.5 text-cyan-400" />;
      case "resume":
        return <FileText className="w-3.5 h-3.5 text-emerald-400" />;
      case "learning":
        return <BookOpen className="w-3.5 h-3.5 text-purple-400" />;
      case "achievement":
        return <Award className="w-3.5 h-3.5 text-yellow-400" />;
      case "reminder":
        return <Clock className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-primary-400" />;
    }
  };

  const getInitials = (name) => {
    if (!name) return "IP";
    const parts = name.trim().split(" ");
    return parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 bg-surface/95 border-b border-border/80 sticky top-0 z-50 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 w-full">
      
      {/* Left: Brand Identity & Target Context */}
      <div className="flex items-center gap-3.5 sm:gap-6">
        
        {/* Mobile Menu Trigger */}
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-xl bg-surface-2 border border-border text-text-secondary hover:text-text-primary cursor-pointer"
          aria-label="Toggle navigation"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 via-indigo-600 to-cyan-400 p-[1.5px] shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-bg-base rounded-[10px] flex items-center justify-center">
              <span className="font-extrabold text-xs font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-cyan-300">
                IP
              </span>
            </div>
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-bold tracking-tight text-text-primary block leading-none font-display">
              InterviewPilot
            </span>
            <span className="text-[9px] font-mono uppercase tracking-wider text-text-muted">
              AI Partner
            </span>
          </div>
        </Link>

        {/* Target Role Chip */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-2/80 border border-border/70 text-xs">
          <Target className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-text-muted">Target:</span>
          <span className="font-semibold text-text-primary truncate max-w-[140px]">
            {user?.targetCompany || user?.career?.targetRole || "Software Engineer"}
          </span>
        </div>

      </div>

      {/* Center: Global Quick Search */}
      <div className="hidden xl:block max-w-xs w-full">
        <GlobalSearch />
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 rounded-xl bg-surface-2 border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary-500 text-white text-[10px] font-bold font-mono flex items-center justify-center shadow-md animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-border"
              >
                {/* Header */}
                <div className="p-3.5 bg-surface-2/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-primary">Notifications</span>
                    {unreadCount > 0 ? (
                      <span className="px-1.5 py-0.5 rounded-md bg-primary-500/20 text-primary-300 font-mono text-[10px] font-bold">
                        {unreadCount} new
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-emerald-400">All caught up</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-medium text-text-muted hover:text-primary-400 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                {/* Notification List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
                  {loadingNotifs ? (
                    <div className="p-6 text-center text-xs font-mono text-text-muted">
                      Loading notifications...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center space-y-2">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-text-primary">No new notifications</p>
                      <p className="text-[11px] text-text-muted">
                        You're all caught up with your daily preparation!
                      </p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id || notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={cn(
                          "p-3 hover:bg-surface-hover transition-colors cursor-pointer text-left space-y-1 relative",
                          !notif.read && "bg-primary-500/[0.04]"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            {getTypeIcon(notif.type)}
                            <span className="text-[11px] font-bold text-text-primary line-clamp-1">
                              {notif.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] font-mono text-text-muted">
                              {formatRelativeTime(notif.createdAt)}
                            </span>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-primary-400" />
                            )}
                          </div>
                        </div>

                        <p className="text-[11px] text-text-secondary leading-snug line-clamp-2">
                          {notif.message}
                        </p>

                        {notif.actionLabel && (
                          <div className="pt-1 flex justify-end">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary-400 hover:text-primary-300">
                              <span>{notif.actionLabel}</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="p-2.5 bg-surface-2/40 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setNotifOpen(false);
                      navigate("/notifications");
                    }}
                    className="text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors w-full py-1 cursor-pointer block text-center"
                  >
                    View all notifications →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-surface-2 border border-transparent hover:border-border transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {getInitials(user?.name)}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-text-muted hidden sm:block" />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-60 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-border"
              >
                <div className="p-3 bg-surface-2/60">
                  <p className="text-xs font-bold text-text-primary truncate">{user?.name || "Placement Candidate"}</p>
                  <p className="text-[11px] text-text-muted truncate font-mono">{user?.email || ""}</p>
                </div>

                <div className="p-1.5 space-y-0.5 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => { setProfileOpen(false); navigate("/profile"); }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-2 text-left cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-primary-400" />
                    <span>Placement Identity</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setProfileOpen(false); navigate("/journey"); }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-2 text-left cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>My Journey</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setProfileOpen(false); navigate("/settings"); }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-2 text-left cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-text-muted" />
                    <span>Settings</span>
                  </button>
                </div>

                <div className="p-1.5">
                  <button
                    type="button"
                    onClick={() => { setProfileOpen(false); logout(); navigate("/login"); }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-error-500 hover:bg-error-500/10 text-left text-xs font-semibold cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </header>
  );
}
