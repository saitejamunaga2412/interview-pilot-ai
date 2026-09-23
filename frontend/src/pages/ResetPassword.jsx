import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../hooks/useAuth";

function ResetPassword() {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleReset = async () => {
    if (!token.trim() || !newPassword.trim()) {
      alert("Token and new password are required");
      return;
    }

    try {
      setLoading(true);
      const response = await API.post("/auth/reset-password", {
        token,
        newPassword
      });

      login(response.data);
      alert("Password reset successful");
      navigate("/");
    } catch (error) {
      alert(error?.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Reset Password</h1>
        <p className="text-sm text-gray-500 mb-6">Enter the reset token and your new password.</p>

        <label className="block text-sm text-gray-500 mb-2">Reset Token</label>
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:border-indigo-400"
          placeholder="Paste token"
        />

        <label className="block text-sm text-gray-500 mb-2">New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-400"
          placeholder="At least 6 characters"
        />

        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full mt-5 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;
