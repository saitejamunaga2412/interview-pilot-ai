import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

export function useCodingData() {
  const [problems, setProblems] = useState([]);
  const [activeProblem, setActiveProblem] = useState(null);
  const [code, setCode] = useState("// Write your code here");
  
  // Execution states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  
  // Setup states
  const [loadingProblems, setLoadingProblems] = useState(true);
  
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Toast equivalent using a simple state (can be hooked up to our ToastProvider via useEffect in container)
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = useCallback((type, message) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ type, message });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Fetch all problems on mount
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoadingProblems(true);
        const res = await API.get("/coding/problems");
        const problemsData = res.data?.data;
        setProblems(Array.isArray(problemsData) ? problemsData : []);
      } catch (error) {
        console.error("Failed to load problems", error);
        showToast("error", "Failed to load coding problems.");
      } finally {
        setLoadingProblems(false);
      }
    };
    fetchProblems();
  }, [showToast]);

  // Load specific problem if URL has param
  const loadProblem = useCallback(async (problemId) => {
    try {
      setLoading(true);
      const res = await API.get(`/coding/problems/${problemId}`);
      const problemData = res.data?.data;
      setActiveProblem(problemData || null);
      setResult(null); // Clear previous results

      // Restore saved code from local storage
      const savedCode = localStorage.getItem(`coding:draft:${problemId}`);
      if (savedCode) {
        setCode(savedCode);
      } else if (problemData?.boilerplate) {
         setCode(problemData.boilerplate);
      } else {
         setCode("// Write your code here");
      }
    } catch (error) {
      console.error("Failed to load problem", error);
      showToast("error", "Problem not found.");
    } finally {
      setLoading(false);
    }
  }, [setSearchParams, showToast]);

  // Check URL params on mount
  useEffect(() => {
    const problemId = id || searchParams.get("problem");
    if (problemId && (!activeProblem || activeProblem._id !== problemId)) {
      loadProblem(problemId);
    }
  }, [id, searchParams, loadProblem, activeProblem]);

  // Auto-save code
  useEffect(() => {
    if (activeProblem && code) {
      localStorage.setItem(`coding:draft:${activeProblem._id}`, code);
    }
  }, [code, activeProblem]);

  const handleSeed = async () => {
    try {
      await API.post("/coding/seed");
      window.location.reload();
    } catch (e) {
      console.error(e);
      showToast("error", "Seeding failed.");
    }
  };

  const handleRunCode = async () => {
    if (!code.trim() || !activeProblem) return;
    try {
      setSubmitting(true);
      const res = await API.post("/coding/submit", {
        problemId: activeProblem._id,
        code,
        languageId: 63 // Fixed to JS for now
      });
      // The backend returns AI feedback directly on submit.
      // We store it in result.
      setResult(res.data?.data?.submission || null);
      showToast("success", "Code executed successfully.");
    } catch (error) {
      console.error(error);
      showToast("error", "Failed to execute code.");
    } finally {
      setSubmitting(false);
    }
  };

  const startNewProblem = () => {
    setActiveProblem(null);
    setResult(null);
    setCode("// Write your code here");
    navigate('/arena');
  };

  // Determine current step based on state
  // Steps: SETUP -> WORKSPACE -> RESULTS
  const viewResults = searchParams.get("view") === "results";
  
  let step = "SETUP";
  if (activeProblem && viewResults && result) {
    step = "RESULTS";
  } else if (activeProblem) {
    step = "WORKSPACE";
  }

  const navigateToResults = () => {
    if (result) {
      setSearchParams(prev => {
        prev.set("view", "results");
        return prev;
      });
    } else {
      showToast("error", "Run and submit code first to view analysis.");
    }
  };
  
  const navigateToWorkspace = () => {
    setSearchParams(prev => {
      prev.delete("view");
      return prev;
    });
  };

  return {
    step,
    problems,
    loadingProblems,
    activeProblem,
    loadProblem,
    code,
    setCode,
    loading,
    submitting,
    result,
    handleRunCode,
    startNewProblem,
    handleSeed,
    toast,
    navigateToResults,
    navigateToWorkspace
  };
}
