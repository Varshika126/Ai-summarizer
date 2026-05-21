import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../apiClient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { motion } from 'framer-motion';
import {
  FiEdit,
  FiFileText,
  FiLink2,
  FiUploadCloud,
  FiSettings,
  FiCheck,
  FiCopy,
  FiStar,
  FiDownload,
  FiMic,
  FiVolume2,
  FiArrowRight,
  FiTrash2,
  FiEdit2,
  FiBookmark
} from 'react-icons/fi';

const SummarizerWorkspace = () => {
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('id');

  // Input states
  const [inputType, setInputType] = useState('text'); // 'text' | 'url' | 'file'
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [summaryType, setSummaryType] = useState('medium'); // 'short' | 'medium' | 'detailed' | 'bullet' | 'executive'

  // Speech Recognition (STT)
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Speech Synthesis (TTS)
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Drag and Drop
  const [dragActive, setDragActive] = useState(false);

  // App UI states
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [summary, setSummary] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [error, setError] = useState('');

  // Fetch deep-linked summary if provided in URL
  useEffect(() => {
    if (queryId) {
      const fetchLinkedSummary = async () => {
        try {
          setLoading(true);
          const { data } = await api.get(`/api/summaries/${queryId}`);
          setSummary(data);
          setEditedTitle(data.generatedTitle);
        } catch (err) {
          console.error('Failed to load linked summary:', err);
          setError('Could not retrieve requested summary.');
        } finally {
          setLoading(false);
        }
      };
      fetchLinkedSummary();
    }
  }, [queryId]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setText(prev => prev + (prev ? ' ' : '') + transcript);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported by your current browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // Text-To-Speech (TTS)
  const handleSpeak = (textToSpeak) => {
    if ('speechSynthesis' in window) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Speech synthesis is not supported on this browser.');
    }
  };

  // Drag and Drop File Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const ext = droppedFile.name.split('.').pop().toLowerCase();
      if (ext === 'txt' || ext === 'docx') {
        setFile(droppedFile);
        setError('');
      } else {
        setError('Unsupported format. Only .txt and .docx files are permitted.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  // Run Summarizer API
  const handleProcess = async (e) => {
    e.preventDefault();
    setError('');
    setSummary(null);

    // Form validation
    if (inputType === 'text' && text.trim().length < 50) {
      setError('Pasted text content must be at least 50 characters long.');
      return;
    }
    if (inputType === 'url' && !url) {
      setError('Please provide a valid website URL.');
      return;
    }
    if (inputType === 'file' && !file) {
      setError('Please select a .txt or .docx file.');
      return;
    }

    try {
      setLoading(true);
      let res;

      if (inputType === 'file') {
        const formData = new FormData();
        formData.append('inputType', 'file');
        formData.append('file', file);
        formData.append('summaryType', summaryType);
        formData.append('fileTitle', file.name);

        res = await api.post('/api/summaries', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await api.post('/api/summaries', {
          inputType,
          text: inputType === 'text' ? text : undefined,
          url: inputType === 'url' ? url : undefined,
          summaryType
        });
      }

      setSummary(res.data);
      setEditedTitle(res.data.generatedTitle);
    } catch (err) {
      setError(err.response?.data?.message || 'Processing failed. Check input structure.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle Favorite Status
  const handleToggleFavorite = async () => {
    if (!summary) return;
    try {
      const { data } = await api.put(`/api/summaries/${summary._id}/favorite`);
      setSummary(prev => ({ ...prev, isFavorite: data.isFavorite }));
    } catch (err) {
      console.error('Failed to toggle favorite status:', err);
    }
  };

  // Save Title Edit
  const handleSaveTitle = async () => {
    if (!summary || !editedTitle.trim()) return;
    try {
      const { data } = await api.put(`/api/summaries/${summary._id}/title`, { title: editedTitle });
      setSummary(prev => ({ ...prev, generatedTitle: data.generatedTitle }));
      setEditMode(false);
    } catch (err) {
      console.error('Failed to edit title:', err);
    }
  };

  // Export Results
  const handleCopy = () => {
    if (!summary) return;
    const textToCopy = `Title: ${summary.generatedTitle}\n\nSummary:\n${summary.detailedSummary}\n\nBullet Points:\n${summary.bulletPoints.map(p => `• ${p}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!summary) return;
    const content = `Title: ${summary.generatedTitle}\nOriginal Source: ${summary.originalTitle}\nSentiment: ${summary.sentiment}\nReading Time: ${summary.readingTime} min\n\nShort Summary:\n${summary.shortSummary}\n\nDetailed Summary:\n${summary.detailedSummary}\n\nBullet Points:\n${summary.bulletPoints.map(p => `- ${p}`).join('\n')}\n\nInsights:\n${summary.insights.map(i => `* ${i}`).join('\n')}\n\nKeywords: ${summary.keywords.join(', ')}`;
    const element = document.createElement('a');
    const fileBlob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(fileBlob);
    element.download = `${summary.generatedTitle.replace(/\s+/g, '_')}_summary.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadPdf = () => {
    if (!summary) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${summary.generatedTitle}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            h1 { color: #8b5cf6; border-bottom: 2px solid #06b6d4; padding-bottom: 10px; margin-bottom: 5px; }
            .subtitle { font-size: 14px; color: #64748b; margin-bottom: 30px; font-style: italic; }
            .badge-container { display: flex; gap: 10px; margin-bottom: 30px; }
            .badge { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: bold; background: #f1f5f9; color: #475569; }
            .badge-accent { background: #e0f7fe; color: #0369a1; }
            .section { margin-bottom: 30px; }
            .section-title { font-weight: 800; font-size: 16px; margin-bottom: 10px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; border-left: 3px solid #8b5cf6; padding-left: 10px; }
            ul { padding-left: 20px; margin: 5px 0; }
            li { margin-bottom: 8px; }
            .keywords { font-size: 12px; color: #475569; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          </style>
        </head>
        <body>
          <h1>${summary.generatedTitle}</h1>
          <div class="subtitle">Synthesized from: ${summary.originalTitle}</div>
          
          <div class="badge-container">
            <span class="badge">Reading Time: ${summary.readingTime} min</span>
            <span class="badge badge-accent">Sentiment: ${summary.sentiment}</span>
            <span class="badge">Engine: Local TF-IDF</span>
          </div>

          <div class="section">
            <div class="section-title">Overview Analysis</div>
            <p>${summary.shortSummary}</p>
          </div>

          <div class="section">
            <div class="section-title">Detailed Expansion</div>
            <p>${summary.detailedSummary}</p>
          </div>

          ${summary.bulletPoints.length ? `
          <div class="section">
            <div class="section-title">Key Bullet Targets</div>
            <ul>
              ${summary.bulletPoints.map(pt => `<li>${pt}</li>`).join('')}
            </ul>
          </div>
          ` : ''}

          ${summary.insights.length ? `
          <div class="section">
            <div class="section-title">Primary Insights</div>
            <ul>
              ${summary.insights.map(ins => `<li>${ins}</li>`).join('')}
            </ul>
          </div>
          ` : ''}

          <div class="keywords">
            <strong>Key Indexing Terms:</strong> ${summary.keywords.join(', ')}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    // Delay to let browser render and fetch resources
    setTimeout(() => {
      printWindow.print();
    }, 450);
  };

  const cardClass = `p-6 rounded-3xl border transition-all duration-300 ${
    theme === 'dark'
      ? 'glass-panel border-white/5 text-white'
      : 'glass-panel-light border-slate-200 text-slate-800'
  }`;

  // Word & Character count
  const getWordCount = () => text.split(/\s+/).filter(w => w.length > 0).length;
  const getCharCount = () => text.length;

  return (
    <div className={`min-h-screen flex transition-colors ${
      theme === 'dark' ? 'mesh-gradient text-white' : 'mesh-gradient-light text-slate-800'
    }`}>
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 p-6 lg:p-8 pt-24 overflow-y-auto max-w-7xl w-full mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight dark:text-white">
              Synthesizer Workspace
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Select your input medium, configure summarization profiles, and compile results.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Input Panels (Left 7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className={cardClass}>
                {/* Input Option Selection tabs */}
                <div className="flex border-b border-slate-800/10 dark:border-white/5 mb-6">
                  {[
                    { id: 'text', label: 'Paste text', icon: FiFileText },
                    { id: 'file', label: 'Upload file', icon: FiUploadCloud },
                    { id: 'url', label: 'Article URL', icon: FiLink2 }
                  ].map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setInputType(tab.id);
                          setError('');
                        }}
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 font-semibold text-sm transition-all ${
                          inputType === tab.id
                            ? 'border-neonBlue text-neonBlue bg-neonBlue/5'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Icon /> {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Validation Messages */}
                {error && (
                  <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Form Input fields */}
                <form onSubmit={handleProcess} className="space-y-6">
                  {/* Tab 1: Paste Text */}
                  {inputType === 'text' && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
                        <span>Characters: {getCharCount()} / Words: {getWordCount()}</span>
                        <button
                          type="button"
                          onClick={toggleListening}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] transition-colors ${
                            isListening
                              ? 'border-red-500 bg-red-500/10 text-red-400 animate-pulse'
                              : 'border-slate-700 hover:border-neonBlue hover:text-neonBlue'
                          }`}
                        >
                          <FiMic /> {isListening ? 'Listening...' : 'Voice Dictate'}
                        </button>
                      </div>
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Paste or dictate your long document text here (minimum 50 characters)..."
                        className={`w-full h-80 p-4 rounded-2xl outline-none text-sm font-medium resize-y transition-all ${
                          theme === 'dark' ? 'glass-input text-white' : 'glass-input-light text-slate-800'
                        }`}
                      />
                    </div>
                  )}

                  {/* Tab 2: File Upload */}
                  {inputType === 'file' && (
                    <div className="space-y-2">
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-all ${
                          dragActive
                            ? 'border-neonBlue bg-neonBlue/5'
                            : 'border-slate-800/20 dark:border-white/10 hover:border-slate-600 dark:hover:border-white/20'
                        }`}
                      >
                        <input
                          type="file"
                          id="file-upload-input"
                          onChange={handleFileChange}
                          accept=".txt,.docx"
                          className="hidden"
                        />
                        <label htmlFor="file-upload-input" className="cursor-pointer flex flex-col items-center">
                          <div className="p-4 rounded-2xl bg-slate-800/10 dark:bg-white/5 border border-slate-700/20 mb-4 text-neonBlue text-2xl">
                            <FiUploadCloud />
                          </div>
                          <span className="font-bold text-sm block">Drag & drop your document here</span>
                          <span className="text-xs text-slate-400 mt-1 block">Supports .txt and .docx file sizes up to 5MB</span>
                          <span className="mt-4 px-4 py-1.5 rounded-full text-xs font-semibold bg-slate-800/40 dark:bg-white/5 border border-slate-700/40 hover:bg-slate-800 transition-colors inline-block">
                            Browse Files
                          </span>
                        </label>
                      </div>

                      {file && (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 dark:bg-white/5 border border-slate-700/20 text-xs">
                          <span className="font-semibold truncate max-w-[80%]">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                          <button
                            type="button"
                            onClick={() => setFile(null)}
                            className="p-1 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 3: Scrape URL */}
                  {inputType === 'url' && (
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Article or Blog URL
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <FiLink2 />
                        </div>
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          placeholder="https://wikipedia.org/wiki/Artificial_intelligence"
                          className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all ${
                            theme === 'dark' ? 'glass-input text-white' : 'glass-input-light text-slate-800'
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Settings / Config Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/10 dark:border-white/5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        Summarization Profile
                      </label>
                      <select
                        value={summaryType}
                        onChange={(e) => setSummaryType(e.target.value)}
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

                    <div className="flex items-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 rounded-xl font-bold bg-gradient-to-r from-neonBlue to-neonPurple text-white hover:opacity-90 glow-blue transition-all flex items-center justify-center gap-2 group"
                      >
                        Execute Synthesizer <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Results Panel (Right 5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {loading ? (
                <div className={cardClass}>
                  <Loader title="Synthesizing Content" />
                </div>
              ) : summary ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  {/* Results Main Header Card */}
                  <div className={cardClass}>
                    {/* Header Toolbar */}
                    <div className="flex items-center justify-between mb-4 border-b border-slate-800/10 dark:border-white/5 pb-3">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Synthesized Results</span>
                      <div className="flex items-center gap-2">
                        {/* Favorite */}
                        <button
                          onClick={handleToggleFavorite}
                          className={`p-2 rounded-lg border transition-all ${
                            summary.isFavorite
                              ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
                              : 'text-slate-400 bg-slate-800/30 dark:bg-white/5 border-slate-700/40 hover:text-white'
                          }`}
                          title="Save to favorites"
                        >
                          <FiStar className={summary.isFavorite ? 'fill-current' : ''} />
                        </button>
                        {/* Audio Speak */}
                        <button
                          onClick={() => handleSpeak(summary.detailedSummary)}
                          className={`p-2 rounded-lg border transition-all ${
                            isSpeaking
                              ? 'text-neonPink bg-neonPink/10 border-neonPink/20 animate-pulse'
                              : 'text-slate-400 bg-slate-800/30 dark:bg-white/5 border-slate-700/40 hover:text-white'
                          }`}
                          title={isSpeaking ? 'Mute Speech' : 'Listen Summary'}
                        >
                          <FiVolume2 />
                        </button>
                        {/* Copy */}
                        <button
                          onClick={handleCopy}
                          className="p-2 rounded-lg bg-slate-800/30 dark:bg-white/5 border border-slate-700/40 text-slate-400 hover:text-white transition-all"
                          title="Copy to clipboard"
                        >
                          {copied ? <FiCheck className="text-green-400" /> : <FiCopy />}
                        </button>
                        {/* Download Menu */}
                        <button
                          onClick={handleDownloadTxt}
                          className="p-2 rounded-lg bg-slate-800/30 dark:bg-white/5 border border-slate-700/40 text-slate-400 hover:text-white transition-all"
                          title="Download as TXT"
                        >
                          <FiDownload />
                        </button>
                        <button
                          onClick={handleDownloadPdf}
                          className="p-2 rounded-lg bg-slate-800/30 dark:bg-white/5 border border-slate-700/40 text-slate-400 hover:text-white transition-all"
                          title="Export PDF Document"
                        >
                          <FiBookmark />
                        </button>
                      </div>
                    </div>

                    {/* Editable Title */}
                    <div className="mb-6">
                      {editMode ? (
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            className={`w-full px-3 py-1.5 rounded-xl text-sm outline-none ${
                              theme === 'dark' ? 'glass-input text-white' : 'glass-input-light text-slate-800'
                            }`}
                          />
                          <button
                            onClick={handleSaveTitle}
                            className="px-3 py-1.5 rounded-xl bg-neonBlue text-white text-xs font-bold"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                          {summary.generatedTitle}
                          <button
                            onClick={() => setEditMode(true)}
                            className="text-xs text-slate-400 hover:text-white"
                          >
                            <FiEdit2 />
                          </button>
                        </h3>
                      )}
                      <p className="text-[11px] text-slate-400 mt-1">Source: {summary.originalTitle}</p>
                    </div>

                    {/* Summarization tabs */}
                    <div className="space-y-4">
                      {/* Overview */}
                      <div className="p-4 rounded-2xl bg-slate-800/10 dark:bg-white/5 border border-slate-700/20">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block mb-2">Overview Summary</span>
                        <p className="text-xs leading-relaxed text-slate-300 dark:text-slate-300">{summary.shortSummary}</p>
                      </div>

                      {/* Detailed Summary */}
                      <div className="p-4 rounded-2xl bg-slate-800/10 dark:bg-white/5 border border-slate-700/20">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block mb-2">Detailed Digest</span>
                        <p className="text-xs leading-relaxed text-slate-300 dark:text-slate-300">{summary.detailedSummary}</p>
                      </div>

                      {/* Bullet points */}
                      {summary.bulletPoints.length > 0 && (
                        <div className="p-4 rounded-2xl bg-slate-800/10 dark:bg-white/5 border border-slate-700/20">
                          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block mb-2">Key Bullet Takeaways</span>
                          <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-300 dark:text-slate-300">
                            {summary.bulletPoints.map((pt, index) => (
                              <li key={index}>{pt}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Insights */}
                      {summary.insights.length > 0 && (
                        <div className="p-4 rounded-2xl bg-slate-800/10 dark:bg-white/5 border border-slate-700/20">
                          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block mb-2">Critical Highlights</span>
                          <ul className="list-decimal pl-4 space-y-1.5 text-xs text-slate-300 dark:text-slate-300 font-mono">
                            {summary.insights.map((ins, index) => (
                              <li key={index}>{ins}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadata and statistics sidebar card */}
                  <div className={cardClass}>
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-slate-800/10 dark:border-white/5 pb-2 dark:text-white">Linguistic Diagnostic</h3>
                    <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                      <div>
                        <span className="text-slate-400 block">Sentiment Tone</span>
                        <span className={`inline-block mt-1 font-bold px-2 py-0.5 rounded ${
                          summary.sentiment === 'Positive'
                            ? 'bg-green-500/10 text-green-400'
                            : summary.sentiment === 'Negative'
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {summary.sentiment}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Est. Reading Time</span>
                        <span className="inline-block mt-1 font-bold dark:text-white">{summary.readingTime} min</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400 block mb-2">Extracted Keywords</span>
                      <div className="flex flex-wrap gap-1.5">
                        {summary.keywords.map((word, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 rounded bg-slate-800/40 dark:bg-white/5 border border-slate-700/20 text-[10px] font-mono tracking-wide text-neonBlue"
                          >
                            #{word}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-64 rounded-3xl border border-dashed border-slate-700/30 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <FiSettings className="text-3xl mb-3 text-slate-500 animate-spin-slow" />
                  <span className="font-semibold text-sm">Awaiting Content Synthesizer</span>
                  <span className="text-xs text-slate-500 mt-1">Configure options on the left and execute the engine to generate diagnostic summaries.</span>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default SummarizerWorkspace;
