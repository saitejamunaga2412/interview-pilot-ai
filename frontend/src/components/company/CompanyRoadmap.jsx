import React, { useState } from "react";
import api from "../../services/api";
import { FaCalendarAlt, FaCheckCircle, FaSpinner } from "react-icons/fa";

export default function CompanyRoadmap({ companyId, initialRoadmap }) {
  const [timeframe, setTimeframe] = useState(30);
  const [studentLevel, setStudentLevel] = useState("Intermediate");
  const [roadmap, setRoadmap] = useState(initialRoadmap || null);
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await api.post("/company/roadmap", { companyId, timeframeDays: timeframe, studentLevel });
      setRoadmap(res.data.data.roadmap);
    } catch (error) {
      console.error("Failed to generate roadmap", error);
      alert("Failed to generate roadmap. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FaCalendarAlt className="text-blue-500" /> Personalized AI Roadmap
        </h3>
        
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <select 
            value={timeframe} 
            onChange={e => setTimeframe(Number(e.target.value))}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm"
          >
            <option value={30}>30 Days</option>
            <option value={60}>60 Days</option>
            <option value={90}>90 Days</option>
          </select>
          
          <select 
            value={studentLevel} 
            onChange={e => setStudentLevel(e.target.value)}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
          
          <button 
            onClick={generate}
            disabled={generating}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {generating ? <><FaSpinner className="animate-spin"/> Generating...</> : "Generate Dynamic Roadmap"}
          </button>
        </div>

        {generating && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>AI is analyzing your progress and target company to build a custom roadmap...</p>
          </div>
        )}

        {!generating && roadmap && roadmap.length > 0 && (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 dark:before:via-gray-600 before:to-transparent">
            {roadmap.map((phase, idx) => (
              <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-gray-800 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  {idx + 1}
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-lg">{phase.phase}</h4>
                    <span className="text-xs font-semibold px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full">{phase.focus}</span>
                  </div>
                  <ul className="space-y-3 mt-4">
                    {phase.tasks.map((task, tIdx) => (
                      <li key={tIdx} className="flex gap-3 items-start text-sm">
                        <FaCheckCircle className="text-gray-300 dark:text-gray-600 mt-1 shrink-0" />
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
