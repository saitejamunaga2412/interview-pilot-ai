import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calculator, Code2, Bot, Compass, Play, 
  CheckCircle2, Sparkles, AlertCircle, ArrowRight, 
  Terminal, ShieldCheck, Target, RefreshCw, Lightbulb, BookOpen, Eye, HelpCircle
} from "lucide-react";

export default function LandingInteractiveStudio() {
  const [activeTab, setActiveTab] = useState("aptitude");
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [codeExecuted, setCodeExecuted] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedRole, setSelectedRole] = useState("swe");

  const runCodeSimulation = () => {
    setIsRunningCode(true);
    setCodeExecuted(false);
    setTimeout(() => {
      setIsRunningCode(false);
      setCodeExecuted(true);
    }, 600);
  };

  const codeSnippets = {
    python: `def maxSubArray(nums: list[int]) -> int:
    # Kadane's Algorithm
    max_so_far = nums[0]
    curr_max = nums[0]
    for x in nums[1:]:
        curr_max = max(x, curr_max + x)
        max_so_far = max(max_so_far, curr_max)
    return max_so_far

# Test Execution
print(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])) # Output: 6`,
    cpp: `#include <vector>
#include <algorithm>
#include <iostream>

int maxSubArray(const std::vector<int>& nums) {
    int max_so_far = nums[0], curr_max = nums[0];
    for (size_t i = 1; i < nums.size(); ++i) {
        curr_max = std::max(nums[i], curr_max + nums[i]);
        max_so_far = std::max(max_so_far, curr_max);
    }
    return max_so_far;
}`,
    java: `class Solution {
    public int maxSubArray(int[] nums) {
        int maxSoFar = nums[0], currMax = nums[0];
        for (int i = 1; i < nums.length; i++) {
            currMax = Math.max(nums[i], currMax + nums[i]);
            maxSoFar = Math.max(maxSoFar, currMax);
        }
        return maxSoFar;
    }
}`,
    javascript: `function maxSubArray(nums) {
    let maxSoFar = nums[0], currMax = nums[0];
    for (let i = 1; i < nums.length; i++) {
        currMax = Math.max(nums[i], currMax + nums[i]);
        maxSoFar = Math.max(maxSoFar, currMax);
    }
    return maxSoFar;
}`
  };

  return (
    <section id="interactive-studio" className="py-24 bg-bg-base relative overflow-hidden">
      
      {/* Background Subtle Gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[450px] bg-primary-600/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-2 border border-border text-xs font-mono text-primary-400 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Product Sandbox</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary mb-4">
            Test Drive the Platform.
          </h2>
          <p className="text-text-secondary text-base sm:text-lg">
            Interact with real preview interfaces for our 4 core preparation modules. 
            Experience how InterviewPilot AI guides your daily practice.
          </p>
        </div>

        {/* ── Studio Tab Switcher ── */}
        <div className="flex items-center justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-2xl bg-surface-2 border border-border gap-1 overflow-x-auto max-w-full">
            {[
              { id: "aptitude", label: "Aptitude & Logic", icon: Calculator },
              { id: "coding", label: "Algorithmic Arena", icon: Code2 },
              { id: "interview", label: "AI Mock Studio", icon: Bot },
              { id: "career", label: "Career Radar", icon: Compass },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-surface text-text-primary shadow-sm border border-border"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-transparent"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-primary-400" : "text-text-muted"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Interactive Preview Frame ── */}
        <div className="max-w-5xl mx-auto rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden">
          
          {/* Header Bar */}
          <div className="px-5 py-3 border-b border-border bg-surface-2/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-bold text-text-primary uppercase tracking-wider">
                LIVE SANDBOX PREVIEW
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-500/10 text-primary-400 border border-primary-500/20 font-bold">
              [INTERACTIVE DEMO — CONTROLLED PREVIEW STATE]
            </span>
          </div>

          <div className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              
              {/* TAB 1: APTITUDE & LOGIC */}
              {activeTab === "aptitude" && (
                <motion.div
                  key="aptitude-tab"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-border/80">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono font-semibold border border-cyan-500/20">
                        Quantitative Aptitude
                      </span>
                      <span className="text-xs text-text-muted font-mono">Topic: Speed, Time & Distance</span>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-medium">Difficulty: Medium</span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-text-primary mb-4">
                      A train 240 m long crosses a platform of equal length in 24 seconds. What is the speed of the train in km/h?
                    </h3>

                    {/* Multiple Choice Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      {[
                        { id: "A", text: "60 km/h", correct: false },
                        { id: "B", text: "72 km/h", correct: true },
                        { id: "C", text: "80 km/h", correct: false },
                        { id: "D", text: "90 km/h", correct: false },
                      ].map((opt) => {
                        const isSelected = selectedAnswer === opt.id;
                        const isRevealedAnswer = showAnswer && opt.correct;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => setSelectedAnswer(opt.id)}
                            className={`p-3.5 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                              isRevealedAnswer
                                ? "bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-md ring-2 ring-emerald-500/30"
                                : isSelected
                                  ? opt.correct
                                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                                    : "bg-rose-500/10 border-rose-500 text-rose-400"
                                  : "bg-surface-2 border-border/80 text-text-secondary hover:border-border-strong hover:text-text-primary"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className={`w-6 h-6 rounded-lg border flex items-center justify-center font-mono font-bold text-xs ${
                                isRevealedAnswer
                                  ? "bg-emerald-500 text-white border-emerald-400"
                                  : "bg-surface border-border text-text-primary"
                              }`}>
                                {opt.id}
                              </span>
                              <span className={isRevealedAnswer ? "font-bold text-text-primary" : ""}>{opt.text}</span>
                            </div>
                            {isRevealedAnswer && (
                              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                                ✓ Correct Option
                              </span>
                            )}
                            {!isRevealedAnswer && isSelected && (
                              <span className="text-[11px] font-mono font-bold">
                                {opt.correct ? "✓ Correct" : "✗ Try Again"}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Interactive AI Actions Bar: Hint | Explanation | Show Answer */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 p-2 bg-surface-2 rounded-2xl border border-border mb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* 1. HINT BUTTON */}
                        <button
                          type="button"
                          onClick={() => setShowHint(prev => !prev)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                            showHint
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
                              : "bg-surface text-text-secondary hover:text-amber-400 hover:bg-amber-500/10 border-border"
                          }`}
                        >
                          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                          <span>{showHint ? "Hide Hint" : "Get Hint"}</span>
                        </button>

                        {/* 2. EXPLANATION BUTTON */}
                        <button
                          type="button"
                          onClick={() => setShowExplanation(prev => !prev)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                            showExplanation
                              ? "bg-primary-500/20 text-primary-300 border-primary-500/40 shadow-sm"
                              : "bg-surface text-text-secondary hover:text-primary-300 hover:bg-primary-500/10 border-border"
                          }`}
                        >
                          <Bot className="w-3.5 h-3.5 text-primary-400" />
                          <span>{showExplanation ? "Hide Explanation" : "Explain Step-by-Step"}</span>
                        </button>

                        {/* 3. SHOW ANSWER BUTTON */}
                        <button
                          type="button"
                          onClick={() => {
                            setShowAnswer(prev => !prev);
                            if (!showAnswer) {
                              setSelectedAnswer("B");
                            }
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                            showAnswer
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm"
                              : "bg-surface text-text-secondary hover:text-emerald-400 hover:bg-emerald-500/10 border-border"
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{showAnswer ? "Hide Answer" : "Show Answer"}</span>
                        </button>
                      </div>

                      {/* Reset Button */}
                      {(selectedAnswer || showHint || showExplanation || showAnswer) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAnswer(null);
                            setShowHint(false);
                            setShowExplanation(false);
                            setShowAnswer(false);
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-mono text-text-muted hover:text-text-primary hover:bg-surface flex items-center gap-1 cursor-pointer transition-colors"
                          title="Reset question sandbox"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Reset</span>
                        </button>
                      )}
                    </div>

                    {/* Dynamic Expandable Sections based on User Click */}
                    <div className="space-y-3">
                      {/* PANEL 1: HINT */}
                      {showHint && (
                        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-1.5 animate-fade-in text-left">
                          <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                            <span className="flex items-center gap-1.5">
                              <Lightbulb className="w-3.5 h-3.5" /> AI Progressive Hint
                            </span>
                            <button onClick={() => setShowHint(false)} className="text-text-muted hover:text-text-primary text-xs cursor-pointer">✕</button>
                          </div>
                          <p className="text-xs text-amber-200 leading-relaxed font-medium">
                            💡 <strong>Key Formula:</strong> Total Distance = Length of Train + Length of Platform.
                            Once you calculate the speed in m/s (Distance / Time), convert to km/h by multiplying with <strong>(18 / 5)</strong>.
                          </p>
                        </div>
                      )}

                      {/* PANEL 2: EXPLANATION */}
                      {showExplanation && (
                        <div className="p-4 rounded-xl border border-primary-500/30 bg-primary-500/10 space-y-2.5 animate-fade-in text-left">
                          <div className="flex items-center justify-between text-xs font-mono font-bold text-primary-300 uppercase tracking-wider">
                            <span className="flex items-center gap-1.5">
                              <Bot className="w-4 h-4 text-primary-400" /> AI Step-by-Step Explanation
                            </span>
                            <button onClick={() => setShowExplanation(false)} className="text-text-muted hover:text-text-primary text-xs cursor-pointer">✕</button>
                          </div>
                          <div className="text-xs text-text-secondary space-y-1.5 font-mono">
                            <p><strong className="text-text-primary">Step 1:</strong> Total Distance = Train Length + Platform Length = 240 m + 240 m = <span className="text-primary-300 font-bold">480 m</span></p>
                            <p><strong className="text-text-primary">Step 2:</strong> Speed (in m/s) = Total Distance / Time = 480 m / 24 s = <span className="text-primary-300 font-bold">20 m/s</span></p>
                            <p><strong className="text-text-primary">Step 3:</strong> Convert to km/h = 20 × (18 / 5) = 4 × 18 = <span className="text-emerald-400 font-bold">72 km/h</span></p>
                            <p className="text-text-muted pt-1">Result: The train's calculated speed is 72 km/h (Option B).</p>
                          </div>
                        </div>
                      )}

                      {/* PANEL 3: ANSWER */}
                      {showAnswer && (
                        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-1.5 animate-fade-in text-left">
                          <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" /> Correct Answer Revealed
                            </span>
                            <button onClick={() => setShowAnswer(false)} className="text-text-muted hover:text-text-primary text-xs cursor-pointer">✕</button>
                          </div>
                          <p className="text-xs text-emerald-200 leading-relaxed font-semibold">
                            Correct Option: <strong className="text-white font-mono text-sm bg-emerald-500/25 px-2.5 py-0.5 rounded border border-emerald-500/30">Option B — 72 km/h</strong>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: CODING ARENA */}
              {activeTab === "coding" && (
                <motion.div
                  key="coding-tab"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Editor Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/80">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-primary">Problem: Maximum Subarray</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold">
                        Easy / Kadane's
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Language Switcher */}
                      <div className="flex rounded-lg bg-surface-2 p-0.5 border border-border text-[11px] font-mono">
                        {["python", "cpp", "java", "javascript"].map((lang) => (
                          <button
                            key={lang}
                            onClick={() => setSelectedLanguage(lang)}
                            className={`px-2.5 py-1 rounded-md transition-colors ${
                              selectedLanguage === lang
                                ? "bg-primary-600 text-white font-bold"
                                : "text-text-muted hover:text-text-primary"
                            }`}
                          >
                            {lang.toUpperCase()}
                          </button>
                        ))}
                      </div>

                      {/* Run Simulation Button */}
                      <button
                        onClick={runCodeSimulation}
                        disabled={isRunningCode}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        {isRunningCode ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Executing...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            <span>Run Sandbox</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Monaco-Style Code Block */}
                  <div className="rounded-xl border border-border bg-[#0a0f1e] p-4 font-mono text-xs text-slate-200 overflow-x-auto shadow-inner">
                    <pre className="leading-relaxed whitespace-pre-wrap">
                      {codeSnippets[selectedLanguage]}
                    </pre>
                  </div>

                  {/* Execution Output Console */}
                  {codeExecuted && (
                    <div className="p-3.5 rounded-xl border border-border/80 bg-surface-2 font-mono text-xs flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>All 3 Test Cases Passed</span>
                      </div>
                      <span className="text-text-muted text-[11px]">
                        Judge0 Runtime: 0.038s · Time Complexity: O(N) · Space Complexity: O(1)
                      </span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 3: AI MOCK INTERVIEW */}
              {activeTab === "interview" && (
                <motion.div
                  key="interview-tab"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Interview Chat Simulation */}
                  <div className="space-y-4">
                    {/* AI Message */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="p-4 rounded-2xl bg-surface-2 border border-border max-w-xl text-xs sm:text-sm text-text-primary space-y-1">
                        <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase block">
                          AI Interviewer · Question 03
                        </span>
                        <p>
                          "Can you explain the trade-offs between an SQL relational database and a NoSQL document database when designing a high-throughput notification system?"
                        </p>
                      </div>
                    </div>

                    {/* Candidate Response Preview */}
                    <div className="flex items-start justify-end gap-3">
                      <div className="p-4 rounded-2xl bg-primary-600/10 border border-primary-500/30 max-w-xl text-xs sm:text-sm text-text-primary space-y-1 text-right">
                        <span className="text-[10px] font-mono text-primary-400 font-bold uppercase block">
                          Candidate Audio Transcript Preview
                        </span>
                        <p>
                          "For high-throughput notifications where schema flexibility and rapid write speeds matter, a NoSQL store like MongoDB handles horizontal scaling with sharding. SQL provides strict ACID compliance for payment notifications, but requires read-replicas for scale..."
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Multi-Axis Rubric Feedback */}
                  <div className="p-4 rounded-xl border border-border/90 bg-surface-2/70 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-text-primary">AI Evaluation Matrix</span>
                      <span className="text-emerald-400 font-bold">Overall Round Score: 8.2 / 10</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-surface border border-border">
                        <span className="text-text-muted text-[11px] block">Technical Depth</span>
                        <span className="text-sm font-bold text-text-primary">8.5 / 10</span>
                        <p className="text-[10px] text-text-secondary mt-1">Accurately contrasted ACID vs horizontal partitioning.</p>
                      </div>
                      <div className="p-3 rounded-lg bg-surface border border-border">
                        <span className="text-text-muted text-[11px] block">Communication</span>
                        <span className="text-sm font-bold text-text-primary">8.0 / 10</span>
                        <p className="text-[10px] text-text-secondary mt-1">Structured trade-off explanation with real system examples.</p>
                      </div>
                      <div className="p-3 rounded-lg bg-surface border border-border">
                        <span className="text-text-muted text-[11px] block">Follow-Up Readiness</span>
                        <span className="text-sm font-bold text-text-primary">8.2 / 10</span>
                        <p className="text-[10px] text-text-secondary mt-1">Ready for message queue (Kafka) architecture follow-up.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: CAREER RADAR */}
              {activeTab === "career" && (
                <motion.div
                  key="career-tab"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/80">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary-400" />
                      <span className="text-xs font-bold text-text-primary">Select Target Role Calibration:</span>
                    </div>

                    <div className="flex gap-1.5">
                      {[
                        { id: "swe", label: "Software Engineer (SDE)" },
                        { id: "fullstack", label: "Full Stack Developer" },
                        { id: "data", label: "Data Engineer" },
                      ].map((r) => (
                        <button
                          key={r.id}
                          onClick={() => setSelectedRole(r.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            selectedRole === r.id
                              ? "bg-primary-600 text-white font-bold"
                              : "bg-surface-2 text-text-secondary hover:text-text-primary border border-border"
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Skill Gap Analysis Matrix */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-border bg-surface-2/60 space-y-3">
                      <span className="text-xs font-bold text-text-primary block">Demonstration Skill Mastery</span>
                      <div className="space-y-2 text-xs">
                        {[
                          { skill: "Data Structures & Algorithms", status: "Mastered", color: "text-emerald-400" },
                          { skill: "System Design & Architecture", status: "In Progress", color: "text-amber-400" },
                          { skill: "Database Management (SQL)", status: "Mastered", color: "text-emerald-400" },
                          { skill: "Concurrency & OS Threads", status: "Needs Practice", color: "text-rose-400" },
                        ].map((s) => (
                          <div key={s.skill} className="flex justify-between items-center py-1 border-b border-border/50">
                            <span className="text-text-secondary">{s.skill}</span>
                            <span className={`font-mono font-bold text-[11px] ${s.color}`}>{s.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-primary-500/25 bg-primary-500/5 space-y-3 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-text-primary block mb-1">Recommended Next Best Action</span>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          Your diagnostic analysis indicates <strong className="text-text-primary">Concurrency & OS Deadlocks</strong> is your primary gap for the SDE benchmark.
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-surface border border-border text-xs flex items-center justify-between">
                        <span className="font-medium text-text-primary">Target: OS Concurrency Lesson</span>
                        <span className="text-primary-400 font-bold">15 min queue →</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>

      </div>

    </section>
  );
}
