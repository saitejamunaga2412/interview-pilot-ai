import React from 'react';
import { Container, Stack } from '../../components/layout';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { ChevronLeft, GraduationCap } from 'lucide-react';
import AcademicDetailsForm from '../../components/profile/AcademicDetailsForm';

export default function AcademicProfile({ dataHook }) {
  const { formData, handleFieldChange, navigateTo } = dataHook;

  return (
    <Container className="py-8 max-w-3xl">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigateTo("dashboard")} leftIcon={<ChevronLeft className="w-4 h-4" />}>
          Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Academic Profile</h1>
          <p className="text-text-secondary mt-1">Manage your educational background.</p>
        </div>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="border-b border-border">
           <CardTitle className="flex items-center gap-2"><GraduationCap className="w-5 h-5 text-emerald-500" /> Education</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
           <AcademicDetailsForm 
              academicData={formData.academic} 
              onChange={(field, value) => handleFieldChange('academic', field, value)} 
              errors={{}} 
           />
        </CardContent>
      </Card>
    </Container>
  );
}
