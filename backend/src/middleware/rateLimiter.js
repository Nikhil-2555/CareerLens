const rateLimit = require('express-rate-limit');

// General API limiter: 60 req/min per IP
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT', message: 'Too many requests, please try again later.' },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI endpoints limiter: 10 req/min per IP
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT', message: 'AI rate limit exceeded. Please wait a moment.' },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth limiter: 20 req/min per IP
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT', message: 'Too many auth attempts.' },
  },
});

module.exports = { apiLimiter, aiLimiter, authLimiter };
