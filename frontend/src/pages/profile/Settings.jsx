import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';
import { FaMoon, FaSun, FaDesktop, FaBell, FaGlobe, FaPalette, FaSpinner } from 'react-icons/fa';

export default function Settings() {
  const navigate = useNavigate();
  const { user, fetchProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);
  
  const [settings, setSettings] = useState({
    theme: theme || 'dark',
    accentColor: 'indigo',
    animations: true,
    timezone: 'Asia/Kolkata',
    notificationPreferences: {
      email: true,
      push: true,
      marketing: false
    }
  });

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') return;
    try {
      setDeleting(true);
      await api.delete('/profile');
      logout();
      navigate('/landing');
    } catch (err) {
      setMessage({ text: err?.response?.data?.message || 'Failed to delete account.', type: 'error' });
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (user?.settings) {
      setSettings(prev => ({ 
        ...prev, 
        ...user.settings,
        theme: user.settings.theme || theme || 'dark'
      }));
    }
  }, [user, theme]);

  const handleThemeSelect = (themeOption) => {
    handleChange('theme', themeOption);
    if (themeOption === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(systemDark ? 'dark' : 'light');
    } else {
      setTheme(themeOption);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => {
      const updated = { ...prev };
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        updated[parent] = { ...updated[parent], [child]: value };
      } else {
        updated[field] = value;
      }
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      await api.put('/profile', { settings });
      await fetchProfile();
      setMessage({ text: 'Settings saved successfully!', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Failed to save settings.', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold mb-8 text-text-primary tracking-tight font-display">
        Settings & Preferences
      </h1>
      
      {message.text && (
        <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${
          message.type === 'success' ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Theme Settings */}
        <section className="bg-surface rounded-2xl p-6 shadow-sm border border-border">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-text-primary">
            <FaPalette className="text-primary-400" /> Appearance
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              { id: 'light', label: 'Light', icon: <FaSun className="text-2xl mb-2 text-amber-400" /> },
              { id: 'dark', label: 'Dark', icon: <FaMoon className="text-2xl mb-2 text-primary-400" /> },
              { id: 'system', label: 'System', icon: <FaDesktop className="text-2xl mb-2 text-text-muted" /> }
            ].map(({ id, label, icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleThemeSelect(id)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  settings.theme === id 
                    ? 'border-primary-500 bg-primary-500/15 text-primary-300 shadow-md' 
                    : 'border-border bg-surface-2 hover:border-border-strong text-text-secondary hover:text-text-primary'
                }`}
              >
                {icon}
                <span className="font-semibold text-xs">{label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between py-3 border-t border-border">
            <div>
              <h3 className="font-semibold text-sm text-text-primary">Enable Animations</h3>
              <p className="text-xs text-text-muted">Turn on micro-animations for smoother UX.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.animations} onChange={(e) => handleChange('animations', e.target.checked)} />
              <div className="w-11 h-6 bg-surface-2 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all border border-border peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </section>

        {/* Region Settings */}
        <section className="bg-surface rounded-2xl p-6 shadow-sm border border-border">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-text-primary">
            <FaGlobe className="text-primary-400" /> Region & Localization
          </h2>
          
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase font-mono tracking-wider mb-2">Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
              className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 bg-bg-base text-text-primary text-sm font-medium"
            >
              <option value="Asia/Kolkata">India Standard Time (IST)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time (US & Canada)</option>
              <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
              <option value="Europe/London">London</option>
            </select>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-surface rounded-2xl p-6 shadow-sm border border-border">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-text-primary">
            <FaBell className="text-primary-400" /> Notifications
          </h2>
          
          <div className="divide-y divide-border/60">
            {/* 1. In-app notifications */}
            <div className="flex items-center justify-between py-3.5">
              <div>
                <h3 className="font-semibold text-sm text-text-primary">In-app notifications</h3>
                <p className="text-xs text-text-muted">Receive goal alerts, reminders, and recommendations inside InterviewPilot AI.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.notificationPreferences?.inApp !== false}
                  onChange={(e) => handleChange('notificationPreferences.inApp', e.target.checked)}
                />
                <div className="w-11 h-6 bg-surface-2 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all border border-border peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* 2. Email recommendations */}
            <div className="flex items-center justify-between py-3.5">
              <div>
                <h3 className="font-semibold text-sm text-text-primary">Email recommendations</h3>
                <p className="text-xs text-text-muted">Receive high-impact recommendations and important preparation updates via email.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.notificationPreferences?.email !== false}
                  onChange={(e) => handleChange('notificationPreferences.email', e.target.checked)}
                />
                <div className="w-11 h-6 bg-surface-2 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all border border-border peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* 3. Daily preparation reminders */}
            <div className="flex items-center justify-between py-3.5">
              <div>
                <h3 className="font-semibold text-sm text-text-primary">Daily preparation reminders</h3>
                <p className="text-xs text-text-muted">Receive morning reminders with your daily priority problem and focus area.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.notificationPreferences?.dailyPreparation !== false}
                  onChange={(e) => handleChange('notificationPreferences.dailyPreparation', e.target.checked)}
                />
                <div className="w-11 h-6 bg-surface-2 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all border border-border peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* 4. Weekly progress summary */}
            <div className="flex items-center justify-between py-3.5">
              <div>
                <h3 className="font-semibold text-sm text-text-primary">Weekly progress summary</h3>
                <p className="text-xs text-text-muted">Receive Sunday progress reports analyzing readiness trends and solved problems.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.notificationPreferences?.weeklySummary !== false}
                  onChange={(e) => handleChange('notificationPreferences.weeklySummary', e.target.checked)}
                />
                <div className="w-11 h-6 bg-surface-2 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all border border-border peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* 5. Interview reminders */}
            <div className="flex items-center justify-between py-3.5">
              <div>
                <h3 className="font-semibold text-sm text-text-primary">Interview reminders</h3>
                <p className="text-xs text-text-muted">Get notified when AI interview and placement simulation reports are ready.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.notificationPreferences?.interviewReminders !== false}
                  onChange={(e) => handleChange('notificationPreferences.interviewReminders', e.target.checked)}
                />
                <div className="w-11 h-6 bg-surface-2 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all border border-border peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* 6. Achievement notifications */}
            <div className="flex items-center justify-between py-3.5">
              <div>
                <h3 className="font-semibold text-sm text-text-primary">Achievement notifications</h3>
                <p className="text-xs text-text-muted">Celebrations when you cross coding milestones and curriculum goals.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.notificationPreferences?.achievementNotifications !== false}
                  onChange={(e) => handleChange('notificationPreferences.achievementNotifications', e.target.checked)}
                />
                <div className="w-11 h-6 bg-surface-2 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all border border-border peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* 7. SMS notifications (Architecture-Ready, Disabled) */}
            <div className="flex items-center justify-between py-3.5 opacity-60">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm text-text-primary">SMS notifications</h3>
                  <span className="px-1.5 py-0.5 rounded bg-surface-2 text-[10px] font-mono font-bold text-text-muted border border-border">OFF (COMING SOON)</span>
                </div>
                <p className="text-xs text-text-muted">Direct SMS alerts for urgent placement drive dates and mock slots.</p>
              </div>
              <label className="relative inline-flex items-center cursor-not-allowed">
                <input
                  type="checkbox"
                  disabled
                  className="sr-only peer"
                  checked={false}
                  onChange={() => {}}
                />
                <div className="w-11 h-6 bg-surface-2 rounded-full border border-border"></div>
              </label>
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary-600 hover:bg-primary-500 text-white px-7 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md shadow-primary-600/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? <FaSpinner className="animate-spin" /> : null}
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>

        {/* Danger Zone: Delete Account */}
        <section className="bg-red-50/40 dark:bg-red-950/20 rounded-xl p-6 border border-red-200 dark:border-red-900/50 mt-8 space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
              Danger Zone: Delete Account
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Permanently delete your account and all associated data including interview sessions, simulation reports, mistakes, coding submissions, and uploaded resumes. This action cannot be undone.
            </p>
          </div>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-all cursor-pointer"
            >
              Delete My Account
            </button>
          ) : (
            <div className="p-4 rounded-lg bg-surface border border-red-300 dark:border-red-800 space-y-3">
              <p className="text-xs font-mono text-red-400 font-bold uppercase tracking-wider">
                Confirm Account Deletion
              </p>
              <p className="text-xs text-text-secondary">
                To confirm permanent deletion, please type <span className="font-mono font-bold text-text-primary">DELETE</span> in the box below:
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Type DELETE to confirm"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-border bg-bg-base text-text-primary text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500 w-full sm:w-64"
                />
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteInput !== "DELETE" || deleting}
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-all cursor-pointer"
                >
                  {deleting ? "Deleting..." : "Permanently Delete Account"}
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); }}
                  className="px-4 py-2 rounded-lg border border-border bg-surface hover:bg-surface-2 text-text-secondary text-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
