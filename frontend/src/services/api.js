import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://localhost:5000/api");

const API = axios.create({
  baseURL: API_BASE,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let isUnauthorizedDispatched = false;

API.interceptors.response.use(
  (response) => {
    // Reset flag on successful requests (assuming token is valid)
    if (isUnauthorizedDispatched) isUnauthorizedDispatched = false;
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      
      if (status === 401) {
        console.warn("API 401 Unauthorized Response:", error.config?.url);
        const isAuthRoute = 
          error.config?.url?.includes("/auth/login") || 
          error.config?.url?.includes("/auth/register") ||
          error.config?.url?.includes("/auth/forgot-password") ||
          error.config?.url?.includes("/auth/reset-password");
  
        if (!isAuthRoute && !isUnauthorizedDispatched) {
          isUnauthorizedDispatched = true;
          console.warn("Dispatching auth:unauthorized event");
          localStorage.removeItem("token");
          window.dispatchEvent(new CustomEvent("auth:unauthorized"));
        }
      } else if (status === 403) {
        console.error("API 403 Forbidden Response:", error.config?.url);
        window.dispatchEvent(new CustomEvent("api:error", { detail: { type: "forbidden", message: "You don't have permission to access this resource." }}));
      } else if (status === 429) {
        console.error("API 429 Too Many Requests Response:", error.config?.url);
        window.dispatchEvent(new CustomEvent("api:error", { detail: { type: "rate_limit", message: "You are making too many requests. Please slow down." }}));
      } else if (status >= 500) {
        console.error("API 500+ Server Error Response:", error.config?.url);
        window.dispatchEvent(new CustomEvent("api:error", { detail: { type: "server_error", message: "Our servers are experiencing issues. Please try again later." }}));
      }
    } else if (error.request) {
      // Network Error
      console.error("API Network Error:", error.config?.url);
      window.dispatchEvent(new CustomEvent("api:error", { detail: { type: "network_error", message: "Unable to connect to the server. Please check your internet connection." }}));
    }
    
    return Promise.reject(error);
  }
);

export default API;