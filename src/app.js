const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
require('dotenv').config();


const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
const optionalEnvVars = ['JWT_EXPIRES_IN', 'NODE_ENV', 'PORT'];


requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    logger.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});


if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 12) {
  logger.error('JWT_SECRET must be at least 12 characters long');
  process.exit(1);
}


optionalEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    logger.warn(`Optional environment variable not set: ${varName}`);
  }
});

const authRoutes = require('./routes/authRoutes');
const searchRoutes = require('./routes/searchRoutes');
const spamRoutes = require('./routes/spamRoutes');

const app = express();


app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, 
  message: 'Too many authentication attempts'
});

app.use('/api/auth', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/spam', spamRoutes);


app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});


app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message
  });
});


app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;