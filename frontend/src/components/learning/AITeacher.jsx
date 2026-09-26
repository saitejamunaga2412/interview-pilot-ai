import React, { useState, useRef, useEffect } from "react";
import api from "../../services/api";
import { FaPaperPlane, FaRobot, FaUser } from "react-icons/fa";
import AIMessageRenderer from "./AIMessageRenderer";

export default function AITeacher({ topicId, topicTitle }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Hi! I'm your AI Teacher for ${topicTitle}. To get started, what do you already know about this topic?` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  
  const messagesEndRef = useRef(null);

  const steps = [
    "understand", "explain", "analogy", "example", "dry_run",
    "quiz", "hint_1", "hint_2", "solution", "summary", "next"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    
    const newHistory = [...messages, { role: "user", content: userMessage }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const currentStep = steps[Math.min(stepIndex, steps.length - 1)];
      
      const response = await api.post("/learning/teacher/chat", {
        topicId: topicId,
        history: messages,
        currentMessage: userMessage,
        step: currentStep
      });

      if (response.data.data.status === 'generating') {
        const chatId = response.data.data.chatId;
        
        let attempts = 0;
        const pollInterval = setInterval(async () => {
          attempts++;
          if (attempts > 40) { // Max 120 seconds
            clearInterval(pollInterval);
            setMessages([...newHistory, { role: "assistant", content: "Sorry, the generation took too long." }]);
            setLoading(false);
            return;
          }
          
          try {
            const statusRes = await api.get(`/learning/teacher/chat/${chatId}`);
            if (statusRes.data.data.status === 'ready') {
              clearInterval(pollInterval);
              setMessages([...newHistory, { role: "assistant", content: statusRes.data.data.reply }]);
              setLoading(false);
              
              if (stepIndex < steps.length - 1) {
                setStepIndex(stepIndex + 1);
              }
            } else if (statusRes.data.data.status === 'error') {
              clearInterval(pollInterval);
              setMessages([...newHistory, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
              setLoading(false);
            }
          } catch (e) {
            console.error("Polling error", e);
          }
        }, 3000);
      } else {
        setMessages([...newHistory, { role: "assistant", content: response.data.data.reply }]);
        setLoading(false);
        if (stepIndex < steps.length - 1) {
          setStepIndex(stepIndex + 1);
        }
      }
    } catch (error) {
      console.error("AI Teacher chat failed", error);
      setMessages([...newHistory, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
      setLoading(false);
    }
  };

  const renderMessageContent = (content, msgIdx) => {
    return <AIMessageRenderer content={content} msgIdx={msgIdx} />;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mt-8 h-[600px] flex flex-col">
      <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
        <FaRobot className="text-blue-500" /> AI Interactive Tutor
      </h3>
      
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-none shadow-sm'
            }`}>
              <div className="flex items-center gap-2 mb-1 opacity-80 text-xs uppercase tracking-wider font-semibold">
                {msg.role === 'user' ? <><FaUser/> You</> : <><FaRobot/> Tutor</>}
              </div>
              <div>{renderMessageContent(msg.content, idx)}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-none px-5 py-4 shadow-sm text-gray-500 flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your answer or question here..."
          disabled={loading}
          className="w-full pl-4 pr-12 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="absolute right-2 top-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
}
