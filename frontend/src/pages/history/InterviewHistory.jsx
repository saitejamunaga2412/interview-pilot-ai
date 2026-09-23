import React from 'react';
import { Container } from '../../components/layout';
import { Button } from '../../components/ui/Button';
import { GlobalTimeline } from '../../components/history/GlobalTimeline';
import { ChevronLeft } from 'lucide-react';

export default function InterviewHistory({ dataHook }) {
  const { filteredActivities, deleteActivity, navigateTo } = dataHook;

  return (
    <Container className="py-8 max-w-4xl">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigateTo("dashboard")} leftIcon={<ChevronLeft className="w-4 h-4" />}>
          Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Interview History</h1>
          <p className="text-text-secondary mt-1">Review your past mock interview sessions.</p>
        </div>
      </div>

      <GlobalTimeline activities={filteredActivities} onDelete={deleteActivity} />
    </Container>
  );
}
