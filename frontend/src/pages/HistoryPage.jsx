import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../apiClient';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiFilter,
  FiTrash2,
  FiStar,
  FiEye,
  FiClock,
  FiDownload,
  FiLayers,
  FiX
} from 'react-icons/fi';

const HistoryPage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState([]);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [inputType, setInputType] = useState(''); // '' | 'text' | 'file' | 'url'
  const [favorite, setFavorite] = useState(false);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch history from API
  const fetchHistory = async () => {
    try {
      setLoading(true);
      let queryStr = `/api/summaries?search=${encodeURIComponent(debouncedSearch)}`;
      if (inputType) queryStr += `&inputType=${inputType}`;
      if (favorite) queryStr += `&favorite=true`;

      const { data } = await api.get(queryStr);
      setSummaries(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [debouncedSearch, inputType, favorite]);

  // Toggle favorite
  const handleToggleFavorite = async (id) => {
    try {
      const { data } = await api.put(`/api/summaries/${id}/favorite`);
      setSummaries(prev =>
        prev.map(s => (s._id === id ? { ...s, isFavorite: data.isFavorite } : s))
      );
    } catch (err) {
      console.error('Favorite toggle failed:', err);
    }
  };

  // Delete summary
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this summary permanently from your database?')) return;
    try {
      await api.delete(`/api/summaries/${id}`);
      setSummaries(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Bulk deletion
  const handleClearAll = async () => {
    if (!window.confirm('WARNING: This will permanently wipe all summaries in your account history. Are you absolutely sure?')) return;
    try {
      setLoading(true);
      await api.delete('/api/summaries');
      setSummaries([]);
    } catch (err) {
      console.error('Clear history failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const cardClass = `p-5 rounded-3xl border transition-all duration-300 ${
    theme === 'dark'
      ? 'glass-panel border-white/5 hover:border-white/10'
      : 'glass-panel-light border-slate-200 hover:border-slate-300'
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight dark:text-white">
                Syntheses History
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Retrieve, search, organize and analyze previous NLP summaries.
              </p>
            </div>
            {summaries.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center gap-1.5 self-start"
              >
                <FiTrash2 /> Clear Entire History
              </button>
            )}
          </div>

          {/* Filtering Hub */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <FiSearch />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search summaries by title, content keywords..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs outline-none transition-all ${
                  theme === 'dark' ? 'glass-input text-white' : 'glass-input-light text-slate-800'
                }`}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                >
                  <FiX />
                </button>
              )}
            </div>

            {/* Input Type Selector */}
            <div className="md:col-span-3">
              <select
                value={inputType}
                onChange={(e) => setInputType(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl text-xs outline-none transition-all ${
                  theme === 'dark' ? 'glass-input text-white' : 'glass-input-light text-slate-800'
                }`}
              >
                <option value="">All Input Types</option>
                <option value="text">Text Paste</option>
                <option value="file">File Uploads</option>
                <option value="url">Article URLs</option>
              </select>
            </div>

            {/* Favorites Star Filter Toggle */}
            <div className="md:col-span-3">
              <button
                onClick={() => setFavorite(!favorite)}
                className={`w-full py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-2 ${
                  favorite
                    ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                    : 'border-slate-800/20 dark:border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <FiStar className={favorite ? 'fill-current' : ''} />
                Starred Only
              </button>
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="h-56 rounded-3xl bg-slate-800/10 dark:bg-white/5 animate-pulse border border-slate-700/20" />
              ))}
            </div>
          ) : summaries.length === 0 ? (
            <div className="text-center py-20 rounded-3xl border border-dashed border-slate-700/20 text-slate-400 font-mono">
              No matching summarization files found in your database.
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {summaries.map((summary) => (
                  <motion.div
                    key={summary._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className={cardClass}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="capitalize px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider bg-slate-800/30 dark:bg-white/5 border border-slate-700/20 text-neonBlue">
                        {summary.inputType}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleToggleFavorite(summary._id)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            summary.isFavorite
                              ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
                              : 'text-slate-500 hover:text-white border-transparent'
                          }`}
                        >
                          <FiStar className={summary.isFavorite ? 'fill-current' : ''} />
                        </button>
                        <button
                          onClick={() => handleDelete(summary._id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-base truncate mb-2 dark:text-white">
                      {summary.generatedTitle}
                    </h3>
                    
                    <p className="text-xs text-slate-400 line-clamp-3 mb-4">
                      {summary.shortSummary}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800/10 dark:border-white/5 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <FiClock /> {summary.readingTime} min read
                      </span>
                      <Link
                        to={`/workspace?id=${summary._id}`}
                        className="flex items-center gap-1 text-neonBlue hover:underline font-bold"
                      >
                        <FiEye /> View Core
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

        </main>
      </div>
    </div>
  );
};

export default HistoryPage;
