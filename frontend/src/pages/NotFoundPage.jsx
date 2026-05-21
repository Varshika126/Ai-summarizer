import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { FiHome, FiAlertCircle } from 'react-icons/fi';

const NotFoundPage = () => {
  const { theme } = useTheme();
  const { user } = useAuth();

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center relative overflow-hidden transition-colors ${
      theme === 'dark' ? 'mesh-gradient text-white' : 'mesh-gradient-light text-slate-800'
    }`}>
      <Navbar />

      {/* Decorative Spheres */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-neonPink/10 rounded-full blur-[110px] pointer-events-none" />

      <div className="text-center z-10 p-6 space-y-6 max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative inline-block"
        >
          <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neonBlue via-neonPurple to-neonPink select-none animate-pulse">
            404
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/80 p-2.5 rounded-full border border-neonPink/30 text-neonPink animate-bounce">
            <FiAlertCircle className="text-2xl" />
          </div>
        </motion.div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight dark:text-white">
            Lost in Cyberspace
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-400">
            The database address or summarization coordinate you requested does not exist in our neural cluster.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="pt-4"
        >
          <Link
            to={user ? '/dashboard' : '/'}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold bg-gradient-to-r from-neonBlue to-neonPurple text-white hover:opacity-90 glow-blue transition-all group"
          >
            <FiHome className="group-hover:-translate-y-0.5 transition-transform" />
            {user ? 'Return to Dashboard' : 'Return Home'}
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;
