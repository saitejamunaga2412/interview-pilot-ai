import React from 'react';
import { Container, Grid, Stack } from '../../components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/States';
import { ChevronLeft, User, GraduationCap, Briefcase, Code, FileText, ExternalLink } from 'lucide-react';

export default function ResumeAnalysis({ dataHook }) {
  const { resumeData, navigateTo } = dataHook;

  if (!resumeData) {
    return (
      <Container className="py-12">
        <EmptyState 
          icon={FileText}
          title="Analysis Not Available"
          description="Upload a resume first to view the extracted data analysis."
          action={{ label: "Upload Resume", onClick: () => navigateTo('upload') }}
        />
      </Container>
    );
  }

  return (
    <Container className="py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigateTo("dashboard")} leftIcon={<ChevronLeft className="w-4 h-4" />}>
            Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Data Extraction Analysis</h1>
            <p className="text-text-secondary mt-1">This is exactly what the Applicant Tracking Systems (ATS) read.</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigateTo('ats')}>View ATS Score</Button>
      </div>

      <Grid cols={2} gap="lg">
        {/* Personal & Links */}
        <Card className="border-l-4 border-primary-500 shadow-sm h-full">
          <CardHeader className="bg-surface-hover/50 border-b border-border">
             <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary-500" /> Identity & Contact</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
             <div className="grid grid-cols-3 gap-2 text-sm border-b border-border pb-2">
               <span className="font-semibold text-text-secondary">Name</span>
               <span className="col-span-2 text-text-primary">{resumeData.name || "Missing"}</span>
             </div>
             <div className="grid grid-cols-3 gap-2 text-sm border-b border-border pb-2">
               <span className="font-semibold text-text-secondary">Email</span>
               <span className="col-span-2 text-text-primary">{resumeData.email || "Missing"}</span>
             </div>
             <div className="grid grid-cols-3 gap-2 text-sm border-b border-border pb-2">
               <span className="font-semibold text-text-secondary">Phone</span>
               <span className="col-span-2 text-text-primary">{resumeData.phone || "Missing"}</span>
             </div>
             <div className="pt-2 flex gap-3">
               {resumeData.linkedin && (
                 <a href={resumeData.linkedin} target="_blank" rel="noreferrer" className="text-xs font-semibold flex items-center gap-1 text-primary-600 hover:underline">
                   LinkedIn <ExternalLink className="w-3 h-3" />
                 </a>
               )}
               {resumeData.github && (
                 <a href={resumeData.github} target="_blank" rel="noreferrer" className="text-xs font-semibold flex items-center gap-1 text-text-primary hover:underline">
                   GitHub <ExternalLink className="w-3 h-3" />
                 </a>
               )}
             </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="border-l-4 border-purple-500 shadow-sm h-full">
          <CardHeader className="bg-surface-hover/50 border-b border-border">
             <CardTitle className="flex items-center gap-2"><Code className="w-5 h-5 text-purple-500" /> Technical Skills</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {resumeData.skills?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map((skill, idx) => (
                  <Badge key={idx} variant="secondary">{skill}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-error-600 font-medium">Critical: No technical skills were detected by the parser.</p>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Experience & Projects */}
      <Card className="border-l-4 border-warning-500 shadow-sm">
        <CardHeader className="bg-surface-hover/50 border-b border-border">
           <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-warning-500" /> Work & Projects</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {resumeData.experience?.map((exp, idx) => (
              <div key={idx} className="p-6">
                <Badge variant="warning" className="mb-2">Experience</Badge>
                <p className="text-sm text-text-primary whitespace-pre-wrap">{exp}</p>
              </div>
            ))}
            {resumeData.projects?.map((proj, idx) => (
              <div key={idx} className="p-6">
                <Badge variant="primary" className="mb-2">Project</Badge>
                <h4 className="font-bold text-text-primary mb-2">{proj.title}</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-text-secondary">
                  {proj.highlights?.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {(!resumeData.experience?.length && !resumeData.projects?.length) && (
            <div className="p-8 text-center text-text-muted">No experience or projects extracted. Check formatting.</div>
          )}
        </CardContent>
      </Card>

      {/* Education */}
      <Card className="border-l-4 border-emerald-500 shadow-sm">
        <CardHeader className="bg-surface-hover/50 border-b border-border">
           <CardTitle className="flex items-center gap-2"><GraduationCap className="w-5 h-5 text-emerald-500" /> Education</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Stack spacing="md">
            {resumeData.education?.map((edu, idx) => (
              <div key={idx} className="bg-surface-hover rounded p-4 border border-border">
                <h4 className="font-bold text-text-primary">{edu.degree}</h4>
                <p className="text-sm text-text-secondary mt-1">{edu.institution}</p>
              </div>
            ))}
          </Stack>
        </CardContent>
      </Card>
      
    </Container>
  );
}
