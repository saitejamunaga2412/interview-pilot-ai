import React, { useEffect } from 'react';
import { useHistoryData } from '../../hooks/useHistoryData';
import { ToastProvider, useToast } from '../../components/ui/Toast';

import ActivityDashboard from './ActivityDashboard';
import InterviewHistory from './InterviewHistory';
import CodingHistory from './CodingHistory';
import LearningHistory from './LearningHistory';
import ResumeHistory from './ResumeHistory';
import CareerHistory from './CareerHistory';
import { LoadingState } from '../../components/ui/States';

function HistoryContent() {
  const dataHook = useHistoryData();
  const { addToast } = useToast();

  useEffect(() => {
    if (dataHook.toast) {
      addToast(dataHook.toast.message, dataHook.toast.type);
    }
  }, [dataHook.toast, addToast]);

  const renderView = () => {
    if (dataHook.loading) {
       return <div className="py-20"><LoadingState text="Loading History..." /></div>;
    }

    switch (dataHook.activeView) {
      case 'dashboard':
        return <ActivityDashboard dataHook={dataHook} />;
      case 'interview':
        return <InterviewHistory dataHook={dataHook} />;
      case 'coding':
        return <CodingHistory dataHook={dataHook} />;
      case 'learning':
        return <LearningHistory dataHook={dataHook} />;
      case 'resume':
        return <ResumeHistory dataHook={dataHook} />;
      case 'career':
        return <CareerHistory dataHook={dataHook} />;
      default:
        return <ActivityDashboard dataHook={dataHook} />;
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

export default function History() {
  return (
    <ToastProvider>
      <HistoryContent />
    </ToastProvider>
  );
}
