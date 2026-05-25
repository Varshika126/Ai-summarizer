const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const summaryRoutes = require('./routes/summaryRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// CORS — allow vercel.app domains, localhost, and any custom domains via env
const extraOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      return callback(null, true);
    }
    if (extraOrigins.includes('*') || extraOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check routes
app.get('/', (req, res) => res.json({ message: 'AI Content Summarizer API is running' }));
app.get('/api', (req, res) => res.json({ message: 'AI Content Summarizer API is running' }));

// Debug endpoint — shows which env vars are present (not their values)
app.get('/api/debug/env', (req, res) => {
  res.json({
    has_google_API_KEY: !!process.env.google_API_KEY,
    has_JWT_SECRET: !!process.env.JWT_SECRET,
    has_MONGO_URI: !!process.env.MONGO_URI,
    has_LANGSMITH_TRACING: !!process.env.LANGSMITH_TRACING,
    has_LANGSMITH_API_KEY: !!process.env.LANGSMITH_API_KEY,
    has_LANGSMITH_PROJECT: !!process.env.LANGSMITH_PROJECT,
    NODE_ENV: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/summaries', summaryRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Only bind to port when running directly (local dev)
// On Vercel, the file is imported as a module — no listen needed
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
