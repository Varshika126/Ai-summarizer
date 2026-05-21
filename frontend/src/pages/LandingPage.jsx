import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import {
  FiArrowRight,
  FiZap,
  FiShield,
  FiGlobe,
  FiFolderPlus,
  FiVolume2,
  FiSmile
} from 'react-icons/fi';

const LandingPage = () => {
  const { user } = useAuth();
  const { theme } = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const featureClass = `p-6 rounded-3xl border transition-all duration-300 ${
    theme === 'dark'
      ? 'glass-panel border-white/5 hover:border-white/10 hover:-translate-y-1'
      : 'glass-panel-light border-slate-200 hover:border-slate-300 hover:-translate-y-1'
  }`;

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden transition-colors ${
      theme === 'dark' ? 'mesh-gradient text-white' : 'mesh-gradient-light text-slate-800'
    }`}>
      <Navbar />

      {/* Background Decorative Blur Rings */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-neonBlue/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-neonPurple/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Hero Section */}
      <section className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 flex flex-col lg:flex-row items-center justify-between gap-12 z-10">
        
        {/* Left column text */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="lg:w-1/2 space-y-6 text-center lg:text-left"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/40 dark:bg-white/5 border border-slate-700/50 dark:border-white/10 text-xs font-mono font-semibold tracking-wider text-neonBlue">
            <FiZap className="animate-pulse" /> LOCAL NLP DICTATION & ANALYSIS
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none">
            Synthesize Content.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-neonBlue via-neonPurple to-neonPink">
              Extract Intelligence.
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-slate-400 dark:text-slate-400 max-w-lg mx-auto lg:mx-0 text-sm sm:text-base leading-relaxed">
            AetherSummary delivers modern documents parsing, Web Scraping, sentiment analysis, keywords mapping, and voice interaction—powered completely locally with zero paid API integrations.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link
              to={user ? '/dashboard' : '/register'}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold bg-gradient-to-r from-neonBlue to-neonPurple text-white hover:opacity-90 glow-blue transition-all flex items-center justify-center gap-2 group"
            >
              Launch Console <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold bg-slate-800/40 dark:bg-white/5 border border-slate-700/50 dark:border-white/10 hover:border-slate-500 transition-all text-center"
            >
              Sign In
            </Link>
          </motion.div>
        </motion.div>

        {/* Right column dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="lg:w-1/2 w-full flex justify-center"
        >
          {/* Hologram Card Mockup */}
          <div className="relative w-full max-w-md aspect-video p-1 rounded-[32px] bg-gradient-to-tr from-neonBlue via-neonPurple to-neonPink shadow-2xl animate-float">
            <div className="w-full h-full bg-[#0b0f19] rounded-[30px] p-6 flex flex-col justify-between border border-white/5 font-mono text-[10px] text-slate-400 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-neonBlue tracking-widest uppercase">nlp_core_loaded</span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
              </div>
              <div className="space-y-1.5 flex-1">
                <p className="text-white font-bold text-xs">Generated Summary // AetherSummary</p>
                <p>&gt; parsing original document tokens (4,821 words)...</p>
                <p className="text-slate-300">&gt; "Artificial Intelligence represents a paradigm shift in data synthesis and cognitive automation protocols..."</p>
                <p>&gt; extracted keywords: [learning, neural, models, parsing, semantic]</p>
              </div>
              <div className="flex justify-between items-center text-[9px] border-t border-white/5 pt-2">
                <span>SENTIMENT: POSITIVE (89%)</span>
                <span className="text-neonPurple">READ TIME: 2 MIN</span>
              </div>
            </div>
          </div>
        </motion.div>

      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight">
            High-Performance Synthesizer Features
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Experience premium cognitive utilities optimized for desktop and mobile devices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className={featureClass}>
            <div className="p-3 rounded-2xl bg-neonBlue/10 text-neonBlue w-fit mb-4 text-xl"><FiZap /></div>
            <h3 className="font-bold text-base mb-2">Local NLP Core</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Synthesize reports using our localized TF-IDF parsing model. Enjoy zero latency and total text confidentiality.
            </p>
          </div>

          <div className={featureClass}>
            <div className="p-3 rounded-2xl bg-neonPurple/10 text-neonPurple w-fit mb-4 text-xl"><FiFolderPlus /></div>
            <h3 className="font-bold text-base mb-2">Word & Docx Parser</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Drag and drop local `.txt` or `.docx` files. The system decodes documents and prepares diagnostic summaries instantly.
            </p>
          </div>

          <div className={featureClass}>
            <div className="p-3 rounded-2xl bg-neonPink/10 text-neonPink w-fit mb-4 text-xl"><FiGlobe /></div>
            <h3 className="font-bold text-base mb-2">Web Article Scraper</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Input any blog or news URL. Our backend filters out navigational layouts and scrapes the article body to summarize.
            </p>
          </div>

          <div className={featureClass}>
            <div className="p-3 rounded-2xl bg-green-500/10 text-green-400 w-fit mb-4 text-xl"><FiSmile /></div>
            <h3 className="font-bold text-base mb-2">Sentiment Analytics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Map the emotional tone of text documents instantly using integrated AFINN-based lexicons.
            </p>
          </div>

          <div className={featureClass}>
            <div className="p-3 rounded-2xl bg-yellow-500/10 text-yellow-400 w-fit mb-4 text-xl"><FiVolume2 /></div>
            <h3 className="font-bold text-base mb-2">Speech Synthesizer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Listen to generated summaries using web-based text-to-speech, and dictate new transcripts directly with voice recognition.
            </p>
          </div>

          <div className={featureClass}>
            <div className="p-3 rounded-2xl bg-red-500/10 text-red-400 w-fit mb-4 text-xl"><FiShield /></div>
            <h3 className="font-bold text-base mb-2">curated star history</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bookmark highlights, export formatted summaries as PDF layouts, copy to clipboard, or search preceding history.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/10 dark:border-white/5 py-8 text-center text-xs text-slate-500 z-10">
        &copy; {new Date().getFullYear()} AetherSummary Systems. Distributed under local MIT guidelines.
      </footer>
    </div>
  );
};

export default LandingPage;
