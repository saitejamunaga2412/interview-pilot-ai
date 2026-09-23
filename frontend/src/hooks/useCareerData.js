import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../services/api";

export function useCareerData() {
  const [data, setData] = useState(null);
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
      const res = await API.get("/career-advisor/dashboard");
      setData(res.data?.data || null);
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to load career data.");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleSeed = async () => {
    try {
      await API.post("/career-advisor/seed");
      window.location.reload();
    } catch (e) {
      console.error(e);
      showToast("error", "Seeding failed.");
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

  return {
    data,
    loading,
    activeView,
    navigateTo,
    handleSeed,
    toast,
  };
}
