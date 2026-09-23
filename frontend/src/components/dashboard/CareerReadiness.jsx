import React from 'react';
import { Grid } from '../layout';
import { CareerReadinessGauge, ConfidenceMeter, SkillMatchMeter } from '../domain/AIMetrics';

export const CareerReadiness = ({ memory, globalDashboard, className }) => {
  const readiness = globalDashboard?.placementReadinessScore ?? memory?.placementReadinessScore;
  const confidence = memory?.confidenceScore; // Derived or fallback
  const skillMatch = memory?.skillMatchScore; // Derived or fallback

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-text-primary mb-4">Career Readiness</h3>
      <Grid cols={3} gap="md">
        <CareerReadinessGauge 
          score={readiness ?? 0} 
          isEmpty={readiness === undefined} 
        />
        <ConfidenceMeter 
          score={confidence ?? 0} 
          isEmpty={confidence === undefined} 
        />
        <SkillMatchMeter 
          score={skillMatch ?? 0} 
          isEmpty={skillMatch === undefined} 
        />
      </Grid>
    </div>
  );
};
