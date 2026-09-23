import {
  FaArrowUp,
  FaLightbulb,
  FaCheckCircle,
  FaExclamationTriangle,
  FaBookOpen,
  FaBullseye,
  FaRunning
} from "react-icons/fa";

function RecommendationCard({
  profile = {},
  totalInterviews = 0,
  avgScore = 0,
  insights = null,
  loading = false
}) {
  const defaultRecs = [];
  if ((profile.completion || 0) < 80) {
    defaultRecs.push("Complete your profile to improve placement readiness.");
  }
  if (!profile.resumeUploaded) {
    defaultRecs.push("Upload your resume to get AI-powered feedback.");
  }
  if (avgScore < 60 && totalInterviews > 0) {
    defaultRecs.push("Practice more mock interviews to improve your score.");
  }
  if (totalInterviews === 0) {
    defaultRecs.push("Start your first mock interview to get custom insights.");
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
        </div>
      </div>
    );
  }

  // If no detailed insights are available yet (no completed interviews or resume), show basic setup reminders
  if (!insights || (totalInterviews === 0 && !profile.resumeUploaded)) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <FaLightbulb className="text-amber-500" />
          AI Recommendations
        </h2>
        <ul className="space-y-3 text-gray-700">
          {(defaultRecs ?? []).map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="text-indigo-500 mt-1">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const { strengths, weaknesses, studyPlan, topicRecommendations, performanceTrends } = insights;

  return (
    <div className="space-y-6">
      {/* Overview stats block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {performanceTrends?.mostPracticedRole && performanceTrends.mostPracticedRole !== "None" && (
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-2xl p-5 border border-indigo-100 flex items-center gap-4">
            <div className="p-3 bg-indigo-500 text-white rounded-xl">
              <FaBullseye size={20} />
            </div>
            <div>
              <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wider">Most Practiced</p>
              <p className="text-lg font-bold text-gray-800">{performanceTrends.mostPracticedRole}</p>
            </div>
          </div>
        )}

        {performanceTrends?.improvementRate !== undefined && totalInterviews >= 2 && (
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-5 border border-emerald-100 flex items-center gap-4">
            <div className="p-3 bg-emerald-500 text-white rounded-xl">
              <FaArrowUp size={20} />
            </div>
            <div>
              <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Score Progression</p>
              <p className="text-lg font-bold text-gray-800">
                {performanceTrends.improvementRate >= 0 ? "+" : ""}
                {performanceTrends.improvementRate}% improvement rate
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Insights Panel */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-4">
          <FaLightbulb className="text-amber-500" />
          AI Career & Prep Insights
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="bg-emerald-50/50 rounded-xl p-5 border border-emerald-100">
            <h3 className="text-md font-bold text-emerald-800 flex items-center gap-2 mb-3">
              <FaCheckCircle className="text-emerald-500" />
              Key Strengths
            </h3>
            {strengths && strengths.length > 0 ? (
              <ul className="space-y-2 text-sm text-emerald-950">
                {(strengths ?? []).map((str, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No strengths observed yet. Keep practicing!</p>
            )}
          </div>

          {/* Weaknesses */}
          <div className="bg-rose-50/50 rounded-xl p-5 border border-rose-100">
            <h3 className="text-md font-bold text-rose-800 flex items-center gap-2 mb-3">
              <FaExclamationTriangle className="text-rose-500" />
              Areas to Improve
            </h3>
            {weaknesses && weaknesses.length > 0 ? (
              <ul className="space-y-2 text-sm text-rose-950">
                {(weaknesses ?? []).map((weak, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No specific weaknesses identified yet.</p>
            )}
          </div>
        </div>

        {/* Topic Recommendations */}
        {topicRecommendations && topicRecommendations.length > 0 && (
          <div className="mt-6">
            <h3 className="text-md font-bold text-gray-800 mb-3 flex items-center gap-2">
              <FaBookOpen className="text-indigo-500" />
              Next Recommended Topics to Practice
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(topicRecommendations ?? []).map((rec, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-3 bg-gray-50 hover:bg-indigo-50/20 transition">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-gray-800">{rec?.topic}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      rec?.priority === "High" ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {rec?.priority} Priority
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{rec?.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Study Plan Section */}
        {studyPlan && (
          <div className="mt-6 border-t pt-5">
            <h3 className="text-md font-bold text-gray-800 mb-3 flex items-center gap-2">
              <FaRunning className="text-violet-500" />
              Personalized Practice Plan
            </h3>
            <div className="bg-violet-50 border-l-4 border-violet-500 p-4 rounded-r-xl">
              <p className="text-sm text-violet-950 leading-relaxed font-medium">
                {studyPlan}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecommendationCard;