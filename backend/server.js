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
app.use(cors({
  origin: '*', // In production, refine to specific domains
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
