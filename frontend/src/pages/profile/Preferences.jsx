import React from 'react';
import { Container, Stack } from '../../components/layout';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { ChevronLeft, Settings, Target } from 'lucide-react';
import LearningPreferencesForm from '../../components/profile/LearningPreferencesForm';
import PlacementProfileForm from '../../components/profile/PlacementProfileForm';

export default function Preferences({ dataHook }) {
  const { formData, handleFieldChange, navigateTo } = dataHook;

  return (
    <Container className="py-8 max-w-3xl">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigateTo("dashboard")} leftIcon={<ChevronLeft className="w-4 h-4" />}>
          Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Preferences</h1>
          <p className="text-text-secondary mt-1">Configure your learning goals and career targets.</p>
        </div>
      </div>

      <Stack spacing="lg">
        <Card className="border-border shadow-sm">
          <CardHeader className="border-b border-border">
             <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5 text-warning-500" /> Learning Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
             <LearningPreferencesForm 
                learningData={formData.learningPreferences} 
                onChange={(field, value) => handleFieldChange('learningPreferences', field, value)} 
                errors={{}} 
             />
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="border-b border-border">
             <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-primary-500" /> Placement Profile</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
             <PlacementProfileForm 
                placementData={formData.placementProfile} 
                onChange={(field, value) => handleFieldChange('placementProfile', field, value)} 
                errors={{}} 
             />
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
