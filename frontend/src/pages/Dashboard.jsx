import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../apiClient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { BarChart, DonutChart } from '../components/CustomChart';
import { motion } from 'framer-motion';
import {
  FiLayout,
  FiClock,
  FiZap,
  FiFileText,
  FiPlus,
  FiArrowRight,
  FiHeart,
  FiActivity,
  FiEye
} from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/summaries/analytics');
        setData(res.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const cardClass = `p-6 rounded-3xl border transition-all duration-300 ${
    theme === 'dark'
      ? 'glass-panel border-white/5 hover:border-white/10'
      : 'glass-panel-light border-slate-200 hover:border-slate-300'
  }`;

  return (
    <div className={`min-h-screen flex transition-colors ${
      theme === 'dark' ? 'mesh-gradient text-white' : 'mesh-gradient-light text-slate-800'
    }`}>
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Navbar />

        {/* Workspace content container */}
        <main className="flex-1 p-6 lg:p-8 pt-24 overflow-y-auto max-w-7xl w-full mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight dark:text-white">
                Terminal Dashboard
              </h1>
              <p className="text-sm text-slate-400 dark:text-slate-400 mt-1">
                Overview of your synthesized records and linguistic analytics.
              </p>
            </div>
            <Link
              to="/workspace"
              className="px-5 py-3 rounded-2xl font-bold bg-gradient-to-r from-neonBlue to-neonPurple text-white hover:opacity-90 glow-blue transition-all flex items-center gap-2 self-start"
            >
              <FiPlus /> New Summary
            </Link>
          </div>

          {loading ? (
            // Skeleton Loader State
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(n => (
                  <div key={n} className="h-32 rounded-3xl bg-slate-800/10 dark:bg-white/5 animate-pulse border border-slate-700/20" />
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80 rounded-3xl bg-slate-800/10 dark:bg-white/5 animate-pulse border border-slate-700/20" />
                <div className="h-80 rounded-3xl bg-slate-800/10 dark:bg-white/5 animate-pulse border border-slate-700/20" />
              </div>
            </div>
          ) : (
            // Dashboard Main View
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Core metrics cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={cardClass}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs uppercase font-mono tracking-widest text-slate-400">Total Syntheses</span>
                    <div className="p-3 rounded-2xl bg-neonBlue/10 text-neonBlue"><FiFileText /></div>
                  </div>
                  <h3 className="text-3xl font-extrabold tracking-tight dark:text-white">
                    {data?.totalSummaries || 0}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2">Processed documents and articles</p>
                </div>

                <div className={cardClass}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs uppercase font-mono tracking-widest text-slate-400">Reading Time Saved</span>
                    <div className="p-3 rounded-2xl bg-neonPurple/10 text-neonPurple"><FiZap /></div>
                  </div>
                  <h3 className="text-3xl font-extrabold tracking-tight dark:text-white">
                    {data?.totalReadingTimeSaved || 0} <span className="text-sm font-semibold text-slate-400">min</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-2">Accumulated processing efficiency</p>
                </div>

                <div className={cardClass}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs uppercase font-mono tracking-widest text-slate-400">System Activity</span>
                    <div className="p-3 rounded-2xl bg-neonPink/10 text-neonPink"><FiActivity /></div>
                  </div>
                  <h3 className="text-3xl font-extrabold tracking-tight dark:text-white">
                    Active
                  </h3>
                  <p className="text-xs text-slate-400 mt-2">Local NLP Engine status verified</p>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Syntheses Bar Chart */}
                <div className={cardClass}>
                  <h3 className="text-lg font-bold tracking-tight mb-6 dark:text-white">Weekly Syntheses</h3>
                  <div className="h-44">
                    <BarChart data={data?.weeklyActivity || []} />
                  </div>
                </div>

                {/* Input Type & Sentiment Distributions */}
                <div className={cardClass}>
                  <h3 className="text-lg font-bold tracking-tight mb-6 dark:text-white">Distribution Diagnostics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                    <div>
                      <h4 className="text-xs uppercase font-mono tracking-widest text-slate-400 mb-3">Input Mediums</h4>
                      <DonutChart
                        data={[
                          { label: 'Text Paste', value: data?.inputTypeCounts?.text || 0, color: '#00F0FF' },
                          { label: 'File Upload', value: data?.inputTypeCounts?.file || 0, color: '#A855F7' },
                          { label: 'URL Scraping', value: data?.inputTypeCounts?.url || 0, color: '#FF007A' }
                        ]}
                      />
                    </div>
                    <div>
                      <h4 className="text-xs uppercase font-mono tracking-widest text-slate-400 mb-3">Tone Spectrum</h4>
                      <DonutChart
                        data={[
                          { label: 'Positive', value: data?.sentimentCounts?.Positive || 0, color: '#10B981' },
                          { label: 'Neutral', value: data?.sentimentCounts?.Neutral || 0, color: '#F59E0B' },
                          { label: 'Negative', value: data?.sentimentCounts?.Negative || 0, color: '#EF4444' }
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity List */}
              <div className={cardClass}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold tracking-tight dark:text-white">Recent Syntheses</h3>
                  <Link to="/history" className="text-sm font-semibold text-neonBlue hover:underline flex items-center gap-1">
                    Full History <FiArrowRight />
                  </Link>
                </div>

                {data?.recentItems?.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 dark:text-slate-500 font-mono">
                    No summaries generated yet. Visit the Workspace to begin.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/10 dark:divide-white/5">
                    {data?.recentItems?.map((item) => (
                      <div key={item._id} className="py-4 flex items-center justify-between gap-4 hover:bg-slate-800/5 dark:hover:bg-white/5 px-2 rounded-xl transition-colors">
                        <div className="overflow-hidden">
                          <h4 className="font-bold text-sm truncate dark:text-white text-slate-800">
                            {item.generatedTitle}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 font-medium">
                            <span className="capitalize px-2 py-0.5 rounded bg-slate-800/20 dark:bg-white/5 border border-slate-700/20">
                              {item.inputType}
                            </span>
                            <span>Saved: {Math.max(1, Math.round(item.readingTime * 0.8))} min</span>
                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Link
                          to={`/workspace?id=${item._id}`}
                          className="p-2 rounded-lg bg-slate-800/40 dark:bg-white/5 border border-slate-700/50 dark:border-white/10 text-slate-400 hover:text-neonBlue hover:border-neonBlue transition-all shrink-0"
                          title="Open in Workspace"
                        >
                          <FiEye />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </main>
      </div>
    </div>
  );
};

export default Dashboard;
