import React from 'react';
import { Container } from '../../components/layout';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/States';
import { ChevronLeft, FileSearch } from 'lucide-react';

export default function ATSAnalysis({ dataHook }) {
  const { navigateTo } = dataHook;

  return (
    <Container className="py-8 max-w-3xl">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigateTo("dashboard")} leftIcon={<ChevronLeft className="w-4 h-4" />}>
          Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">ATS Compatibility</h1>
          <p className="text-text-secondary mt-1">Deep dive into formatting, keyword optimization, and readability.</p>
        </div>
      </div>

      <div className="border border-border rounded-xl bg-surface p-1">
         <EmptyState 
           icon={FileSearch}
           title="ATS Scanner Under Construction"
           description="The backend does not yet provide ATS compatibility scores, formatting checks, or missing keywords. The UI is ready to render these metrics once the API fields are exposed."
         />
      </div>
    </Container>
  );
}
