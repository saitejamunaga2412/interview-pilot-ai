import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import TopicQuiz from "../../components/learning/TopicQuiz";
import AITeacher from "../../components/learning/AITeacher";
import { 
  FaBook, FaCode, FaCheckDouble, FaExclamationTriangle, 
  FaLightbulb, FaArrowRight, FaBrain, FaProjectDiagram, 
  FaLayerGroup, FaPlay, FaRedo, FaLaptopCode, FaCheckCircle, 
  FaClock, FaDatabase 
} from "react-icons/fa";

const VisualizationEngine = ({ category, title }) => {
  const lowerTitle = title?.toLowerCase() || '';

  // 1. Arrays: Contiguous memory & Indexing
  if (lowerTitle.includes('array')) {
    const [selectedIdx, setSelectedIdx] = useState(2);
    const elements = [10, 25, 40, 55, 70];
    const baseAddr = 0x2000;

    return (
      <div className="flex flex-col items-center py-6 gap-6">
        <div className="text-xs font-semibold text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-full border border-primary-200">
          Contiguous Memory Layout: Address = Base (0x2000) + (Index × 4 bytes)
        </div>
        
        <div className="flex gap-2 sm:gap-4 justify-center flex-wrap">
          {elements.map((val, idx) => {
            const addr = `0x${(baseAddr + idx * 4).toString(16).toUpperCase()}`;
            const isSelected = selectedIdx === idx;
            return (
              <div 
                key={idx} 
                onClick={() => setSelectedIdx(idx)}
                className={`relative group cursor-pointer transition-all duration-300 p-3 rounded-2xl border-2 flex flex-col items-center ${
                  isSelected 
                    ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-500 shadow-lg scale-105' 
                    : 'bg-surface border-border hover:border-primary-300'
                }`}
              >
                <span className="text-[10px] font-mono text-text-muted mb-1">{addr}</span>
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold font-mono ${
                  isSelected ? 'bg-primary-600 text-white' : 'bg-surface-hover text-text-primary'
                }`}>
                  {val}
                </div>
                <span className="text-xs font-mono font-bold mt-2 text-primary-600">Index {idx}</span>
              </div>
            );
          })}
        </div>

        <div className="bg-surface-hover p-4 rounded-xl border border-border text-xs sm:text-sm font-mono text-text-secondary max-w-md text-center">
          Selected: <strong className="text-primary-600">Index {selectedIdx}</strong> (Value: <strong className="text-text-primary">{elements[selectedIdx]}</strong>) | Memory: <strong className="text-emerald-500">0x{(baseAddr + selectedIdx * 4).toString(16).toUpperCase()}</strong> | Time to Access: <strong className="text-blue-500">O(1)</strong>
        </div>
      </div>
    );
  }

  // 2. Strings: Two-Pointer Palindrome Simulator
  if (lowerTitle.includes('string')) {
    const chars = ['R', 'A', 'C', 'E', 'C', 'A', 'R'];
    const [step, setStep] = useState(0);
    const left = step;
    const right = chars.length - 1 - step;
    const isDone = left >= right;

    return (
      <div className="flex flex-col items-center py-6 gap-6">
        <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-200">
          Two-Pointer Symmetric Scan: Left Ptr ➔ | 🠔 Right Ptr
        </div>

        <div className="flex gap-2 sm:gap-3 justify-center">
          {chars.map((char, idx) => {
            const isLeft = idx === left;
            const isRight = idx === right;
            const isMatched = (idx < left) || (idx > right);
            return (
              <div key={idx} className="flex flex-col items-center">
                <div className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center font-mono font-bold text-base transition-all ${
                  isLeft || isRight 
                    ? 'bg-emerald-500 text-white border-emerald-600 scale-110 shadow-md' 
                    : isMatched 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-300' 
                      : 'bg-surface border-border text-text-primary'
                }`}>
                  {char}
                </div>
                <span className="text-[10px] font-mono mt-1 font-bold">
                  {isLeft && isRight ? 'L & R' : isLeft ? 'LEFT' : isRight ? 'RIGHT' : idx}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 items-center">
          <button 
            onClick={() => setStep(0)} 
            className="text-xs px-3 py-1.5 rounded-lg bg-surface border border-border hover:bg-surface-hover flex items-center gap-1"
          >
            <FaRedo size={10} /> Reset
          </button>
          <button 
            onClick={() => setStep(prev => prev + 1)}
            disabled={isDone}
            className="text-xs px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold flex items-center gap-1"
          >
            <FaPlay size={10} /> Next Comparison Step
          </button>
        </div>

        <div className="bg-surface-hover p-3 rounded-xl border border-border text-xs text-text-secondary">
          {isDone ? "✓ Palindrome check complete! All symmetric characters match in O(N/2) time." : `Comparing chars[${left}] ('${chars[left]}') === chars[${right}] ('${chars[right]}') -> MATCH`}
        </div>
      </div>
    );
  }

  // 3. Linked Lists: Nodes + Pointers
  if (lowerTitle.includes('linked list') || lowerTitle.includes('list')) {
    const [activeNode, setActiveNode] = useState(0);
    const nodes = [12, 99, 37, 84];

    return (
      <div className="flex flex-col items-center py-6 gap-6">
        <div className="text-xs font-semibold text-purple-600 bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full border border-purple-200">
          Non-Contiguous Nodes connected by Heap Pointers
        </div>

        <div className="flex items-center gap-1 sm:gap-3 flex-wrap justify-center">
          {nodes.map((val, idx) => (
            <React.Fragment key={idx}>
              <div 
                onClick={() => setActiveNode(idx)}
                className={`cursor-pointer transition-all duration-300 rounded-xl border-2 overflow-hidden flex flex-col items-center ${
                  activeNode === idx 
                    ? 'border-purple-500 shadow-lg scale-105 bg-purple-50 dark:bg-purple-950/40' 
                    : 'border-border bg-surface hover:border-purple-300'
                }`}
              >
                <div className="text-[10px] font-mono px-2 py-0.5 bg-surface-hover w-full text-center text-text-muted">
                  {idx === 0 ? 'HEAD' : idx === nodes.length - 1 ? 'TAIL' : `Node ${idx}`}
                </div>
                <div className="flex divide-x divide-border">
                  <div className="p-3 font-bold font-mono text-text-primary">{val}</div>
                  <div className="p-3 text-[10px] font-mono text-purple-500 flex items-center">ptr</div>
                </div>
              </div>
              {idx < nodes.length - 1 && (
                <div className="text-purple-500 text-lg font-bold flex items-center">➔</div>
              )}
            </React.Fragment>
          ))}
          <div className="text-xs font-mono font-bold text-text-muted bg-surface-hover px-2.5 py-2 rounded-lg border border-border">
            NULL
          </div>
        </div>

        <button 
          onClick={() => setActiveNode((prev) => (prev + 1) % nodes.length)}
          className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-sm"
        >
          <FaPlay size={10} /> Step Pointer (Traverse)
        </button>
      </div>
    );
  }

  // 4. Stack: LIFO Push & Pop Simulator
  if (lowerTitle.includes('stack')) {
    const [stack, setStack] = useState([10, 20, 30]);

    const handlePush = () => {
      if (stack.length < 5) {
        setStack(prev => [...prev, (prev.length + 1) * 10]);
      }
    };

    const handlePop = () => {
      if (stack.length > 0) {
        setStack(prev => prev.slice(0, prev.length - 1));
      }
    };

    return (
      <div className="flex flex-col items-center py-6 gap-6">
        <div className="text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-900/30 px-3 py-1 rounded-full border border-rose-200">
          Last-In, First-Out (LIFO): Insert & Remove at TOP
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handlePush}
            disabled={stack.length >= 5}
            className="text-xs px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl"
          >
            + Push() [O(1)]
          </button>
          <button 
            onClick={handlePop}
            disabled={stack.length === 0}
            className="text-xs px-3.5 py-1.5 bg-surface border border-border hover:bg-surface-hover disabled:opacity-50 text-text-primary font-bold rounded-xl"
          >
            - Pop() [O(1)]
          </button>
        </div>

        <div className="w-36 flex flex-col-reverse border-b-4 border-l-4 border-r-4 border-rose-400 rounded-b-2xl p-2 gap-1.5 min-h-[140px] bg-bg-base/50">
          {stack.map((val, idx) => (
            <div 
              key={idx} 
              className={`p-2.5 rounded-xl font-mono font-bold text-center text-sm border shadow-sm transition-all ${
                idx === stack.length - 1 
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse' 
                  : 'bg-surface border-border text-text-primary'
              }`}
            >
              {val} {idx === stack.length - 1 && '🠔 TOP'}
            </div>
          ))}
          {stack.length === 0 && (
            <span className="text-xs text-text-muted text-center my-auto">Stack is Empty</span>
          )}
        </div>
      </div>
    );
  }

  // 5. Queue: FIFO Enqueue & Dequeue Simulator
  if (lowerTitle.includes('queue')) {
    const [queue, setQueue] = useState([10, 20, 30]);

    const handleEnqueue = () => {
      if (queue.length < 5) {
        setQueue(prev => [...prev, (prev.length > 0 ? prev[prev.length - 1] + 10 : 10)]);
      }
    };

    const handleDequeue = () => {
      if (queue.length > 0) {
        setQueue(prev => prev.slice(1));
      }
    };

    return (
      <div className="flex flex-col items-center py-6 gap-6">
        <div className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-200">
          First-In, First-Out (FIFO): Enqueue at REAR, Dequeue from FRONT
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleEnqueue}
            disabled={queue.length >= 5}
            className="text-xs px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl"
          >
            + Enqueue(REAR)
          </button>
          <button 
            onClick={handleDequeue}
            disabled={queue.length === 0}
            className="text-xs px-3.5 py-1.5 bg-surface border border-border hover:bg-surface-hover disabled:opacity-50 text-text-primary font-bold rounded-xl"
          >
            - Dequeue(FRONT)
          </button>
        </div>

        <div className="flex items-center gap-2 border-t-2 border-b-2 border-dashed border-blue-400 px-4 py-3 min-h-[70px] rounded-xl bg-bg-base/50">
          <span className="text-[10px] font-bold font-mono text-blue-600">FRONT ➔</span>
          {queue.map((val, idx) => (
            <div key={idx} className="w-12 h-12 rounded-xl bg-surface border-2 border-blue-400 flex items-center justify-center font-mono font-bold text-text-primary shadow-sm">
              {val}
            </div>
          ))}
          {queue.length === 0 && <span className="text-xs text-text-muted">Queue is Empty</span>}
          <span className="text-[10px] font-bold font-mono text-blue-600">➔ REAR</span>
        </div>
      </div>
    );
  }

  // 6. Binary Search: Interactive Step Simulator
  if (lowerTitle.includes('binary search') || lowerTitle.includes('search')) {
    const array = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
    const target = 23;
    const [step, setStep] = useState(0);

    const steps = [
      { low: 0, high: 9, mid: 4, text: "Initial: Low = 0 (2), High = 9 (91), Mid = 4 (16). Since 16 < 23, discard left half and move Low to Mid + 1." },
      { low: 5, high: 9, mid: 7, text: "Step 2: Low = 5 (23), High = 9 (91), Mid = 7 (56). Since 56 > 23, discard right half and move High to Mid - 1." },
      { low: 5, high: 6, mid: 5, text: "Step 3: Low = 5 (23), High = 6 (38), Mid = 5 (23). Array[Mid] === Target (23)! Target Found in O(log N) steps!" }
    ];

    const currentStep = steps[Math.min(step, steps.length - 1)];

    return (
      <div className="flex flex-col items-center py-6 gap-6">
        <div className="flex items-center justify-between w-full max-w-lg px-2">
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-200">
            Target Value = {target}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setStep(0)}
              className="text-xs font-medium px-3 py-1 rounded-lg bg-surface border border-border hover:bg-surface-hover text-text-secondary flex items-center gap-1"
            >
              <FaRedo size={10} /> Reset
            </button>
            <button 
              onClick={() => setStep(prev => Math.min(prev + 1, steps.length - 1))}
              disabled={step >= steps.length - 1}
              className="text-xs font-semibold px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white flex items-center gap-1 transition-all"
            >
              <FaPlay size={10} /> Step Forward ({step + 1}/{steps.length})
            </button>
          </div>
        </div>

        <div className="flex gap-1.5 sm:gap-2 justify-center flex-wrap">
          {array.map((val, idx) => {
            const isLow = idx === currentStep.low;
            const isMid = idx === currentStep.mid;
            const isHigh = idx === currentStep.high;
            const isOutOfRange = idx < currentStep.low || idx > currentStep.high;

            let borderClass = "border-border bg-surface text-text-primary";
            if (isMid) borderClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold scale-110 shadow-md";
            else if (isLow) borderClass = "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700";
            else if (isHigh) borderClass = "border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700";
            else if (isOutOfRange) borderClass = "border-border/40 bg-surface/30 text-text-muted opacity-40";

            return (
              <div key={idx} className="relative group flex flex-col items-center">
                <div className={`w-9 sm:w-11 h-9 sm:h-11 border-2 rounded-xl flex items-center justify-center text-sm sm:text-base font-mono transition-all duration-300 ${borderClass}`}>
                  {val}
                </div>
                <div className="mt-1 text-[9px] font-mono font-bold flex flex-col items-center">
                  {isMid && <span className="text-emerald-500">MID</span>}
                  {isLow && !isMid && <span className="text-blue-500">LOW</span>}
                  {isHigh && !isMid && <span className="text-purple-500">HIGH</span>}
                  <span className="text-text-muted">{idx}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-surface-hover p-4 rounded-xl border border-border text-xs sm:text-sm text-text-secondary max-w-xl text-center leading-relaxed">
          {currentStep.text}
        </div>
      </div>
    );
  }

  // 7. Trees / BST: Traversal Highlighter
  if (lowerTitle.includes('tree') || lowerTitle.includes('bst')) {
    const [traversal, setTraversal] = useState('inorder');
    const traversalOrders = {
      inorder: [5, 10, 15],
      preorder: [10, 5, 15],
      postorder: [5, 15, 10]
    };

    return (
      <div className="flex flex-col items-center py-6 gap-6">
        <div className="flex gap-2">
          {['inorder', 'preorder', 'postorder'].map((mode) => (
            <button
              key={mode}
              onClick={() => setTraversal(mode)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize border transition-all ${
                traversal === mode 
                  ? 'bg-primary-600 text-white border-primary-600 shadow-sm' 
                  : 'bg-surface text-text-secondary border-border hover:bg-surface-hover'
              }`}
            >
              {mode} Traversal
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/60 border-2 border-primary-500 rounded-full flex items-center justify-center font-bold text-primary-700 dark:text-primary-300 z-10 shadow-md">
            10
          </div>
          <div className="flex w-32 justify-between -mt-2 relative">
            <div className="w-1/2 h-10 border-l-2 border-t-2 border-primary-300 rounded-tl-lg -mr-[1px] mt-2"></div>
            <div className="w-1/2 h-10 border-r-2 border-t-2 border-primary-300 rounded-tr-lg -ml-[1px] mt-2"></div>
          </div>
          <div className="flex w-44 justify-between">
            <div className="w-12 h-12 bg-surface border-2 border-primary-400 rounded-full flex items-center justify-center font-bold text-primary-600 shadow-sm">5</div>
            <div className="w-12 h-12 bg-surface border-2 border-primary-400 rounded-full flex items-center justify-center font-bold text-primary-600 shadow-sm">15</div>
          </div>
        </div>

        <div className="bg-surface-hover p-3 rounded-xl border border-border text-xs sm:text-sm font-mono text-text-secondary">
          Visited Sequence: <strong className="text-primary-600">[{traversalOrders[traversal].join(" ➔ ")}]</strong>
        </div>
      </div>
    );
  }

  // 8. Dynamic Programming: Tabulation Grid Visualizer
  if (lowerTitle.includes('dynamic') || lowerTitle.includes('dp')) {
    const [step, setStep] = useState(3);
    const fibStates = [0, 1, 1, 2, 3, 5, 8];

    return (
      <div className="flex flex-col items-center py-6 gap-6">
        <div className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full border border-amber-200">
          DP Tabulation State: dp[i] = dp[i-1] + dp[i-2] (Linear Time & Space Optimization)
        </div>

        <div className="flex gap-2">
          {fibStates.map((val, idx) => (
            <div 
              key={idx} 
              className={`p-3 rounded-xl border-2 flex flex-col items-center transition-all ${
                idx <= step 
                  ? idx === step 
                    ? 'bg-amber-500 text-white border-amber-600 scale-105 shadow-md' 
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border-amber-300' 
                  : 'bg-surface border-border text-text-muted opacity-40'
              }`}
            >
              <span className="text-[10px] font-mono mb-1">dp[{idx}]</span>
              <span className="text-base font-bold font-mono">{idx <= step ? val : '?'}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setStep(prev => Math.min(prev + 1, fibStates.length - 1))}
            disabled={step >= fibStates.length - 1}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
          >
            Compute Next State (i = {step + 1})
          </button>
          <button 
            onClick={() => setStep(2)}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-surface border border-border hover:bg-surface-hover"
          >
            Reset
          </button>
        </div>
      </div>
    );
  }

  // 9. Default Architectural / Concept Flow Box
  return (
    <div className="h-36 flex flex-col items-center justify-center gap-3">
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/40 border border-primary-300 flex items-center justify-center font-bold text-primary-600">A</div>
        <div className="w-12 h-12 rounded-xl bg-primary-200 dark:bg-primary-800/40 border border-primary-400 flex items-center justify-center font-bold text-primary-600">➔</div>
        <div className="w-12 h-12 rounded-xl bg-primary-300 dark:bg-primary-700/40 border border-primary-500 flex items-center justify-center font-bold text-primary-600">B</div>
      </div>
      <span className="text-xs text-text-muted font-medium">Concept Architecture & Algorithmic Pattern Flow</span>
    </div>
  );
};

export default function TopicDetails() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [recommendation, setRecommendation] = useState(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState("");
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    fetchTopic();
    fetchRecommendations();
    return () => clearInterval(pollIntervalRef.current);
  }, [topicId]);

  const fetchTopic = async () => {
    try {
      const response = await api.get(`/learning/topic/${topicId}`);
      const fetchedTopic = response.data.data.topic;
      const fetchedProgress = response.data.data.progress;

      setTopic(fetchedTopic);
      setProgress(fetchedProgress);

      if (fetchedTopic && fetchedTopic.status === 'generating') {
        setIsGenerating(true);
        setGenerationProgress(fetchedTopic.generationProgress);
        setLoading(false);
        
        if (!pollIntervalRef.current) {
          pollIntervalRef.current = setInterval(pollTopic, 3000);
        }
      } else {
        setIsGenerating(false);
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to load topic", error);
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const res = await api.get("/recommendations/daily-plan");
      if (res.data?.data?.plan?.length > 0) {
        setRecommendation(res.data.data.plan[0]);
      }
    } catch (e) {
      console.error("Could not fetch next steps", e);
    }
  };

  const pollTopic = async () => {
    try {
      const response = await api.get(`/learning/topic/${topicId}`);
      const fetchedTopic = response.data.data.topic;
      if (fetchedTopic) {
        setTopic(fetchedTopic);
        setProgress(response.data.data.progress);
        setGenerationProgress(fetchedTopic.generationProgress);
        
        if (fetchedTopic.status !== 'generating') {
          setIsGenerating(false);
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      }
    } catch (e) {
      console.error("Error polling topic:", e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6">
        <div className="w-14 h-14 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-text-secondary">Loading curated curriculum...</p>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 text-center">
        <FaExclamationTriangle className="text-amber-500 text-4xl mb-4" />
        <h2 className="text-xl font-bold text-text-primary mb-2">Topic not found</h2>
        <p className="text-sm text-text-secondary mb-6">The requested topic could not be retrieved.</p>
        <button 
          onClick={() => navigate('/learning')}
          className="px-6 py-2.5 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
        >
          Return to Learning Hub
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary pb-32 relative overflow-x-hidden">
      
      {/* Sticky Top Header */}
      <div className="bg-surface/90 backdrop-blur-md border-b border-border sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1 flex items-center gap-2">
              <FaLayerGroup /> {topic.category || "DSA Course"}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">{topic.title}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-semibold text-text-muted">Mastery Progress</span>
              <span className="text-sm font-bold text-primary-600">{progress?.overallCompletionPercentage || 0}%</span>
            </div>
            <div className="w-28 bg-surface-hover rounded-full h-2.5 border border-border overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary-600 to-indigo-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${progress?.overallCompletionPercentage || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {isGenerating && (
        <div className="bg-blue-50 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 px-4 py-3 flex items-center justify-center gap-3 text-sm font-medium">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>AI Teacher is enhancing this topic with detailed examples ({generationProgress})...</span>
        </div>
      )}

      {/* Main Linear Curriculum Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 space-y-10">
        
        {/* 1. Definition */}
        <section className="bg-surface p-6 sm:p-8 rounded-3xl border border-border shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2 text-text-primary">
            <FaBook className="text-primary-600"/> 1. Formal Definition
          </h2>
          <p className="text-base sm:text-lg leading-relaxed text-text-secondary font-sans">
            {topic.definition || `${topic.title} is a fundamental engineering structure used to organize and manipulate data efficiently.`}
          </p>
        </section>

        {/* 2. Why it Matters & Real-World Analogy */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topic.beginnerExplanation && (
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-6 rounded-3xl border border-emerald-200 dark:border-emerald-800/50 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold mb-3 flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                  <FaBrain /> Why it Matters
                </h3>
                <p className="text-sm leading-relaxed text-emerald-950 dark:text-emerald-100">
                  {topic.beginnerExplanation}
                </p>
              </div>
            </div>
          )}

          {topic.overview && (
            <div className="bg-amber-50/70 dark:bg-amber-950/30 p-6 rounded-3xl border border-amber-200 dark:border-amber-800/50 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold mb-3 flex items-center gap-2 text-amber-800 dark:text-amber-300">
                  <FaLightbulb /> Real-Life Analogy
                </h3>
                <p className="text-sm leading-relaxed italic text-amber-950 dark:text-amber-100">
                  {topic.overview}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* 3. Interactive Visualization */}
        <section className="bg-surface rounded-3xl border border-border shadow-sm p-6 overflow-hidden">
          <h2 className="text-lg sm:text-xl font-bold mb-2 flex items-center gap-2 text-text-primary">
            <FaProjectDiagram className="text-purple-600"/> 2. Visual Model & Animation
          </h2>
          <p className="text-xs text-text-muted mb-4">Interact with the memory elements and step through the algorithm flow:</p>
          <div className="bg-bg-base/70 rounded-2xl border border-border p-4">
            <VisualizationEngine category={topic.category} title={topic.title} />
          </div>
        </section>

        {/* 4. Step-by-Step Logic */}
        {topic.stepByStep?.length > 0 && (
          <section className="bg-surface p-6 sm:p-8 rounded-3xl border border-border shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold mb-6 text-text-primary">
              3. Step-by-Step Algorithm Walkthrough
            </h2>
            <div className="space-y-4">
              {topic.stepByStep.map((step, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-bg-base border border-border hover:border-primary-300 transition-colors">
                  <div className="w-8 h-8 shrink-0 bg-primary-600 text-white rounded-xl flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-text-primary">{typeof step === 'string' ? `Phase ${idx + 1}` : (step.title || `Phase ${idx + 1}`)}</h4>
                    <p className="text-sm text-text-secondary mt-1 leading-relaxed">{typeof step === 'string' ? step : step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. Multi-Language Code Implementation */}
        <section className="bg-surface p-6 sm:p-8 rounded-3xl border border-border shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-text-primary">
              <FaCode className="text-primary-600"/> 4. Code Implementation
            </h2>
            
            <div className="flex gap-2 bg-bg-base p-1 rounded-xl border border-border">
              {['python', 'java', 'javascript'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                    selectedLanguage === lang 
                      ? 'bg-primary-600 text-white shadow-sm' 
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-950 rounded-2xl overflow-hidden border border-gray-800 shadow-xl">
            <div className="bg-gray-900 px-4 py-2.5 flex justify-between items-center text-xs font-mono text-gray-400 border-b border-gray-800">
              <span className="uppercase font-bold text-primary-400">{selectedLanguage} Solution</span>
              <span>Clean Code Standard</span>
            </div>
            <pre className="p-5 overflow-x-auto text-sm text-emerald-400 font-mono leading-relaxed">
              <code>
                {(() => {
                  if (Array.isArray(topic.codeExamples)) {
                    const match = topic.codeExamples.find(ex => ex.language?.toLowerCase() === selectedLanguage?.toLowerCase());
                    return match?.code || topic.codeExamples[0]?.code || `# ${topic.title} implementation in ${selectedLanguage}`;
                  }
                  if (topic.codeExamples && typeof topic.codeExamples === 'object') {
                    return topic.codeExamples[selectedLanguage?.toLowerCase()] || 
                           topic.codeExamples.python || 
                           topic.codeExamples.java || 
                           topic.codeExamples.javascript || 
                           `# ${topic.title} implementation in ${selectedLanguage}`;
                  }
                  return `# ${topic.title} implementation in ${selectedLanguage}\ndef solution():\n    pass`;
                })()}
              </code>
            </pre>
          </div>
        </section>

        {/* 6. Complexity Analysis */}
        {topic.complexity && (
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5 mb-1">
                  <FaClock className="text-blue-500" /> Time Complexity
                </span>
                <span className="font-mono text-xl font-extrabold text-primary-600">{topic.complexity.time || "O(N)"}</span>
              </div>
            </div>
            <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5 mb-1">
                  <FaDatabase className="text-purple-500" /> Space Complexity
                </span>
                <span className="font-mono text-xl font-extrabold text-purple-600">{topic.complexity.space || "O(1)"}</span>
              </div>
            </div>
          </section>
        )}

        {/* 7. Common Mistakes & Interview Tips */}
        {(topic.interviewTips?.length > 0 || topic.commonMistakes?.length > 0) && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topic.interviewTips?.length > 0 && (
              <div className="bg-blue-50/70 dark:bg-blue-950/30 p-6 rounded-3xl border border-blue-200 dark:border-blue-800/50">
                <h3 className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2 mb-4 text-base">
                  <FaLightbulb className="text-blue-600" /> Pro Interview Tips
                </h3>
                <ul className="space-y-2 list-disc pl-5 text-sm text-blue-950 dark:text-blue-200 leading-relaxed">
                  {topic.interviewTips.map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
              </div>
            )}
            {topic.commonMistakes?.length > 0 && (
              <div className="bg-rose-50/70 dark:bg-rose-950/30 p-6 rounded-3xl border border-rose-200 dark:border-rose-800/50">
                <h3 className="font-bold text-rose-900 dark:text-rose-300 flex items-center gap-2 mb-4 text-base">
                  <FaExclamationTriangle className="text-rose-600" /> Common Mistakes
                </h3>
                <ul className="space-y-2 list-disc pl-5 text-sm text-rose-950 dark:text-rose-200 leading-relaxed">
                  {topic.commonMistakes.map((mistake, i) => <li key={i}>{mistake}</li>)}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* 8. Practice in Coding Arena Action Card */}
        <section className="bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
              Hands-On Engineering
            </span>
            <h3 className="text-xl sm:text-2xl font-bold">Ready to write code for {topic.title}?</h3>
            <p className="text-sm text-indigo-100 max-w-lg">
              Solidify this concept by solving real curated placement problems in the Monaco Code Arena with live test cases and hints.
            </p>
          </div>
          <Link
            to={`/arena?topic=${topic.topicId}&category=${encodeURIComponent(topic.category || '')}`}
            className="bg-white text-primary-600 hover:bg-gray-100 px-6 py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center gap-2 shrink-0 hover:scale-105"
          >
            <FaLaptopCode size={16} /> Open Coding Arena
          </Link>
        </section>

        {/* 9. Interactive AI Placement Mentor */}
        <section>
          <AITeacher topicId={topic.topicId || topicId} topicTitle={topic.title} />
        </section>

        {/* 10. Quiz Check */}
        {topic.quiz && topic.quiz.length > 0 && (
          <section className="bg-surface p-6 sm:p-8 rounded-3xl border border-border shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold mb-6 flex items-center gap-2 text-text-primary">
              <FaCheckDouble className="text-primary-600"/> 5. Concept Mastery Check
            </h2>
            <TopicQuiz topic={topic} progress={progress} onQuizComplete={() => {}} />
          </section>
        )}

        {/* 10. Next Steps / Recommendation */}
        <section className="bg-surface p-6 sm:p-8 rounded-3xl border border-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-base font-bold text-text-primary mb-1">Recommended Next Step</h3>
            <p className="text-sm text-text-secondary">
              {recommendation ? recommendation.why : "Advance to the next concept in your personalized placement roadmap."}
            </p>
          </div>
          <button 
            onClick={() => navigate('/learning')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-colors flex items-center gap-2 shrink-0"
          >
            {recommendation ? recommendation.task : "Next Topic"} <FaArrowRight />
          </button>
        </section>

      </div>
    </div>
  );
}
