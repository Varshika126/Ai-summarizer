const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
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

// Middlewares
const isDev = process.env.NODE_ENV !== 'production';

// Extra allowed origins from env (comma-separated)
const extraOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (same-origin on Vercel, curl, mobile)
    if (!origin) return callback(null, true);
    // Always allow in development
    if (isDev) return callback(null, true);
    // Allow all vercel.app preview/production deployments
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    // Allow localhost for testing
    if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      return callback(null, true);
    }
    // Allow any extra origins defined in env
    if (extraOrigins.includes('*') || extraOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route prefix support for services that mount backend under a subpath
const BACKEND_ROUTE_PREFIX = process.env.BACKEND_ROUTE_PREFIX || '';
const apiPrefix = `${BACKEND_ROUTE_PREFIX}/api`;

// Routes
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/settings`, settingsRoutes);
app.use(`${apiPrefix}/summaries`, summaryRoutes);

app.get('/', (req, res) => {
  res.send('AI Content Summarizer API is running...');
});

// Serve frontend build if deployed as a single fullstack app
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
  });
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Only start the HTTP server when running directly (local dev)
// Vercel serverless imports this file as a module
if (process.env.NODE_ENV !== 'production' || require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
