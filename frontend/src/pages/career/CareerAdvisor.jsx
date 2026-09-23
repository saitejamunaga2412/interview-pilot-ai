import { useState, useEffect } from "react";
import API from "../../services/api";
import { FaBuilding, FaSpinner, FaBriefcase, FaChartLine, FaRobot, FaExclamationTriangle } from "react-icons/fa";

function CareerAdvisor() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdvisorData = async () => {
      try {
        const res = await API.get("/career-advisor/dashboard");
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdvisorData();
  }, []);

  const handleSeed = async () => {
    try {
      await API.post("/career-advisor/seed");
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Seeding failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <FaSpinner className="animate-spin text-4xl mb-4 text-indigo-500" />
          <p>AI Career Advisor is analyzing your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-6xl mx-auto px-6 py-8 w-full flex-1">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <FaChartLine className="text-indigo-600" /> AI Career Advisor
            </h1>
            <p className="text-gray-600 mt-1">
              Your personalized opportunity engine and placement roadmap based on your CareerMemory.
            </p>
          </div>
          {(!data?.readinessReports || data.readinessReports.length === 0) && (
            <button onClick={handleSeed} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700">
              Seed Company DB
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left/Main Column: Company Readiness */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaBuilding className="text-indigo-600" /> Target Company Analysis
            </h2>
            
            {data?.readinessReports?.map((report, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{report.company}</h3>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <FaRobot className="text-indigo-400"/> AI Predicted Readiness
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-indigo-600">{report.companyReadinessScore}%</div>
                    <div className="text-xs text-gray-400 font-medium uppercase tracking-wide mt-1">Match Score</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                    <h4 className="font-bold text-red-800 flex items-center gap-2 mb-2">
                      <FaExclamationTriangle /> Missing Skills
                    </h4>
                    {report.missingSkills?.length > 0 ? (
                      <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
                        {report.missingSkills.map((skill, i) => <li key={i}>{skill}</li>)}
                      </ul>
                    ) : (
                      <p className="text-sm text-red-600">None detected!</p>
                    )}
                  </div>
                  
                  <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                    <h4 className="font-bold text-indigo-800 mb-2">Recommended Plan</h4>
                    <p className="text-xs text-indigo-600 font-medium mb-3 uppercase tracking-wider">
                      Est. Time: {report.daysRequired} Days
                    </p>
                    <ul className="space-y-2">
                      {report.recommendedPlan?.map((step, i) => (
                        <li key={i} className="flex gap-2 text-sm text-indigo-900">
                          <span className="font-bold text-indigo-500">{i + 1}.</span> {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}

            {(!data?.readinessReports || data.readinessReports.length === 0) && (
              <div className="bg-white p-8 rounded-xl text-center border border-gray-200 shadow-sm">
                <p className="text-gray-500">No company profiles available. Seed the DB to view analysis.</p>
              </div>
            )}
          </div>

          {/* Right Column: Opportunities & Profile */}
          <div className="space-y-6">
            
            <div className="bg-gray-800 rounded-xl p-6 text-white shadow-md">
              <h2 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">Your Career Profile</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Overall Readiness</span>
                  <span className="font-bold text-green-400">{data?.memoryStats?.placementReadinessScore}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Resume Score</span>
                  <span className="font-bold text-yellow-400">{data?.memoryStats?.resumeScore}%</span>
                </div>
                
                <div className="pt-3 border-t border-gray-700">
                  <span className="text-gray-400 text-sm block mb-2">Strong Concepts</span>
                  <div className="flex flex-wrap gap-2">
                    {data?.memoryStats?.strongTopics?.length > 0 ? 
                      data.memoryStats.strongTopics.map(t => (
                        <span key={t} className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">{t}</span>
                      )) : <span className="text-xs text-gray-500">None yet</span>
                    }
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaBriefcase className="text-indigo-600"/> Recommended Opportunities
              </h2>
              <div className="space-y-3">
                {data?.opportunities?.map((opp, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:border-indigo-300 transition cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-800">{opp.title}</h3>
                      <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded">
                        {opp.matchScore}% Match
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{opp.company} • {opp.type}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default CareerAdvisor;
