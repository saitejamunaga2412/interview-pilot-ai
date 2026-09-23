import API from "./api";

/**
 * Fetch current user profile and completion metrics.
 * @returns {Promise<Object>} API response data containing user and completion objects.
 */
export const getProfile = async () => {
  const response = await API.get("/profile");
  return response.data;
};

/**
 * Update current user profile.
 * @param {Object} payload - Fields to update.
 * @returns {Promise<Object>} API response data with updated user and completion.
 */
export const updateProfile = async (payload) => {
  const response = await API.put("/profile", payload);
  return response.data;
};

/**
 * Upload profile photo.
 * @param {File} file - Photo file.
 * @returns {Promise<Object>} API response data with updated user and completion.
 */
export const uploadProfilePhoto = async (file) => {
  const formData = new FormData();
  formData.append("photo", file);

  const response = await API.post("/profile/upload-photo", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return response.data;
};

/**
 * Upload resume PDF.
 * @param {File} file - Resume file.
 * @returns {Promise<Object>} API response data with updated user and completion.
 */
export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append("resume", file);

  const response = await API.post("/profile/upload-resume", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return response.data;
};
