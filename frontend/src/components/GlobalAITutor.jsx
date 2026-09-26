import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, X, Send, Sparkles, Copy, Check, RotateCcw, Minus, RefreshCw
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import { cn } from "../utils/cn";
import AIMessageRenderer from "./learning/AIMessageRenderer";

export default function GlobalAITutor() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [lastFailedMsg, setLastFailedMsg] = useState(null);
  
  const location = useLocation();
  const { user } = useAuth();
  const endRef = useRef(null);
  const pollRef = useRef(null);

  const userName = user?.name ? user.name.split(" ")[0] : "there";

  const handleCancel = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setLoading(false);
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "Request cancelled." }
    ]);
  };

  const getContextDetails = () => {
    const path = location.pathname;

    if (path.startsWith("/learning")) {
      return {
        roleTitle: "InterviewPilot AI",
        roleSubtitle: "AI Study & Interview Assistant",
        mode: "teacher",
        contextTag: "Learning Platform",
        topicId: "CS Curriculum",
        welcomeMsg: "Want me to explain this topic?",
        suggestions: [
          "Coding",
          "Aptitude",
          "AI Interview",
          "Resume",
          "Study Plan"
        ]
      };
    }

    if (path.startsWith("/aptitude") || path.startsWith("/reasoning")) {
      return {
        roleTitle: "InterviewPilot AI",
        roleSubtitle: "AI Study & Interview Assistant",
        mode: "aptitude_coach",
        contextTag: "Aptitude & Logic",
        topicId: "Aptitude Assessment",
        welcomeMsg: "Want a hint for this question?",
        suggestions: [
          "Coding",
          "Aptitude",
          "AI Interview",
          "Resume",
          "Study Plan"
        ]
      };
    }

    if (path.startsWith("/arena")) {
      return {
        roleTitle: "InterviewPilot AI",
        roleSubtitle: "AI Study & Interview Assistant",
        mode: "coding_coach",
        contextTag: "Coding Arena",
        topicId: "Algorithm Arena",
        welcomeMsg: "Need help with this problem?",
        suggestions: [
          "Coding",
          "Aptitude",
          "AI Interview",
          "Resume",
          "Study Plan"
        ]
      };
    }

    if (path.startsWith("/interview")) {
      return {
        roleTitle: "InterviewPilot AI",
        roleSubtitle: "AI Study & Interview Assistant",
        mode: "interview_coach",
        contextTag: "Mock Interview",
        topicId: "Interview Studio",
        welcomeMsg: "Want feedback on your interview answer?",
        suggestions: [
          "Coding",
          "Aptitude",
          "AI Interview",
          "Resume",
          "Study Plan"
        ]
      };
    }

    if (path.startsWith("/resume")) {
      return {
        roleTitle: "InterviewPilot AI",
        roleSubtitle: "AI Study & Interview Assistant",
        mode: "career_advisor",
        contextTag: "Resume ATS",
        topicId: "Resume & ATS",
        welcomeMsg: "Want me to explain this ATS issue?",
        suggestions: [
          "Coding",
          "Aptitude",
          "AI Interview",
          "Resume",
          "Study Plan"
        ]
      };
    }

    if (path.startsWith("/profile")) {
      return {
        roleTitle: "InterviewPilot AI",
        roleSubtitle: "AI Study & Interview Assistant",
        mode: "placement_advisor",
        contextTag: "Student Profile",
        topicId: "Placement Strategy & Profile",
        welcomeMsg: "Hey! I'm InterviewPilot AI. What do you want to work on?",
        suggestions: [
          "Coding",
          "Aptitude",
          "AI Interview",
          "Resume",
          "Study Plan"
        ]
      };
    }

    // Default / Dashboard / Journey
    return {
      roleTitle: "InterviewPilot AI",
      roleSubtitle: "AI Study & Interview Assistant",
      mode: "placement_advisor",
      contextTag: "AI Study Assistant",
      topicId: "Placement Strategy",
      welcomeMsg: "Hey! I'm InterviewPilot AI. What do you want to work on?",
      suggestions: [
        "Coding",
        "Aptitude",
        "AI Interview",
        "Resume",
        "Study Plan"
      ]
    };
  };

  const contextInfo = getContextDetails();

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: "assistant", content: contextInfo.welcomeMsg }]);
    }
  }, [location.pathname]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleCopy = (code, idx) => {
    navigator.clipboard.writeText(code);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleClear = () => {
    setMessages([{ role: "assistant", content: contextInfo.welcomeMsg }]);
    setLastFailedMsg(null);
  };

  const handleSend = async (customMessage) => {
    const textToSend = typeof customMessage === "string" ? customMessage : input;
    if (!textToSend.trim() || loading) return;

    const userMsg = textToSend.trim();
    if (typeof customMessage !== "string") setInput("");
    setLastFailedMsg(null);

    const newHistory = [...messages, { role: "user", content: userMsg }];
    setMessages(newHistory);

    // Client-side greeting short-circuit for immediate response (<10ms)
    const cleanMsg = userMsg.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").trim();
    const greetings = ["hi", "hello", "hey", "good morning", "good evening", "good afternoon", "howdy", "sup"];
    if (greetings.includes(cleanMsg)) {
      const reply = `Hey ${userName}! I'm InterviewPilot AI. What do you want to work on today?`;
      setMessages([...newHistory, { role: "assistant", content: reply }]);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/learning/teacher/chat", {
        topicId: contextInfo.topicId,
        history: messages,
        currentMessage: userMsg,
        step: "general",
        contextMeta: {
          mode: contextInfo.mode,
          activePage: location.pathname,
          userName: userName,
          targetRole: user?.career?.targetRole || ""
        }
      });

      const resData = response.data?.data || response.data;

      if (resData?.status === "generating") {
        const chatId = resData?.chatId;
        let attempts = 0;
        pollRef.current = setInterval(async () => {
          attempts++;
          if (attempts > 60) {
            if (pollRef.current) {
              clearInterval(pollRef.current);
              pollRef.current = null;
            }
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: "The request took a bit too long. Please try asking again." }
            ]);
            setLastFailedMsg(userMsg);
            setLoading(false);
            return;
          }

          try {
            const statusRes = await api.get(`/learning/teacher/chat/${chatId}`);
            const payload = statusRes.data?.data || statusRes.data;
            if (payload?.status === "ready") {
              if (pollRef.current) {
                clearInterval(pollRef.current);
                pollRef.current = null;
              }
              setMessages((prev) => [
                ...prev,
                { role: "assistant", content: payload.reply }
              ]);
              setLoading(false);
            } else if (payload?.status === "error") {
              if (pollRef.current) {
                clearInterval(pollRef.current);
                pollRef.current = null;
              }
              setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Unable to process that question right now. Please try again." }
              ]);
              setLastFailedMsg(userMsg);
              setLoading(false);
            }
          } catch (err) {
            console.error("Polling error:", err);
          }
        }, 200);
      } else {
        const reply = resData?.reply || "I've reviewed your question. Let's continue!";
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
        setLoading(false);
      }
    } catch (error) {
      console.error("AI Assistant Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "AI service is currently synchronizing. Please try again in a moment." }
      ]);
      setLastFailedMsg(userMsg);
      setLoading(false);
    }
  };

  const renderMessageContent = (content, msgIdx) => {
    return <AIMessageRenderer content={content} msgIdx={msgIdx} />;
  };

  return (
    <>
      {/* Floating Single Trigger Button (Orb: 56px) */}
      <div className="fixed bottom-6 right-6 z-40">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              type="button"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                y: [0, -4, 0]
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                scale: { duration: 0.2 },
                opacity: { duration: 0.2 },
                y: {
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-primary-600 via-indigo-600 to-cyan-500 text-white shadow-xl shadow-primary-500/25 flex items-center justify-center cursor-pointer transition-all border border-white/10"
              aria-label="Open InterviewPilot AI Assistant"
            >
              <Bot size={22} className="relative z-10" />
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3 z-20">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[#070914]" />
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Floating AI Chat Window (Desktop: 380px max width, Glass Depth) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.96 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-40 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[80vh] bg-[#0F1629]/95 border border-border/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="bg-surface-2/80 border-b border-border/70 px-3.5 py-3 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Bot size={15} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-xs text-text-primary font-display">{contextInfo.roleTitle}</h3>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] text-text-muted font-mono">
                    <Sparkles size={9} className="text-cyan-400" />
                    {contextInfo.roleSubtitle}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button 
                  type="button"
                  onClick={handleClear}
                  className="p-1 hover:bg-surface-hover rounded-lg text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                  title="Reset conversation"
                >
                  <RotateCcw size={13} />
                </button>
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-surface-hover rounded-lg text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                  title="Minimize"
                >
                  <Minus size={14} />
                </button>
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-surface-hover rounded-lg text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                  title="Close assistant"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-bg-base/30">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={cn(
                    "max-w-[90%] rounded-2xl px-3 py-2 shadow-sm text-xs",
                    msg.role === "user" 
                      ? "bg-primary-600 text-white rounded-br-xs" 
                      : "bg-[#11162A] border border-border text-text-primary rounded-bl-xs"
                  )}>
                    {renderMessageContent(msg.content, i)}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start items-center gap-2">
                  <div className="bg-[#11162A] border border-border rounded-2xl rounded-bl-xs px-3 py-2 shadow-sm flex items-center gap-2 text-text-muted text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: "0.15s" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: "0.3s" }} />
                    <span className="text-[10px] font-mono text-primary-300 ml-1">Thinking...</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-2 py-1 text-[10px] font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-md transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {lastFailedMsg && !loading && (
                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => handleSend(lastFailedMsg)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/15 border border-primary-500/30 text-primary-300 hover:text-primary-200 text-[11px] font-mono font-bold transition-all cursor-pointer"
                  >
                    <RefreshCw size={11} />
                    <span>Retry Last Question</span>
                  </button>
                </div>
              )}

              <div ref={endRef} />
            </div>

            {/* Suggestion Chips */}
            {contextInfo.suggestions && contextInfo.suggestions.length > 0 && (
              <div className="px-3 py-1.5 bg-surface-2/60 border-t border-border/60 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                {contextInfo.suggestions.map((chip, cIdx) => (
                  <button
                    key={cIdx}
                    type="button"
                    onClick={() => handleSend(chip)}
                    disabled={loading}
                    className="whitespace-nowrap text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface hover:bg-primary-500/10 text-text-secondary hover:text-primary-300 border border-border hover:border-primary-500/30 transition-all shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-2.5 bg-surface-2/90 border-t border-border/80 shrink-0">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask InterviewPilot AI..."
                  disabled={loading}
                  className="w-full bg-bg-base border border-border rounded-full pl-3 pr-9 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500/40 text-text-primary placeholder:text-text-muted transition-all"
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || loading} 
                  className="absolute right-1 p-1 bg-primary-600 text-white rounded-full hover:bg-primary-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                  aria-label="Send message"
                >
                  <Send size={11} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

