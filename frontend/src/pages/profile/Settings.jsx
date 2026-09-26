import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';
import { FaMoon, FaSun, FaDesktop, FaBell, FaGlobe, FaPalette, FaSpinner, FaShieldAlt, FaBullhorn, FaCalendarDay, FaChartLine, FaLock, FaCheck, FaClock, FaEnvelope, FaKey, FaEye, FaEyeSlash } from 'react-icons/fa';

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
  
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState(null);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (!passwordForm.currentPassword) {
      setPasswordStatus({ type: 'error', text: 'Please enter your current password.' });
      return;
    }
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      setPasswordStatus({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordStatus({ type: 'error', text: 'New password cannot be identical to your current password.' });
      return;
    }

    try {
      setChangingPassword(true);
      const res = await api.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword
      });

      if (res.data?.success) {
        setPasswordStatus({
          type: 'success',
          text: 'Password updated successfully! A security confirmation has been sent to your registered email.'
        });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordStatus({
          type: 'error',
          text: res.data?.message || 'Failed to update password.'
        });
      }
    } catch (err) {
      const msg = err?.response?.data?.detail?.message || err?.response?.data?.message || err?.response?.data?.detail || 'Failed to change password. Please verify your current password.';
      setPasswordStatus({
        type: 'error',
        text: typeof msg === 'string' ? msg : JSON.stringify(msg)
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const [settings, setSettings] = useState({
    theme: theme || 'dark',
    accentColor: 'indigo',
    animations: true,
    timezone: 'Asia/Kolkata',
    notificationPreferences: {
      email: true,
      securityAlerts: true,
      productUpdates: false,
      dailyReminder: false,
      dailyReminderTime: '08:00',
      weeklyProgressReport: false,
      monthlyPerformanceSummary: false,
      inactivityReminders: false,
      progressReportFrequency: 'disabled',
      inApp: true
    }
  });

  const handleSendTestEmail = async () => {
    try {
      setSendingTestEmail(true);
      setTestEmailStatus(null);
      const res = await api.post('/misc/send-test-email');
      if (res.data?.success) {
        setTestEmailStatus({ 
          type: 'success', 
          text: `Verification email sent successfully to ${user?.email || 'your registered address'}!` 
        });
      } else {
        setTestEmailStatus({ 
          type: 'error', 
          text: res.data?.message || res.data?.result?.error || 'Failed to dispatch test email.' 
        });
      }
    } catch (err) {
      setTestEmailStatus({ 
        type: 'error', 
        text: err?.response?.data?.message || 'Error connecting to email service.' 
      });
    } finally {
      setSendingTestEmail(false);
    }
  };

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
        theme: user.settings.theme || theme || 'dark',
        notificationPreferences: {
          email: true,
          securityAlerts: true,
          dailyReminder: false,
          dailyReminderTime: '08:00',
          inactivityReminders: false,
          progressReportFrequency: 'disabled',
          inApp: true,
          ...(user.settings.notificationPreferences || {}),
          productUpdates: Boolean(user.settings.notificationPreferences?.productUpdates),
          weeklyProgressReport: user.settings?.notificationPreferences?.weeklyProgressReport !== undefined
            ? Boolean(user.settings.notificationPreferences.weeklyProgressReport)
            : false,
          monthlyPerformanceSummary: user.settings?.notificationPreferences?.monthlyPerformanceSummary !== undefined
            ? Boolean(user.settings.notificationPreferences.monthlyPerformanceSummary)
            : false
        }
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

        {/* Notifications & Email Preferences */}
        <section className="bg-surface rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2 text-text-primary">
                <FaBell className="text-primary-400" /> Notification & Email Preferences
              </h2>
              <p className="text-xs text-text-muted mt-1">
                Customize which notifications and automated preparation digests you receive.
              </p>
            </div>
          </div>

          {/* Account Recipient Reassurance Banner */}
          <div className="mb-6 p-4 rounded-xl bg-primary-500/10 border border-primary-500/25 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 text-xs text-text-secondary flex-wrap">
                <FaEnvelope className="text-primary-400 shrink-0" />
                <span>Notifications are sent directly to your registered account:</span>
                <strong className="font-mono text-primary-300 bg-surface-2 px-2 py-0.5 rounded border border-border">{user?.email || 'Authenticated Account'}</strong>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                  <FaCheck className="text-[9px]" /> Verified Account
                </span>
                <button
                  type="button"
                  onClick={handleSendTestEmail}
                  disabled={sendingTestEmail || !user?.email}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-primary-600 hover:bg-primary-500 text-white transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  {sendingTestEmail ? <FaSpinner className="animate-spin text-[10px]" /> : <FaEnvelope className="text-[10px]" />}
                  <span>{sendingTestEmail ? 'Sending...' : 'Send Test Email'}</span>
                </button>
              </div>
            </div>
            {testEmailStatus && (
              <div className={`p-2.5 rounded-lg text-xs font-medium border flex items-center gap-2 ${
                testEmailStatus.type === 'success' 
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              }`}>
                <span>{testEmailStatus.text}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-4 divide-y divide-border/60">
            {/* Master Email Notifications Toggle */}
            <div className="pt-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 p-2 rounded-lg bg-primary-500/10 border border-primary-500/20 text-primary-400">
                    <FaEnvelope className="text-base" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-text-primary">Master Email Notifications</h3>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                      Enable or disable all optional automated emails (reminders, reports, announcements). Security and password alerts remain active.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 pt-1">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.notificationPreferences?.email !== false}
                    onChange={(e) => handleChange('notificationPreferences.email', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-surface-2 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all border border-border peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>

            {/* Category A: Security & Account Emails (Always Enabled) */}
            <div className="pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <FaShieldAlt className="text-base" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-text-primary">A. Security and Account Emails</h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                        <FaLock className="text-[9px]" /> Always Active
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                      Critical transactional notifications including password resets, account security alerts, and email confirmations. Sent immediately to safeguard your account.
                    </p>
                  </div>
                </div>
                <div className="shrink-0 pt-1">
                  <span className="text-xs font-semibold text-text-muted font-mono bg-surface-2 px-2.5 py-1 rounded-md border border-border">
                    Required
                  </span>
                </div>
              </div>
            </div>

            {/* Category 1: Daily Placement Reminders */}
            <div className="pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <FaCalendarDay className="text-base" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-text-primary">1. Daily Placement Reminders</h3>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                      Personalized daily preparation missions, priority problem recommendations, and streak reminders. Dispatched at most once per day.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 pt-1">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={Boolean(settings.notificationPreferences?.dailyReminder)}
                    onChange={(e) => handleChange('notificationPreferences.dailyReminder', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-surface-2 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all border border-border peer-checked:bg-primary-600"></div>
                </label>
              </div>

              {Boolean(settings.notificationPreferences?.dailyReminder) && (
                <div className="mt-3 pl-11 pt-2 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-text-secondary">Preferred Reminder Time:</span>
                    <select
                      value={settings.notificationPreferences?.dailyReminderTime || '08:00'}
                      onChange={(e) => handleChange('notificationPreferences.dailyReminderTime', e.target.value)}
                      className="p-1.5 text-xs rounded-lg border border-border bg-bg-base text-text-primary focus:ring-1 focus:ring-primary-500 font-mono"
                    >
                      <option value="06:00">06:00 AM (Early Bird)</option>
                      <option value="07:00">07:00 AM</option>
                      <option value="08:00">08:00 AM (Default)</option>
                      <option value="09:00">09:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="18:00">06:00 PM (Evening)</option>
                      <option value="20:00">08:00 PM (Night)</option>
                    </select>
                  </div>
                  <span className="text-[11px] text-text-muted font-mono">
                    Timezone: <strong className="text-text-secondary">{settings.timezone || 'Asia/Kolkata'}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Category: Progress Reports */}
            <div className="pt-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="mt-0.5 p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
                      <FaChartLine className="text-base" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm text-text-primary">Progress Reports</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-2 border border-border text-text-muted">
                          Default: Weekly
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">
                        Data-driven analytics digest showing solved coding problems, topic mastery, and mock interview results based on your real activity.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 pt-1">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.notificationPreferences?.progressReportFrequency !== 'disabled'}
                      onChange={(e) => {
                        const isEnabled = e.target.checked;
                        const newFreq = isEnabled ? 'weekly' : 'disabled';
                        handleChange('notificationPreferences.progressReportFrequency', newFreq);
                        handleChange('notificationPreferences.weeklyProgressReport', isEnabled);
                        handleChange('notificationPreferences.monthlyPerformanceSummary', false);
                      }}
                    />
                    <div className="w-11 h-6 bg-surface-2 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all border border-border peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                {settings.notificationPreferences?.progressReportFrequency !== 'disabled' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 pl-11">
                    {[
                      {
                        id: 'weekly',
                        label: 'Weekly Reports (Default)',
                        desc: 'Dispatched every Sunday with 7-day metrics & upcoming goals',
                        active: (settings.notificationPreferences?.progressReportFrequency || 'weekly') === 'weekly'
                      },
                      {
                        id: 'monthly',
                        label: 'Monthly Reports',
                        desc: 'Dispatched at the end of each month with 30-day cumulative review',
                        active: settings.notificationPreferences?.progressReportFrequency === 'monthly'
                      }
                    ].map(({ id, label, desc, active }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          handleChange('notificationPreferences.progressReportFrequency', id);
                          handleChange('notificationPreferences.weeklyProgressReport', id === 'weekly');
                          handleChange('notificationPreferences.monthlyPerformanceSummary', id === 'monthly');
                        }}
                        className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                          active
                            ? 'bg-primary-500/15 border-primary-500/60 text-primary-300 ring-1 ring-primary-500/30'
                            : 'bg-surface-2 border-border text-text-secondary hover:border-border-strong hover:text-text-primary'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs">{label}</span>
                          {active && <FaCheck className="text-[11px] text-primary-400 shrink-0" />}
                        </div>
                        <span className="text-[11px] text-text-muted block mt-1 leading-snug">{desc}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Category 4: Product Announcements */}
            <div className="pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <FaBullhorn className="text-base" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-text-primary">4. Product Announcements</h3>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                      Major platform feature launches, new company interview questions, and partner placement drive announcements. Dispatched only when genuinely new.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 pt-1">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={Boolean(settings.notificationPreferences?.productUpdates)}
                    onChange={(e) => handleChange('notificationPreferences.productUpdates', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-surface-2 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all border border-border peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>

            {/* Inactivity Reminders */}
            <div className="pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
                    <FaClock className="text-base" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-text-primary">Inactivity Reminders</h3>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                      Receive an encouraging prompt if you haven't logged in or practiced for 7 days. Limited to at most 1 reminder per week.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 pt-1">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.notificationPreferences?.inactivityReminders !== false}
                    onChange={(e) => handleChange('notificationPreferences.inactivityReminders', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-surface-2 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all border border-border peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>

            {/* In-app notifications */}
            <div className="pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    <FaBell className="text-base" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-text-primary">In-App Notification Banners</h3>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                      Instant alerts, milestone badges, and study hints shown inside the application header notification center.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 pt-1">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.notificationPreferences?.inApp !== false}
                    onChange={(e) => handleChange('notificationPreferences.inApp', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-surface-2 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all border border-border peer-checked:bg-primary-600"></div>
                </label>
              </div>
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

        {/* Security & Password Management */}
        <section className="bg-surface rounded-2xl p-6 border border-border shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="p-2.5 rounded-xl bg-primary-500/10 text-primary-500 border border-primary-500/20">
              <FaKey className="text-lg" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">Change Account Password</h2>
              <p className="text-xs text-text-muted mt-0.5">
                Update your login credentials. A security confirmation email will be sent to <strong className="text-text-primary">{user?.email || 'your registered address'}</strong>.
              </p>
            </div>
          </div>

          {passwordStatus && (
            <div className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
              passwordStatus.type === 'success' 
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              {passwordStatus.type === 'success' ? <FaCheck className="mt-0.5 shrink-0" /> : <FaLock className="mt-0.5 shrink-0" />}
              <span>{passwordStatus.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Enter your current password"
                  required
                  className="w-full bg-bg-base border border-border rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1 cursor-pointer"
                  aria-label="Toggle current password visibility"
                >
                  {showCurrentPassword ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-text-secondary">
                  New Password
                </label>
                <span className={`text-[10px] ${passwordForm.newPassword.length >= 6 ? "text-emerald-400" : "text-text-muted"}`}>
                  At least 6 characters
                </span>
              </div>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Enter new strong password"
                  required
                  className="w-full bg-bg-base border border-border rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1 cursor-pointer"
                  aria-label="Toggle new password visibility"
                >
                  {showNewPassword ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-text-secondary">
                  Confirm New Password
                </label>
                {passwordForm.confirmPassword && (
                  <span className={`text-[10px] ${
                    passwordForm.newPassword === passwordForm.confirmPassword ? "text-emerald-400" : "text-red-400"
                  }`}>
                    {passwordForm.newPassword === passwordForm.confirmPassword ? "Passwords match" : "Does not match"}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  required
                  className="w-full bg-bg-base border border-border rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1 cursor-pointer"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={changingPassword || !passwordForm.currentPassword || passwordForm.newPassword.length < 6 || passwordForm.newPassword !== passwordForm.confirmPassword}
              className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-primary-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {changingPassword ? <FaSpinner className="animate-spin" /> : <FaLock size={12} />}
              <span>{changingPassword ? "Updating Password..." : "Update Password"}</span>
            </button>
          </form>
        </section>

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
