import React from 'react';
import { cn } from '../../utils/cn';
import { Container, Section, Grid, Stack } from '../layout';

export const DashboardLayout = ({ children, className }) => (
  <Container className={cn("py-8 min-h-screen", className)}>
    {children}
  </Container>
);

export const AnalyticsSection = ({ children, title, description, className }) => (
  <Section className={cn("pt-0 pb-8", className)}>
    {(title || description) && (
      <div className="mb-6">
        {title && <h2 className="text-2xl font-bold text-text-primary">{title}</h2>}
        {description && <p className="text-text-secondary mt-1">{description}</p>}
      </div>
    )}
    {children}
  </Section>
);

export const MetricGrid = ({ children, cols = 4, className }) => (
  <Grid cols={cols} gap="md" className={cn("mb-8", className)}>
    {children}
  </Grid>
);

export const InsightPanel = ({ children, className }) => (
  <div className={cn("p-6 rounded-xl bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/30 mb-8", className)}>
    <div className="flex items-center gap-2 mb-4">
      <h3 className="text-lg font-semibold text-text-primary">AI Insights</h3>
    </div>
    <Grid cols={3} gap="md">
      {children}
    </Grid>
  </div>
);

export const ChartSection = ({ children, className }) => (
  <Grid cols={2} gap="lg" className={cn("mb-8", className)}>
    {children}
  </Grid>
);

export const RecommendationPanel = ({ children, className }) => (
  <div className={cn("mb-8", className)}>
    <h3 className="text-lg font-semibold text-text-primary mb-4">Recommendations</h3>
    <Stack spacing="md">
      {children}
    </Stack>
  </div>
);
