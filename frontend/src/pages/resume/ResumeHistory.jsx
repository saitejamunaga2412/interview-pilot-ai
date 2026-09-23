import React from 'react';
import { Container } from '../../components/layout';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/States';
import { ChevronLeft, History } from 'lucide-react';

export default function ResumeHistory({ dataHook }) {
  const { navigateTo } = dataHook;

  return (
    <Container className="py-8 max-w-3xl">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigateTo("dashboard")} leftIcon={<ChevronLeft className="w-4 h-4" />}>
          Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Resume History</h1>
          <p className="text-text-secondary mt-1">Track your iterations and score improvements over time.</p>
        </div>
      </div>

      <div className="border border-border rounded-xl bg-surface p-1">
         <EmptyState 
           icon={History}
           title="Version History Coming Soon"
           description="The backend currently stores only the latest uploaded resume. Once versioning support is added to the database, your upload timeline and score comparisons will appear here."
         />
      </div>
    </Container>
  );
}
