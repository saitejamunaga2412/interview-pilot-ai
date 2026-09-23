import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { FaBrain, FaSpinner, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

function CareerAssessment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAssessment = async () => {
    try {
      setLoading(true);
      setError(null);
      await API.post("/career-intelligence/assessment/trigger");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to trigger assessment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white max-w-lg w-full rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaBrain size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            AI Career Diagnostic
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Let our AI engine analyze your resume, skills, and goals to generate a comprehensive placement readiness score and personalized study plan.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 justify-center">
              <FaExclamationCircle /> {error}
            </div>
          )}

          <button
            onClick={handleAssessment}
            disabled={loading}
            className={`w-full py-4 rounded-xl text-lg font-bold text-white transition-all ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-md"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <FaSpinner className="animate-spin" /> Analyzing Profile...
              </span>
            ) : (
              "Generate Career Roadmap"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CareerAssessment;
