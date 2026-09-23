import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import { FaBrain, FaLayerGroup, FaBolt, FaCheck } from "react-icons/fa";

function LearningTutor() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get("/learning/dashboard");
        setDashboardData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleSeed = async () => {
    try {
      await API.post("/learning/seed");
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Seeding failed");
    }
  };

  const handleReview = async (topicId, grade) => {
    try {
      await API.post("/learning/review", { topicId, grade, timeSpentMs: 15000 });
      // Remove from UI queue immediately for UX
      setDashboardData(prev => ({
        ...prev,
        revisionQueue: prev.revisionQueue.filter(q => q.topicId !== topicId)
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to submit review");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading AI Learning Engine...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-6xl mx-auto px-6 py-8 w-full flex-1">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Learning Intelligence</h1>
            <p className="text-gray-600 mt-1">Adaptive spaced repetition driven by CareerMemory.</p>
          </div>
          <button onClick={handleSeed} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700">
            Seed Demo Queue
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Revision Queue */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaLayerGroup className="text-indigo-600"/> Today's Revision Queue
            </h2>
            
            {dashboardData?.revisionQueue?.length === 0 ? (
              <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-xl text-center">
                <FaCheck className="mx-auto text-3xl mb-2"/>
                <h3 className="font-bold">You're all caught up!</h3>
                <p className="text-sm">No topics due for revision today.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {dashboardData?.revisionQueue?.map((item) => {
                  const isWeak = dashboardData.weakTopics?.includes(item.topicId);
                  return (
                    <div key={item._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                          {item.topicId.replace("_", " ").toUpperCase()}
                          {isWeak && <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded font-bold">Weak Topic</span>}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Repetition: {item.repetition} | Easiness: {item.easinessFactor.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => handleReview(item.topicId, 0)} className="px-3 py-1.5 bg-red-50 text-red-600 text-sm font-medium rounded hover:bg-red-100 transition">Forgot (0)</button>
                        <button onClick={() => handleReview(item.topicId, 2)} className="px-3 py-1.5 bg-orange-50 text-orange-600 text-sm font-medium rounded hover:bg-orange-100 transition">Hard (2)</button>
                        <button onClick={() => handleReview(item.topicId, 4)} className="px-3 py-1.5 bg-green-50 text-green-600 text-sm font-medium rounded hover:bg-green-100 transition">Good (4)</button>
                        <button onClick={() => handleReview(item.topicId, 5)} className="px-3 py-1.5 bg-blue-50 text-blue-600 text-sm font-medium rounded hover:bg-blue-100 transition">Easy (5)</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: AI Optimization Panel */}
          <div className="space-y-6">
            <div className="bg-indigo-900 rounded-xl p-6 text-white shadow-md">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                <FaBolt className="text-yellow-400"/> AI Optimizer
              </h2>
              <p className="text-sm text-indigo-200 mb-4">
                Your SM-2 schedule is being actively optimized by the AI using your CareerMemory.
              </p>
              
              <h3 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-2">Detected Weak Topics</h3>
              {dashboardData?.weakTopics?.length > 0 ? (
                <ul className="space-y-2">
                  {dashboardData.weakTopics.map(wt => (
                    <li key={wt} className="bg-indigo-800/50 px-3 py-2 rounded text-sm border border-indigo-700 font-medium">
                      {wt.replace("_", " ").toUpperCase()}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-indigo-200">No weak topics detected.</p>
              )}
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                <FaBrain className="text-indigo-600"/> Next Best Topic
              </h2>
              <p className="text-sm text-gray-600 mb-4">Based on your learning graph, the AI recommends:</p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-800">Two Pointers</h3>
                <p className="text-xs text-gray-500 mt-1">Prerequisite: Arrays</p>
                <button className="w-full mt-3 bg-indigo-600 text-white text-sm py-2 rounded font-medium hover:bg-indigo-700 transition">
                  Start AI Lesson
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LearningTutor;
