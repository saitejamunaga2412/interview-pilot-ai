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
      console.error(err);
      // No resume uploaded yet is fine, don't show an error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResume();
  }, [fetchResume]);

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
      formData.append("resume", file);

      const res = await API.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const payload = res.data?.data;
      setResumeData(payload?.resumeData || null);
      setUploadedAt(payload?.uploadedAt ? new Date(payload.uploadedAt) : new Date());
      showToast("success", "Resume uploaded and analyzed successfully");
      
      // Navigate to analysis view automatically upon successful upload
      navigateTo("analysis");
    } catch (error) {
      console.error("Resume Upload Error:", error);
      showToast("error", error?.response?.data?.message || "Resume upload failed");
    } finally {
      setUploading(false);
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
  };
}
