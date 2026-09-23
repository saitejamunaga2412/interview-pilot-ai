import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../services/api";
import { calculateStatistics } from "../utils/analytics";

/**
 * Normalizes a raw interview record into a standard Activity model.
 * Future records (coding, learning) will have their own normalizers.
 */
function normalizeInterview(record) {
  return {
    id: record._id,
    type: 'interview',
    title: `${record.role || 'General'} Interview`,
    description: `${record.level || 'Entry'} Level • ${record.interviewMode || 'Technical'} Mode`,
    timestamp: new Date(record.createdAt),
    score: record.overallScore || 0,
    status: record.status || 'Completed',
    metadata: {
      role: record.role,
      level: record.level,
      mode: record.interviewMode
    },
    raw: record // Keep a reference to the raw record for deep views/exports
  };
}

export function useHistoryData() {
  const [rawInterviews, setRawInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  // Toast setup
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = useCallback((type, message) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ type, message });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      // Currently only fetching interviews. 
      // In the future, we would Promise.all([fetchInterviews, fetchCoding, fetchLearning])
      const res = await API.get("/result/history");
      const payload = res.data?.data;
      const records = payload?.sessions ?? payload ?? [];
      setRawInterviews(Array.isArray(records) ? records : []);
    } catch (error) {
      console.error("History Error:", error);
      showToast("error", "Failed to load activity history");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Normalization
  const allActivities = useMemo(() => {
    const activities = [
      ...rawInterviews.map(normalizeInterview),
      // Future: ...rawCoding.map(normalizeCoding)
    ];
    // Sort chronological descending globally
    return activities.sort((a, b) => b.timestamp - a.timestamp);
  }, [rawInterviews]);

  const activeView = searchParams.get("view") || "dashboard";

  const navigateTo = (view, extraParams = {}) => {
    setSearchParams(prev => {
      prev.set("view", view);
      Object.entries(extraParams).forEach(([k, v]) => {
        if (v) prev.set(k, v);
        else prev.delete(k);
      });
      return prev;
    });
  };

  // Activity Deletion
  const deleteActivity = async (id, type) => {
    if (type === 'interview') {
      try {
        await API.delete(`/result/session/${id}`);
        setRawInterviews(prev => prev.filter(item => item._id !== id));
        showToast("success", "Activity deleted successfully");
      } catch (error) {
        showToast("error", "Failed to delete activity");
      }
    } else {
      showToast("error", "Deletion not supported for this activity type yet");
    }
  };

  const clearAllHistory = async () => {
    try {
      await API.delete("/result/clear-history");
      setRawInterviews([]);
      showToast("success", "History cleared");
    } catch (error) {
      showToast("error", "Failed to clear history");
    }
  };

  // Client-side filtering
  const filteredActivities = useMemo(() => {
    let filtered = allActivities;

    // Apply View Filter
    if (activeView !== "dashboard") {
      filtered = filtered.filter(a => a.type === activeView);
    }

    // Apply Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.status.toLowerCase().includes(q)
      );
    }

    // Apply Date Range Filter
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from);
      filtered = filtered.filter(a => a.timestamp >= fromDate);
    }
    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(a => a.timestamp <= toDate);
    }

    return filtered;
  }, [allActivities, activeView, searchQuery, dateRange]);

  // Statistics (Computed only from real data)
  const statistics = useMemo(() => {
    return calculateStatistics(rawInterviews); // Reuse existing utility for now
  }, [rawInterviews]);

  return {
    allActivities,
    filteredActivities,
    rawInterviews,
    statistics,
    loading,
    activeView,
    searchQuery,
    setSearchQuery,
    dateRange,
    setDateRange,
    navigateTo,
    deleteActivity,
    clearAllHistory,
    toast,
  };
}
