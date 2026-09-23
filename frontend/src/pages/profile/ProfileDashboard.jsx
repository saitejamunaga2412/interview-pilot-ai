import React from 'react';
import { Container, Grid, Stack } from '../../components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MetricGrid } from '../../components/domain/DashboardLayout';
import { KPICard } from '../../components/domain/DashboardAnalytics';
import ProfileCompletionCard from '../../components/profile/ProfileCompletionCard';
import { User, GraduationCap, Settings, Sparkles, FileText, Code, Brain } from 'lucide-react';
import { RecommendationCard } from '../../components/domain/AIInsightCards';

export default function ProfileDashboard({ dataHook }) {
  const { originalUser, completion, navigateTo } = dataHook;

  return (
    <Container className="py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            Welcome, {originalUser?.name || "User"}
          </h1>
          <p className="text-text-secondary mt-1">Manage your identity and career personalization settings.</p>
        </div>
      </div>

      <Grid cols={3} gap="lg">
        {/* Left Column: Quick Actions & Completion */}
        <div className="col-span-3 lg:col-span-2 space-y-6">
           <ProfileCompletionCard completion={completion} showAction={false} />
           
           <Card className="border-border">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-lg">Profile Sections</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                   
                   <div className="p-6 hover:bg-surface-hover transition-colors cursor-pointer" onClick={() => navigateTo('personal')}>
                     <User className="w-8 h-8 text-primary-500 mb-3" />
                     <h3 className="font-bold text-text-primary">Personal Details</h3>
                     <p className="text-sm text-text-secondary mt-1">Update your bio, location, and contact information.</p>
                   </div>
                   
                   <div className="p-6 hover:bg-surface-hover transition-colors cursor-pointer border-t md:border-t-0" onClick={() => navigateTo('academic')}>
                     <GraduationCap className="w-8 h-8 text-emerald-500 mb-3" />
                     <h3 className="font-bold text-text-primary">Academic Profile</h3>
                     <p className="text-sm text-text-secondary mt-1">Manage your degree, college, and graduation year.</p>
                   </div>
                   
                   <div className="p-6 hover:bg-surface-hover transition-colors cursor-pointer border-t" onClick={() => navigateTo('skills')}>
                     <Code className="w-8 h-8 text-purple-500 mb-3" />
                     <h3 className="font-bold text-text-primary">Technical Skills</h3>
                     <p className="text-sm text-text-secondary mt-1">View the skills extracted from your resume and coding tests.</p>
                   </div>
                   
                   <div className="p-6 hover:bg-surface-hover transition-colors cursor-pointer border-t" onClick={() => navigateTo('preferences')}>
                     <Settings className="w-8 h-8 text-warning-500 mb-3" />
                     <h3 className="font-bold text-text-primary">Preferences</h3>
                     <p className="text-sm text-text-secondary mt-1">Configure your daily study goals and target roles.</p>
                   </div>

                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Right Column: AI Insight */}
        <div className="col-span-3 lg:col-span-1 space-y-6">
           <RecommendationCard 
              title="Profile Optimization"
              description="Adding your GitHub profile link can increase your Resume Score by up to 5 points."
              type="suggestion"
              actionText="Update Profile"
              onAction={() => navigateTo('personal')}
           />

           <Card className="bg-primary-900 border-primary-800 text-white shadow-md">
             <CardContent className="p-6">
               <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
                 <Sparkles className="text-warning-400 w-5 h-5" /> AI Identity
               </h2>
               <p className="text-sm text-primary-200">
                 Your profile data feeds directly into InterviewPilot and the Career Advisor to generate personalized mock sessions and roadmap graphs. Keep it updated!
               </p>
             </CardContent>
           </Card>
        </div>
      </Grid>
    </Container>
  );
}
