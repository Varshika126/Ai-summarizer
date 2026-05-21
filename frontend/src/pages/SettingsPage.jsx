import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import {
  FiSettings,
  FiUser,
  FiBell,
  FiLock,
  FiCheckCircle,
  FiAlertTriangle,
  FiSliders,
  FiEye
} from 'react-icons/fi';

const SettingsPage = () => {
  const { user, settings, updateSettings, updatePassword } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Settings State
  const [notifications, setNotifications] = useState(true);
  const [defaultSummaryType, setDefaultSummaryType] = useState('medium');
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  // Populate settings state
  useEffect(() => {
    if (settings) {
      setNotifications(settings.notifications);
      setDefaultSummaryType(settings.defaultSummaryType);
    }
  }, [settings]);

  // Handle Preferences Save
  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSettingsSuccess(false);
    try {
      await updateSettings({
        theme,
        notifications,
        defaultSummaryType
      });
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err) {
      console.error('Settings update failed:', err);
    }
  };

  // Handle password update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassError('All password fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters.');
      return;
    }

    try {
      setPassLoading(true);
      await updatePassword(currentPassword, newPassword);
      setPassSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPassError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPassLoading(false);
    }
  };

  const cardClass = `p-6 rounded-3xl border transition-all duration-300 ${
    theme === 'dark'
      ? 'glass-panel border-white/5 text-white'
      : 'glass-panel-light border-slate-200 text-slate-800'
  }`;

  return (
    <div className={`min-h-screen flex transition-colors ${
      theme === 'dark' ? 'mesh-gradient text-white' : 'mesh-gradient-light text-slate-800'
    }`}>
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 p-6 lg:p-8 pt-24 overflow-y-auto max-w-7xl w-full mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight dark:text-white">
              System Settings
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Customize your diagnostic profiles, credentials, and notification behaviors.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Preferences Setup */}
            <div className={cardClass}>
              <h3 className="text-lg font-bold flex items-center gap-2 mb-6 dark:text-white">
                <FiSliders className="text-neonBlue" /> Application Preferences
              </h3>

              {settingsSuccess && (
                <div className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
                  <FiCheckCircle /> Preferences saved successfully.
                </div>
              )}

              <form onSubmit={handleSavePreferences} className="space-y-6">
                
                {/* Theme Selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Visual Core Theme
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (theme !== 'dark') toggleTheme();
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        theme === 'dark'
                          ? 'border-neonBlue bg-neonBlue/10 text-neonBlue'
                          : 'border-slate-200 text-slate-400 dark:border-slate-700'
                      }`}
                    >
                      Dark Hologram
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (theme === 'dark') toggleTheme();
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        theme === 'light'
                          ? 'border-neonPurple bg-neonPurple/10 text-neonPurple'
                          : 'border-slate-800/20 dark:border-slate-700 text-slate-400'
                      }`}
                    >
                      Light Spectrum
                    </button>
                  </div>
                </div>

                {/* Default Summarization Type */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Default Summarizer Model
                  </label>
                  <select
                    value={defaultSummaryType}
                    onChange={(e) => setDefaultSummaryType(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs outline-none transition-all ${
                      theme === 'dark' ? 'glass-input text-white' : 'glass-input-light text-slate-800'
                    }`}
                  >
                    <option value="short">Short Summary (2-3 Sentences)</option>
                    <option value="medium">Medium Summary (3-5 Sentences)</option>
                    <option value="detailed">Detailed Summary (8 Sentences)</option>
                    <option value="bullet">Bullet Points List</option>
                    <option value="executive">Executive Overview</option>
                  </select>
                </div>

                {/* Notifications toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/10 dark:bg-white/5 border border-slate-700/20">
                  <div>
                    <h4 className="text-xs font-bold dark:text-white">Activity Alerts</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Toggle interface diagnostic notifications</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                    className="w-4 h-4 rounded text-neonBlue bg-slate-800 border-slate-700 focus:ring-neonBlue"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl font-bold bg-gradient-to-r from-neonBlue to-neonPurple text-white hover:opacity-90 glow-blue transition-all"
                >
                  Save Workspace Defaults
                </button>
              </form>
            </div>

            {/* Password Update Card */}
            <div className={cardClass}>
              <h3 className="text-lg font-bold flex items-center gap-2 mb-6 dark:text-white">
                <FiLock className="text-neonPurple" /> Credentials Core
              </h3>

              {passSuccess && (
                <div className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
                  <FiCheckCircle /> Credentials updated successfully.
                </div>
              )}

              {passError && (
                <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                  <FiAlertTriangle /> {passError}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs outline-none transition-all ${
                      theme === 'dark' ? 'glass-input text-white' : 'glass-input-light text-slate-800'
                    }`}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs outline-none transition-all ${
                      theme === 'dark' ? 'glass-input text-white' : 'glass-input-light text-slate-800'
                    }`}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs outline-none transition-all ${
                      theme === 'dark' ? 'glass-input text-white' : 'glass-input-light text-slate-800'
                    }`}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={passLoading}
                  className="w-full mt-2 py-2.5 rounded-xl font-bold bg-gradient-to-r from-neonPurple to-neonPink text-white hover:opacity-90 glow-purple transition-all flex items-center justify-center"
                >
                  {passLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Re-authenticate Credentials'
                  )}
                </button>
              </form>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
