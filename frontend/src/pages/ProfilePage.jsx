import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiCalendar, FiCheckCircle, FiEdit3 } from 'react-icons/fi';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { theme } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!name || !email) {
      setError('Name and Email are required.');
      return;
    }

    try {
      setLoading(true);
      await updateProfile(name, email);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile details.');
    } finally {
      setLoading(false);
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
              User Profile
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Configure your account details and review synthesis statistics.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Profile Info Details Card */}
            <div className={`lg:col-span-1 flex flex-col items-center text-center ${cardClass}`}>
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-neonBlue via-neonPurple to-neonPink flex items-center justify-center text-white text-3xl font-black shadow-lg mb-4">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold dark:text-white">{user?.name}</h2>
              <p className="text-xs text-slate-400 font-mono mt-1">{user?.email}</p>

              <div className="w-full text-left mt-8 pt-6 border-t border-slate-800/10 dark:border-white/5 space-y-4 text-xs">
                <div className="flex items-center gap-3">
                  <FiCalendar className="text-slate-400 text-base" />
                  <div>
                    <span className="text-slate-500 block">Registered Terminal</span>
                    <span className="font-semibold font-mono mt-0.5 dark:text-white">Active System</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FiUser className="text-slate-400 text-base" />
                  <div>
                    <span className="text-slate-500 block">Security Profile</span>
                    <span className="font-semibold mt-0.5 dark:text-white">Authorized User</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Editing Form Card */}
            <div className={`lg:col-span-2 ${cardClass}`}>
              <h3 className="text-lg font-bold flex items-center gap-2 mb-6 dark:text-white">
                <FiEdit3 className="text-neonBlue" /> Account Details
              </h3>

              {success && (
                <div className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
                  <FiCheckCircle /> Profile details updated successfully.
                </div>
              )}

              {error && (
                <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <FiUser />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all ${
                        theme === 'dark' ? 'glass-input text-white' : 'glass-input-light text-slate-800'
                      }`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <FiMail />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all ${
                        theme === 'dark' ? 'glass-input text-white' : 'glass-input-light text-slate-800'
                      }`}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 rounded-xl font-bold bg-gradient-to-r from-neonBlue to-neonPurple text-white hover:opacity-90 glow-blue transition-all flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Save Profile Details'
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

export default ProfilePage;
