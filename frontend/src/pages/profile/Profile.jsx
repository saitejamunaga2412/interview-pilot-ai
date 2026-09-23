import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, GraduationCap, Target, Award, Code2, Briefcase, 
  Sparkles, CheckCircle2, AlertCircle, Edit3, X, Save, 
  ChevronRight, Building2, BookOpen, Layers, ShieldCheck,
  TrendingUp, Database, Wrench, RefreshCw, Star, Compass, Clock
} from 'lucide-react';
import { useProfileData } from '../../hooks/useProfileData';
import { ToastProvider, useToast } from '../../components/ui/Toast';
import { LoadingState } from '../../components/ui/States';
import { cn } from '../../utils/cn';

// Drawer edit section sub-components (unchanged functional APIs)
function EditPersonalSection({ formData, handleFieldChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5 font-mono">Full Name</label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => handleFieldChange(null, 'name', e.target.value)}
          className="input-base"
          placeholder="e.g. Alex Morgan"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5 font-mono">Phone Number</label>
          <input
            type="text"
            value={formData.phoneNumber || ''}
            onChange={(e) => handleFieldChange(null, 'phoneNumber', e.target.value)}
            className="input-base"
            placeholder="+91 9876543210"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5 font-mono">Gender</label>
          <select
            value={formData.gender || ''}
            onChange={(e) => handleFieldChange(null, 'gender', e.target.value)}
            className="input-base"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function EditAcademicSection({ formData, handleFieldChange }) {
  const academic = formData.academic || {};
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5 font-mono">College / University</label>
        <input
          type="text"
          value={academic.college || ''}
          onChange={(e) => handleFieldChange('academic', 'college', e.target.value)}
          className="input-base"
          placeholder="e.g. Stanford University"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5 font-mono">Degree</label>
          <input
            type="text"
            value={academic.degree || ''}
            onChange={(e) => handleFieldChange('academic', 'degree', e.target.value)}
            className="input-base"
            placeholder="e.g. B.Tech / B.S."
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5 font-mono">Branch / Specialization</label>
          <input
            type="text"
            value={academic.branch || ''}
            onChange={(e) => handleFieldChange('academic', 'branch', e.target.value)}
            className="input-base"
            placeholder="e.g. Computer Science & Engineering"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5 font-mono">Graduation Year</label>
          <input
            type="number"
            value={academic.graduationYear || ''}
            onChange={(e) => handleFieldChange('academic', 'graduationYear', e.target.value ? parseInt(e.target.value, 10) : '')}
            className="input-base"
            placeholder="e.g. 2026"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5 font-mono">CGPA / Percentage</label>
          <input
            type="text"
            value={academic.cgpa || ''}
            onChange={(e) => handleFieldChange('academic', 'cgpa', e.target.value)}
            className="input-base"
            placeholder="e.g. 8.5 / 10.0"
          />
        </div>
      </div>
    </div>
  );
}

function EditCareerSection({ formData, handleFieldChange }) {
  const career = formData.career || {};
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5 font-mono">Target Primary Role</label>
        <input
          type="text"
          value={career.targetRole || ''}
          onChange={(e) => handleFieldChange('career', 'targetRole', e.target.value)}
          className="input-base"
          placeholder="e.g. ML Engineering / Software Engineer"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5 font-mono">Experience Level</label>
        <select
          value={career.currentSkillLevel || ''}
          onChange={(e) => handleFieldChange('career', 'currentSkillLevel', e.target.value)}
          className="input-base"
        >
          <option value="">Select Level</option>
          <option value="Fresher">Fresher</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5 font-mono">Target Companies (Comma separated)</label>
        <input
          type="text"
          value={Array.isArray(career.targetCompanies) ? career.targetCompanies.join(', ') : (career.targetCompanies || '')}
          onChange={(e) => {
            const list = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
            handleFieldChange('career', 'targetCompanies', list);
          }}
          className="input-base"
          placeholder="Google, Microsoft, TCS, Amazon"
        />
      </div>
    </div>
  );
}

