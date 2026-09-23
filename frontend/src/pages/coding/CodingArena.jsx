import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { codingService } from '../../services/codingService';
import SharedCodeEditor from '../../components/coding/SharedCodeEditor';
import { LoadingState, ErrorState } from '../../components/ui/States';
import { Play, Send, Lightbulb, Bookmark, BookmarkCheck, Settings, ArrowLeft, X } from 'lucide-react';
import API from '../../services/api';
import TopicNotes from '../../components/learning/TopicNotes';

export default function CodingArena() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState('Problem');
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const [executing, setExecuting] = useState(false);
  const [output, setOutput] = useState(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const res = await codingService.getProblemDetails(id);
        setProblem(res.data);
        
        if (res.data.starterCode && res.data.starterCode.javascript) {
          setCode(res.data.starterCode.javascript);
        }

        const bkRes = await API.get(`/user-actions/bookmarks/check?entityId=${id}&entityType=Problem`);
        setIsBookmarked(bkRes.data?.bookmarked);
        
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id]);

  const toggleBookmark = async () => {
    try {
      const res = await API.post('/user-actions/bookmarks/toggle', {
        entityId: id,
        entityType: 'Problem',
        title: problem?.title || 'Problem',
        url: `/arena/${id}`
      });
      setIsBookmarked(res.data?.bookmarked);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    if (problem.starterCode && problem.starterCode[newLang]) {
      setCode(problem.starterCode[newLang]);
    }
  };

  const handleRun = async () => {
    if (!code || executing) return;
    setExecuting(true);
    try {
      const res = await codingService.executeCode(id, code, language);
      const data = res.data || {};
      const exec = data.executionResult || {};
      const rawStatus = data.status || exec.status || 'Accepted';
      
      setOutput({
        status: rawStatus,
        output: exec.stdout || exec.stderr || exec.compile_output || 'Code executed.',
        executionTime: exec.time ? `${exec.time}s` : null,
        memory: exec.memory ? `${exec.memory} KB` : null,
        data
      });
    } catch (err) {
      const is503 = err.response?.status === 503;
      const errMsg = err.response?.data?.message || err.message || (is503 ? "Code execution service is temporarily unavailable." : "Execution failed.");
      setOutput({ 
        status: is503 ? 'Service Unavailable' : 'Execution Error', 
        output: errMsg,
        isUnavailable: is503
      });
    } finally {
      setExecuting(false);
    }
  };

  const handleSubmit = async () => {
    if (!code || executing) return;
    setExecuting(true);
    try {
      const res = await codingService.executeCode(id, code, language, 0);
      const data = res.data || {};
      const exec = data.executionResult || {};
      const rawStatus = data.status || exec.status || 'Accepted';
      
      setOutput({
        status: rawStatus,
        output: exec.stdout || exec.stderr || exec.compile_output || (rawStatus === 'Accepted' ? 'All test cases passed! Submission accepted.' : 'Submission completed.'),
        executionTime: exec.time ? `${exec.time}s` : null,
        memory: exec.memory ? `${exec.memory} KB` : null,
        isSubmit: true,
        report: data.report,
        aiDebugger: data.aiDebugger,
        aiComplexity: data.aiComplexity,
        data
      });
    } catch (err) {
      const is503 = err.response?.status === 503;
      const errMsg = err.response?.data?.message || err.message || (is503 ? "Code execution service is temporarily unavailable." : "Submission failed.");
      setOutput({ 
        status: is503 ? 'Service Unavailable' : 'Submission Error', 
        output: errMsg,
        isUnavailable: is503
      });
    } finally {
      setExecuting(false);
    }
  };

  if (loading) return <LoadingState text="Loading Problem Environment..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="flex flex-col h-screen bg-bg-base overflow-hidden">
      
      {/* Navbar */}
      <div className="h-14 bg-surface border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/arena" className="text-text-muted hover:text-text-primary transition-colors flex items-center gap-1">
            <ArrowLeft size={16} /> <span className="text-sm font-medium">Arena</span>
          </Link>
          <div className="w-px h-4 bg-border"></div>
          <h1 className="font-semibold text-text-primary flex items-center gap-2">
            {problem.title}
            <span className={`text-xs px-2 py-0.5 rounded-md font-medium border ${
              problem.difficulty === 'Easy' ? 'bg-success-50 text-success-700 border-success-200' :
              problem.difficulty === 'Medium' ? 'bg-warning-50 text-warning-700 border-warning-200' :
              'bg-error-50 text-error-700 border-error-200'
            }`}>
              {problem.difficulty}
            </span>
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={toggleBookmark} className="p-2 hover:bg-surface-hover rounded-lg transition-colors text-text-muted">
            {isBookmarked ? <BookmarkCheck className="text-primary-600" fill="currentColor" size={18} /> : <Bookmark size={18} />}
          </button>
          <button className="p-2 hover:bg-surface-hover rounded-lg transition-colors text-text-muted">
            <Settings size={18} />
          </button>
          
          <div className="w-px h-4 bg-border mx-1"></div>
          
          <button 
            onClick={handleRun}
            disabled={executing}
            className="flex items-center gap-2 px-4 py-1.5 bg-surface hover:bg-surface-hover border border-border text-text-primary rounded-lg text-sm font-medium transition-colors"
          >
            <Play size={14} className={executing ? 'animate-pulse text-success-500' : 'text-success-500'} /> 
            {executing ? 'Running...' : 'Run Code'}
          </button>
          
          <button 
            onClick={handleSubmit}
            disabled={executing}
            className="flex items-center gap-2 px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Send size={14} /> {executing ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel */}
        <div className="w-1/2 border-r border-border flex flex-col bg-surface">
          <div className="flex border-b border-border bg-bg-base">
            {['Problem', 'Solutions', 'Test Cases', 'Notes'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-semibold transition-colors ${
                  activeTab === tab ? 'border-b-2 border-primary-600 text-primary-600 bg-surface' : 'text-text-muted hover:text-text-primary hover:bg-surface'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'Problem' && (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {problem.pattern && (
                    <Link to={`/patterns/${problem.pattern._id}`} className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded border border-primary-200 hover:bg-primary-100">
                      Pattern: {problem.pattern.name}
                    </Link>
                  )}
                  {problem.companyTags?.map(c => (
                    <span key={c} className="text-xs bg-bg-base text-text-secondary px-2 py-1 rounded border border-border">{c}</span>
                  ))}
                </div>
                
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap leading-relaxed text-text-primary">{problem.questionText}</p>
                </div>

                {problem.constraints?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-text-primary mb-2">Constraints</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-text-secondary font-mono">
                      {problem.constraints.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                )}
                
                {problem.hints?.length > 0 && (
                  <div className="space-y-2 pt-4">
                    {problem.hints.map((hint, i) => (
                      <details key={i} className="group border border-border rounded-lg bg-bg-base">
                        <summary className="px-4 py-2 cursor-pointer font-medium text-sm flex items-center gap-2 text-text-secondary hover:text-text-primary">
                          <Lightbulb size={14} className="text-warning-500" /> Hint {i + 1}
                        </summary>
                        <div className="px-4 pb-3 text-sm text-text-primary border-t border-border pt-2">
                          {hint}
                        </div>
                      </details>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'Solutions' && (
              <div className="space-y-8">
                {problem.bruteForce && (
                  <div>
                    <h3 className="font-semibold text-lg border-b border-border pb-2 mb-4">Brute Force Approach</h3>
                    <p className="text-sm text-text-secondary mb-4">{problem.bruteForce.explanation}</p>
                    <div className="flex gap-4 text-xs font-mono mb-4 text-text-muted">
                      <span>Time: {problem.bruteForce.timeComplexity}</span>
                      <span>Space: {problem.bruteForce.spaceComplexity}</span>
                    </div>
                    <pre className="bg-bg-base p-4 rounded-lg overflow-x-auto text-sm border border-border">
                      <code>{problem.bruteForce.code}</code>
                    </pre>
                  </div>
                )}
                {problem.optimalSolution && (
                  <div>
                    <h3 className="font-semibold text-lg border-b border-border pb-2 mb-4 text-success-600">Optimal Approach</h3>
                    <p className="text-sm text-text-secondary mb-4">{problem.optimalSolution.explanation}</p>
                    <div className="flex gap-4 text-xs font-mono mb-4 text-text-muted">
                      <span>Time: {problem.optimalSolution.timeComplexity}</span>
                      <span>Space: {problem.optimalSolution.spaceComplexity}</span>
                    </div>
                    <pre className="bg-bg-base p-4 rounded-lg overflow-x-auto text-sm border border-border">
                      <code>{problem.optimalSolution.code}</code>
                    </pre>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'Test Cases' && (
              <div className="space-y-6">
                <h3 className="font-semibold text-lg text-text-primary mb-4">Available Test Cases</h3>
                {problem.examples?.length > 0 ? (
                   problem.examples.map((ex, idx) => (
                     <div key={idx} className="bg-bg-base p-4 rounded-xl border border-border">
                       <div className="font-semibold mb-2">Example {idx + 1}</div>
                       <div className="text-sm font-mono space-y-2">
                         <div><span className="text-text-muted">Input:</span> <span className="text-primary-600">{ex.input}</span></div>
                         <div><span className="text-text-muted">Expected:</span> <span className="text-success-600">{ex.output}</span></div>
                       </div>
                     </div>
                   ))
                ) : (
                   <div className="text-text-muted">No specific test cases provided.</div>
                )}
              </div>
            )}
            
            {activeTab === 'Notes' && (
              <div className="h-[80vh]">
                <TopicNotes topicId={id} />
              </div>
            )}
          </div>
        </div>
        
        {/* Right Panel: Editor */}
        <div className="w-1/2 flex flex-col bg-bg-base">
          
          <SharedCodeEditor 
            questionId={id}
            code={code}
            onChange={setCode}
            language={language}
            onLanguageChange={(lang) => {
              setLanguage(lang);
              if (problem.starterCode && problem.starterCode[lang]) {
                setCode(problem.starterCode[lang]);
              }
            }}
            onRun={(c, l) => {
               setCode(c);
               setLanguage(l);
               handleRun();
            }}
            output={output}
            executing={executing}
            mode="arena"
            onClearOutput={() => setOutput(null)}
          />
        </div>

      </div>
    </div>
  );
}
