import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { 
  FaClock, FaCheckCircle, FaTimesCircle, FaShieldAlt, 
  FaArrowRight, FaArrowLeft, FaTrophy, FaRedo, FaTimes,
  FaLayerGroup, FaExclamationTriangle, FaBrain, FaRocket
} from "react-icons/fa";

export default function ExamSimulationModal({ isOpen, onClose, patternId, patternName }) {
  const [loading, setLoading] = useState(false);
  const [simulationData, setSimulationData] = useState(null);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [qId]: { answer, timeSpentSeconds, sectionIndex } }
  const [sectionTimeLeft, setSectionTimeLeft] = useState(1200); // 20 mins
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [questionTimer, setQuestionTimer] = useState(0);

  useEffect(() => {
    if (isOpen && patternId) {
      initSimulation();
    }
  }, [isOpen, patternId]);

  // Question stopwatch
  useEffect(() => {
    let interval = null;
    if (isOpen && !isSubmitted && !loading) {
      interval = setInterval(() => {
        setQuestionTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, isSubmitted, loading, activeSectionIdx, activeQuestionIdx]);

  // Section countdown timer
  useEffect(() => {
    let timer = null;
    if (isOpen && !isSubmitted && sectionTimeLeft > 0) {
      timer = setInterval(() => {
        setSectionTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitSimulation();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, isSubmitted, sectionTimeLeft]);

  const initSimulation = async () => {
    setLoading(true);
    setIsSubmitted(false);
    setEvalResult(null);
    setUserAnswers({});
    setActiveSectionIdx(0);
    setActiveQuestionIdx(0);
    try {
      const res = await API.post("/aptitude/simulation/start", { patternId });
      const data = res.data?.data || res.data;
      setSimulationData(data);
      const firstSecTime = (data.sections?.[0]?.timeMinutes || 20) * 60;
      setSectionTimeLeft(firstSecTime);
    } catch (err) {
      console.error("Failed to start simulation", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qId, opt) => {
    setUserAnswers(prev => ({
      ...prev,
      [qId]: {
        selectedAnswer: opt,
        timeSpentSeconds: (prev[qId]?.timeSpentSeconds || 0) + questionTimer,
        sectionIndex: activeSectionIdx
      }
    }));
    setQuestionTimer(0);
  };

  const handleSubmitSimulation = async () => {
    if (isSubmitted) return;
    setLoading(true);
    try {
      const currentSec = simulationData.sections[activeSectionIdx];
      const currentQ = currentSec.questions[activeQuestionIdx];

      // Record any final pending time
      const finalAnswers = { ...userAnswers };
      if (currentQ && (!finalAnswers[currentQ._id] || !finalAnswers[currentQ._id].selectedAnswer)) {
        finalAnswers[currentQ._id] = {
          selectedAnswer: "",
          timeSpentSeconds: questionTimer,
          sectionIndex: activeSectionIdx
        };
      }

      const answersPayload = Object.entries(finalAnswers).map(([qId, data]) => ({
        questionId: qId,
        selectedAnswer: data.selectedAnswer || "",
        timeSpentSeconds: data.timeSpentSeconds || 45,
        sectionIndex: data.sectionIndex || 0
      }));

      const res = await API.post("/aptitude/simulation/submit", {
        patternId: simulationData.patternId,
        simulationId: simulationData.simulationId,
        answers: answersPayload
      });

      const evalData = res.data?.data || res.data;
      setEvalResult(evalData);
      setIsSubmitted(true);
    } catch (err) {
      console.error("Failed to evaluate simulation", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentSection = simulationData?.sections?.[activeSectionIdx] || null;
  const currentQuestion = currentSection?.questions?.[activeQuestionIdx] || null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-surface border border-border rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-text-primary">
        
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-border flex justify-between items-center bg-bg-base">
          <div>
            <span className="text-[10px] font-black uppercase text-primary-600 tracking-wider">
              {simulationData?.type?.toUpperCase() || "EXAM"} SIMULATION ARENA
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-text-primary">
              {simulationData?.patternName || patternName || "Full Exam Simulation"}
            </h2>
            <p className="text-xs text-text-muted">
              {simulationData?.disclaimer}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isSubmitted && (
              <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-mono font-black rounded-xl border border-rose-200 shadow-inner">
                <FaClock />
                <span>
                  {Math.floor(sectionTimeLeft / 60).toString().padStart(2, "0")}:
                  {(sectionTimeLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
            >
              <FaTimes size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm font-semibold text-text-secondary">Preparing simulated assessment...</p>
            </div>
          ) : !isSubmitted && currentSection ? (
            /* Live Simulation Question Screen */
            <div className="space-y-6">
              
              {/* Section Tabs */}
              <div className="flex gap-2 border-b border-border pb-3 overflow-x-auto">
                {simulationData.sections.map((sec, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => {
                      setActiveSectionIdx(sIdx);
                      setActiveQuestionIdx(0);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      activeSectionIdx === sIdx
                        ? "bg-primary-600 text-white shadow"
                        : "bg-bg-base text-text-secondary hover:text-text-primary border border-border"
                    }`}
                  >
                    {sec.name} ({sec.questionCount} Qs • {sec.timeMinutes}m)
                  </button>
                ))}
              </div>

              {/* Question Area */}
              {currentQuestion && (
                <div className="bg-bg-base p-6 sm:p-8 rounded-2xl border border-border space-y-6 shadow-sm">
                  <div className="flex justify-between items-center border-b border-border pb-3">
                    <span className="text-sm font-bold text-text-muted">
                      Question {activeQuestionIdx + 1} of {currentSection.questions.length}
                    </span>
                    <span className="text-xs font-mono px-2.5 py-1 bg-surface rounded-lg border border-border text-text-secondary">
                      ⏱️ {questionTimer}s
                    </span>
                  </div>

                  <div className="text-lg sm:text-xl font-bold text-text-primary leading-relaxed">
                    {currentQuestion.questionText}
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    {currentQuestion.options?.map((opt, oIdx) => {
                      const isSelected = userAnswers[currentQuestion._id]?.selectedAnswer === opt;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectOption(currentQuestion._id, opt)}
                          className={`p-4 rounded-2xl font-semibold text-sm text-left border transition-all ${
                            isSelected
                              ? "bg-primary-50 dark:bg-primary-950/40 border-primary-500 text-primary-700 dark:text-primary-300 font-bold shadow-sm"
                              : "bg-surface border-border hover:border-primary-300 text-text-primary"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Question Navigation */}
                  <div className="flex justify-between items-center pt-4 border-t border-border">
                    <button
                      disabled={activeQuestionIdx === 0}
                      onClick={() => {
                        setActiveQuestionIdx(prev => prev - 1);
                        setQuestionTimer(0);
                      }}
                      className="px-4 py-2.5 bg-surface border border-border rounded-xl text-xs font-bold disabled:opacity-40 flex items-center gap-1.5"
                    >
                      <FaArrowLeft /> Prev
                    </button>

                    <div className="flex items-center gap-2">
                      {activeQuestionIdx + 1 < currentSection.questions.length ? (
                        <button
                          onClick={() => {
                            setActiveQuestionIdx(prev => prev + 1);
                            setQuestionTimer(0);
                          }}
                          className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5"
                        >
                          Next <FaArrowRight />
                        </button>
                      ) : activeSectionIdx + 1 < simulationData.sections.length ? (
                        <button
                          onClick={() => {
                            setActiveSectionIdx(prev => prev + 1);
                            setActiveQuestionIdx(0);
                            setQuestionTimer(0);
                          }}
                          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow"
                        >
                          Next Section &rarr;
                        </button>
                      ) : (
                        <button
                          onClick={handleSubmitSimulation}
                          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow"
                        >
                          Finish & Submit Exam
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : evalResult ? (
            /* Post Simulation Detailed Score Report */
            <div className="space-y-8 animate-fadeIn">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-black">
                  {evalResult.percentageScore}%
                </div>
                <h3 className="text-2xl font-black text-text-primary">Exam Simulation Evaluated!</h3>
                <p className="text-sm text-text-secondary">
                  Score: <strong>{evalResult.totalScore} / {evalResult.maxMarks} marks</strong> • Accuracy: <strong>{evalResult.accuracy}%</strong>
                </p>
              </div>

              {/* Target Readiness Banner */}
              <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-white/10 rounded-2xl text-white flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <span className="text-xs uppercase font-bold text-indigo-300">Exam Readiness Score</span>
                  <strong className="text-2xl block text-white mt-0.5">{evalResult.patternName}</strong>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-black text-emerald-400">{evalResult.examReadiness}%</span>
                  <span className="text-xs text-indigo-200">Simulation Readiness</span>
                </div>
              </div>

              {/* Section Breakdown Grid */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-text-muted uppercase tracking-wider">Section Performance</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {evalResult.sectionBreakdown?.map((sec, i) => (
                    <div key={i} className="p-4 bg-bg-base rounded-2xl border border-border space-y-1.5">
                      <strong className="text-sm font-bold block">{sec.name}</strong>
                      <div className="flex justify-between text-xs text-text-muted">
                        <span>Score:</span>
                        <span className="font-bold text-text-primary">{sec.score} / {sec.maxScore}</span>
                      </div>
                      <div className="flex justify-between text-xs text-text-muted">
                        <span>Correct / Attempted:</span>
                        <span className="font-bold text-emerald-600">{sec.correct} / {sec.attempted}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weak Concept & Speed Diagnostics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-bg-base rounded-2xl border border-border space-y-2">
                  <span className="text-xs font-bold text-amber-600 uppercase block">⚡ Speed Analysis</span>
                  <p className="text-lg font-black text-text-primary">{evalResult.speedRating}</p>
                  <p className="text-xs text-text-muted">Avg time per question: {evalResult.averageTimePerQuestion}s</p>
                </div>

                <div className="p-5 bg-bg-base rounded-2xl border border-border space-y-2">
                  <span className="text-xs font-bold text-rose-600 uppercase block">🔥 Weak Areas Logged</span>
                  <p className="text-xs text-text-secondary">
                    {evalResult.weakConcepts?.length || 0} weak sub-concepts were identified and automatically added to your <strong>Mistake Notebook</strong>.
                  </p>
                </div>
              </div>

            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-bg-base flex justify-between items-center">
          <span className="text-xs text-text-muted">
            Strict examination conditions applied.
          </span>

          <div className="flex gap-2">
            {isSubmitted ? (
              <button
                onClick={initSimulation}
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5"
              >
                <FaRedo /> Retake Exam Simulation
              </button>
            ) : (
              <button
                onClick={handleSubmitSimulation}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow"
              >
                Submit Simulation
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