function EditSkillsSection({ formData, handleFieldChange }) {
  const skills = formData.placementProfile?.skills || formData.career?.skills || formData.academic?.skills || [];
  const [skillInput, setSkillInput] = useState('');

  const addSkill = () => {
    if (!skillInput.trim()) return;
    const current = Array.isArray(skills) ? [...skills] : [];
    if (!current.includes(skillInput.trim())) {
      current.push(skillInput.trim());
      handleFieldChange('placementProfile', 'skills', current);
      handleFieldChange('career', 'skills', current);
    }
    setSkillInput('');
  };

  const removeSkill = (s) => {
    const current = skills.filter(item => item !== s);
    handleFieldChange('placementProfile', 'skills', current);
    handleFieldChange('career', 'skills', current);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5 font-mono">Core Technical Skills</label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
            className="input-base"
            placeholder="e.g. Python, Machine Learning, SQL"
          />
          <button
            type="button"
            onClick={addSkill}
            className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold font-mono cursor-pointer"
          >
            ADD
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {Array.isArray(skills) && skills.map((s, idx) => (
            <span 
              key={idx} 
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-2 border border-border text-xs font-mono"
            >
              {s}
              <button 
                type="button" 
                onClick={() => removeSkill(s)} 
                className="text-text-muted hover:text-red-400 font-bold ml-1 cursor-pointer"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const { addToast, showToast: contextShowToast } = useToast();
  const showToast = React.useCallback((msg, variant = 'default') => {
    if (contextShowToast) {
      contextShowToast(msg, variant);
    } else {
      addToast({ title: msg, variant });
    }
  }, [addToast, contextShowToast]);

  const { 
    loading, 
    user: originalUser, 
    completion, 
    saveProfile,
    loadProfile
  } = useProfileData();

  // Drawer edit triggers
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState('personal'); // personal, academic, career, skills

  // Edit draft model matching backend structures
  const [editForm, setEditForm] = useState(null);

  const handleFieldChange = (parentKey, fieldName, val) => {
    setEditForm(prev => {
      if (!prev) return prev;
      if (parentKey) {
        return {
          ...prev,
          [parentKey]: {
            ...prev[parentKey],
            [fieldName]: val
          }
        };
      }
      return {
        ...prev,
        [fieldName]: val
      };
    });
  };

  const handleDrawerSave = async () => {
    if (!editForm) return;
    const response = await saveProfile(editForm);
    if (response?.success) {
      showToast("Profile credentials synchronized successfully", "success");
      setDrawerOpen(false);
      if (loadProfile) await loadProfile();
    } else {
      showToast(response?.message || "Sync failure", "error");
    }
  };

  const initEditMode = React.useCallback((userData) => {
    const u = userData || originalUser || {};
    const academic = u.academic || {};
    const career = u.career || {};
    const rawSkills = career.skills || u.placementProfile?.skills || academic.skills || u.skills || u.resumeData?.skills || [];
    const skillsList = Array.isArray(rawSkills)
      ? rawSkills.map(s => typeof s === 'object' && s !== null ? (s.name || s.skill || '') : String(s)).filter(Boolean)
      : typeof rawSkills === 'string' ? rawSkills.split(',').map(s => s.trim()).filter(Boolean) : [];

    setEditForm({
      name: u.name || '',
      phoneNumber: u.phoneNumber || '',
      gender: u.gender || '',
      academic: {
        college: academic.college || '',
        university: academic.university || '',
        degree: academic.degree || '',
        branch: academic.branch || '',
        graduationYear: academic.graduationYear || '',
        cgpa: academic.cgpa || ''
      },
      career: {
        targetRole: career.targetRole || '',
        targetCompanies: Array.isArray(career.targetCompanies) ? career.targetCompanies : (career.targetCompanies ? [career.targetCompanies] : []),
        currentSkillLevel: career.currentSkillLevel || 'Fresher',
        skills: skillsList
      },
      placementProfile: {
        skills: skillsList
      }
    });
  }, [originalUser]);

  React.useEffect(() => {
    if (originalUser) {
      initEditMode(originalUser);
    }
  }, [originalUser, initEditMode]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingState text="Loading Placement Identity..." />
      </div>
    );
  }

  const user = originalUser || {};
  const academic = user.academic || {};
  const career = user.career || {};
  const placement = user.placementProfile || {};
  const completenessPct = completion?.percentage ?? user.completionPercentage ?? 0;

  const rawSkills = career.skills || placement.skills || academic.skills || user.skills || user.resumeData?.skills || [];
  const skillsList = Array.isArray(rawSkills) 
    ? rawSkills.map(s => typeof s === 'object' && s !== null ? (s.name || s.skill || '') : String(s)).filter(Boolean)
    : typeof rawSkills === 'string' ? rawSkills.split(',').map(s => s.trim()).filter(Boolean) : [];

  const targetRole = career.targetRole || user.career?.targetRole || "";
  const skillLevel = career.currentSkillLevel || user.career?.currentSkillLevel || "";
  const degreeCollegeText = [academic.degree, academic.college].filter(Boolean).join(' • ');
  const readinessVal = placement.readinessScore || user.readinessScore || 0;

  // Visual radar topics: DSA, Aptitude, CS Fundamentals, Coding, Communication
  const constellationSkills = [
    { name: "DSA", value: user?.skillRatings?.dsa || 80 },
    { name: "Aptitude", value: user?.skillRatings?.aptitude || 75 },
    { name: "CS Fundamentals", value: user?.skillRatings?.csFundamentals || 70 },
    { name: "Coding", value: user?.skillRatings?.coding || 85 },
    { name: "Communication", value: user?.skillRatings?.communication || 90 }
  ];

  const userInitials = user.name 
    ? user.name.trim().slice(0, 2).toUpperCase() 
    : (user.email ? user.email.slice(0, 2).toUpperCase() : 'ME');

  return (
    <div className="space-y-8 pb-20 animate-fade-in text-sans text-left">
      
      {/* Title & Subtitle */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight font-display">
          MY PROFILE
        </h1>
        <p className="text-xs text-text-secondary">
          Your placement identity and preparation profile.
        </p>
      </div>

      {/* Hero identity section */}
      <div className="rounded-2xl border border-border bg-surface p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-xl shadow-md border border-white/10 shrink-0 overflow-hidden relative">
              {user.profilePhoto ? (
                <img 
                  src={user.profilePhoto.startsWith('http') ? user.profilePhoto : `${import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') : (import.meta.env.PROD ? '' : '')}${user.profilePhoto}`} 
                  alt={user.name || "Profile"} 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : null}
              <span className={user.profilePhoto ? "hidden" : "block"}>
                {userInitials}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-text-primary tracking-tight font-display">
                {user.name || 'User Profile'}
              </h2>
              {user.email && (
                <p className="text-xs text-text-secondary mt-0.5">
                  {user.email}
                </p>
              )}
              {degreeCollegeText && (
                <p className="text-xs text-text-secondary mt-1">
                  {degreeCollegeText}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {targetRole && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-500/15 text-primary-300 border border-primary-500/30 font-bold">
                    TARGET: {targetRole}
                  </span>
                )}
                {skillLevel && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    LEVEL: {skillLevel}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 text-right">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-text-muted">Profile Completeness:</span>
              <span className="font-bold font-mono text-primary-400 text-sm">{completenessPct}%</span>
            </div>
            <button
              onClick={() => { setDrawerTab('personal'); setDrawerOpen(true); }}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-primary-600 hover:bg-primary-500 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              EDIT PROFILE
            </button>
          </div>
        </div>
      </div>

      {/* Core Profile Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Skill Profile & Career Target */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Skill Profile Radar Visualizer */}
          <div className="bg-surface rounded-2xl border border-border p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold font-mono text-primary-400 uppercase tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              <span>SKILL PROFILE</span>
            </h3>
            
            <div className="flex flex-col md:flex-row items-center justify-around gap-6 pt-2">
              {/* SVG Polygon Constellation Graphic */}
              <div className="relative w-48 h-48">
                <svg className="w-full h-full" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="45" className="fill-none stroke-border/30" strokeWidth="0.5" />
                  <circle cx="60" cy="60" r="30" className="fill-none stroke-border/20" strokeWidth="0.5" />
                  <circle cx="60" cy="60" r="15" className="fill-none stroke-border/10" strokeWidth="0.5" />
                  {/* Axis lines */}
                  {[0, 72, 144, 216, 288].map((angle, idx) => {
                    const rad = (angle - 90) * Math.PI / 180;
                    const x = 60 + 45 * Math.cos(rad);
                    const y = 60 + 45 * Math.sin(rad);
                    return <line key={idx} x1="60" y1="60" x2={x} y2={y} className="stroke-border/40" strokeWidth="0.5" />;
                  })}
                  {/* Skill Constellation Polygon */}
                  <polygon
                    points={constellationSkills.map((sk, idx) => {
                      const angle = idx * 72 - 90;
                      const rad = angle * Math.PI / 180;
                      const valRadius = (sk.value / 100) * 45;
                      const x = 60 + valRadius * Math.cos(rad);
                      const y = 60 + valRadius * Math.sin(rad);
                      return `${x},${y}`;
                    }).join(" ")}
                    className="fill-primary-500/10 stroke-primary-400"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>

              {/* Skill Checklist breakdown */}
              <div className="space-y-2.5 font-mono text-xs w-full md:max-w-xs">
                {constellationSkills.map((sk, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-border/40 pb-1.5 last:border-0">
                    <span className="text-text-secondary">{sk.name}</span>
                    <span className="font-bold text-primary-300">{sk.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {skillsList.length > 0 && (
              <div className="pt-4 border-t border-border/40">
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block mb-2 font-bold">
                  Active Technical Skills ({skillsList.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {skillsList.map((skill, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-surface-2 border border-border text-xs font-mono text-primary-300 font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Career Target parameters */}
          <div className="bg-surface rounded-2xl border border-border p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold font-mono text-primary-400 uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>CAREER TARGET</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-bg-base/40 rounded-xl border border-border">
                <span className="text-[9px] text-text-muted uppercase block">Target Role</span>
                <span className="text-text-primary font-bold block mt-1">{targetRole}</span>
              </div>
              <div className="p-3 bg-bg-base/40 rounded-xl border border-border">
                <span className="text-[9px] text-text-muted uppercase block">Experience Level</span>
                <span className="text-text-primary font-bold block mt-1">{skillLevel}</span>
              </div>
              <div className="p-3 bg-bg-base/40 rounded-xl border border-border">
                <span className="text-[9px] text-text-muted uppercase block">Preferred Language</span>
                <span className="text-text-primary font-bold block mt-1">{user?.learningPreferences?.preferredLanguage || 'Python'}</span>
              </div>
              <div className="p-3 bg-bg-base/40 rounded-xl border border-border">
                <span className="text-[9px] text-text-muted uppercase block">Target Companies</span>
                <span className="text-text-primary font-bold block mt-1">
                  {Array.isArray(career.targetCompanies) && career.targetCompanies.length > 0 
                    ? career.targetCompanies.map(c => String(c).toUpperCase()).join(', ') 
                    : 'Not specified'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Profile Health & Preparation Status */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Profile Health / Completeness */}
          <div className="bg-surface rounded-2xl border border-border p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold font-mono text-primary-400 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>PROFILE COMPLETENESS</span>
            </h3>
            <div className="space-y-3 font-mono text-xs">
              {[
                { 
                  label: "Identity", 
                  ok: !!(user.name && user.email), 
                  actionLabel: "Edit Identity", 
                  action: () => { setDrawerTab('personal'); setDrawerOpen(true); } 
                },
                { 
                  label: "Education", 
                  ok: !!(academic.college || academic.degree), 
                  actionLabel: "Add Education", 
                  action: () => { setDrawerTab('academic'); setDrawerOpen(true); } 
                },
                { 
                  label: "Target Role", 
                  ok: !!career.targetRole, 
                  actionLabel: "Set Target", 
                  action: () => { setDrawerTab('career'); setDrawerOpen(true); } 
                },
                { 
                  label: "Skills", 
                  ok: skillsList.length > 0, 
                  actionLabel: "Add Skills", 
                  action: () => { setDrawerTab('skills'); setDrawerOpen(true); } 
                },
                { 
                  label: "Resume", 
                  ok: !!(career.resumeUrl || user.resumeUrl || user.resumeData), 
                  actionLabel: "Upload Resume", 
                  action: () => { window.location.href = '/resume'; } 
                },
                { 
                  label: "Interview", 
                  ok: placement.interviewScore !== undefined || user.interviewScore !== undefined, 
                  actionLabel: "Take Interview", 
                  action: () => { window.location.href = '/interview'; } 
                }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center pb-2 border-b border-border/40 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${item.ok ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {item.ok ? '✓' : '○'}
                    </span>
                    <span className="text-text-secondary">{item.label}</span>
                  </div>
                  {item.ok ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      COMPLETED
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={item.action}
                      className="text-[10px] font-bold text-primary-300 hover:text-white bg-primary-500/15 hover:bg-primary-500/30 px-2 py-0.5 rounded border border-primary-500/30 transition-all cursor-pointer"
                    >
                      {item.actionLabel}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Preparation Status */}
          <div className="bg-surface rounded-2xl border border-border p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold font-mono text-primary-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>PREPARATION STATUS</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <span className="font-bold block">Active Learning Track</span>
                <span className="text-[11px] text-text-muted">CS Foundations & DSA modules underway</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-2 border border-border text-text-secondary">
                <span className="font-bold block text-text-primary">Next Recommended Step</span>
                <span className="text-[11px] text-text-muted">Complete 1 Mock Interview to calibrate score</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Slide-Over Profile Edit Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black z-50 pointer-events-auto"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 right-0 w-full sm:w-[480px] bg-surface border-l border-border z-50 flex flex-col p-6 shadow-2xl overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                <div>
                  <h3 className="font-bold text-base text-text-primary font-display uppercase">Edit Profile Credentials</h3>
                  <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider">Sync settings live</span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg bg-surface-2 hover:bg-surface-hover text-text-muted hover:text-text-primary cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Drawer Tabs */}
              <div className="flex gap-1.5 border-b border-border/50 pb-2 mb-4 overflow-x-auto no-scrollbar shrink-0">
                {[
                  { id: 'personal', label: 'IDENTITY' },
                  { id: 'academic', label: 'EDUCATION' },
                  { id: 'career', label: 'CAREER' },
                  { id: 'skills', label: 'SKILLS' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setDrawerTab(t.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer whitespace-nowrap",
                      drawerTab === t.id
                        ? "bg-primary-500/25 border border-primary-500/35 text-primary-300 shadow-sm"
                        : "border border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-2"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 space-y-6">
                {editForm && (
                  <>
                    {drawerTab === 'personal' && (
                      <EditPersonalSection formData={editForm} handleFieldChange={handleFieldChange} />
                    )}
                    {drawerTab === 'academic' && (
                      <EditAcademicSection formData={editForm} handleFieldChange={handleFieldChange} />
                    )}
                    {drawerTab === 'career' && (
                      <EditCareerSection formData={editForm} handleFieldChange={handleFieldChange} />
                    )}
                    {drawerTab === 'skills' && (
                      <EditSkillsSection formData={editForm} handleFieldChange={handleFieldChange} />
                    )}
                  </>
                )}
              </div>

              <div className="border-t border-border pt-4 mt-6 flex gap-3 shrink-0">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 py-2.5 border border-border hover:bg-surface-hover text-text-secondary rounded-xl text-xs font-bold font-mono"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleDrawerSave}
                  className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold font-mono shadow-md flex items-center justify-center gap-1.5"
                >
                  <Save size={12} />
                  <span>SYNC PROFILE</span>
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
