import React, { useState, useRef, useEffect } from "react";
import api from "../../services/api";
import { FaPaperPlane, FaRobot, FaUser } from "react-icons/fa";

export default function CompanyMentor({ companyName }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Hello! I'm your AI Mentor for ${companyName}. I can recommend specific Learning Topics, Coding Problems, Aptitude Topics, and CS concepts you need to crack ${companyName}. What's your current preparation level?` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userLevel, setUserLevel] = useState("Intermediate"); // Default
  
  const messagesEndRef = useRef(null);

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
    
    // Simple heuristic to gauge level if they type it, though real app might use profile data
    if (userMessage.toLowerCase().includes("beginner")) setUserLevel("Beginner");
    if (userMessage.toLowerCase().includes("advanced")) setUserLevel("Advanced");

    const newHistory = [...messages, { role: "user", content: userMessage }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const response = await api.post("/company/mentor/chat", {
        companyName,
        userLevel,
        history: messages,
        currentMessage: userMessage
      });

      setMessages([...newHistory, { role: "assistant", content: response.data.data.reply }]);
    } catch (error) {
      console.error("AI Mentor chat failed", error);
      setMessages([...newHistory, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 h-[600px] flex flex-col">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
        <FaRobot className="text-blue-500" /> {companyName} AI Mentor
      </h3>
      
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-none shadow-sm'
            }`}>
              <div className="flex items-center gap-2 mb-1 opacity-80 text-xs uppercase tracking-wider font-semibold">
                {msg.role === 'user' ? <><FaUser/> You</> : <><FaRobot/> Mentor</>}
              </div>
              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
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
          placeholder="Ask for topic recommendations, tips, or coding questions..."
          disabled={loading}
          className="w-full pl-4 pr-12 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
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
