import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../services/api";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function useResumeData() {
  const [resumeData, setResumeData] = useState(null);
  const [uploadedAt, setUploadedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // ATS State
  const [atsAnalysis, setAtsAnalysis] = useState(null);
  const [atsHistory, setAtsHistory] = useState([]);
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsAnalyzing, setAtsAnalyzing] = useState(false);
  const [atsStep, setAtsStep] = useState(0);
  const [atsError, setAtsError] = useState(null);

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

  const fetchResume = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/resume");
      const payload = res.data?.data;
      if (payload?.resumeData) {
        setResumeData(payload.resumeData);
        setUploadedAt(payload.uploadedAt ? new Date(payload.uploadedAt) : null);
      }
    } catch (err) {
      console.error("Resume fetch notice:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLatestAts = useCallback(async () => {
    try {
      setAtsLoading(true);
      setAtsError(null);
      const res = await API.get("/resume/ats/latest");
      const data = res.data?.data;
      if (data) {
        setAtsAnalysis(data);
      } else {
        setAtsAnalysis(null);
      }
    } catch (err) {
      console.warn("ATS latest fetch:", err);
    } finally {
      setAtsLoading(false);
    }
  }, []);

  const fetchAtsHistory = useCallback(async () => {
    try {
      const res = await API.get("/resume/ats/history");
      if (res.data?.data) {
        setAtsHistory(res.data.data);
      }
    } catch (err) {
      console.warn("ATS history fetch:", err);
    }
  }, []);

  useEffect(() => {
    fetchResume();
    fetchLatestAts();
    fetchAtsHistory();
  }, [fetchResume, fetchLatestAts, fetchAtsHistory]);

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

  const uploadResume = async (file) => {
    if (!file) {
      showToast("error", "Please select a file to upload.");
      return;
    }

    const isPdfOrDoc =
      file.type === "application/pdf" ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.toLowerCase().endsWith(".pdf") ||
      file.name.toLowerCase().endsWith(".docx");

    if (!isPdfOrDoc) {
      showToast("error", "Only PDF and DOCX files are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showToast("error", "Maximum file size is 5MB.");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("resume", file);

      const res = await API.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const payload = res.data?.data;
      setResumeData(payload?.resumeData || null);
      setUploadedAt(payload?.uploadedAt ? new Date(payload.uploadedAt) : new Date());
      showToast("success", "Resume uploaded successfully");
      
      navigateTo("ats");
    } catch (error) {
      console.error("Resume Upload Error:", error);
      showToast("error", error?.response?.data?.message || "Resume upload failed");
    } finally {
      setUploading(false);
    }
  };

  const runAtsAnalysis = async (file, targetRole) => {
    if (!file && !resumeData) {
      showToast("error", "Please select or upload a resume to analyze.");
      return;
    }

    try {
      setAtsAnalyzing(true);
      setAtsError(null);
      setAtsStep(1); // Uploading & extracting

      const formData = new FormData();
      if (file) {
        formData.append("file", file);
        formData.append("resume", file);
      }
      if (targetRole) {
        formData.append("targetRole", targetRole);
      }

      // Step progression animation
      const stepTimer1 = setTimeout(() => setAtsStep(2), 700);
      const stepTimer2 = setTimeout(() => setAtsStep(3), 1600);

      const res = await API.post("/resume/ats/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setAtsStep(4);

      const analysisDoc = res.data?.data;
      setAtsAnalysis(analysisDoc);
      fetchAtsHistory();
      fetchResume();
      showToast("success", "ATS compatibility analysis completed!");
    } catch (err) {
      console.error("ATS Analysis error:", err);
      const msg = err?.response?.data?.detail?.message || err?.response?.data?.message || "Resume analysis is temporarily unavailable. Please try again.";
      setAtsError(msg);
      showToast("error", msg);
    } finally {
      setAtsAnalyzing(false);
      setAtsStep(0);
    }
  };

  const activeView = searchParams.get("view") || "dashboard";

  return {
    resumeData,
    uploadedAt,
    loading,
    uploading,
    activeView,
    navigateTo,
    uploadResume,
    toast,
    // ATS specific
    atsAnalysis,
    atsHistory,
    atsLoading,
    atsAnalyzing,
    atsStep,
    atsError,
    runAtsAnalysis,
    fetchLatestAts,
    fetchAtsHistory
  };
}
