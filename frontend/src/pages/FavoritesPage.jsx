import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../apiClient';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiEye, FiClock, FiTrash2, FiHeart } from 'react-icons/fi';

const FavoritesPage = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/summaries?favorite=true');
      setFavorites(data);
    } catch (err) {
      console.error('Failed to load favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (id) => {
    try {
      await api.put(`/api/summaries/${id}/favorite`);
      setFavorites(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      console.error('Remove favorite failed:', err);
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
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight dark:text-white flex items-center gap-2">
              <FiStar className="text-yellow-400 fill-current" /> Starred Digest
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Your curated list of pinned and favorite syntheses documents.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-56 rounded-3xl bg-slate-800/10 dark:bg-white/5 animate-pulse border border-slate-700/20" />
              ))}
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-20 rounded-3xl border border-dashed border-slate-700/20 text-slate-400 font-mono">
              <FiHeart className="text-4xl mx-auto mb-3 text-slate-600 animate-pulse" />
              <span>No pinned summaries found. Pin your favorite summaries in the workspace to view them here.</span>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {favorites.map((fav) => (
                  <motion.div
                    key={fav._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className={cardClass}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="capitalize px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider bg-slate-800/30 dark:bg-white/5 border border-slate-700/20 text-neonPurple">
                        {fav.inputType}
                      </span>
                      <button
                        onClick={() => handleRemoveFavorite(fav._id)}
                        className="p-1.5 rounded-lg border text-yellow-400 bg-yellow-400/10 border-yellow-400/20 hover:bg-red-500/10 hover:text-red-400 hover:border-transparent transition-all"
                        title="Remove from favorites"
                      >
                        <FiStar className="fill-current" />
                      </button>
                    </div>

                    <h3 className="font-bold text-base truncate mb-2 dark:text-white">
                      {fav.generatedTitle}
                    </h3>
                    
                    <p className="text-xs text-slate-400 line-clamp-3 mb-4">
                      {fav.shortSummary}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800/10 dark:border-white/5 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <FiClock /> {fav.readingTime} min read
                      </span>
                      <Link
                        to={`/workspace?id=${fav._id}`}
                        className="flex items-center gap-1 text-neonPurple hover:underline font-bold"
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

export default FavoritesPage;
