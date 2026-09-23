import React from 'react';
import { Container, Grid } from '../../components/layout';
import { GlobalTimeline } from '../../components/history/GlobalTimeline';
import { HistoryFilterBar } from '../../components/history/HistoryFilterBar';
import { Activity, Clock, CheckCircle, Target, Sparkles, Database } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { exportHistoryToCsv } from '../../services/reportService';

export default function ActivityDashboard({ dataHook }) {
  const { 
    filteredActivities, 
    statistics, 
    searchQuery, 
    setSearchQuery, 
    dateRange, 
    setDateRange,
    deleteActivity
  } = dataHook;

  const handleExport = () => {
    const listToExport = (filteredActivities && filteredActivities.length > 0)
      ? filteredActivities
      : (dataHook.rawInterviews || []);

    if (!listToExport || listToExport.length === 0) {
      dataHook.showToast?.("info", "No activity data available to export");
      return;
    }

    const ok = exportHistoryToCsv(listToExport);
    if (ok) {
      dataHook.showToast?.("success", `Exported ${listToExport.length} activity records to CSV`);
    } else {
      dataHook.showToast?.("error", "Failed to generate CSV export");
    }
  };

  const hasHistory = filteredActivities && filteredActivities.length > 0;

  return (
    <Container className="py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight font-display animate-fade-in">
            Preparation Analytics
          </h1>
          <p className="text-text-secondary text-sm">Review your practice sessions, coding progress, and mock interview performance.</p>
        </div>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Sessions", value: filteredActivities?.length || 0, desc: "Completed tasks", icon: Activity, color: "text-primary-400" },
          { label: "Practice Accuracy", value: statistics?.averageScore || 0, suffix: "%", desc: "Overall correct attempts", icon: Target, color: "text-emerald-400" },
          { label: "Milestones", value: filteredActivities?.filter(a => a.status?.toLowerCase() === 'completed').length || 0, desc: "Mastered modules", icon: CheckCircle, color: "text-cyan-400" },
          { label: "Status", value: hasHistory ? "Active" : "New", desc: "Preparation state", icon: Clock, color: "text-indigo-400" }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="p-4 rounded-xl border border-border bg-surface flex flex-col justify-between h-28">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">{stat.label}</span>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-extrabold font-mono text-text-primary mt-1">
                  {stat.value}{stat.suffix}
                </p>
                <p className="text-[10px] text-text-muted mt-1 leading-normal">{stat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <Grid cols={3} gap="lg">
        
        {/* Main Timeline Area */}
        <div className="col-span-3 lg:col-span-2 space-y-4">
          <HistoryFilterBar 
             searchQuery={searchQuery}
             setSearchQuery={setSearchQuery}
             dateRange={dateRange}
             setDateRange={setDateRange}
             onExport={handleExport}
          />
          
          {hasHistory ? (
            <GlobalTimeline activities={filteredActivities} onDelete={deleteActivity} />
          ) : (
            <div className="p-12 text-center bg-surface border border-dashed border-border rounded-2xl space-y-3">
              <Clock className="w-10 h-10 text-text-muted mx-auto animate-pulse" />
              <h3 className="font-semibold text-text-primary text-sm">No Activity Recorded Yet</h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                Complete a few practice problems or mock interviews to unlock your performance insights.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar Breakdown */}
        <div className="col-span-3 lg:col-span-1 space-y-6">
           <Card className="border-border bg-surface">
             <CardHeader className="border-b border-border">
               <CardTitle className="text-sm font-bold uppercase font-mono tracking-wider text-primary-400">Activity Breakdown</CardTitle>
             </CardHeader>
             <CardContent className="p-4 space-y-3">
                {[
                  { name: "Mock Interviews", count: filteredActivities?.filter(a => a.type === 'interview').length || 0 },
                  { name: "Coding Challenges", count: filteredActivities?.filter(a => a.type === 'coding').length || 0 },
                  { name: "Aptitude Tests", count: filteredActivities?.filter(a => a.type === 'aptitude').length || 0 },
                  { name: "Resume ATS Scans", count: filteredActivities?.filter(a => a.type === 'resume').length || 0 }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-xs border-b border-border/50 pb-2 last:border-0 last:pb-0">
                    <span className="text-text-secondary">{item.name}</span>
                    <span className="font-bold text-text-primary font-mono">{item.count}</span>
                  </div>
                ))}
             </CardContent>
           </Card>
        </div>

      </Grid>

    </Container>
  );
}
