import React from 'react';
import { Container, Grid, Stack } from '../../components/layout';
import { CodingScoreCard } from '../../components/domain/AIPerformanceCards';
import { RecommendationCard } from '../../components/domain/AIInsightCards';
import { Button } from '../../components/ui/Button';
import { ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

export default function CodingResults({ dataHook }) {
  const { activeProblem, result, navigateToWorkspace, startNewProblem } = dataHook;

  if (!result || !result.aiFeedback) {
    return (
      <Container className="py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-12 h-12 text-warning-500 mb-4" />
        <h2 className="text-xl font-bold text-text-primary mb-2">No AI Feedback Available</h2>
        <p className="text-text-secondary mb-6">Run and submit your code to generate an AI review.</p>
        <Button onClick={navigateToWorkspace} variant="primary">Return to Editor</Button>
      </Container>
    );
  }

  const { aiFeedback, status, runtimeMs, memoryKb } = result;
  
  // Approximate a code quality score based on status and feedback length (mock logic since backend doesn't return a direct score out of 100 yet)
  const isAccepted = status === 'Accepted';
  const score = isAccepted ? 100 : 40;

  return (
    <Container className="py-8 relative">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={navigateToWorkspace} leftIcon={<ChevronLeft className="w-4 h-4" />}>
          Back to Code
        </Button>
        <h1 className="text-2xl font-bold text-text-primary">AI Analysis: {activeProblem?.title}</h1>
      </div>

      <Grid cols={3} gap="lg">
        {/* Left Column: Metrics & Complexity */}
        <div className="col-span-3 lg:col-span-1 space-y-6">
          <CodingScoreCard 
            metrics={[
              { label: 'Code Quality Score', value: score, suffix: '/100' },
              { label: 'Runtime', value: runtimeMs || 0, suffix: ' ms' },
              { label: 'Memory', value: memoryKb || 0, suffix: ' KB' }
            ]}
          />
          
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider">Complexity Analysis</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <p className="text-xs text-text-muted font-medium mb-1 uppercase">Time Complexity</p>
                <div className="bg-surface-hover px-3 py-2 rounded border border-border font-mono text-sm text-text-primary">
                  {aiFeedback.timeComplexity || "O(N)"}
                </div>
              </div>
              <div>
                <p className="text-xs text-text-muted font-medium mb-1 uppercase">Space Complexity</p>
                <div className="bg-surface-hover px-3 py-2 rounded border border-border font-mono text-sm text-text-primary">
                  {aiFeedback.spaceComplexity || "O(1)"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Review & Hints */}
        <div className="col-span-3 lg:col-span-2 space-y-6">
          <Card className="border-border shadow-sm h-full">
            <CardHeader className="pb-3 border-b border-border bg-primary-50/30 dark:bg-primary-900/10">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary-600" />
                Comprehensive Code Review
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 prose dark:prose-invert max-w-none text-text-secondary">
              <p className="whitespace-pre-wrap leading-relaxed">{aiFeedback.review}</p>
              
              {aiFeedback.hints?.length > 0 && (
                <div className="mt-8 pt-6 border-t border-border">
                  <h3 className="text-lg font-semibold text-warning-700 dark:text-warning-500 flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5" /> 
                    Optimization Hints
                  </h3>
                  <Stack spacing="sm">
                    {aiFeedback.hints.map((hint, idx) => (
                      <div key={idx} className="bg-warning-50 dark:bg-warning-900/10 border border-warning-200 dark:border-warning-900/30 p-4 rounded-lg text-sm text-warning-900 dark:text-warning-200">
                        {hint}
                      </div>
                    ))}
                  </Stack>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Grid>
      
      <div className="mt-8 pt-8 border-t border-border flex justify-end">
        <Button variant="primary" onClick={startNewProblem}>
          Solve Another Problem
        </Button>
      </div>
    </Container>
  );
}
