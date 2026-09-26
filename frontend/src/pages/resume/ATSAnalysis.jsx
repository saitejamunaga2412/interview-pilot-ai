import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, FileSearch, Sparkles, CheckCircle2, AlertTriangle, 
  AlertCircle, ArrowRight, UploadCloud, FileText, Check, HelpCircle, 
  RefreshCw, TrendingUp, Award, Clock, History, ExternalLink, ShieldAlert, Download
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Container } from '../../components/layout';
import { Button } from '../../components/ui/Button';
import { exportAtsReportPdf } from '../../services/reportService';

const TARGET_ROLES = [
  "Software Engineer",
  "ML Engineer",
  "Data Scientist",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Data Analyst",
  "DevOps Engineer"
];

export default function ATSAnalysis({ dataHook }) {
  const { user } = useAuth();
  const { 
    resumeData, 
    atsAnalysis, 
    atsHistory, 
    atsLoading, 
    atsAnalyzing, 
    atsStep, 
    atsError, 
    runAtsAnalysis, 
    navigateTo 
  } = dataHook;

  const userProfileRole = user?.career?.targetRole || user?.targetRole || "";
  const [selectedRole, setSelectedRole] = useState(userProfileRole);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showImproveModal, setShowImproveModal] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userProfileRole && !selectedRole) {
      setSelectedRole(userProfileRole);
    }
  }, [userProfileRole]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleTriggerAnalysis = () => {
    if (!selectedRole) {
      return;
    }
    runAtsAnalysis(selectedFile, selectedRole);
  };

  const analysisData = atsAnalysis?.analysis || null;
  const overallScore = atsAnalysis?.overallScore ?? analysisData?.overall_score ?? null;
  const categoryScores = analysisData?.category_scores || atsAnalysis?.categoryScores || {};

  const getScoreColor = (score) => {
    if (score === null || score === undefined || score === "INSUFFICIENT_DATA") return "text-text-muted";
    if (score >= 80) return "text-emerald-400";
    if (score >= 65) return "text-cyan-400";
    if (score >= 50) return "text-amber-400";
    return "text-rose-400";
  };

  const getScoreBarColor = (score) => {
    if (score === null || score === undefined || score === "INSUFFICIENT_DATA") return "bg-surface-3";
    if (score >= 80) return "bg-emerald-500";
    if (score >= 65) return "bg-cyan-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-rose-500";
  };

  const getSeverityBadge = (sev) => {
    const s = String(sev).toLowerCase();
    if (s === "high") {
      return <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1"><span>🔴</span> HIGH</span>;
    }
    if (s === "medium") {
      return <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1"><span>🟡</span> MEDIUM</span>;
    }
    return <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1"><span>🔵</span> LOW</span>;
  };

  return (
    <Container className="py-6 max-w-5xl space-y-6">
      
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigateTo("dashboard")} 
            leftIcon={<ChevronLeft className="w-4 h-4" />}
            className="cursor-pointer"
          >
            Dashboard
          </Button>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight font-display">
              Resume ATS Analyzer
            </h1>
            <p className="text-text-secondary text-xs mt-0.5">
              Upload your resume and analyze how well it matches your target role.
            </p>
          </div>
        </div>

        {atsHistory && atsHistory.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            leftIcon={<History className="w-4 h-4 text-primary-400" />}
            className="cursor-pointer self-end sm:self-auto text-xs"
          >
            {showHistory ? "Hide Scan History" : `Scan History (${atsHistory.length})`}
          </Button>
        )}
      </div>

      {/* History Drawer if toggled */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-2xl border border-border bg-surface-2/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">Past ATS Analyses</span>
                <span className="text-[11px] text-text-muted">Strictly scoped to your user account</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {atsHistory.map((item, idx) => (
                  <div key={item._id || idx} className="p-3 rounded-xl border border-border bg-surface flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-text-primary">{item.targetRole}</p>
                      <p className="text-[10px] text-text-muted">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Saved"}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-base font-extrabold font-mono ${getScoreColor(item.overallScore)}`}>
                        {item.overallScore}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload & Role Control Panel */}
      <div className="p-5 sm:p-6 rounded-2xl border border-border bg-surface/90 shadow-sm backdrop-blur space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* File Picker Zone */}
          <div className="md:col-span-6">
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
              onChange={handleFileChange}
              className="hidden" 
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer flex items-center gap-3.5 ${
                dragActive 
                  ? "border-primary-500 bg-primary-500/10" 
                  : selectedFile 
                  ? "border-emerald-500/50 bg-emerald-500/5" 
                  : "border-border hover:border-border-hover bg-surface-2/40"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center shrink-0">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div className="truncate flex-1">
                <p className="text-xs font-semibold text-text-primary truncate">
                  {selectedFile ? selectedFile.name : (resumeData?.name ? `Active: ${resumeData.name}` : "Upload Resume (PDF or DOCX)")}
                </p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB selected` : "Drag and drop or browse from computer (Max 5MB)"}
                </p>
              </div>
              {selectedFile && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 shrink-0">
                  Ready
                </span>
              )}
            </div>
          </div>

          {/* Target Role Selector */}
          <div className="md:col-span-3">
            <label className="block text-[11px] font-mono text-text-muted uppercase mb-1.5">
              Target Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2.5 text-xs text-text-primary font-medium focus:outline-none focus:border-primary-500 transition-colors"
            >
              {!selectedRole && (
                <option value="" disabled>
                  Select a target role...
                </option>
              )}
              {TARGET_ROLES.map((r) => (
                <option key={r} value={r} className="bg-surface text-text-primary">
                  {r}
                </option>
              ))}
            </select>
            {!selectedRole && (
              <p className="text-[10px] text-amber-400 mt-1">
                Select a target role to perform a personalized ATS analysis.
              </p>
            )}
          </div>

          {/* Analyze Button */}
          <div className="md:col-span-3 flex items-end">
            <Button
              variant="primary"
              onClick={handleTriggerAnalysis}
              disabled={atsAnalyzing || !selectedRole}
              className="w-full h-[42px] cursor-pointer shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 font-bold text-xs disabled:opacity-50"
            >
              {atsAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Analyze Resume</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {atsError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{atsError}</span>
          </div>
        )}
      </div>

      {/* Loading Progress State */}
      {atsAnalyzing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 rounded-2xl border border-primary-500/30 bg-surface/95 text-center space-y-5 shadow-xl"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-primary-400 mx-auto">
            <Sparkles className="w-7 h-7 animate-pulse text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary font-display">
              Analyzing your resume...
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              Evaluating alignment for target role: <strong className="text-text-primary">{selectedRole}</strong>
            </p>
          </div>

          {/* Stepper matching prompt specifications */}
          <div className="max-w-xs mx-auto space-y-2.5 text-xs text-left">
            <div className="flex items-center gap-2.5 text-emerald-400 font-medium">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Resume uploaded</span>
            </div>
            <div className={`flex items-center gap-2.5 ${atsStep >= 2 ? "text-emerald-400 font-medium" : "text-text-muted"}`}>
              {atsStep >= 2 ? <Check className="w-4 h-4 text-emerald-400" /> : <span className="w-4 text-center">●</span>}
              <span>Resume text extracted</span>
            </div>
            <div className={`flex items-center gap-2.5 ${atsStep >= 3 ? "text-emerald-400 font-medium" : (atsStep >= 2 ? "text-cyan-400 font-medium" : "text-text-muted")}`}>
              {atsStep >= 3 ? <Check className="w-4 h-4 text-emerald-400" /> : <span className="w-4 text-center">●</span>}
              <span>Analyzing role alignment</span>
            </div>
            <div className={`flex items-center gap-2.5 ${atsStep >= 4 ? "text-emerald-400 font-medium" : "text-text-muted"}`}>
              {atsStep >= 4 ? <Check className="w-4 h-4 text-emerald-400" /> : <span className="w-4 text-center">○</span>}
              <span>Building ATS report</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State when no analysis has been run */}
      {!atsAnalyzing && !analysisData && (
        <div className="p-12 rounded-2xl border border-dashed border-border bg-surface/50 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border text-text-muted flex items-center justify-center mx-auto">
            <FileSearch className="w-7 h-7 text-primary-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">No resume analyzed yet.</h3>
            <p className="text-xs text-text-secondary mt-1 max-w-md mx-auto">
              Upload your resume and select a target role above to calculate your authentic InterviewPilot AI ATS compatibility score.
            </p>
          </div>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => fileInputRef.current?.click()}
            leftIcon={<UploadCloud className="w-4 h-4" />}
            className="cursor-pointer text-xs"
          >
            Upload Resume
          </Button>
        </div>
      )}

      {/* Full ATS Analysis Results Dashboard */}
      {!atsAnalyzing && analysisData && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Main Score Hero Card */}
          <div className="p-6 sm:p-8 rounded-3xl border border-border bg-gradient-to-br from-surface to-surface-2 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              
              <div className="space-y-2.5 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-300 text-[11px] font-mono font-bold tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>INTERVIEWPILOT AI ATS COMPATIBILITY ANALYSIS</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary font-display">
                  {atsAnalysis?.targetRole || selectedRole}
                </h2>
                <p className="text-xs text-text-secondary max-w-xl leading-relaxed">
                  Compatibility analysis based on the selected target role.
                </p>
                <p className="text-xs text-emerald-400/90 font-medium">
                  {overallScore >= 80 
                    ? "Your resume demonstrates strong technical depth and alignment with the selected target role." 
                    : "Your resume has several strengths but some improvements could increase its alignment with the selected role."}
                </p>
                <p className="text-[10px] text-text-muted italic pt-1">
                  Note: The InterviewPilot AI ATS Compatibility Score is an analysis aid, not a guarantee of employer ATS behavior.
                </p>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportAtsReportPdf(atsAnalysis, selectedRole || atsAnalysis?.targetRole)}
                    leftIcon={<Download className="w-4 h-4 text-primary-400" />}
                    className="cursor-pointer text-xs"
                  >
                    Download ATS Report (PDF)
                  </Button>
                </div>
              </div>

              {/* Radial Score Gauge */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-bg-base/70 border border-border/80 min-w-[210px] shadow-inner text-center">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">ATS Compatibility</span>
                <div className="flex items-baseline gap-1 my-1">
                  <span className={`text-6xl font-black font-mono tracking-tight ${getScoreColor(overallScore)}`}>
                    {overallScore}
                  </span>
                  <span className="text-xl font-mono text-text-muted">/100</span>
                </div>
                <span className="text-[11px] font-medium text-text-secondary mt-0.5">
                  {overallScore >= 80 ? "High Compatibility" : (overallScore >= 65 ? "Moderate Alignment" : "Needs Optimization")}
                </span>
              </div>

            </div>
          </div>

          {/* Category Scores Breakdown */}
          <div className="p-5 sm:p-6 rounded-2xl border border-border bg-surface space-y-4">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <div>
                <h3 className="text-sm font-bold text-text-primary font-display uppercase tracking-wider">CATEGORY SCORES</h3>
                <p className="text-[11px] text-text-muted">Objective structural evaluation weighted according to engineering screener standards.</p>
              </div>
              <span className="text-[10px] font-mono text-text-muted uppercase">Total 100%</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Keyword Match", key: "keyword_match", weight: "25%" },
                { label: "Skills Alignment", key: "skills_alignment", weight: "20%" },
                { label: "Experience Relevance", key: "experience_relevance", weight: "15%" },
                { label: "Projects", key: "projects_relevance", weight: "15%" },
                { label: "Education", key: "education", weight: "5%" },
                { label: "Structure", key: "structure", weight: "5%" },
                { label: "Formatting", key: "formatting", weight: "5%" },
                { label: "Content Quality", key: "content_quality", weight: "10%" },
              ].map((cat) => {
                const score = categoryScores[cat.key];
                const isInsufficient = score === "INSUFFICIENT_DATA" || score === null || score === undefined;
                return (
                  <div key={cat.key} className="p-3.5 rounded-xl border border-border/80 bg-surface-2/40 flex flex-col justify-between space-y-2">
                    <div className="flex justify-between items-start text-xs">
                      <span className="font-semibold text-text-primary">{cat.label}</span>
                      <span className="text-[10px] font-mono text-text-muted">{cat.weight}</span>
                    </div>

                    <div className="flex items-end justify-between">
                      <span className={`text-xl font-bold font-mono ${getScoreColor(score)}`}>
                        {!isInsufficient ? `${score}/100` : "Insufficient Data"}
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-surface-3 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(score)}`}
                        style={{ width: `${!isInsufficient ? score : 0}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Keyword Analysis Section */}
          <div className="p-5 sm:p-6 rounded-2xl border border-border bg-surface space-y-4">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <div>
                <h3 className="text-sm font-bold text-text-primary font-display uppercase tracking-wider">KEYWORD ANALYSIS</h3>
                <p className="text-[11px] text-text-muted">Detected and recommended technologies for {selectedRole}.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Detected Keywords */}
              <div className="p-4 rounded-xl border border-border/80 bg-surface-2/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Detected Keywords ({analysisData.detected_keywords?.length || 0})</span>
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-mono">Verified in Resume</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {analysisData.detected_keywords && analysisData.detected_keywords.length > 0 ? (
                    analysisData.detected_keywords.map((kw, i) => (
                      <span 
                        key={i} 
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-mono font-medium flex items-center gap-1.5"
                      >
                        <Check className="w-3 h-3 text-emerald-400" />
                        {kw}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-text-muted italic">No role-specific keywords detected yet.</span>
                  )}
                </div>
              </div>

              {/* Missing Relevant Keywords */}
              <div className="p-4 rounded-xl border border-border/80 bg-surface-2/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Missing / Relevant Keywords ({analysisData.missing_keywords?.length || 0})</span>
                  </h4>
                  <span className="text-[10px] text-amber-400 font-mono">Role Expectation</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {analysisData.missing_keywords && analysisData.missing_keywords.length > 0 ? (
                    analysisData.missing_keywords.map((kw, i) => (
                      <span 
                        key={i} 
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-mono font-medium flex items-center gap-1.5"
                      >
                        <span className="font-bold text-amber-400">!</span>
                        {kw}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-emerald-400 font-medium">All standard baseline keywords present!</span>
                  )}
                </div>
                <p className="text-[10px] text-text-muted italic pt-1 border-t border-border/50">
                  IMPORTANT: Add relevant skills ONLY if you genuinely have practical experience with them. Never fabricate skills.
                </p>
              </div>

            </div>

            {/* Categorized Framework View */}
            {analysisData.keyword_categories && Object.keys(analysisData.keyword_categories).length > 0 && (
              <div className="pt-2 border-t border-border/70 space-y-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted block">Keyword Categories</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {Object.entries(analysisData.keyword_categories).map(([catName, data]) => (
                    <div key={catName} className="p-3 rounded-lg border border-border/60 bg-bg-base/40 text-xs space-y-2">
                      <p className="font-bold text-text-primary border-b border-border/40 pb-1">{catName}</p>
                      <div className="space-y-1">
                        <span className="text-[10px] text-text-muted uppercase block">Detected:</span>
                        <div className="flex flex-wrap gap-1">
                          {data.detected?.length > 0 ? (
                            data.detected.map((kw, idx) => (
                              <span key={idx} className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                ✓ {kw}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-text-muted italic">None</span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] text-text-muted uppercase block">Missing Relevant:</span>
                        <div className="flex flex-wrap gap-1">
                          {data.missing?.length > 0 ? (
                            data.missing.slice(0, 4).map((kw, idx) => (
                              <span key={idx} className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded">
                                ! {kw}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-emerald-400 font-mono">None</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Top Issues Identified with Evidence & How-To-Fix */}
          <div className="p-5 sm:p-6 rounded-2xl border border-border bg-surface space-y-4">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <div>
                <h3 className="text-sm font-bold text-text-primary font-display uppercase tracking-wider">RESUME ISSUES</h3>
                <p className="text-[11px] text-text-muted">Evidence-based audit of formatting, keyword density, and bullet phrasing.</p>
              </div>
              <span className="text-[10px] font-mono text-text-muted uppercase">
                {analysisData.issues?.length || 0} Findings
              </span>
            </div>

            <div className="space-y-4">
              {analysisData.issues && analysisData.issues.length > 0 ? (
                analysisData.issues.map((issue, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-border/90 bg-surface-2/40 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-text-primary flex items-center gap-2">
                        <span className="font-mono text-primary-400">{idx + 1}.</span>
                        <span>{issue.title}</span>
                      </h4>
                      <div className="flex items-center gap-2">
                        {issue.category && (
                          <span className="px-2 py-0.5 rounded bg-surface-3 text-[9px] font-mono text-text-muted uppercase">
                            {issue.category}
                          </span>
                        )}
                        {getSeverityBadge(issue.severity)}
                      </div>
                    </div>

                    {issue.evidence && (
                      <div className="text-xs text-text-secondary pl-4 border-l-2 border-primary-500/40 font-mono text-[11px] bg-bg-base/40 p-2.5 rounded space-y-0.5">
                        <strong className="text-text-muted font-sans block text-[10px] uppercase tracking-wider">Problem / Evidence:</strong>
                        <p className="text-text-primary">{issue.evidence}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-text-muted font-semibold text-[11px]">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Why it matters:</span>
                        </div>
                        <p className="text-text-secondary text-[11px] leading-relaxed pl-5">
                          {issue.why_it_matters}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>How to improve:</span>
                        </div>
                        <p className="text-emerald-300/90 text-[11px] leading-relaxed pl-5 font-medium">
                          {issue.how_to_fix}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-text-muted">
                  No structural formatting or keyword deficits detected.
                </div>
              )}
            </div>
          </div>

          {/* Bullet Improvement Guidance */}
          {analysisData.bullet_improvements && analysisData.bullet_improvements.length > 0 && (
            <div className="p-5 sm:p-6 rounded-2xl border border-border bg-surface space-y-4">
              <div className="border-b border-border/70 pb-3">
                <h3 className="text-sm font-bold text-text-primary font-display uppercase tracking-wider">PROJECT BULLETS ANALYSIS</h3>
                <p className="text-[11px] text-text-muted">Transform task-based bullets into measurable engineering achievements.</p>
              </div>

              <div className="space-y-3">
                {analysisData.bullet_improvements.map((bullet, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-border/80 bg-surface-2/30 space-y-2.5 text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-text-muted uppercase">Current:</span>
                      <p className="text-text-secondary italic mt-0.5 pl-3 border-l-2 border-amber-500/40">
                        "{bullet.current_bullet}"
                      </p>
                    </div>
                    {bullet.problem && (
                      <div>
                        <span className="text-[10px] font-mono text-amber-400 uppercase">Problem:</span>
                        <p className="text-text-secondary mt-0.5 pl-3 border-l-2 border-amber-500/40">
                          {bullet.problem}
                        </p>
                      </div>
                    )}
                    <div className="pt-1">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase">Recommended Style:</span>
                      <p className="text-text-primary font-medium mt-0.5 pl-3 border-l-2 border-emerald-500">
                        {bullet.suggested_structure}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-text-muted italic pt-1 border-t border-border/50">
                IMPORTANT: Never invent achievements, metrics, or technologies.
              </p>
            </div>
          )}

          {/* Strengths & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Strengths */}
            <div className="p-5 rounded-2xl border border-border bg-surface space-y-3">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Verified Profile Strengths</span>
              </h3>
              <ul className="space-y-2 pt-1 text-xs">
                {analysisData.strengths?.map((st, i) => (
                  <li key={i} className="flex items-start gap-2 text-text-secondary">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="p-5 rounded-2xl border border-border bg-surface space-y-3">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Recommendations</span>
              </h3>
              <ol className="space-y-2 pt-1 text-xs">
                {analysisData.recommendations?.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-text-secondary">
                    <span className="font-mono text-primary-400 font-bold shrink-0">{i + 1}.</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ol>
            </div>

          </div>

          {/* Action CTA Bar */}
          <div className="p-6 rounded-2xl border border-primary-500/30 bg-primary-950/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white">Ready to elevate your resume and interview preparation?</h4>
              <p className="text-xs text-primary-200 mt-0.5">
                Apply ATS improvements or practice questions tailored to your resume stack.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                variant="outline"
                onClick={() => setShowImproveModal(true)}
                leftIcon={<Sparkles className="w-4 h-4 text-amber-300" />}
                className="cursor-pointer text-xs font-bold border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
              >
                Improve My Resume
              </Button>
              <Button
                variant="primary"
                onClick={() => window.location.href = `/interview?role=${encodeURIComponent(selectedRole)}&mode=resume&fromResume=true`}
                leftIcon={<Sparkles className="w-4 h-4 text-cyan-300" />}
                className="cursor-pointer shadow-lg shadow-primary-500/20 text-xs font-bold"
              >
                Practice Interview From Resume
              </Button>
            </div>
          </div>

        </div>
      )}

      {/* Improve Resume Guidance Modal */}
      <AnimatePresence>
        {showImproveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-text-primary font-display">Improve Your Resume Checklist</h3>
                </div>
                <button 
                  onClick={() => setShowImproveModal(false)}
                  className="text-text-muted hover:text-text-primary text-xs font-mono"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-3 text-xs text-text-secondary">
                <p>Follow these evidence-based principles to raise your InterviewPilot AI ATS Compatibility Score:</p>
                <div className="space-y-2 bg-surface-2/40 p-3 rounded-xl border border-border/80">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Add Quantifiable Metrics:</strong> Update bullets with scale, latency improvements, user counts, or test coverage where truthful.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Align Genuine Keywords:</strong> Add relevant technologies (e.g. {analysisData?.missing_keywords?.slice(0, 3).join(", ") || "Docker, REST API"}) ONLY if you have real hands-on experience.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Standard Section Headings:</strong> Ensure your resume has explicit headers: Technical Skills, Experience, Projects, Education.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Clean Formatting:</strong> Avoid multi-column text tables or non-standard symbols that can confuse automated screeners.</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/70">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowImproveModal(false)}
                  className="text-xs"
                >
                  Got It
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => {
                    setShowImproveModal(false);
                    fileInputRef.current?.click();
                  }}
                  leftIcon={<UploadCloud className="w-4 h-4" />}
                  className="text-xs"
                >
                  Upload Updated Resume
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </Container>
  );
}
