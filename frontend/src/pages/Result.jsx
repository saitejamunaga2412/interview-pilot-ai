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
    <div className="min-h-screen bg-bg-base text-text-primary p-6 sm:p-8 animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="bg-surface border border-border rounded-2xl shadow-xl p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary font-display mb-2">
            Interview Performance Report
          </h1>
          <p className="text-text-secondary text-sm sm:text-base">
            Detailed aggregate analytics and historical breakdown of your mock interview performance
          </p>
        </div>

        {/* Overall Score */}
        <div className="bg-surface border border-primary-500/30 rounded-2xl shadow-xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary-500 to-secondary-500" />
          <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
            <span>Average Readiness Index</span>
          </h2>
          <ScoreCard score={averageScore} />
        </div>

        {/* Strengths and Weaknesses */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Strengths */}
          <div className="bg-surface border border-emerald-500/30 rounded-2xl shadow-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
            <h2 className="text-xl font-bold text-emerald-400 mb-5 flex items-center gap-2">
              <FaCheckCircle className="text-emerald-400" />
              <span>Demonstrated Strengths</span>
            </h2>

            <div className="space-y-3">
              {strengths.map((item, index) => (
                <div
                  key={index}
                  className="bg-surface-2 border border-border/80 rounded-xl p-4 flex items-center gap-3 text-sm text-text-primary shadow-sm"
                >
                  <FaCheckCircle className="text-emerald-400 shrink-0 text-base" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div className="bg-surface border border-amber-500/30 rounded-2xl shadow-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
            <h2 className="text-xl font-bold text-amber-400 mb-5 flex items-center gap-2">
              <FaExclamationTriangle className="text-amber-400" />
              <span>Target Growth Areas</span>
            </h2>

            <div className="space-y-3">
              {weaknesses.map((item, index) => (
                <div
                  key={index}
                  className="bg-surface-2 border border-border/80 rounded-xl p-4 flex items-center gap-3 text-sm text-text-primary shadow-sm"
                >
                  <FaExclamationTriangle className="text-amber-400 shrink-0 text-base" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* PDF Button */}
        <div className="bg-surface border border-border rounded-2xl shadow-xl p-6 sm:p-8 text-center space-y-4">
          <h2 className="text-xl font-bold text-text-primary">
            Official Evaluation Dossier
          </h2>
          <p className="text-text-muted text-sm max-w-md mx-auto">
            Generate and export a comprehensive PDF evaluation dossier with answers, scores, and recruiter feedback.
          </p>

          <button
            onClick={downloadLatestReport}
            disabled={downloading || history.length === 0}
            className={`px-8 py-3.5 rounded-xl font-medium flex items-center justify-center gap-2.5 mx-auto shadow-lg transition-all ${
              downloading || history.length === 0
                ? "bg-surface-3 text-text-muted cursor-not-allowed border border-border"
                : "bg-primary-600 hover:bg-primary-500 text-white shadow-primary-500/20 active:scale-95"
            }`}
          >
            <FaFilePdf className="text-lg" />
            <span>{downloading ? "Generating PDF Dossier..." : "Download Official PDF Report"}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default Result;

