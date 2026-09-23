import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { FaBuilding, FaBook, FaCode, FaBrain, FaUsers, FaMap, FaRobot, FaExternalLinkAlt } from "react-icons/fa";
import CompanyRoadmap from "../../components/company/CompanyRoadmap";
import CompanyMentor from "../../components/company/CompanyMentor";

export default function CompanyDetails() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState("");
  const pollIntervalRef = useRef(null);
  const pollCountRef = useRef(0);

  useEffect(() => {
    fetchCompany();
    return () => clearInterval(pollIntervalRef.current);
  }, [name]);

  const fetchCompany = async () => {
    try {
      const res = await api.get(`/company/details/${name}`);
      const fetchedCompany = res.data.data.company;
      const fetchedProgress = res.data.data.progress;

      setCompany(fetchedCompany);
      setProgress(fetchedProgress);

      if (fetchedCompany && fetchedCompany.status === 'generating') {
        setIsGenerating(true);
        setGenerationProgress(fetchedCompany.generationProgress);
        setLoading(false);
        
        if (!pollIntervalRef.current) {
          pollCountRef.current = 0;
          pollIntervalRef.current = setInterval(pollCompany, 3000);
        }
      } else {
        setIsGenerating(false);
        setLoading(false);
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      }
    } catch (error) {
      console.error("Failed to load company", error);
      alert("Error loading company. Please try again.");
      navigate("/company");
    }
  };

  const pollCompany = async () => {
    pollCountRef.current += 1;
    if (pollCountRef.current > 20) { // Max 60 seconds
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
      setIsGenerating(false);
      return;
    }
    
    try {
      const res = await api.get(`/company/details/${name}`);
      const fetchedCompany = res.data.data.company;
      const fetchedProgress = res.data.data.progress;
      
      if (fetchedCompany) {
        setCompany(fetchedCompany);
        setProgress(fetchedProgress);
        setGenerationProgress(fetchedCompany.generationProgress);
        
        if (fetchedCompany.status !== 'generating') {
          setIsGenerating(false);
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      }
    } catch (e) {
      console.error("Error polling", e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-8"></div>
      </div>
    );
  }

  if (!company) return null;

  const tabs = [
    { id: "overview", icon: <FaBuilding/>, label: "Overview & Process" },
    { id: "pattern", icon: <FaCode/>, label: "Test Pattern" },
    { id: "interview", icon: <FaUsers/>, label: "Interview" },
    { id: "resources", icon: <FaBook/>, label: "Resources" },
    { id: "roadmap", icon: <FaMap/>, label: "Personalized Roadmap" },
    { id: "mentor", icon: <FaRobot/>, label: "AI Mentor" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Generating Banner */}
      {isGenerating && (
        <div className="bg-blue-50 border-b border-blue-100 text-blue-800 px-4 py-3 flex items-center justify-center gap-3">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-medium">
            AI is analyzing {name} ({generationProgress}). Content will appear progressively...
          </span>
        </div>
      )}
      
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-blue-200 mb-2 font-semibold tracking-wider text-xs uppercase font-mono">
              <span className="px-2 py-0.5 rounded bg-white/10 border border-white/20">General preparation strategy for this target</span>
              <span>&bull;</span>
              <span>Difficulty {company.difficultyLevel || 7}/10</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">{company.name} Preparation Workspace</h1>
            <p className="text-sm md:text-base text-blue-100 max-w-2xl leading-relaxed">{company.overview}</p>
          </div>
          
          <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/20 w-full md:w-64">
            <h3 className="font-bold text-lg mb-2">Company Readiness</h3>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-4xl font-bold">{progress?.readinessPercentage || 0}%</span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-2">
              <div className="bg-green-400 h-2 rounded-full transition-all" style={{ width: `${progress?.readinessPercentage || 0}%` }}></div>
            </div>
            <p className="text-sm mt-3 opacity-80">Keep following the roadmap to boost your chances.</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex overflow-x-auto space-x-2 border-b border-gray-200 dark:border-gray-700 mb-8 pb-2 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-8 animate-fadeIn">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-4">Recruitment Process</h2>
                <p className="text-lg leading-relaxed">{company.recruitmentProcess}</p>
              </section>

              <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-4">Eligibility</h2>
                <ul className="space-y-3">
                  <li className="flex gap-2"><strong>Min CGPA:</strong> {company.eligibility?.minCgpa}</li>
                  <li className="flex gap-2"><strong>Branches:</strong> {(company.eligibility?.allowedBranches ?? []).join(", ")}</li>
                  {company.eligibility?.details && <li className="text-gray-600 dark:text-gray-400 mt-2">{company.eligibility?.details}</li>}
                </ul>
              </section>

              <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 md:col-span-2">
                <h2 className="text-2xl font-bold mb-6">Selection Rounds</h2>
                <div className="space-y-4">
                  {(company.selectionRounds ?? []).map((round, idx) => (
                    <div key={idx} className="flex gap-4 items-start p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center rounded-full shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{round?.roundName}</h4>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">{round?.description}</p>
                        <p className="text-sm font-semibold mt-2 text-blue-600 dark:text-blue-400">⏱️ {round?.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === "pattern" && (
            <div className="space-y-8">
              <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">Online Assessment Pattern</h2>
                <p className="text-lg leading-relaxed whitespace-pre-wrap">{company.oaPattern}</p>
              </section>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h2 className="text-2xl font-bold mb-4 text-green-600 dark:text-green-400 flex items-center gap-2"><FaCode/> Coding Pattern</h2>
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">{company.codingPattern}</p>
                </section>
                <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h2 className="text-2xl font-bold mb-4 text-yellow-600 dark:text-yellow-400 flex items-center gap-2"><FaBrain/> Aptitude Pattern</h2>
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">{company.aptitudePattern}</p>
                </section>
              </div>
            </div>
          )}

          {activeTab === "interview" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h2 className="text-2xl font-bold mb-4">Technical Interview</h2>
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">{company.technicalInterview}</p>
                </section>
                <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h2 className="text-2xl font-bold mb-4">HR Interview</h2>
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">{company.hrInterview}</p>
                </section>
              </div>

              {(company.interviewExperiences ?? [])?.length > 0 && (
                <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h2 className="text-2xl font-bold mb-4">Interview Experiences</h2>
                  <div className="space-y-4">
                    {(company.interviewExperiences ?? []).map((exp, idx) => (
                      <div key={idx} className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 rounded-xl border-l-4 border-blue-500 italic">
                        "{exp}"
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {activeTab === "resources" && (
            <div className="space-y-8">
              <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-4">Preparation Strategy</h2>
                <p className="text-lg leading-relaxed whitespace-pre-wrap">{company.preparationStrategy}</p>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {(company.faqs ?? [])?.length > 0 && (
                  <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-4">FAQs</h2>
                    <div className="space-y-4">
                      {(company.faqs ?? []).map((faq, idx) => (
                        <details key={idx} className="group bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                          <summary className="font-semibold cursor-pointer">{faq?.question}</summary>
                          <p className="mt-2 text-gray-600 dark:text-gray-400">{faq?.answer}</p>
                        </details>
                      ))}
                    </div>
                  </section>
                )}

                {(company.previousYearQuestions ?? [])?.length > 0 && (
                  <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-4">Previous Year Questions</h2>
                    <ul className="list-disc pl-6 space-y-2">
                      {(company.previousYearQuestions ?? []).map((q, idx) => <li key={idx}>{q}</li>)}
                    </ul>
                  </section>
                )}
              </div>

              {(company.resources ?? [])?.length > 0 && (
                <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h2 className="text-2xl font-bold mb-4">Useful Links</h2>
                  <div className="flex flex-col gap-3">
                    {(company.resources ?? []).map((res, idx) => (
                      <a key={idx} href={res?.link} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                        <FaExternalLinkAlt className="text-blue-500" />
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{res?.title}</span>
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {activeTab === "roadmap" && (
            <CompanyRoadmap companyId={company._id} initialRoadmap={progress?.roadmaps?.thirtyDay} />
          )}

          {activeTab === "mentor" && (
            <CompanyMentor companyName={company.name} />
          )}
        </div>
      </div>
    </div>
  );
}
