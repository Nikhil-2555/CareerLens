const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

/**
 * Verify JWT access token from Authorization header.
 * Attaches decoded user to req.user
 */
const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('No access token provided');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Access token expired');
    }
    throw ApiError.unauthorized('Invalid access token');
  }
};

/**
 * Optional auth — attaches user if token present, but doesn't block
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch {
    // Silently ignore invalid tokens for optional auth
  }
  next();
};

module.exports = { verifyAccessToken, optionalAuth };
