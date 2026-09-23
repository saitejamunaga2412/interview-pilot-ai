import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import API from "../../services/api";
import { useToast } from "../../components/ui/Toast";
import { 
  FaBookOpen, FaLightbulb, FaCalculator, FaCheckCircle, 
  FaTimesCircle, FaClock, FaRocket, FaRedo, FaArrowRight, 
  FaBrain, FaExclamationTriangle, FaTrophy, FaLock, FaUnlock,
  FaChevronDown, FaChevronUp, FaStar, FaInfoCircle, FaShieldAlt,
  FaBuilding, FaLandmark, FaRobot, FaSyncAlt, FaLayerGroup, FaFilter
} from "react-icons/fa";

export default function TopicLearningPage() {
  const { topicId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const domain = location.pathname.includes("/reasoning") ? "Reasoning" : "Aptitude";

  const [activeTab, setActiveTab] = useState("learn"); // 'learn' | 'practice' | 'test'
  const [loading, setLoading] = useState(true);
  const [topicData, setTopicData] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [activeTarget, setActiveTarget] = useState(null);

  // Practice State
  const [practiceDifficulty, setPracticeDifficulty] = useState("Easy");
  const [practiceSourceFilter, setPracticeSourceFilter] = useState("all");
  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const [sourceDistribution, setSourceDistribution] = useState(null);
  const [insufficientVerifiedAlert, setInsufficientVerifiedAlert] = useState(null);
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [currentPracticeIdx, setCurrentPracticeIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showPracticeExplanation, setShowPracticeExplanation] = useState(false);
  const [showPracticeAnswer, setShowPracticeAnswer] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Question Timer & Speed tracking
  const [questionTimer, setQuestionTimer] = useState(0);
  const [similarQuestion, setSimilarQuestion] = useState(null);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  // Guided Practice State
  const [guidedStepIdx, setGuidedStepIdx] = useState(0);
  const [guidedSelectedOption, setGuidedSelectedOption] = useState(null);
  const [guidedCompleted, setGuidedCompleted] = useState(false);

  // Test State
  const [testQuestions, setTestQuestions] = useState([]);
  const [testAnswers, setTestAnswers] = useState({});
  const [testTimeLeft, setTestTimeLeft] = useState(600);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testEvaluation, setTestEvaluation] = useState(null);

  // Collapsible sections state
  const [openSection, setOpenSection] = useState({
    formulas: true,
    methods: true,
    examples: true,
    shortcuts: true,
    mistakes: false
  });

  const toggleSection = (sec) => {
    setOpenSection(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  useEffect(() => {
    fetchTopicDetails();
  }, [topicId]);

  const fetchTopicDetails = async () => {
    setLoading(true);
    try {
      const endpoint = domain === "Reasoning" ? `/reasoning/topics/${topicId}` : `/aptitude/topics/${topicId}`;
      const [topicRes, targetRes] = await Promise.all([
        API.get(endpoint),
        API.get("/exam-patterns/targets/active").catch(() => ({ data: { data: null } }))
      ]);

      const data = topicRes.data?.data || topicRes.data;
      const resolvedTopic = data?.topic || data;
      setTopicData(resolvedTopic);
      setUserProgress(data?.progress || null);
      setActiveTarget(targetRes.data?.data || targetRes.data || null);

      if (data?.progress?.highestDifficultyUnlocked) {
        setPracticeDifficulty(data.progress.highestDifficultyUnlocked);
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to load topic details", "error");
    } finally {
      setLoading(false);
    }
  };

  // Practice question timer
  useEffect(() => {
    let interval = null;
    if (activeTab === "practice" && !submittedResult && !practiceLoading) {
      interval = setInterval(() => {
        setQuestionTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTab, submittedResult, practiceLoading, currentPracticeIdx]);

  // Fetch practice questions when switching to practice mode or difficulty changes
  useEffect(() => {
    if (activeTab === "practice" && topicData) {
      fetchPracticeQuestions(practiceDifficulty, practiceSourceFilter);
    }
  }, [activeTab, practiceDifficulty, practiceSourceFilter, topicData]);

  const fetchPracticeQuestions = async (diff, srcFilter = "all", allowSupplement = false) => {
    setPracticeLoading(true);
    setSelectedAnswer(null);
    setSubmittedResult(null);
    setShowHint(false);
    setQuestionTimer(0);
    setSimilarQuestion(null);
    setInsufficientVerifiedAlert(null);

    try {
      let queryParams = `difficulty=${diff}&mode=practice&limit=10`;
      if (srcFilter && srcFilter !== "all" && !allowSupplement) {
        queryParams += `&sourceType=${srcFilter}`;
      }
      if (allowSupplement) {
        queryParams += `&allowAiFallback=true`;
      }
      if (activeTarget?.targetType === "government" && activeTarget.exam) {
        queryParams += `&examName=${encodeURIComponent(activeTarget.exam)}`;
      } else if (activeTarget?.targetType === "company" && activeTarget.company) {
        queryParams += `&companyName=${encodeURIComponent(activeTarget.company)}`;
      }

      const endpoint = domain === "Reasoning" 
        ? `/reasoning/topics/${topicId}/practice?${queryParams}` 
        : `/aptitude/topics/${topicId}/practice?${queryParams}`;
      const res = await API.get(endpoint);
      const rawData = res.data?.data || res.data || [];
      const qList = Array.isArray(rawData) ? rawData : (rawData.questions || []);

      setPracticeQuestions(qList);
      setSourceDistribution(rawData.sourceDistribution || null);

      if (rawData.insufficientVerified && srcFilter === "previous_year") {
        setInsufficientVerifiedAlert({
          available: rawData.availableCount || qList.length,
          requested: rawData.requestedCount || 10
        });
      }

      setCurrentPracticeIdx(0);
    } catch (err) {
      console.error(err);
      addToast("Failed to load practice questions", "error");
    } finally {
      setPracticeLoading(false);
    }
  };

  // Start Timed Test
  const startTest = async () => {
    setLoading(true);
    setTestAnswers({});
    setTestSubmitted(false);
    setTestEvaluation(null);
    setTestTimeLeft(600); // 10 mins
    try {
      const endpoint = domain === "Reasoning"
        ? `/reasoning/topics/${topicId}/practice?difficulty=all&mode=test&limit=10`
        : `/aptitude/topics/${topicId}/practice?difficulty=all&mode=test&limit=10`;
      const res = await API.get(endpoint);
      const rawData = res.data?.data || res.data || [];
      const qList = Array.isArray(rawData) ? rawData : (rawData.questions || []);
      setTestQuestions(qList);
      setActiveTab("test");
    } catch (err) {
      console.error(err);
      addToast("Failed to start test", "error");
    } finally {
      setLoading(false);
    }
  };

  // Test timer effect
  useEffect(() => {
    if (activeTab === "test" && !testSubmitted && testTimeLeft > 0) {
      const timer = setInterval(() => {
        setTestTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            submitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeTab, testSubmitted, testTimeLeft]);

  const handlePracticeSubmit = async () => {
    if (!selectedAnswer || isSubmitting) return;
    setIsSubmitting(true);
    const currQ = practiceQuestions[currentPracticeIdx];

    try {
      const endpoint = domain === "Reasoning" ? `/reasoning/practice/submit` : `/aptitude/practice/submit`;
      const res = await API.post(endpoint, {
        topicId: topicData.topicId,
        mode: "practice",
        targetId: activeTarget?.targetId,
        targetType: activeTarget?.targetType,
        answers: [{ 
          questionId: currQ._id, 
          answer: selectedAnswer,
          timeSpentSeconds: questionTimer || 40 
        }]
      });
      const data = res.data?.data || res.data;
      setSubmittedResult(data.results[0]);
      setUserProgress(prev => ({
        ...prev,
        highestDifficultyUnlocked: data.highestDifficultyUnlocked,
        masteryPercentage: data.masteryPercentage,
        status: data.masteryLevel,
        weakConcepts: data.weakConcepts
      }));

      if (data.results[0]?.isCorrect) {
        addToast("Correct Answer! Great Job!", "success");
      } else {
        addToast("Incorrect approach. Review the breakdown below.", "info");
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to submit answer", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch a similar practice question for remediation
  const handleTrySimilar = async () => {
    if (!submittedResult) return;
    setLoadingSimilar(true);
    try {
      const currQ = practiceQuestions[currentPracticeIdx];
      const res = await API.get(`/exam-patterns/similar-question/${topicData.topicId}?questionId=${currQ._id}&concept=${encodeURIComponent(submittedResult.concept)}`);
      const sim = res.data?.data || res.data;
      if (sim) {
        setSimilarQuestion(sim);
        addToast("Loaded similar remediation question!", "success");
      } else {
        addToast("No similar question found. Try next question.", "info");
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to load similar question", "error");
    } finally {
      setLoadingSimilar(false);
    }
  };

  const handleMarkLearnComplete = async () => {
    try {
      const endpoint = domain === "Reasoning" 
        ? `/reasoning/topics/${topicId}/complete-learn` 
        : `/aptitude/topics/${topicId}/complete-learn`;
      await API.post(endpoint, { domain });
      addToast("Lesson completed! You earned +30% baseline mastery. Now test your skills in Practice mode!", "success");
      setUserProgress(prev => ({ ...prev, learnCompleted: true }));
      setActiveTab("practice");
    } catch (err) {
      console.error(err);
      setActiveTab("practice");
    }
  };

  const submitTest = async () => {
    if (testSubmitted) return;
    setLoading(true);
    try {
      const answersPayload = testQuestions.map(q => ({
        questionId: q._id,
        answer: testAnswers[q._id] || "",
        timeSpentSeconds: 45
      }));

      const endpoint = domain === "Reasoning" ? `/reasoning/practice/submit` : `/aptitude/practice/submit`;
      const res = await API.post(endpoint, {
        topicId: topicData.topicId,
        mode: "test",
        targetId: activeTarget?.targetId,
        answers: answersPayload
      });
      const data = res.data?.data || res.data;
      setTestEvaluation(data);
      setTestSubmitted(true);
      setUserProgress(prev => ({
        ...prev,
        highestDifficultyUnlocked: data.highestDifficultyUnlocked,
        masteryPercentage: data.masteryPercentage,
        status: data.masteryLevel,
        weakConcepts: data.weakConcepts
      }));
      addToast(`Test completed! Your score: ${data.score}%`, "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to submit test", "error");
    } finally {
      setLoading(false);
    }
  };

  const renderProvenanceBadge = (q) => {
    const src = q.questionSource || "curated";
    if (src === "previous_year" || q.verified) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
          <FaShieldAlt className="text-emerald-600" />
          <span>🏛️ Previous Year — {q.examName || "Verified Exam"} {q.year ? `(${q.year})` : ""} — Verified</span>
        </span>
      );
    }
    if (src === "official_sample") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-300">
          <FaLandmark className="text-blue-600" />
          <span>📘 Official Sample — {q.examName || "Govt Exam"} — Verified</span>
        </span>
      );
    }
    if (src === "company_style") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border border-purple-300">
          <FaBuilding className="text-purple-600" />
          <span>🏢 Company-Style — {q.companyName || "Placement"} Pattern</span>
        </span>
      );
    }
    if (src === "exam_style") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 border border-indigo-300">
          <span>🎯 Exam-Style — {q.examName || "Competitive"} Pattern</span>
        </span>
      );
    }
    if (src === "ai_generated") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300">
          <FaRobot className="text-amber-600" />
          <span>🤖 AI Generated — {q.companyName || q.examName || "Target"}-style</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-surface-hover text-text-secondary border border-border">
        <span>📚 Curated Placement Question</span>
      </span>
    );
  };

  if (loading && !topicData) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-secondary font-medium">Loading placement lesson...</p>
        </div>
      </div>
    );
  }

  if (!topicData) {
    return (
      <div className="min-h-screen bg-bg-base p-8 text-center text-text-primary">
        <h2 className="text-2xl font-bold mb-4">Topic not found</h2>
        <Link to="/aptitude" className="text-primary-600 font-semibold hover:underline">&larr; Back to Aptitude</Link>
      </div>
    );
  }

  const masteryScore = userProgress?.masteryPercentage || 0;
  const masteryBadge = userProgress?.status || (masteryScore >= 85 ? "Strong" : masteryScore >= 50 ? "Developing" : "Beginner");

  return (
    <div className="min-h-screen bg-bg-base text-text-primary p-4 sm:p-6 md:p-10 pb-32">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb with Target */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-text-muted">
          <div className="flex items-center gap-2">
            <Link to="/aptitude" className="hover:text-primary-600 transition-colors">
              {domain === "Reasoning" ? "Reasoning" : "Aptitude"}
            </Link>
            <span>&rarr;</span>
            <span className="font-semibold text-text-primary">{topicData.title}</span>
          </div>

          {activeTarget && (
            <span className="text-xs bg-surface px-3 py-1 rounded-full border border-border font-bold text-primary-600">
              🎯 Target: {activeTarget.targetName}
            </span>
          )}
        </div>

        {/* Topic Header Card */}
        <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 rounded-full text-xs font-bold uppercase tracking-wider">
                {topicData.subCategory || domain}
              </span>
              <span className="px-3 py-1 bg-surface-hover text-text-secondary rounded-full text-xs font-semibold">
                ⏱️ {topicData.estimatedTimeMinutes || 40} mins
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                masteryScore >= 85 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
                masteryScore >= 50 ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400' :
                'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
              }`}>
                🏆 {masteryBadge} ({masteryScore}% Mastery)
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 text-text-primary">
              {topicData.title}
            </h1>
            <p className="text-text-secondary text-base max-w-2xl leading-relaxed">
              {topicData.placementImportance || topicData.definition}
            </p>
          </div>

          {/* Mastery Gauge */}
          <div className="bg-bg-base p-4 rounded-2xl border border-border flex flex-col items-center shrink-0 w-full sm:w-auto">
            <span className="text-xs text-text-muted font-bold uppercase mb-1">Your Mastery</span>
            <span className="text-3xl font-black text-primary-600">{masteryScore}%</span>
            <div className="w-32 bg-surface-hover h-2 rounded-full overflow-hidden mt-2">
              <div className="bg-primary-500 h-full rounded-full transition-all duration-500" style={{ width: `${masteryScore}%` }}></div>
            </div>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-border bg-surface rounded-2xl p-1.5 shadow-sm gap-2">
          <button
            onClick={() => setActiveTab("learn")}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all ${
              activeTab === "learn" 
                ? "bg-primary-600 text-white shadow-md" 
                : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
            }`}
          >
            <FaBookOpen /> 1. Learn First
          </button>

          <button
            onClick={() => setActiveTab("practice")}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all ${
              activeTab === "practice" 
                ? "bg-primary-600 text-white shadow-md" 
                : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
            }`}
          >
            <FaCalculator /> 2. Practice Topic
          </button>

          <button
            onClick={startTest}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all ${
              activeTab === "test" 
                ? "bg-primary-600 text-white shadow-md" 
                : "text-text-secondary hover:text-text-primary hover:bg-surface-hover text-amber-600 dark:text-amber-400"
            }`}
          >
            <FaClock /> 3. Timed Test
          </button>
        </div>

        {/* TAB 1: LEARN FIRST CONTENT */}
        {activeTab === "learn" && (
          <div className="space-y-8 animate-fadeIn">

            {/* What is this topic & Analogy */}
            <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-border space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-primary-600">
                <FaInfoCircle /> What is this topic?
              </h2>
              <p className="text-text-primary text-lg leading-relaxed">{topicData.beginnerExplanation || topicData.definition}</p>
              {topicData.realLifeAnalogy && (
                <div className="p-4 bg-primary-50 dark:bg-primary-950/40 rounded-2xl border border-primary-200 dark:border-primary-900/50 text-sm sm:text-base text-primary-900 dark:text-primary-100 flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <strong className="block font-bold mb-1">Real-World Analogy:</strong>
                    {topicData.realLifeAnalogy}
                  </div>
                </div>
              )}
            </div>

            {/* Core Concepts Grid */}
            {topicData.coreConcepts && topicData.coreConcepts.length > 0 && (
              <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-border space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-indigo-600">
                  <FaBrain /> Core Concepts You Must Master
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topicData.coreConcepts.map((c, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-bg-base border border-border hover:border-primary-400 transition-colors">
                      <h3 className="font-bold text-base text-text-primary mb-1">{c.title}</h3>
                      <p className="text-sm text-text-secondary leading-relaxed">{c.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Important Formulas / Rule Sheet */}
            {topicData.formulas && topicData.formulas.length > 0 && (
              <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-border space-y-4">
                <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection("formulas")}>
                  <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <FaCalculator /> {domain === "Reasoning" ? "Core Patterns & Logical Rules Sheet" : "Important Formula Sheet"}
                  </h2>
                  <button className="text-text-muted hover:text-text-primary">
                    {openSection.formulas ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>

                {openSection.formulas && (
                  <div className="grid grid-cols-1 gap-4 pt-2">
                    {topicData.formulas.map((f, i) => (
                      <div key={i} className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-2">
                        <div className="font-mono font-bold text-lg text-emerald-800 dark:text-emerald-300">
                          {f.formula}
                        </div>
                        <div className="text-sm text-text-primary">
                          <strong>Meaning:</strong> {f.meaning}
                        </div>
                        <div className="text-sm text-text-secondary">
                          <strong>When to use:</strong> {f.whenToUse}
                        </div>
                        {f.example && (
                          <div className="text-xs font-mono bg-white/60 dark:bg-black/40 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900 text-emerald-950 dark:text-emerald-200">
                            <strong>Example:</strong> {f.example}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* How To Solve Section */}
            {topicData.solvingMethod && topicData.solvingMethod.length > 0 && (
              <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-border space-y-4">
                <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection("methods")}>
                  <h2 className="text-xl font-bold flex items-center gap-2 text-purple-600 dark:text-purple-400">
                    <FaRocket /> Repeatable Step-by-Step Solving Process
                  </h2>
                  <button className="text-text-muted hover:text-text-primary">
                    {openSection.methods ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>

                {openSection.methods && (
                  <div className="space-y-3 pt-2">
                    {topicData.solvingMethod.map((s, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-2xl bg-bg-base border border-border items-start">
                        <span className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                          {s.stepNumber || i + 1}
                        </span>
                        <div>
                          <h3 className="font-bold text-base text-text-primary">{s.title}</h3>
                          <p className="text-sm text-text-secondary mt-1">{s.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Solved Examples */}
            {topicData.solvedExamples && topicData.solvedExamples.length > 0 && (
              <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-border space-y-4">
                <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection("examples")}>
                  <h2 className="text-xl font-bold flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <FaStar /> Solved Examples with Complete Thought Process
                  </h2>
                  <button className="text-text-muted hover:text-text-primary">
                    {openSection.examples ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>

                {openSection.examples && (
                  <div className="space-y-6 pt-2">
                    {topicData.solvedExamples.map((ex, i) => (
                      <div key={i} className="p-6 rounded-2xl bg-bg-base border border-border space-y-4">
                        <div className="font-bold text-lg text-text-primary">
                          Example {i + 1}: {ex.question}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="p-3 bg-surface rounded-xl border border-border">
                            <span className="text-xs font-bold text-text-muted block uppercase">Given:</span>
                            <span className="text-text-primary font-medium">{ex.given}</span>
                          </div>
                          <div className="p-3 bg-surface rounded-xl border border-border">
                            <span className="text-xs font-bold text-text-muted block uppercase">Asked:</span>
                            <span className="text-text-primary font-medium">{ex.asked}</span>
                          </div>
                        </div>

                        <div className="p-3 bg-primary-50 dark:bg-primary-950/40 rounded-xl text-sm font-mono text-primary-800 dark:text-primary-200 border border-primary-200">
                          <strong>Formula / Rule:</strong> {ex.formulaUsed}
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-surface rounded-xl border border-emerald-300 dark:border-emerald-800 gap-3">
                          <div>
                            <span className="text-xs font-bold text-emerald-600 uppercase block">Final Answer:</span>
                            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{ex.answer}</span>
                          </div>
                          {ex.shortcut && (
                            <div className="text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 p-2.5 rounded-lg border border-amber-200">
                              ⚡ <strong>Shortcut:</strong> {ex.shortcut}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Action */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-surface p-6 rounded-3xl border border-border gap-4">
              <div>
                <h3 className="font-bold text-lg">Ready for target-specific practice?</h3>
                <p className="text-sm text-text-secondary">Solve authentic past-paper and pattern-matched questions.</p>
              </div>
              <button
                onClick={handleMarkLearnComplete}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <span>Mark Learn Complete & Start Practice</span>
                <FaArrowRight />
              </button>
            </div>

          </div>
        )}

        {/* TAB 2: PROGRESSIVE INDEPENDENT PRACTICE */}
        {activeTab === "practice" && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Header & Source Filter Panel */}
            <div className="bg-surface rounded-3xl p-6 border border-border space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <FaRocket className="text-primary-600" /> Target-Aware Practice Session
                  </h2>
                  <p className="text-xs sm:text-sm text-text-secondary">
                    Active Target: <strong className="text-text-primary">{activeTarget?.targetName || "General Placement"}</strong>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Difficulty level */}
                  <div className="flex items-center gap-1 p-1 bg-bg-base rounded-2xl border border-border">
                    {["Easy", "Medium", "Hard"].map((lvl) => {
                      const isUnlocked = lvl === "Easy" || 
                        (lvl === "Medium" && (userProgress?.highestDifficultyUnlocked === "Medium" || userProgress?.highestDifficultyUnlocked === "Hard")) ||
                        (lvl === "Hard" && userProgress?.highestDifficultyUnlocked === "Hard");

                      const isSelected = practiceDifficulty === lvl;

                      return (
                        <button
                          key={lvl}
                          disabled={!isUnlocked}
                          onClick={() => setPracticeDifficulty(lvl)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                            isSelected 
                              ? "bg-primary-600 text-white shadow" 
                              : isUnlocked 
                                ? "text-text-secondary hover:text-text-primary hover:bg-surface" 
                                : "text-text-muted opacity-40 cursor-not-allowed"
                          }`}
                        >
                          {isUnlocked ? <FaUnlock size={10} /> : <FaLock size={10} />}
                          <span>{lvl}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explicit Source Filters */}
                  <select
                    value={practiceSourceFilter}
                    onChange={(e) => setPracticeSourceFilter(e.target.value)}
                    className="p-2 bg-bg-base border border-border rounded-xl text-xs font-bold text-text-primary"
                  >
                    <option value="all">All Sources</option>
                    <option value="previous_year">Verified Past Papers</option>
                    <option value="official_sample">Official Sample</option>
                    <option value="company_style">Company-Style</option>
                    <option value="exam_style">Exam-Style</option>
                    <option value="curated">Curated Bank</option>
                    <option value="ai_generated">AI Generated</option>
                  </select>
                </div>
              </div>

              {/* Source Distribution Breakdown Bar */}
              {sourceDistribution && (
                <div className="flex flex-wrap items-center gap-2 pt-2 text-xs border-t border-border">
                  <span className="font-bold text-text-muted uppercase text-[10px] flex items-center gap-1">
                    <FaLayerGroup size={11} /> Source Mix:
                  </span>
                  {sourceDistribution.previous_year > 0 && (
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300">
                      🏛️ Past Year: {sourceDistribution.previous_year}
                    </span>
                  )}
                  {sourceDistribution.official_sample > 0 && (
                    <span className="px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 font-bold border border-blue-300">
                      📘 Official Sample: {sourceDistribution.official_sample}
                    </span>
                  )}
                  {sourceDistribution.company_style > 0 && (
                    <span className="px-2 py-0.5 rounded-lg bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 font-bold border border-purple-300">
                      🏢 Company Style: {sourceDistribution.company_style}
                    </span>
                  )}
                  {sourceDistribution.exam_style > 0 && (
                    <span className="px-2 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 font-bold border border-indigo-300">
                      🎯 Exam Style: {sourceDistribution.exam_style}
                    </span>
                  )}
                  {sourceDistribution.curated > 0 && (
                    <span className="px-2 py-0.5 rounded-lg bg-surface-hover text-text-secondary font-bold border border-border">
                      📚 Curated: {sourceDistribution.curated}
                    </span>
                  )}
                  {sourceDistribution.ai_generated > 0 && (
                    <span className="px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold border border-amber-300">
                      🤖 AI Generated: {sourceDistribution.ai_generated}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Insufficient Verified Past Questions Alert */}
            {insufficientVerifiedAlert && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                    <FaShieldAlt /> Strict Zero-Fabrication Notice
                  </div>
                  <p className="text-xs text-amber-900 dark:text-amber-200">
                    Only <strong>{insufficientVerifiedAlert.available} verified previous-year questions</strong> are currently available in the database for this topic.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => fetchPracticeQuestions(practiceDifficulty, "previous_year", false)}
                    className="px-4 py-2 bg-surface hover:bg-surface-hover border border-border text-text-primary rounded-xl text-xs font-bold shadow-sm"
                  >
                    Practice {insufficientVerifiedAlert.available} Verified Only
                  </button>
                  <button
                    onClick={() => {
                      setPracticeSourceFilter("all");
                      fetchPracticeQuestions(practiceDifficulty, "all", true);
                    }}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow"
                  >
                    Add Target-Style Questions
                  </button>
                </div>
              </div>
            )}

            {/* Practice Question Card */}
            {practiceLoading ? (
              <div className="bg-surface p-12 rounded-3xl border border-border text-center">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-text-secondary">Fetching target questions...</p>
              </div>
            ) : practiceQuestions.length === 0 ? (
              <div className="bg-surface p-12 rounded-3xl border border-border text-center space-y-4">
                <p className="text-text-secondary font-medium">No questions found matching this filter.</p>
                <button onClick={() => { setPracticeSourceFilter("all"); fetchPracticeQuestions("Easy", "all"); }} className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-xs shadow">
                  Reset Source Filters
                </button>
              </div>
            ) : (
              <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-border space-y-6 shadow-sm">
                
                {/* Question Top Bar with Provenance Badge & Stopwatch */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border pb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-text-muted">
                      Q {currentPracticeIdx + 1}/{practiceQuestions.length}
                    </span>
                    {renderProvenanceBadge(practiceQuestions[currentPracticeIdx])}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono bg-bg-base px-2.5 py-1 rounded-lg border border-border flex items-center gap-1.5 text-text-secondary">
                      <FaClock className="text-primary-600" />
                      <span>{questionTimer}s</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setShowHint(!showHint)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                        showHint
                          ? "text-amber-300 bg-amber-500/20 border-amber-500/40"
                          : "text-amber-500 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20"
                      }`}
                    >
                      <FaLightbulb /> {showHint ? "Hide Hint" : "Hint"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowPracticeExplanation(!showPracticeExplanation)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                        showPracticeExplanation
                          ? "text-primary-300 bg-primary-500/20 border-primary-500/40"
                          : "text-primary-400 bg-primary-500/10 border-primary-500/20 hover:bg-primary-500/20"
                      }`}
                    >
                      <FaBrain /> {showPracticeExplanation ? "Hide Explanation" : "Explain"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowPracticeAnswer(!showPracticeAnswer)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                        showPracticeAnswer
                          ? "text-emerald-300 bg-emerald-500/20 border-emerald-500/40"
                          : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20"
                      }`}
                    >
                      <FaCheckCircle /> {showPracticeAnswer ? "Hide Answer" : "Show Answer"}
                    </button>
                  </div>
                </div>

                {/* Optional Hint Panel */}
                {showHint && practiceQuestions[currentPracticeIdx]?.hints && (
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-300 animate-fadeIn space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-400">
                      <FaLightbulb /> AI Progressive Clue:
                    </div>
                    <p>{practiceQuestions[currentPracticeIdx]?.hints.join(" ")}</p>
                  </div>
                )}

                {/* Optional Explanation Panel */}
                {showPracticeExplanation && (
                  <div className="p-4 bg-primary-500/10 border border-primary-500/30 rounded-2xl text-xs text-text-secondary animate-fadeIn space-y-2">
                    <div className="font-bold flex items-center gap-1.5 text-primary-400">
                      <FaBrain /> AI Step-by-Step Explanation:
                    </div>
                    <div className="font-mono text-xs leading-relaxed text-text-primary whitespace-pre-wrap">
                      {practiceQuestions[currentPracticeIdx]?.explanation || 
                       practiceQuestions[currentPracticeIdx]?.stepByStepSolution || 
                       practiceQuestions[currentPracticeIdx]?.solution || 
                       "Formulate the given values, apply the core topic formula, and simplify to the target units."}
                    </div>
                  </div>
                )}

                {/* Optional Show Answer Panel */}
                {showPracticeAnswer && practiceQuestions[currentPracticeIdx]?.correctAnswer && (
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 animate-fadeIn space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                      <FaCheckCircle /> Verified Correct Answer:
                    </div>
                    <p className="font-mono font-bold text-sm text-white">
                      {practiceQuestions[currentPracticeIdx]?.correctAnswer}
                    </p>
                  </div>
                )}

                {/* Question Statement */}
                <div className="text-lg sm:text-xl font-bold text-text-primary leading-relaxed">
                  {practiceQuestions[currentPracticeIdx]?.questionText}
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  {practiceQuestions[currentPracticeIdx]?.options?.map((opt, optIdx) => {
                    const isSelected = selectedAnswer === opt;
                    const showFeedback = submittedResult !== null;
                    const isCorrect = opt === submittedResult?.correctAnswer;
                    const isWrongSelection = showFeedback && isSelected && !submittedResult?.isCorrect;
                    const isRevealedAnswer = showPracticeAnswer && opt === practiceQuestions[currentPracticeIdx]?.correctAnswer;

                    return (
                      <button
                        key={optIdx}
                        disabled={showFeedback}
                        onClick={() => setSelectedAnswer(opt)}
                        className={`p-4 rounded-2xl font-semibold text-sm sm:text-base text-left transition-all border flex items-center justify-between cursor-pointer ${
                          isRevealedAnswer
                            ? "bg-emerald-500/15 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30 shadow-md"
                            : showFeedback
                              ? isCorrect
                                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                                : isWrongSelection
                                  ? "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300"
                                  : "bg-bg-base border-border text-text-muted opacity-60"
                              : isSelected
                                ? "bg-primary-50 dark:bg-primary-950/40 border-primary-500 text-primary-700 dark:text-primary-300 shadow-sm"
                                : "bg-bg-base border-border hover:border-primary-400 text-text-primary"
                        }`}
                      >
                        <span>{opt}</span>
                        {showFeedback && isCorrect && <FaCheckCircle className="text-emerald-500 shrink-0" />}
                        {showFeedback && isWrongSelection && <FaTimesCircle className="text-rose-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <span className="text-xs text-text-muted font-medium">
                    Difficulty: <strong className="text-text-primary">{practiceQuestions[currentPracticeIdx]?.difficulty}</strong>
                  </span>

                  {!submittedResult ? (
                    <button
                      disabled={!selectedAnswer || isSubmitting}
                      onClick={handlePracticeSubmit}
                      className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-xl shadow transition-all text-sm"
                    >
                      {isSubmitting ? "Evaluating..." : "Check Answer"}
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      {!submittedResult.isCorrect && (
                        <button
                          disabled={loadingSimilar}
                          onClick={handleTrySimilar}
                          className="px-4 py-2.5 bg-surface hover:bg-surface-hover border border-border text-text-primary font-bold rounded-xl text-xs flex items-center gap-1.5"
                        >
                          <FaSyncAlt className={loadingSimilar ? "animate-spin" : ""} />
                          <span>{loadingSimilar ? "Loading..." : "Try Similar Question"}</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (currentPracticeIdx + 1 < practiceQuestions.length) {
                            setCurrentPracticeIdx(prev => prev + 1);
                            setSelectedAnswer(null);
                            setSubmittedResult(null);
                            setShowHint(false);
                            setShowPracticeExplanation(false);
                            setShowPracticeAnswer(false);
                            setQuestionTimer(0);
                            setSimilarQuestion(null);
                          } else {
                            addToast("You've completed all questions in this set!", "success");
                          }
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow flex items-center gap-2 text-sm"
                      >
                        <span>Next Question</span>
                        <FaArrowRight />
                      </button>
                    </div>
                  )}
                </div>

                {/* Answer Feedback & Breakdown */}
                {submittedResult && (
                  <div className={`p-6 rounded-2xl border space-y-3 animate-fadeIn ${
                    submittedResult.isCorrect 
                      ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800" 
                      : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800"
                  }`}>
                    <div className="flex items-center gap-2 font-bold text-base">
                      {submittedResult.isCorrect ? (
                        <span className="text-emerald-600 flex items-center gap-1.5"><FaCheckCircle /> Correct Answer!</span>
                      ) : (
                        <span className="text-rose-600 flex items-center gap-1.5"><FaTimesCircle /> Incorrect Approach</span>
                      )}
                    </div>

                    {submittedResult.wrongReason && (
                      <div className="text-xs bg-rose-100 dark:bg-rose-900/30 text-rose-900 dark:text-rose-200 p-3 rounded-xl border border-rose-300">
                        ⚠️ <strong>Why your approach was wrong:</strong> {submittedResult.wrongReason}
                      </div>
                    )}

                    <p className="text-sm text-text-primary leading-relaxed">
                      <strong>Step-by-Step Solution:</strong> {submittedResult.explanation}
                    </p>

                    {submittedResult.formulaUsed && (
                      <div className="text-xs font-mono text-primary-700 dark:text-primary-300">
                        📐 <strong>Formula Used:</strong> {submittedResult.formulaUsed}
                      </div>
                    )}

                    {submittedResult.shortcuts && (
                      <div className="text-xs font-mono bg-white/60 dark:bg-black/30 p-2 rounded-lg text-amber-800 dark:text-amber-200">
                        ⚡ <strong>Faster Shortcut:</strong> {submittedResult.shortcuts}
                      </div>
                    )}
                  </div>
                )}

                {/* Similar Question Remediation Card */}
                {similarQuestion && (
                  <div className="p-6 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl space-y-3 animate-fadeIn">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase text-indigo-700 dark:text-indigo-300">
                        Remediation Practice: Similar Concept
                      </span>
                      {renderProvenanceBadge(similarQuestion)}
                    </div>
                    <div className="font-bold text-text-primary text-base">
                      {similarQuestion.questionText}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {similarQuestion.options?.map((opt, oIdx) => (
                        <div key={oIdx} className="p-2.5 bg-bg-base border border-border rounded-xl font-medium">
                          {opt}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-text-muted">
                      Correct Answer: <strong>{similarQuestion.correctAnswer}</strong> • {similarQuestion.explanation}
                    </p>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* TAB 3: TIMED PLACEMENT TEST */}
        {activeTab === "test" && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Test Header */}
            <div className="bg-surface rounded-3xl p-6 border border-border flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
              <div>
                <span className="text-xs font-bold uppercase text-primary-600">Simulated Assessment</span>
                <h2 className="text-xl font-bold text-text-primary">
                  {activeTarget?.targetName || "Target Assessment Mode"}
                </h2>
                <p className="text-xs text-text-secondary">Strict exam conditions: no hints or answer previews allowed.</p>
              </div>

              {!testSubmitted && (
                <div className="flex items-center gap-3 px-5 py-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-mono font-black text-xl rounded-2xl border border-rose-200 shadow-inner">
                  <FaClock />
                  <span>
                    {Math.floor(testTimeLeft / 60).toString().padStart(2, "0")}:
                    {(testTimeLeft % 60).toString().padStart(2, "0")}
                  </span>
                </div>
              )}
            </div>

            {/* Test Questions or Multi-Factor Evaluation Results */}
            {!testSubmitted ? (
              <div className="space-y-6">
                {testQuestions.map((q, idx) => (
                  <div key={q._id} className="bg-surface rounded-3xl p-6 border border-border space-y-4 shadow-sm">
                    <div className="flex justify-between items-center border-b border-border pb-3">
                      <span className="font-bold text-sm text-text-muted">Question {idx + 1} of {testQuestions.length}</span>
                      {renderProvenanceBadge(q)}
                    </div>

                    <div className="font-bold text-base text-text-primary">
                      {q.questionText}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.options?.map((opt, oIdx) => {
                        const isSelected = testAnswers[q._id] === opt;
                        return (
                          <button
                            key={oIdx}
                            onClick={() => setTestAnswers(prev => ({ ...prev, [q._id]: opt }))}
                            className={`p-3.5 rounded-xl font-medium text-sm text-left border transition-all ${
                              isSelected 
                                ? "bg-primary-50 dark:bg-primary-950/40 border-primary-500 text-primary-700 dark:text-primary-300 font-bold" 
                                : "bg-bg-base border-border hover:border-primary-300 text-text-primary"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <button
                  onClick={submitTest}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-lg rounded-2xl shadow-xl transition-all"
                >
                  Submit Timed Assessment
                </button>
              </div>
            ) : (
              /* Evaluation Analytics Screen */
              <div className="bg-surface rounded-3xl p-8 border border-border space-y-8 animate-fadeIn">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-black">
                    {testEvaluation?.score}%
                  </div>
                  <h3 className="text-2xl font-black text-text-primary">Assessment Evaluated!</h3>
                  <p className="text-sm text-text-secondary">
                    You scored {testEvaluation?.correctCount} out of {testEvaluation?.totalQuestions} questions.
                  </p>
                </div>

                {/* Target Practice Readiness Meter with Multi-Factor Breakdown */}
                <div className="p-6 bg-gradient-to-r from-indigo-950/40 to-slate-900/40 border border-indigo-300/30 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                      <span className="text-xs font-bold uppercase text-indigo-300 block">Target Readiness Status:</span>
                      <strong className="text-xl text-white block mt-0.5">
                        {testEvaluation?.targetName || "Target Readiness"}
                      </strong>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-black text-emerald-400">
                        {testEvaluation?.targetReadinessScore || testEvaluation?.score}%
                      </span>
                      <span className="text-xs text-indigo-200">Practice Readiness</span>
                    </div>
                  </div>

                  {/* Multi-Factor Readiness Breakdown */}
                  {testEvaluation?.readinessBreakdown && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-white/10 text-center">
                      <div className="p-2.5 bg-black/30 rounded-xl border border-white/10">
                        <span className="text-[10px] uppercase font-bold text-indigo-300 block">Knowledge (30%)</span>
                        <span className="text-base font-black text-white">{testEvaluation.readinessBreakdown.conceptKnowledgeScore}%</span>
                      </div>
                      <div className="p-2.5 bg-black/30 rounded-xl border border-white/10">
                        <span className="text-[10px] uppercase font-bold text-indigo-300 block">Accuracy (30%)</span>
                        <span className="text-base font-black text-white">{testEvaluation.readinessBreakdown.accuracyScore}%</span>
                      </div>
                      <div className="p-2.5 bg-black/30 rounded-xl border border-white/10">
                        <span className="text-[10px] uppercase font-bold text-indigo-300 block">Speed (15%)</span>
                        <span className="text-base font-black text-white">{testEvaluation.readinessBreakdown.speedScore}%</span>
                      </div>
                      <div className="p-2.5 bg-black/30 rounded-xl border border-white/10">
                        <span className="text-[10px] uppercase font-bold text-indigo-300 block">Past Paper (15%)</span>
                        <span className="text-base font-black text-white">{testEvaluation.readinessBreakdown.previousYearPerformance}%</span>
                      </div>
                      <div className="p-2.5 bg-black/30 rounded-xl border border-white/10">
                        <span className="text-[10px] uppercase font-bold text-indigo-300 block">Timed Test (10%)</span>
                        <span className="text-base font-black text-white">{testEvaluation.readinessBreakdown.timedTestPerformance}%</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Time & Speed Management Analytics */}
                {testEvaluation?.timeAnalytics && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 bg-bg-base rounded-xl border border-border">
                      <span className="text-[10px] uppercase font-bold text-text-muted block">Avg Time / Q</span>
                      <span className="text-lg font-black text-text-primary">{testEvaluation.timeAnalytics.averageTimePerQuestion}s</span>
                    </div>
                    <div className="p-3 bg-bg-base rounded-xl border border-border">
                      <span className="text-[10px] uppercase font-bold text-text-muted block">Fastest Q</span>
                      <span className="text-lg font-black text-emerald-600">{testEvaluation.timeAnalytics.fastestTime}s</span>
                    </div>
                    <div className="p-3 bg-bg-base rounded-xl border border-border">
                      <span className="text-[10px] uppercase font-bold text-text-muted block">Slowest Q</span>
                      <span className="text-lg font-black text-amber-600">{testEvaluation.timeAnalytics.slowestTime}s</span>
                    </div>
                    <div className="p-3 bg-bg-base rounded-xl border border-border">
                      <span className="text-[10px] uppercase font-bold text-text-muted block">Total Time</span>
                      <span className="text-lg font-black text-primary-600">{Math.round(testEvaluation.timeAnalytics.totalTimeSeconds / 60)} min</span>
                    </div>
                  </div>
                )}

                {testEvaluation?.weakestConcept && (
                  <div className="p-5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                      <span className="text-xs font-bold text-rose-800 uppercase block">Weakest Concept Detected:</span>
                      <strong className="text-rose-900 dark:text-rose-100 text-lg">{testEvaluation.weakestConcept}</strong>
                    </div>
                    <button
                      onClick={() => setActiveTab("learn")}
                      className="px-6 py-2.5 bg-rose-600 text-white font-bold rounded-xl shadow"
                    >
                      Revise Weak Area Now
                    </button>
                  </div>
                )}

                <div className="flex gap-4 justify-center">
                  <button onClick={startTest} className="px-6 py-3 bg-surface border border-border rounded-xl font-bold hover:bg-surface-hover">
                    Retake Test
                  </button>
                  <button onClick={() => setActiveTab("practice")} className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold">
                    Continue Practice
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
