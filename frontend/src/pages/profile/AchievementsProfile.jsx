import React from 'react';
import { Container } from '../../components/layout';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/States';
import { ChevronLeft, Trophy } from 'lucide-react';

export default function AchievementsProfile({ dataHook }) {
  const { navigateTo } = dataHook;

  return (
    <Container className="py-8 max-w-3xl">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigateTo("dashboard")} leftIcon={<ChevronLeft className="w-4 h-4" />}>
          Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Achievements</h1>
          <p className="text-text-secondary mt-1">Track your certifications and milestones.</p>
        </div>
      </div>

      <div className="border border-border rounded-xl bg-surface p-1">
         <EmptyState 
           icon={Trophy}
           title="Achievements Coming Soon"
           description="Soon you will be able to add certifications, hackathon awards, and badges earned from the Coding Arena to your profile."
         />
      </div>
    </Container>
  );
}
