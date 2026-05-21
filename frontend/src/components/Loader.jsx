import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const loaderStatuses = [
  'Connecting to neural scanner...',
  'Parsing document structure...',
  'Tokenizing raw content & cleansing syntax...',
  'Evaluating sentence TF-IDF weights...',
  'Running semantic density algorithms...',
  'Extracting positive/negative sentiment weights...',
  'Aggregating keywords & topic clusters...',
  'Finalizing summary cards...'
];

const Loader = ({ title = 'Processing Content' }) => {
  const [statusIdx, setStatusIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIdx(prev => (prev + 1) % loaderStatuses.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
      {/* Dynamic Animated Core */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Outer Rotating Glow */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-t-neonBlue border-r-transparent border-b-neonPurple border-l-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Middle Pulse Ring */}
        <motion.div
          className="absolute w-16 h-16 rounded-full border border-neonPink opacity-60"
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        {/* Inner Laser Point */}
        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-neonBlue to-neonPurple glow-blue animate-pulse" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-neonBlue via-neonPurple to-neonPink">
          {title}
        </h3>
        <p className="text-sm text-slate-400 dark:text-slate-400 font-mono tracking-wider h-5 overflow-hidden">
          <motion.span
            key={statusIdx}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-block"
          >
            &gt; {loaderStatuses[statusIdx]}
          </motion.span>
        </p>
      </div>
    </div>
  );
};

export default Loader;
