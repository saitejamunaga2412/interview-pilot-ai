import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, CheckCheck, Trash2, CheckCircle2, ArrowRight,
  Code2, Brain, BookOpen, FileText, Award, Clock, Sparkles,
  AlertTriangle, Filter, ArrowLeft
} from "lucide-react";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  triggerTestNotification
} from "../../services/notificationApi";
import { cn } from "../../utils/cn";

const TABS = [
  { id: "ALL", label: "All" },
  { id: "UNREAD", label: "Unread" },
  { id: "RECOMMENDATION", label: "Recommendations" },
  { id: "LEARNING", label: "Learning" },
  { id: "CODING", label: "Coding" },
  { id: "INTERVIEW", label: "Interview" },
  { id: "PROGRESS", label: "Progress" },
  { id: "SYSTEM", label: "System" }
];

export default function NotificationCenter() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("ALL");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadNotifications = useCallback(async (tab, pageNum = 1) => {
    try {
      setLoading(true);
      const params = { page: pageNum, limit: 25 };
      if (tab === "UNREAD") {
        params.unreadOnly = true;
      } else if (tab !== "ALL") {
        params.type = tab.toLowerCase();
      }

      const res = await fetchNotifications(params);
      setNotifications(res?.notifications || []);
      setTotalPages(res?.totalPages || 1);
      if (typeof res?.unreadCount === "number") {
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.warn("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications(activeTab, page);
  }, [activeTab, page, loadNotifications]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setPage(1);
  };

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await markNotificationAsRead(id);
      if (activeTab === "UNREAD") {
        setNotifications((prev) => prev.filter((n) => (n._id || n.id) !== id));
      } else {
        setNotifications((prev) =>
          prev.map((n) => ((n._id || n.id) === id ? { ...n, read: true } : n))
        );
      }
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      // silent fallback
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      if (activeTab === "UNREAD") {
        setNotifications([]);
      } else {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
      setUnreadCount(0);
    } catch (err) {
      // silent fallback
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => (n._id || n.id) !== id));
      loadNotifications(activeTab, page);
    } catch (err) {
      // silent fallback
    }
  };

  const handleActionClick = (notif) => {
    const notifId = notif._id || notif.id;
    if (!notif.read && notifId) {
      handleMarkAsRead(notifId);
    }
    if (notif.actionRoute) {
      navigate(notif.actionRoute);
    }
  };

  const handleTriggerSample = async () => {
    try {
      const typeKey = activeTab === "ALL" || activeTab === "UNREAD" ? "recommendation" : activeTab.toLowerCase();
      await triggerTestNotification({
        type: typeKey,
        title: "🎯 Focus Topic: Binary Search & Tree Traversal",
        message: "Targeted practice for top technical roles. Master high-frequency algorithm patterns!",
        actionLabel: "Start Practice",
        actionRoute: "/coding"
      });
      loadNotifications(activeTab, 1);
    } catch (err) {
      // silent fallback
    }
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "coding":
        return <Code2 className="w-4 h-4 text-indigo-400" />;
      case "aptitude":
        return <Brain className="w-4 h-4 text-amber-400" />;
      case "interview":
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
      case "resume":
        return <FileText className="w-4 h-4 text-emerald-400" />;
      case "learning":
        return <BookOpen className="w-4 h-4 text-purple-400" />;
      case "achievement":
        return <Award className="w-4 h-4 text-yellow-400" />;
      case "reminder":
        return <Clock className="w-4 h-4 text-blue-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-primary-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-fade-in text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors mb-1 cursor-pointer font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight font-display">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-primary-500/20 text-primary-300 font-mono text-xs font-bold border border-primary-500/30">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary">
            Proactive alerts, daily preparation goals, and personalized focus recommendations.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface-hover border border-border text-xs font-semibold text-text-primary flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <CheckCheck className="w-4 h-4 text-primary-400" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-border/40">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer",
                isActive
                  ? "bg-primary-600 text-white shadow-md shadow-primary-600/25"
                  : "bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-2 border border-border"
              )}
            >
              {tab.label}
              {tab.id === "UNREAD" && unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 rounded-full bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-primary-400 mx-auto animate-pulse">
            <Bell className="w-4 h-4" />
          </div>
          <p className="text-xs font-mono text-text-muted">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-border bg-surface p-8 space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-surface-2 text-text-muted mx-auto flex items-center justify-center border border-border">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-sm font-bold text-text-primary">All caught up!</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            No notifications found in this category. We will alert you when new preparation goals or performance updates are available.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleTriggerSample}
              className="px-4 py-2 rounded-xl bg-primary-600/15 hover:bg-primary-600/25 border border-primary-500/30 text-primary-300 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary-400" />
              <span>Trigger Practice Alert</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {notifications.map((notif) => (
              <motion.div
                key={notif._id || notif.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "p-4 sm:p-5 rounded-2xl border transition-all relative overflow-hidden group",
                  notif.read
                    ? "bg-surface border-border/80 hover:border-border-strong"
                    : "bg-surface border-primary-500/40 shadow-sm shadow-primary-500/5 hover:border-primary-500/60"
                )}
              >
                {!notif.read && (
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary-500" />
                )}

                <div className="flex items-start justify-between gap-3">
                  {/* Category Pill & Title */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-surface-2 border border-border text-[11px] font-bold uppercase tracking-wider text-text-muted">
                        {getTypeIcon(notif.type)}
                        <span>{notif.type}</span>
                      </span>

                      {notif.priority === "high" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          <span>HIGH PRIORITY</span>
                        </span>
                      )}

                      <span className="text-[11px] font-mono text-text-muted">
                        {formatTimestamp(notif.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-text-primary leading-tight">
                      {notif.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      {notif.message}
                    </p>
                  </div>

                  {/* Actions & Delete */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!notif.read && (
                      <button
                        type="button"
                        onClick={(e) => handleMarkAsRead(notif._id || notif.id, e)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-primary-400 hover:bg-surface-2 transition-colors cursor-pointer"
                        title="Mark as read"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(notif._id || notif.id, e)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-rose-400 hover:bg-surface-2 transition-colors cursor-pointer"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Optional Bottom Action Button */}
                {notif.actionLabel && (
                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                    <span className="text-[11px] text-text-muted">
                      Source: {notif.source || "system"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleActionClick(notif)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary-600/15 hover:bg-primary-600/25 border border-primary-500/30 text-primary-300 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <span>{notif.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination if needed */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold disabled:opacity-40 cursor-pointer"
          >
            Previous
          </button>
          <span className="text-xs font-mono text-text-muted px-2">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold disabled:opacity-40 cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
