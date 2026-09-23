import React from 'react';
import { Container, Stack } from '../../components/layout';
import { ProblemCard } from '../../components/coding/ProblemCard';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States';
import { Button } from '../../components/ui/Button';

export default function CodingSetup({ dataHook }) {
  const { problems, loadingProblems, loadProblem, handleSeed } = dataHook;

  if (loadingProblems) {
    return (
      <Container className="py-12">
        <LoadingState text="Loading Coding Arena..." />
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">AI Coding Arena</h1>
          <p className="text-text-secondary mt-1">Practice algorithmic challenges with real-time AI feedback.</p>
        </div>
        {problems.length === 0 && (
          <Button onClick={handleSeed} variant="primary">
            Seed Sample Problems
          </Button>
        )}
      </div>

      {problems.length === 0 ? (
        <EmptyState 
          title="No problems available" 
          description="The arena is currently empty. Seed some problems to get started."
          className="border border-border rounded-xl"
        />
      ) : (
        <Stack spacing="md" className="max-w-4xl mx-auto">
          {problems.map(p => (
            <ProblemCard 
              key={p._id} 
              problem={p} 
              onSelect={() => loadProblem(p._id)} 
            />
          ))}
        </Stack>
      )}
    </Container>
  );
}
