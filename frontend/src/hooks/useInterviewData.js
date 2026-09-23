import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../services/api";

export function useInterviewData() {
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const [sessionId, setSessionId] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [isTimedInterview, setIsTimedInterview] = useState(false);
  const [duration, setDuration] = useState(30);
  const [timeLeft, setTimeLeft] = useState(0);

  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const hasResults = Object.keys(results).length > 0;
  const questionsGenerated = questions.length > 0;

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const showToast = useCallback((type, message) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ type, message });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 4000);
  }, []);

  const restoreSession = useCallback(async (sid) => {
    try {
      setLoading(true);
      const res = await API.get(`/result/session/${sid}`);
      const sessionData = res.data?.data?.session || {};
      
      setSessionId(sid);
      setRole(sessionData.role);
      setLevel(sessionData.level);
      setIsTimedInterview(sessionData.isTimedInterview || false);
      if (sessionData.duration) setDuration(sessionData.duration);
      setQuestions(sessionData.questions || []);
      
      const savedDraft = localStorage.getItem(`interview:draft:${sid}`);
      let parsedAnswers = {};
      if (savedDraft) {
        try {
          parsedAnswers = JSON.parse(savedDraft);
        } catch {}
      }
      setAnswers(parsedAnswers);
      
      const questionsData = res.data?.data?.questions || [];
      if (questionsData.length > 0) {
        const existingResults = {};
        let firstUnanswered = 0;
        questionsData.forEach((q, i) => {
          if (q.status !== "Not Answered" && q.attemptStatus === "Attempted") {
            existingResults[i] = q;
            parsedAnswers[i] = q.answer || parsedAnswers[i];
          } else {
            if (firstUnanswered === 0 && !parsedAnswers[i]) firstUnanswered = i;
          }
        });
        setResults(existingResults);
        setAnswers(parsedAnswers);
        setCurrentQuestionIndex(firstUnanswered);
      }
      
      if (sessionData.isTimedInterview && sessionData.startTime) {
        setStartTime(sessionData.startTime);
        const elapsed = Math.floor((Date.now() - new Date(sessionData.startTime).getTime()) / 1000);
        const totalSecs = (sessionData.duration || 30) * 60;
        const remaining = Math.max(0, totalSecs - elapsed);
        setTimeLeft(remaining);
      }
    } catch (error) {
      console.error("Failed to restore session", error);
      showToast("error", "Failed to restore interview session");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam) {
      setRole(roleParam);
    }
    
    const sessionIdParam = searchParams.get("session");
    if (sessionIdParam && sessionIdParam !== sessionId) {
      restoreSession(sessionIdParam);
    }
  }, [searchParams, sessionId, restoreSession]);

  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    setQuestions([]);
    setAnswers({});
    setResults({});
    setSessionId("");
    setTimeLeft(0);
    setStartTime(null);
    setSubmitting(false);
    setCurrentQuestionIndex(0);
  }, [level]);

  useEffect(() => {
    if (!isTimedInterview || !startTime || !duration) return;

    const calculateRemaining = () => {
      const startMs = typeof startTime === "number" ? startTime : new Date(startTime).getTime();
      const endMs = startMs + duration * 60 * 1000;
      const remainingSecs = Math.max(0, Math.floor((endMs - Date.now()) / 1000));
      setTimeLeft(remainingSecs);
      return remainingSecs;
    };

    calculateRemaining();
    const timer = setInterval(() => {
      const rem = calculateRemaining();
      if (rem <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimedInterview, startTime, duration]);

  useEffect(() => {
    if (!sessionId) return;
    localStorage.setItem(
      `interview:draft:${sessionId}`,
      JSON.stringify(answers)
    );
  }, [answers, sessionId]);

  const submitInterview = useCallback(async (submissionSource = "manual") => {
    if (submitting) return;

    if (questions.length === 0) {
      showToast("error", "Generate questions first");
      return;
    }

    if (!sessionId) {
      showToast("error", "Please generate questions again");
      return;
    }

    try {
      setSubmitting(true);

      const resultEntries = await Promise.all(
        questions.map(async (question, i) => {
          try {
            const res = await API.post(
              "/result/evaluate",
              {
                sessionId,
                role,
                level,
                question,
                answer: answers[i] ?? "",
                submissionSource
              }
            );

            const evalData = res.data?.data || res.data || {};
            return [i, { ...evalData, answer: evalData.answer || answers[i] || "" }];
          } catch (error) {
            console.error(`Question ${i + 1} failed`, error);

            return [
              i,
              {
                attemptStatus:
                  answers[i]?.trim()
                    ? "Attempted"
                    : "Not Attempted",
                status: "Evaluation Failed",
                score: 0,
                feedback:
                  answers[i]?.trim()
                    ? "Evaluation failed. Please review your answer."
                    : "No answer provided.",
                correctAnswer:
                  answers[i]?.trim()
                    ? "Unable to generate ideal answer."
                    : "",
                confidenceLevel: "",
                knowledgeLevel: "",
                priorityLevel: "",
                performanceLevel: "",
                topicCategory: "",
                strengths: [],
                weaknesses:
                  answers[i]?.trim()
                    ? [
                        "Evaluation service failed.",
                        "Answer could not be analyzed."
                      ]
                    : [
                        "Question was skipped.",
                        "Concept understanding cannot be assessed."
                      ],
                mistakes: [],
                suggestions: [
                  "Try submitting again.",
                  "Review the topic."
                ]
              }
            ];
          }
        })
      );

      const newResults = Object.fromEntries(resultEntries);
      setResults(newResults);

      localStorage.removeItem(`interview:draft:${sessionId}`);
      setAnswers({});
      setTimeLeft(0);
      setIsTimedInterview(false);

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

      showToast(
        "success",
        submissionSource === "auto"
          ? "Time's up! Interview auto-submitted."
          : "Interview Submitted Successfully"
      );
    } catch (error) {
      console.error("Submit Error:", error);
      showToast("error", error?.response?.data?.message || "Submission Failed");
    } finally {
      setSubmitting(false);
    }
  }, [submitting, questions, sessionId, answers, role, level, showToast]);

  useEffect(() => {
    if (
      isTimedInterview &&
      timeLeft === 0 &&
      questions.length > 0
    ) {
      submitInterview("auto");
    }
  }, [timeLeft, isTimedInterview, questions, submitInterview]);

  const generateQuestions = async () => {
    if (!role.trim() || !level) {
      showToast("error", "Select Role and Level");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post(
        "/interview/generate",
        {
          role: role.trim(),
          level,
          isTimedInterview,
          duration
        }
      );

      const payload = res.data?.data || res.data;
      setSessionId(payload.sessionId || "");
      const generatedQuestions = Array.isArray(payload.questions) ? payload.questions : [];
      setQuestions(generatedQuestions);
      setResults({});
      setCurrentQuestionIndex(0);

      const savedDraft = localStorage.getItem(
        `interview:draft:${payload.sessionId}`
      );

      if (savedDraft) {
        try {
          setAnswers(JSON.parse(savedDraft));
        } catch {
          setAnswers({});
        }
      } else {
        setAnswers({});
      }

      if (isTimedInterview) {
        setStartTime(Date.now());
        setTimeLeft(duration * 60);
      } else {
        setStartTime(null);
      }

      setSearchParams(prev => {
        prev.set("session", payload.sessionId);
        return prev;
      });

      showToast("success", "Questions generated successfully");
    } catch (error) {
      console.error(error);
      showToast("error", error?.response?.data?.message || "Question generation failed");
    } finally {
      setLoading(false);
    }
  };

  const startNewInterview = () => {
    if (sessionId) {
      localStorage.removeItem(`interview:draft:${sessionId}`);
    }
    setQuestions([]);
    setAnswers({});
    setResults({});
    setSessionId("");
    setTimeLeft(0);
    setIsTimedInterview(false);
    setDuration(30);
    setSubmitting(false);
    setLoading(false);
    setCurrentQuestionIndex(0);
    
    setSearchParams(prev => {
      prev.delete("session");
      return prev;
    });
  };

  const step = hasResults ? "RESULTS" : questionsGenerated ? "ACTIVE" : "SETUP";

  return {
    step,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    role,
    setRole,
    level,
    setLevel,
    questions,
    answers,
    setAnswers,
    results,
    loading,
    submitting,
    isTimedInterview,
    setIsTimedInterview,
    duration,
    setDuration,
    timeLeft,
    toast,
    hasResults,
    questionsGenerated,
    generateQuestions,
    submitInterview,
    startNewInterview,
    sessionId
  };
}
