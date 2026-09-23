import React from 'react';
import { Container } from '../../components/layout';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/States';
import { ChevronLeft, FolderGit2 } from 'lucide-react';

export default function ProjectsProfile({ dataHook }) {
  const { navigateTo } = dataHook;

  return (
    <Container className="py-8 max-w-3xl">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigateTo("dashboard")} leftIcon={<ChevronLeft className="w-4 h-4" />}>
          Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Projects</h1>
          <p className="text-text-secondary mt-1">Showcase your best work.</p>
        </div>
      </div>

      <div className="border border-border rounded-xl bg-surface p-1">
         <EmptyState 
           icon={FolderGit2}
           title="Projects Profile Coming Soon"
           description="Currently, projects are automatically extracted from your Resume. In the future, you will be able to manually add, edit, and link GitHub repositories here."
         />
      </div>
    </Container>
  );
}
