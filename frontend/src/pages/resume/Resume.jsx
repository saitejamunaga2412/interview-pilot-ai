import React, { useEffect } from 'react';
import { useResumeData } from '../../hooks/useResumeData';
import { ToastProvider, useToast } from '../../components/ui/Toast';

import ResumeDashboard from './ResumeDashboard';
import ResumeUpload from './ResumeUpload';
import ResumeAnalysis from './ResumeAnalysis';
import ATSAnalysis from './ATSAnalysis';
import ResumeHistory from './ResumeHistory';

function ResumeContent() {
  const dataHook = useResumeData();
  const { addToast } = useToast();

  useEffect(() => {
    if (dataHook.toast) {
      addToast(dataHook.toast.message, dataHook.toast.type);
    }
  }, [dataHook.toast, addToast]);

  const renderView = () => {
    switch (dataHook.activeView) {
      case 'dashboard':
        return <ResumeDashboard dataHook={dataHook} />;
      case 'upload':
        return <ResumeUpload dataHook={dataHook} />;
      case 'analysis':
        return <ResumeAnalysis dataHook={dataHook} />;
      case 'ats':
        return <ATSAnalysis dataHook={dataHook} />;
      case 'history':
        return <ResumeHistory dataHook={dataHook} />;
      default:
        return <ResumeDashboard dataHook={dataHook} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-base transition-colors duration-200 flex flex-col">
      <main className="flex-1 flex flex-col">
        {renderView()}
      </main>
    </div>
  );
}

export default function Resume() {
  return (
    <ToastProvider>
      <ResumeContent />
    </ToastProvider>
  );
}
