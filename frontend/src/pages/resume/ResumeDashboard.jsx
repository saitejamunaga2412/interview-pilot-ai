import React from 'react';
import { Container, Grid } from '../../components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileText, FileUp, Sparkles, CheckCircle2, AlertTriangle, FileSearch, HelpCircle, ArrowRight } from 'lucide-react';

export default function ResumeDashboard({ dataHook }) {
  const { resumeData, uploadedAt, atsAnalysis, navigateTo } = dataHook;
  const hasResume = !!resumeData;
  const hasAts = !!atsAnalysis;

  const analysis = atsAnalysis?.analysis || null;
  const overallScore = atsAnalysis?.overallScore ?? analysis?.overall_score ?? null;
  const keywordScore = analysis?.category_scores?.keyword_match ?? null;
  const detectedKeywords = analysis?.detected_keywords || resumeData?.skills || [];
  const missingKeywords = analysis?.missing_keywords || [];
  const topIssues = analysis?.issues || [];

  return (
    <Container className="py-6 space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight font-display animate-fade-in">
            Resume ATS Intelligence
          </h1>
          <p className="text-text-secondary text-sm">Verify and scan your profile formatting and keyword indexing against standard corporate criteria.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {hasResume && (
            <Button
              variant="primary"
              onClick={() => window.location.href = `/interview?role=${encodeURIComponent(atsAnalysis?.targetRole || "Software Engineer")}&mode=resume&fromResume=true`}
              leftIcon={<Sparkles className="w-4 h-4 text-cyan-300" />}
              className="cursor-pointer shadow-lg shadow-primary-500/20 text-xs font-bold"
            >
              Practice From My Resume
            </Button>
          )}
          <Button 
            variant="outline"
            onClick={() => navigateTo('ats')} 
            leftIcon={<FileSearch className="w-4 h-4 text-primary-400" />}
            className="cursor-pointer text-xs"
          >
            ATS Scanner
          </Button>
          <Button 
            variant={hasResume ? "outline" : "primary"}
            onClick={() => navigateTo('upload')} 
            leftIcon={<FileUp className="w-4 h-4" />}
            className="cursor-pointer text-xs"
          >
            {hasResume ? "Upload New Resume" : "Upload Document"}
          </Button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: "Overall Score", 
            value: overallScore !== null ? overallScore : "--", 
            suffix: overallScore !== null ? "%" : "", 
            desc: overallScore !== null ? "ATS structural integrity" : "No ATS scan performed", 
            icon: FileText, 
            color: "text-primary-400" 
          },
          { 
            label: "ATS Matching", 
            value: keywordScore !== null ? keywordScore : "--", 
            suffix: keywordScore !== null ? "%" : "", 
            desc: keywordScore !== null ? "Keyword matching index" : "Run scan to calibrate", 
            icon: FileSearch, 
            color: "text-cyan-400" 
          },
          { 
            label: "Extracted Skills", 
            value: detectedKeywords.length, 
            suffix: "", 
            desc: "Parsed keywords detected", 
            icon: CheckCircle2, 
            color: "text-emerald-400" 
          },
          { 
            label: "Keyword Deficits", 
            value: missingKeywords.length > 0 ? missingKeywords.length : (hasAts ? "0" : "--"), 
            suffix: "", 
            desc: "Role-specific gaps", 
            icon: AlertTriangle, 
            color: "text-amber-400" 
          }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="p-4 rounded-xl border border-border bg-surface flex flex-col justify-between h-28">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">{stat.label}</span>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-extrabold font-mono text-text-primary mt-1">
                  {stat.value}{stat.suffix}
                </p>
                <p className="text-[10px] text-text-muted mt-1 leading-normal">{stat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Structured ATS workspace analysis panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Analysis */}
        <div className="lg:col-span-2 space-y-4">
          {hasAts ? (
            <div className="space-y-4">
              <div className="p-5 rounded-xl border border-border bg-surface space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-mono text-primary-400">
                    ATS Audit Findings ({atsAnalysis.targetRole})
                  </h3>
                  <span className="text-[10px] font-mono text-text-muted">
                    Compatibility: {overallScore}%
                  </span>
                </div>
                
                <div className="space-y-3">
                  {topIssues.slice(0, 2).map((issue, idx) => (
                    <div key={idx} className="space-y-1.5 bg-bg-base/50 p-4 rounded-lg border border-border/80 text-xs">
                      <div className="flex items-center gap-2 font-semibold text-text-primary">
                        <span className={`w-2 h-2 rounded-full ${issue.severity === "high" ? "bg-rose-400" : "bg-amber-400"}`} />
                        <span>{issue.title}</span>
                      </div>
                      {issue.evidence && (
                        <p className="text-[11px] text-text-secondary pl-4 leading-relaxed font-mono">
                          Evidence: {issue.evidence}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 text-text-muted pt-1">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Why does it matter?</span>
                      </div>
                      <p className="text-[11px] text-text-secondary pl-5 leading-relaxed">
                        {issue.why_it_matters}
                      </p>
                      <div className="flex items-center gap-1.5 text-emerald-400 pt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>How to improve:</span>
                      </div>
                      <p className="text-[11px] text-emerald-400/90 pl-5 leading-relaxed font-medium">
                        {issue.how_to_fix}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="primary" onClick={() => navigateTo('ats')} size="sm" className="text-xs">
                    View Full ATS Breakdown
                  </Button>
                  <Button variant="outline" onClick={() => navigateTo('analysis')} size="sm" className="text-xs">
                    View Extraction Details
                  </Button>
                </div>
              </div>
            </div>
          ) : hasResume ? (
            <Card className="border-border bg-surface p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-400 flex items-center justify-center mx-auto">
                <FileSearch className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-text-primary">Resume Uploaded • ATS Scan Pending</h3>
              <p className="text-xs text-text-secondary max-w-md mx-auto">
                Your resume document is stored. Run the ATS Compatibility Analyzer to calculate real keyword alignment and formatting scores.
              </p>
              <Button variant="primary" onClick={() => navigateTo('ats')} className="cursor-pointer text-xs">
                Launch ATS Scanner
              </Button>
            </Card>
          ) : (
            <Card className="border-border border-dashed bg-surface-hover/20 min-h-[260px] flex items-center justify-center">
              <CardContent className="p-8 text-center flex flex-col items-center max-w-md space-y-3">
                <div className="w-12 h-12 bg-primary-500/10 text-primary-400 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-text-primary">No resume analyzed yet</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Upload your professional PDF or DOCX resume to calibrate ATS match density, missing keyword indices, and overall structural score.
                </p>
                <Button variant="primary" onClick={() => navigateTo('upload')} className="mt-2 text-xs">
                  Upload Resume Now
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <Card className="bg-primary-950 border-primary-900 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 rounded-full blur-2xl pointer-events-none" />
            <CardContent className="p-5 space-y-2">
              <h2 className="text-sm font-bold flex items-center gap-2 font-display">
                <Sparkles className="text-amber-400 w-4 h-4" /> ATS Compatibility Tip
              </h2>
              <p className="text-xs text-primary-200 leading-relaxed">
                Corporate screening engines scan both technical keyword density and action-verb metric structures in project descriptions.
              </p>
            </CardContent>
          </Card>

          {hasResume && (
            <div className="p-5 rounded-xl border border-border bg-surface space-y-3">
              <span className="text-[10px] font-mono text-text-muted uppercase">ACTIVE DOCUMENT VERIFIED</span>
              <div>
                <h4 className="text-sm font-bold text-text-primary">{resumeData.name || "resume.pdf"}</h4>
                <p className="text-[11px] text-text-muted mt-0.5">Uploaded {uploadedAt ? uploadedAt.toLocaleDateString() : "Active"}</p>
              </div>
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => navigateTo('ats')} className="text-xs text-primary-400 p-0">
                  Open ATS Dashboard →
                </Button>
              </div>
            </div>
          )}
        </div>

      </div>

    </Container>
  );
}
