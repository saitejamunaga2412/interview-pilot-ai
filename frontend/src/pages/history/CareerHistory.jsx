import React from 'react';
import { Container } from '../../components/layout';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/States';
import { ChevronLeft, Target } from 'lucide-react';

export default function CareerHistory({ dataHook }) {
  const { navigateTo } = dataHook;

  return (
    <Container className="py-8 max-w-4xl">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigateTo("dashboard")} leftIcon={<ChevronLeft className="w-4 h-4" />}>
          Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Career History</h1>
          <p className="text-text-secondary mt-1">Review your past career analyses.</p>
        </div>
      </div>

      <div className="border border-border rounded-xl bg-surface p-1">
         <EmptyState 
           icon={Target}
           title="Career History Coming Soon"
           description="The backend does not yet provide a historical stream of your career readiness reports. They will appear here in the future."
         />
      </div>
    </Container>
  );
}
