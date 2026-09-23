import React, { useEffect, useState } from "react";
import API from "../services/api";
import ScoreCard from "../components/ScoreCard";
import { downloadInterviewReport } from "../services/reportService";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaFilePdf,
} from "react-icons/fa";

const Result = () => {
  const [history, setHistory] = useState([]);
  const [averageScore, setAverageScore] = useState(0);
  const [strengths, setStrengths] = useState([]);
  const [weaknesses, setWeaknesses] = useState([]);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await API.get("/result/history");
      const payload = response.data?.data;
      const records = payload?.sessions ?? payload ?? [];
      setHistory(records);

      if (records.length > 0) {
        const total = records.reduce(
          (sum, item) => sum + (item.overallScore || 0),
          0
        );
        const avg = Math.round(total / records.length);
        setAverageScore(avg);

        if (avg >= 70) {
          setStrengths([
            "Strong communication clarity",
            "Good structured answers (STAR method)",
            "Solid core technical understanding",
          ]);
          setWeaknesses([
            "Could elaborate more on system edge cases",
            "Include more quantitative metrics in responses",
          ]);
        } else {
          setStrengths([
            "Addressed key conceptual questions",
            "Demonstrated enthusiasm and good effort",
          ]);
          setWeaknesses([
            "Need deeper technical explanation of core principles",
            "Structure answers more methodically using STAR",
            "Practice time management for timed responses",
          ]);
        }
      }
    } catch (error) {
      console.error("History fetch error:", error);
    }
  };

  const downloadLatestReport = async () => {
    const latestSession = history[0];
    const sessionId = latestSession?._id;

    if (!sessionId) {
      alert("No completed interview session found to download.");
      return;
    }

    try {
      setDownloading(true);
      await downloadInterviewReport(sessionId, {
        session: latestSession,
        questions: []
      });
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download report. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Interview Performance Report
          </h1>

          <p className="text-gray-500">
            Detailed analysis of your interview performance
          </p>
        </div>

        {/* Overall Score */}
        <div className="bg-blue-50 border-l-8 border-blue-500 rounded-3xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-blue-700 mb-6">
            Overall Score
          </h2>

          <ScoreCard score={averageScore} />
        </div>

        {/* Strengths and Weaknesses */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Strengths */}
          <div className="bg-green-50 border-l-8 border-green-500 rounded-3xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-green-700 mb-5">
              Strengths
            </h2>

            <div className="space-y-4">
              {strengths.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow p-4 flex items-center gap-3"
                >
                  <FaCheckCircle className="text-green-600 text-xl" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div className="bg-red-50 border-l-8 border-red-500 rounded-3xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-red-700 mb-5">
              Areas to Improve
            </h2>

            <div className="space-y-4">
              {weaknesses.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow p-4 flex items-center gap-3"
                >
                  <FaExclamationTriangle className="text-red-600 text-xl" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* PDF Button */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mt-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-5">
            Download Interview Report
          </h2>

          <button
            onClick={downloadLatestReport}
            disabled={downloading || history.length === 0}
            className={`px-8 py-4 rounded-2xl flex items-center gap-3 mx-auto shadow-lg text-white ${
              downloading || history.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            <FaFilePdf />
            {downloading ? "Downloading..." : "Download PDF Report"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Result;

