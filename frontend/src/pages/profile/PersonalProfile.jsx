import React from 'react';
import { Container, Stack } from '../../components/layout';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { ChevronLeft, User } from 'lucide-react';
import PersonalDetailsForm from '../../components/profile/PersonalDetailsForm';
import CompetitiveProfilesForm from '../../components/profile/CompetitiveProfilesForm';

export default function PersonalProfile({ dataHook }) {
  const { formData, handleFieldChange, navigateTo } = dataHook;

  return (
    <Container className="py-8 max-w-3xl">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigateTo("dashboard")} leftIcon={<ChevronLeft className="w-4 h-4" />}>
          Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Personal Details</h1>
          <p className="text-text-secondary mt-1">Manage your basic identity information.</p>
        </div>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="border-b border-border">
           <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary-500" /> Identity</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
           <PersonalDetailsForm 
              formData={formData} 
              onChange={(field, value) => handleFieldChange(null, field, value)} 
              errors={{}} 
           />
           <CompetitiveProfilesForm 
              formData={formData}
              onChange={(field, value) => handleFieldChange('career', field, value)}
              errors={{}}
           />
        </CardContent>
      </Card>
    </Container>
  );
}
