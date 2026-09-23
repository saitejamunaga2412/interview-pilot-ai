import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Switch } from '../ui/Switch';
import { Button } from '../ui/Button';
import { FaBrain, FaBuilding, FaCheckCircle, FaSparkles } from 'react-icons/fa';

const ROLE_SUGGESTIONS = [
  "Frontend Developer",
  "React Developer",
  "Python Developer",
  "Java Developer",
  "MERN Stack Developer",
  "DevOps Engineer",
  "Data Scientist",
  "Full Stack Engineer"
];

const COMPANY_PACKS = [
  {
    id: "tcs",
    name: "TCS Digital / Ninja",
    badge: "Mass Recruiter",
    role: "Full Stack Engineer (TCS Digital)",
    level: "intermediate",
    duration: 30,
    timed: true,
  },
  {
    id: "infosys",
    name: "Infosys DSE / SP",
    badge: "Specialist",
    role: "Specialist Programmer (Infosys DSE)",
    level: "advanced",
    duration: 45,
    timed: true,
  },
  {
    id: "amazon",
    name: "Amazon SDE-1",
    badge: "Tier-1 Product",
    role: "Software Development Engineer (Amazon SDE-1)",
    level: "advanced",
    duration: 45,
    timed: true,
  },
  {
    id: "accenture",
    name: "Accenture ASE",
    badge: "Campus Drive",
    role: "Associate Software Engineer (Accenture ASE)",
    level: "beginner",
    duration: 30,
    timed: true,
  },
  {
    id: "google",
    name: "Google SWE",
    badge: "Top Tier",
    role: "Software Engineer (Google SWE)",
    level: "advanced",
    duration: 45,
    timed: true,
  }
];

export const SetupCard = ({
  user,
  role,
  setRole,
  level,
  setLevel,
  isTimedInterview,
  setIsTimedInterview,
  duration,
  setDuration,
  generateQuestions,
  loading,
  hasResults,
  startNewInterview
}) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  const applyCompanyPack = (pack) => {
    setSelectedCompanyId(pack.id);
    setRole(pack.role);
    setLevel(pack.level);
    setIsTimedInterview(pack.timed);
    setDuration(pack.duration);
  };

  return (
    <Card className="max-w-2xl mx-auto border-border">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Interview Setup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-2">
        {/* 1-Click Company Placement Packs */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <FaBuilding className="text-primary-500" />
              <span>1-Click Company Placement Packs</span>
            </span>
            <span className="text-[10px] font-mono text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded border border-primary-500/20">
              Quick Preset
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {COMPANY_PACKS.map((pack) => {
              const isSelected = selectedCompanyId === pack.id || role === pack.role;
              return (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => applyCompanyPack(pack)}
                  disabled={loading}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? "bg-primary-500/15 border-primary-500 ring-2 ring-primary-500/30 shadow-md text-text-primary"
                      : "bg-surface-2 border-border/80 text-text-secondary hover:border-primary-500/50 hover:text-text-primary"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface border border-border text-text-muted">
                      {pack.badge}
                    </span>
                    {isSelected && (
                      <FaCheckCircle className="text-primary-400 text-xs shrink-0" />
                    )}
                  </div>
                  <span className="text-xs font-bold truncate block">{pack.name}</span>
                  <span className="text-[10px] text-text-muted capitalize">
                    {pack.level} · {pack.duration}m
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {user?.resumeData && (
          <div className="flex items-center gap-3 p-4 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 rounded-lg text-indigo-700 dark:text-indigo-400">
            <FaBrain className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              Contextual AI Active: Your interview will be personalized using your uploaded resume.
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Target Role</label>
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Frontend Developer"
              list="role-suggestions"
              disabled={loading}
              fullWidth
            />
            <datalist id="role-suggestions">
              {ROLE_SUGGESTIONS.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Difficulty Level</label>
            <Select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              disabled={loading}
              fullWidth
            >
              <option value="" disabled>Select Level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Select>
          </div>

          <div className="p-4 rounded-lg border border-border bg-surface-hover flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">Timed Interview</p>
              <p className="text-sm text-text-secondary">Simulate real interview time pressure</p>
            </div>
            <Switch
              checked={isTimedInterview}
              onChange={(e) => setIsTimedInterview(e.target.checked)}
              disabled={loading}
            />
          </div>

          {isTimedInterview && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Duration (Minutes)</label>
              <Select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                disabled={loading}
                fullWidth
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
              </Select>
            </div>
          )}
        </div>

        <div className="pt-4 flex justify-end">
          {hasResults ? (
            <Button onClick={startNewInterview} variant="outline" className="w-full">
              Reset & Start New
            </Button>
          ) : (
            <Button 
              onClick={generateQuestions} 
              isLoading={loading}
              disabled={!role || !level || loading}
              className="w-full"
            >
              {loading ? "Generating..." : "Generate Interview"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
