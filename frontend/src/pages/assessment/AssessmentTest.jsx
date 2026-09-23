import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useToast } from '../../components/ui/Toast';

import QuestionRenderer from '../../components/assessment/QuestionRenderer';

const AssessmentTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // State for answers mapping questionId -> answer
  const [answers, setAnswers] = useState({});
  const [reviewFlags, setReviewFlags] = useState({});
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(null); // in seconds
  
  const { addToast } = useToast();

  useEffect(() => {
    fetchAttempt();
  }, [id]);

  const fetchAttempt = async () => {
    try {
      const response = await API.get(`/assessments/attempt/${id}`);
      const att = response.data?.data || response.data;
      setAttempt(att);
      
      if (att.status === 'Evaluated' || att.status === 'Submitted') {
        navigate(`/assessment/result/${id}`);
      }

      // Initialize answers from attempt or local storage
      const savedAnswers = JSON.parse(localStorage.getItem(`assessment_${id}_answers`)) || att.answers || {};
      setAnswers(savedAnswers);
      
      const savedFlags = JSON.parse(localStorage.getItem(`assessment_${id}_flags`)) || {};
      setReviewFlags(savedFlags);

      setTimeLeft(1800);

    } catch (err) {
      console.error(err);
      addToast('Failed to load assessment', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Timer Tick
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) {
      if (timeLeft === 0 && !loading) submitAssessment();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading]);

  // Backend Auto-Save Function
  const saveToBackend = async (silent = true) => {
    try {
       await API.post(`/assessments/attempt/${id}/autosave`, { answers, reviewFlags });
       if (!silent) addToast('Progress saved', 'success');
    } catch (e) {
       console.error("Autosave failed", e);
    }
  };

  // Backend Auto-Save Interval (every 60s)
  useEffect(() => {
    if (loading || !attempt) return;
    const interval = setInterval(() => {
      saveToBackend(true);
    }, 60000);
    return () => clearInterval(interval);
  }, [loading, attempt, answers, reviewFlags]);

  // Auto Save to LocalStorage (runs instantly on answer change)
  useEffect(() => {
    if (!loading && attempt) {
      localStorage.setItem(`assessment_${id}_answers`, JSON.stringify(answers));
      localStorage.setItem(`assessment_${id}_flags`, JSON.stringify(reviewFlags));
    }
  }, [answers, reviewFlags, loading, attempt, id]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const toggleReviewFlag = (questionId) => {
    setReviewFlags(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const submitAssessment = async () => {
    if (!window.confirm("Are you sure you want to submit? You cannot change answers after submitting.")) return;
    try {
      const payload = {
        attemptId: id,
        answers: answers,
        durationSeconds: 1800 - timeLeft
      };

      await API.post('/assessments/submit', payload);
      
      // Clear local storage
      localStorage.removeItem(`assessment_${id}_answers`);
      localStorage.removeItem(`assessment_${id}_flags`);
      
      addToast('Assessment submitted successfully!', 'success');
      navigate(`/assessment/result/${id}`);
    } catch (err) {
      console.error(err);
      addToast('Failed to submit assessment', 'error');
    }
  };

  if (loading || !attempt) return <div className="p-8">Loading test...</div>;

  const currentSection = attempt.sections[currentSectionIndex];
  const currentQuestion = currentSection.questions[currentQuestionIndex]?.questionId;

  if (!currentQuestion) return <div>Question not found</div>;

  return (
    <div className="min-h-screen bg-bg-base flex flex-col">
      <header className="bg-bg-card border-b border-border-color p-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold">Assessment Test</h1>
          <p className="text-sm text-text-muted">Section {currentSectionIndex + 1}</p>
        </div>
        <div className="flex items-center gap-6">
           <div className="text-lg font-mono font-bold text-accent">
             {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
           </div>
           <button 
             onClick={submitAssessment}
             className="bg-red-500 text-white px-4 py-2 rounded font-medium hover:bg-red-600 transition-colors"
           >
             Finish & Submit
           </button>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full p-4 gap-6">
        {/* Main Content */}
        <div className="flex-1 bg-bg-card rounded-lg border border-border-color p-8 shadow-sm flex flex-col">
          <div className="mb-6 flex justify-between items-center">
            <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
              Question {currentQuestionIndex + 1} of {currentSection.questions.length}
            </span>
            <span className="text-sm text-text-muted">Type: {currentQuestion.type}</span>
          </div>

          <div className="prose prose-invert max-w-none mb-8">
            <h2 className="text-xl font-medium mb-4">{currentQuestion.questionText}</h2>
          </div>

          {/* Answer Input based on type */}
          <div className="flex-1 flex flex-col justify-center">
             <QuestionRenderer 
               question={currentQuestion}
               answer={answers[currentQuestion._id]}
               onAnswerChange={(val) => handleAnswerChange(currentQuestion._id, val)}
             />
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-border-color">
            <button
              onClick={() => {
                setCurrentQuestionIndex(prev => prev - 1);
                saveToBackend(true);
              }}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-2 rounded border border-border-color disabled:opacity-50 hover:bg-bg-base transition-colors"
            >
              Previous
            </button>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-text-secondary hover:text-text-primary">
              <input 
                type="checkbox" 
                checked={!!reviewFlags[currentQuestion._id]}
                onChange={() => toggleReviewFlag(currentQuestion._id)}
                className="rounded border-border-color text-warning-500 focus:ring-warning-500 bg-bg-base"
              />
              Mark for Review
            </label>
            <button
              onClick={() => {
                setCurrentQuestionIndex(prev => prev + 1);
                saveToBackend(true);
              }}
              disabled={currentQuestionIndex === currentSection.questions.length - 1}
              className="bg-primary text-white px-6 py-2 rounded font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              Next
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 space-y-6">
          <div className="bg-bg-card p-6 rounded-lg border border-border-color shadow-sm">
            <h3 className="font-semibold mb-4 text-lg">Question Navigator</h3>
            <div className="grid grid-cols-5 gap-2">
              {currentSection.questions.map((q, idx) => {
                const qId = q.questionId._id;
                const isAnswered = !!answers[qId];
                const isReview = !!reviewFlags[qId];
                const isActive = currentQuestionIndex === idx;
                
                let btnClass = 'bg-bg-base border border-border-color text-text-muted hover:border-text-muted';
                if (isActive) btnClass = 'border-2 border-primary bg-bg-base text-primary';
                else if (isReview) btnClass = 'bg-warning-500/20 border-warning-500 text-warning-500';
                else if (isAnswered) btnClass = 'bg-primary/20 text-primary border border-transparent';

                return (
                  <button
                    key={qId}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`h-10 rounded text-sm font-medium transition-colors ${btnClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentTest;
