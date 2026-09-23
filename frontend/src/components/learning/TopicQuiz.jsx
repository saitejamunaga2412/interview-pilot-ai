import React, { useState } from "react";
import api from "../../services/api";

export default function TopicQuiz({ topic, progress, onQuizComplete }) {
  const [answers, setAnswers] = useState(new Array(topic.quiz.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSelectOption = (qIndex, oIndex) => {
    if (submitted) return;
    const newAnswers = [...answers];
    newAnswers[qIndex] = oIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (answers.includes(null)) {
      alert("Please answer all questions before submitting.");
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await api.post("/learning/quiz", {
        topicId: topic.topicId,
        answers
      });
      setResults(response.data.data.results);
      setScore(response.data.data.score);
      setSubmitted(true);
      if (onQuizComplete) {
        onQuizComplete(response.data.data.progress);
      }
    } catch (error) {
      console.error("Quiz submission failed", error);
      alert("Failed to submit quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mt-8">
      <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Knowledge Check</h3>
      
      {progress?.quizCompleted && !submitted && (
        <div className="mb-6 p-4 bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-200 rounded-xl">
          You have already passed this quiz with a score of {progress.quizScore}%! You can retake it below.
        </div>
      )}

      <div className="space-y-8">
        {topic.quiz.map((q, qIndex) => (
          <div key={qIndex} className="space-y-4">
            <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">
              {qIndex + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, oIndex) => {
                let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-colors ";
                
                if (!submitted) {
                  btnClass += answers[qIndex] === oIndex 
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-gray-800";
                } else {
                  const isCorrectAnswer = results[qIndex].correctOptionIndex === oIndex;
                  const isUserAnswer = answers[qIndex] === oIndex;
                  
                  if (isCorrectAnswer) {
                    btnClass += "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300";
                  } else if (isUserAnswer) {
                    btnClass += "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";
                  } else {
                    btnClass += "border-gray-200 dark:border-gray-700 opacity-50";
                  }
                }

                return (
                  <button
                    key={oIndex}
                    disabled={submitted}
                    onClick={() => handleSelectOption(qIndex, oIndex)}
                    className={btnClass}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            
            {submitted && results && (
              <div className={`p-4 rounded-xl mt-2 ${results[qIndex].isCorrect ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200'}`}>
                <p className="font-medium">{results[qIndex].isCorrect ? "Correct!" : "Incorrect"}</p>
                <p className="mt-1 text-sm">{results[qIndex].explanation}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-70"
        >
          {submitting ? "Evaluating..." : "Submit Answers"}
        </button>
      ) : (
        <div className="mt-8 text-center p-6 bg-gray-50 dark:bg-gray-900 rounded-xl">
          <h4 className="text-2xl font-bold mb-2">Your Score: {score}%</h4>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {score >= 70 ? "Great job! You passed the quiz." : "Keep studying and try again."}
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setAnswers(new Array(topic.quiz.length).fill(null));
              setResults(null);
            }}
            className="px-6 py-2 border-2 border-blue-600 text-blue-600 dark:text-blue-400 font-semibold rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            Retake Quiz
          </button>
        </div>
      )}
    </div>
  );
}
