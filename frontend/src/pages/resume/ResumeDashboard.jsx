import React from 'react';
import { Container, Grid } from '../../components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileText, FileUp, Sparkles, CheckCircle2, AlertTriangle, FileSearch, HelpCircle } from 'lucide-react';

export default function ResumeDashboard({ dataHook }) {
  const { resumeData, uploadedAt, navigateTo } = dataHook;
  const hasResume = !!resumeData;

  // Real mock structure parsed or default
  const missingKeywords = hasResume ? ["Redux", "Docker", "RESTful APIs", "TypeScript", "CI/CD"] : [];

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
              onClick={() => window.location.href = '/interview?role=Software%20Engineer&mode=resume&fromResume=true'}
              leftIcon={<Sparkles className="w-4 h-4 text-cyan-300" />}
              className="cursor-pointer shadow-lg shadow-primary-500/20"
            >
              Practice From My Resume
            </Button>
          )}
          <Button 
            variant={hasResume ? "outline" : "primary"}
            onClick={() => navigateTo('upload')} 
            leftIcon={<FileUp className="w-4 h-4" />}
            className="cursor-pointer"
          >
            {hasResume ? "Upload New Resume" : "Upload Document"}
          </Button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Overall Score", value: hasResume ? "85" : "0", suffix: "%", desc: "ATS structural integrity", icon: FileText, color: "text-primary-400" },
          { label: "ATS Matching", value: hasResume ? "72" : "0", suffix: "%", desc: "Keyword matching index", icon: FileSearch, color: "text-cyan-400" },
          { label: "Extracted Skills", value: resumeData?.skills?.length || 0, suffix: "", desc: "Parsed keywords detected", icon: CheckCircle2, color: "text-emerald-400" },
          { label: "Keyword Deficits", value: hasResume ? "5" : "0", suffix: "", desc: "Critical missing words", icon: AlertTriangle, color: "text-amber-400" }
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
        
        {/* Left Column: Analysis (What is wrong? Why? What should I do?) */}
        <div className="lg:col-span-2 space-y-4">
          {hasResume ? (
            <div className="space-y-4">
              
              {/* ATS Problem Card */}
              <div className="p-5 rounded-xl border border-border bg-surface space-y-4">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-mono text-primary-400">ATS Structural Audit</h3>
                
                <div className="space-y-4">
                  {/* Issue 1 */}
                  <div className="space-y-1 bg-bg-base/50 p-4 rounded-lg border border-border/80">
                    <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>What is wrong?</span>
                    </div>
                    <p className="text-xs text-text-secondary pl-4 leading-relaxed">
                      Critical SDE keywords are missing: <span className="font-mono text-primary-400">{missingKeywords.join(", ")}</span>.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-semibold text-text-primary pt-2">
                      <HelpCircle className="w-3.5 h-3.5 text-text-muted" />
                      <span>Why does it matter?</span>
                    </div>
                    <p className="text-xs text-text-secondary pl-4 leading-relaxed">
                      Automated ATS screeners filter out applications without a high match density for key project stack components.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-semibold text-text-primary pt-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>What should I change?</span>
                    </div>
                    <p className="text-xs text-emerald-400/90 pl-4 leading-relaxed font-bold">
                      Add a dedicated "Technical Skills Inventory" and list Redux, Docker, and TypeScript in your core summary section.
                    </p>
                  </div>

                  {/* Issue 2 */}
                  <div className="space-y-1 bg-bg-base/50 p-4 rounded-lg border border-border/80">
                    <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>What is wrong?</span>
                    </div>
                    <p className="text-xs text-text-secondary pl-4 leading-relaxed">
                      Missing quantifiable performance metrics in professional experience section.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-semibold text-text-primary pt-2">
                      <HelpCircle className="w-3.5 h-3.5 text-text-muted" />
                      <span>Why does it matter?</span>
                    </div>
                    <p className="text-xs text-text-secondary pl-4 leading-relaxed">
                      Quantified bullet points boost resume relevance score, verifying business impact and structural quality.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-semibold text-text-primary pt-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>What should I change?</span>
                    </div>
                    <p className="text-xs text-emerald-400/90 pl-4 leading-relaxed font-bold">
                      Format experience bullets to highlight business numbers (e.g. "optimized load time by 30%" or "secured 98% uptime").
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="primary" onClick={() => navigateTo('analysis')} size="sm">View Extraction details</Button>
                  <Button variant="outline" onClick={() => navigateTo('ats')} size="sm">Check Match scoring</Button>
                </div>
              </div>

            </div>
          ) : (
            <Card className="border-border border-dashed bg-surface-hover/20 min-h-[300px] flex items-center justify-center">
              <CardContent className="p-8 text-center flex flex-col items-center max-w-md space-y-3">
                <div className="w-12 h-12 bg-primary-500/10 text-primary-400 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-text-primary">Document Parser Empty State</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Upload your professional PDF resume to calibrate ATS match density, missing keyword indices, and overall structural score.
                </p>
                <Button variant="primary" onClick={() => navigateTo('upload')} className="mt-2">Upload Resume Now</Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: PDF summary & AI recommendations */}
        <div className="space-y-4">
          <Card className="bg-primary-950 border-primary-900 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 rounded-full blur-2xl pointer-events-none" />
            <CardContent className="p-5 space-y-2">
              <h2 className="text-sm font-bold flex items-center gap-2 font-display">
                <Sparkles className="text-amber-400 w-4 h-4" /> AI Placement Insight
              </h2>
              <p className="text-xs text-primary-200 leading-relaxed">
                By resolving the key keyword deficits and formatting experience bullets with numbers, you can increase SDE eligibility scoring by up to 15%.
              </p>
            </CardContent>
          </Card>

          {hasResume && (
            <div className="p-5 rounded-xl border border-border bg-surface space-y-3">
              <span className="text-[10px] font-mono text-text-muted uppercase">ACTIVE DOCUMENT VERIFIED</span>
              <div>
                <h4 className="text-sm font-bold text-text-primary">{resumeData.name || "resume.pdf"}</h4>
                <p className="text-[11px] text-text-muted mt-0.5">Uploaded {uploadedAt ? uploadedAt.toLocaleDateString() : "Pending"}</p>
              </div>
            </div>
          )}
        </div>

      </div>

    </Container>
  );
}
