import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import API from "../services/api";

// Simple module-level cache
const cache = {
  history: null,
  memory: null,
  insights: null,
  globalDashboard: null,
  lastFetched: 0
};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function computeStreak(history) {
  if (!history.length) return 0;

  const days = new Set(
    history
      .map((h) => {
        const d = new Date(h.createdAt);
        if (Number.isNaN(d.getTime())) return null;
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
      .filter(Boolean)
  );

  const oneDay = 24 * 60 * 60 * 1000;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  if (!days.has(cursor.getTime())) {
    cursor = new Date(cursor.getTime() - oneDay);
  }

  let streak = 0;
  while (days.has(cursor.getTime())) {
    streak += 1;
    cursor = new Date(cursor.getTime() - oneDay);
  }

  return streak;
}

export function useDashboardData() {
  const [history, setHistory] = useState(cache.history || []);
  const [loading, setLoading] = useState(!cache.history);
  const [error, setError] = useState("");

  const fetchHistory = useCallback(async (force = false) => {
    if (!force && cache.history && Date.now() - cache.lastFetched < CACHE_TTL) {
      setHistory(cache.history);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/result/history");

      const payload = res.data?.data;
      const sessions = payload?.sessions ?? payload ?? [];
      const list = Array.isArray(sessions) ? sessions : [];

      cache.history = list;
      cache.lastFetched = Date.now();
      setHistory(list);
    } catch (err) {
      console.error("Dashboard Error:", err);
      setError("Couldn't load your interview history. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  const [memory, setMemory] = useState(cache.memory || null);
  const [memoryLoading, setMemoryLoading] = useState(!cache.memory);

  const pollIntervalRef = useRef(null);
  const pollCountRef = useRef(0);
  const [isGeneratingMemory, setIsGeneratingMemory] = useState(false);
  const [memoryProgress, setMemoryProgress] = useState("");

  const fetchMemory = useCallback(async (force = false) => {
    if (!force && cache.memory && Date.now() - cache.lastFetched < CACHE_TTL && cache.memory.status !== 'generating') {
      setMemory(cache.memory);
      setMemoryLoading(false);
      return;
    }
    try {
      setMemoryLoading(true);
      const res = await API.get("/career-intelligence/memory");
      if (res.data?.success) {
        const fetchedMemory = res.data?.data?.memory;
        cache.memory = fetchedMemory;
        setMemory(fetchedMemory || null);

        if (fetchedMemory && fetchedMemory.status === 'generating') {
          setIsGeneratingMemory(true);
          setMemoryProgress(fetchedMemory.generationProgress);
          setMemoryLoading(false);

          if (!pollIntervalRef.current) {
            pollCountRef.current = 0;
            pollIntervalRef.current = setInterval(pollMemory, 3000);
          }
        } else {
          setIsGeneratingMemory(false);
          setMemoryLoading(false);
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }
      }
    } catch (err) {
      console.error("Memory Fetch Error:", err);
      setMemoryLoading(false);
    }
  }, []);

  const pollMemory = async () => {
    pollCountRef.current += 1;
    if (pollCountRef.current > 20) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
      setIsGeneratingMemory(false);
      return;
    }

    try {
      const res = await API.get("/career-intelligence/memory");
      if (res.data?.success) {
        const fetchedMemory = res.data?.data?.memory;
        if (fetchedMemory) {
          setMemory(fetchedMemory);
          setMemoryProgress(fetchedMemory.generationProgress);

          if (fetchedMemory.status !== 'generating') {
            setIsGeneratingMemory(false);
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }
      }
    } catch (err) {
      console.error("Memory Poll Error", err);
    }
  };

  useEffect(() => {
    const handleAuthError = () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
        setIsGeneratingMemory(false);
      }
    };
    window.addEventListener("auth:unauthorized", handleAuthError);

    return () => {
      window.removeEventListener("auth:unauthorized", handleAuthError);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const [insights, setInsights] = useState(cache.insights || null);
  const [insightsLoading, setInsightsLoading] = useState(!cache.insights);
  const [globalDashboard, setGlobalDashboard] = useState(cache.globalDashboard || null);

  const fetchInsights = useCallback(async (force = false) => {
    if (!force && cache.insights && Date.now() - cache.lastFetched < CACHE_TTL) {
      setInsights(cache.insights);
      setInsightsLoading(false);
      return;
    }
    try {
      setInsightsLoading(true);
      const res = await API.get("/result/insights");
      if (res.data?.success) {
        cache.insights = res.data?.data;
        setInsights(res.data?.data || null);
      }
    } catch (err) {
      console.error("Dashboard Insights Error:", err);
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  const fetchGlobalDashboard = useCallback(async (force = false) => {
    if (!force && cache.globalDashboard && Date.now() - cache.lastFetched < CACHE_TTL) {
      setGlobalDashboard(cache.globalDashboard);
      return;
    }
    try {
      const res = await API.get("/dashboard");
      if (res.data?.success) {
        cache.globalDashboard = res.data.data;
        setGlobalDashboard(res.data.data);
      }
    } catch (err) {
      console.error("Global Dashboard Error:", err);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
    fetchInsights();
    fetchMemory();
    fetchGlobalDashboard();
  }, [fetchHistory, fetchInsights, fetchMemory, fetchGlobalDashboard]);

  const statistics = useMemo(() => {
    const totalInterviews = history.length;
    const avgScore = history.length
      ? Math.round(
          history.reduce((sum, h) => sum + (h.overallScore || 0), 0) /
            history.length
        )
      : 0;
    const bestScore = history.length
      ? Math.max(...history.map((h) => h.overallScore || 0))
      : 0;
    const streak = computeStreak(history);

    let mostPracticedRole = "None";
    if (history.length > 0) {
      const roleCounts = {};
      let maxCount = 0;
      history.forEach((h) => {
        if (!h.role) return;
        roleCounts[h.role] = (roleCounts[h.role] || 0) + 1;
        if (roleCounts[h.role] > maxCount) {
          maxCount = roleCounts[h.role];
          mostPracticedRole = h.role;
        }
      });
    }

    return { totalInterviews, avgScore, bestScore, streak, mostPracticedRole };
  }, [history]);

  const recentInterviews = useMemo(
    () =>
      [...history]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
    [history]
  );

  return {
    history,
    loading,
    error,
    fetchHistory,
    memory,
    memoryLoading,
    isGeneratingMemory,
    memoryProgress,
    insights,
    insightsLoading,
    statistics,
    recentInterviews,
    globalDashboard
  };
}
