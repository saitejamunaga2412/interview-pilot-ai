import React from 'react';
import { Container, Grid } from '../../components/layout';
import { Button } from '../../components/ui/Button';
import { UploadCard } from '../../components/resume/UploadCard';
import { ChevronLeft } from 'lucide-react';

export default function ResumeUpload({ dataHook }) {
  const { uploadResume, uploading, uploadedAt, navigateTo } = dataHook;

  return (
    <Container className="py-8 max-w-3xl">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigateTo("dashboard")} leftIcon={<ChevronLeft className="w-4 h-4" />}>
          Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Upload Resume</h1>
          <p className="text-text-secondary mt-1">Our AI will extract, parse, and analyze your experience.</p>
        </div>
      </div>
      
      <UploadCard 
        onUpload={uploadResume} 
        uploading={uploading} 
        currentFileAt={uploadedAt} 
      />
    </Container>
  );
}
