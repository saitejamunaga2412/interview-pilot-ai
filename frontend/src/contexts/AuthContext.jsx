import { createContext, useEffect, useMemo, useState } from "react";
import API from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  useEffect(() => {
    const bootstrapAuth = async () => {
      if (!token) {
        setUser(null);
        setAuthLoading(false);
        return;
      }

      try {
        const response = await API.get("/profile");
        const userData = response.data?.data?.user || response.data?.data || null;
        setUser(userData);
      } catch (error) {
        console.warn("Profile fetch failed:", error.message);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      } finally {
        setAuthLoading(false);
      }
    };

    bootstrapAuth();
  }, [token]);

  const login = ({ token: authToken, user: authUser }) => {
    localStorage.setItem("token", authToken);
    setToken(authToken);
    setUser(authUser || null);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    if (!token) return null;
    const response = await API.get("/profile");
    const userData = response.data?.data?.user || response.data?.data || null;
    setUser(userData);
    return userData;
  };

  const value = useMemo(
    () => ({
      user,
      token,
      authLoading,
      isAuthenticated: Boolean(token),
      login,
      logout,
      refreshProfile,
      setUser
    }),
    [user, authLoading, token]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}