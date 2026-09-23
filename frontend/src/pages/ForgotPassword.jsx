import { useState } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [resetToken, setResetToken] = useState("");

  const handleSubmit = async () => {
    if (!email.trim()) {
      alert("Enter your email");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setResetToken("");

      const response = await API.post("/auth/forgot-password", { email });
      setMessage(response.data.message || "If the account exists, a reset link has been sent");

      if (response.data.resetToken) {
        setResetToken(response.data.resetToken);
      }
    } catch (error) {
      alert(error?.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Forgot Password</h1>
        <p className="text-sm text-gray-500 mb-6">Enter your email and we will send reset instructions.</p>

        <label className="block text-sm text-gray-500 mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-400"
          placeholder="you@example.com"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-5 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition"
        >
          {loading ? "Submitting..." : "Send Reset Link"}
        </button>

        {message && (
          <p className="text-sm text-green-600 mt-4">{message}</p>
        )}

        {resetToken && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700 break-all">
            Dev token: {resetToken}
          </div>
        )}

        <p className="text-sm text-gray-500 mt-6">
          Back to {" "}
          <Link to="/login" className="text-indigo-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
