import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../services/api";

export function useLearningData() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

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

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/learning/dashboard");
      setDashboardData(res.data?.data || null);
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to load learning data.");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleSeed = async () => {
    try {
      await API.post("/learning/seed");
      window.location.reload();
    } catch (e) {
      console.error(e);
      showToast("error", "Seeding failed.");
    }
  };

  const handleReview = async (topicId, grade) => {
    // Optimistic UI update
    setDashboardData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        revisionQueue: prev.revisionQueue.filter(q => q.topicId !== topicId)
      };
    });

    try {
      await API.post("/learning/review", { topicId, grade, timeSpentMs: 15000 });
      showToast("success", "Review recorded.");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to submit review. Rolling back.");
      // In a real app, we'd want to roll back the optimistic update here if it failed.
      fetchDashboard();
    }
  };

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

  const activeView = searchParams.get("view") || "dashboard";
  const activeTopic = searchParams.get("topic");

  return {
    dashboardData,
    loading,
    activeView,
    activeTopic,
    navigateTo,
    handleReview,
    handleSeed,
    toast,
  };
}
