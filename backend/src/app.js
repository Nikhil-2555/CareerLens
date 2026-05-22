const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const passport = require('passport');

// Load passport strategies
require('./config/passport');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const resumeRoutes = require('./routes/resume.routes');
const analysisRoutes = require('./routes/analysis.routes');
const coverLetterRoutes = require('./routes/coverLetter.routes');
const applicationRoutes = require('./routes/application.routes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// ─── Security ───
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Body parsing ───
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// ─── Logging ───
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Passport ───
app.use(passport.initialize());

// ─── Rate limiting ───
app.use('/api', apiLimiter);

// ─── Health check ───
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ─── Routes ───
app.use('/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/resumes', resumeRoutes);
app.use('/api/v1/analyses', analysisRoutes);
app.use('/api/v1/coverletter', coverLetterRoutes);
app.use('/api/v1/applications', applicationRoutes);

// ─── 404 handler ───
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.originalUrl} not found`,
    },
  });
});

// ─── Global error handler ───
app.use(errorHandler);

module.exports = app;

