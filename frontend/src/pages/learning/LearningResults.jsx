import React from 'react';
import { Container, Stack, Grid } from '../../components/layout';
import { Button } from '../../components/ui/Button';
import { ChevronLeft } from 'lucide-react';
import { TopicStrengthCard, TopicWeaknessCard } from '../../components/domain/AIKnowledgeVisualization';

export default function LearningResults({ dataHook }) {
  const { dashboardData, navigateTo } = dataHook;
  const weakTopics = dashboardData?.weakTopics || [];

  return (
    <Container className="py-8">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigateTo("dashboard")} leftIcon={<ChevronLeft className="w-4 h-4" />}>
          Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Learning Analytics</h1>
          <p className="text-text-secondary mt-1">Review your AI-generated knowledge graph.</p>
        </div>
      </div>

      <Grid cols={2} gap="lg">
        {/* We are reusing Layer 4 AI Knowledge Visualization Components here */}
        <TopicWeaknessCard 
          topics={weakTopics.map(w => ({ name: w.replace("_", " "), score: 30 }))}
          isEmpty={weakTopics.length === 0}
        />
        
        <TopicStrengthCard 
          topics={[{ name: "Arrays & Strings", score: 95 }, { name: "Hash Tables", score: 88 }]} // Mock strengths as backend only provides weakTopics currently
        />
      </Grid>
    </Container>
  );
}
