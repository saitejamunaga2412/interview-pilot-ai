import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { getProfile, updateProfile } from "../services/profileApi";

const INITIAL_FORM_DATA = {
  name: "",
  email: "",
  phoneNumber: "",
  gender: "",
  dateOfBirth: "",
  academic: {},
  career: {},
  placementProfile: {},
  learningPreferences: {}
};

function buildFormData(user) {
  if (!user) return INITIAL_FORM_DATA;
  return {
    name: user.name || "",
    email: user.email || "",
    phoneNumber: user.phoneNumber || "",
    gender: user.gender || "",
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : "", // Standardize for input[type=date]
    academic: user.academic || {},
    career: user.career || {},
    placementProfile: user.placementProfile || {},
    learningPreferences: user.learningPreferences || {}
  };
}

export function useProfileData() {
  const [originalUser, setOriginalUser] = useState(null);
  const [completion, setCompletion] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      if (response?.success) {
        const u = response.data?.user || response.data;
        const comp = response.data?.completion || { percentage: u?.completionPercentage ?? 0 };
        setOriginalUser(u);
        setCompletion(comp);
        setFormData(buildFormData(u));
      } else {
        showToast("error", "Failed to load profile.");
      }
    } catch (error) {
      console.error(error);
      showToast("error", "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Check if form is dirty by doing a deep comparison or JSON comparison
  const originalJson = JSON.stringify(buildFormData(originalUser));
  const currentJson = JSON.stringify(formData);
  const hasUnsavedChanges = originalJson !== currentJson;

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

  const handleFieldChange = useCallback((section, field, value) => {
    setFormData(prev => {
      if (!section) {
        // Root field (e.g. name, email, phoneNumber)
        return { ...prev, [field]: value };
      } else {
        // Nested section (e.g. academic, career)
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        };
      }
    });
  }, []);

  const validate = (data = formData) => {
    if (!data?.name?.trim()) {
      showToast("error", "Name is required.");
      return false;
    }
    const mins = Number(data.learningPreferences?.dailyStudyGoalMinutes);
    if (mins && (isNaN(mins) || mins < 15 || mins > 1440)) {
      showToast("error", "Daily study goal must be between 15 and 1440 minutes.");
      return false;
    }
    return true;
  };

  const saveProfile = async (customPayload) => {
    const dataToSave = customPayload || formData;
    if (!validate(dataToSave)) {
      return { success: false, message: "Validation failed" };
    }
    
    try {
      setIsSaving(true);
      const rawPhone = dataToSave.phoneNumber != null ? String(dataToSave.phoneNumber) : "";
      const cleanedPhone = rawPhone.replace("+91", "").replace(/\D/g, "");
      const payload = {
        ...dataToSave,
        phoneNumber: cleanedPhone || rawPhone
      };

      const response = await updateProfile(payload);

      if (response?.success) {
        const u = response.data?.user || response.data;
        const comp = response.data?.completion || { percentage: u?.completionPercentage ?? 0 };
        setOriginalUser(u);
        setCompletion(comp);
        setFormData(buildFormData(u));
        showToast("success", "Profile saved successfully!");
        return { success: true, data: u };
      } else {
        const msg = response?.message || "Failed to save profile.";
        showToast("error", msg);
        return { success: false, message: msg };
      }
    } catch (error) {
      console.error("Profile save error:", error);
      const msg = error.response?.data?.message || "Failed to save profile.";
      showToast("error", msg);
      return { success: false, message: msg };
    } finally {
      setIsSaving(false);
    }
  };

  const discardChanges = useCallback(() => {
    setFormData(buildFormData(originalUser));
    showToast("info", "Changes discarded.");
  }, [originalUser, showToast]);

  const activeView = searchParams.get("view") || "dashboard";

  return {
    user: originalUser,
    originalUser,
    completion,
    formData,
    loading,
    isSaving,
    hasUnsavedChanges,
    activeView,
    navigateTo,
    handleFieldChange,
    saveProfile,
    discardChanges,
    toast,
    loadProfile
  };
}
