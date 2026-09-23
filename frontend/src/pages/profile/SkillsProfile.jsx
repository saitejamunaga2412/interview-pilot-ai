import React from 'react';
import { Container } from '../../components/layout';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { ChevronLeft, Code } from 'lucide-react';
import CareerDetailsForm from '../../components/profile/CareerDetailsForm';

export default function SkillsProfile({ dataHook }) {
  const { formData, handleFieldChange, navigateTo } = dataHook;

  return (
    <Container className="py-8 max-w-3xl">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigateTo("dashboard")} leftIcon={<ChevronLeft className="w-4 h-4" />}>
          Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Skills</h1>
          <p className="text-text-secondary mt-1">Manage your technical and professional skills.</p>
        </div>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="border-b border-border">
           <CardTitle className="flex items-center gap-2"><Code className="w-5 h-5 text-purple-500" /> Career Profile</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
           <CareerDetailsForm 
              careerData={formData.career} 
              onChange={(field, value) => handleFieldChange('career', field, value)} 
              errors={{}} 
           />
        </CardContent>
      </Card>
    </Container>
  );
}
