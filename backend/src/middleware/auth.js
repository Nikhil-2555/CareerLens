const { getAuth } = require('@clerk/express');
const ApiError = require('../utils/ApiError');

/**
 * Verify Clerk session token from Authorization header.
 * Attaches auth info to req.auth (userId, sessionId, etc.)
 */
const verifyAccessToken = (req, res, next) => {
  const auth = getAuth(req);

  if (!auth || !auth.userId) {
    throw ApiError.unauthorized('Not authenticated. Please sign in.');
  }

  // For backward compatibility, also set req.user
  req.user = { id: auth.userId };
  next();
};

/**
 * Optional auth — attaches user if Clerk session present, but doesn't block
 */
const optionalAuth = (req, res, next) => {
  try {
    const auth = getAuth(req);
    if (auth && auth.userId) {
      req.user = { id: auth.userId };
    }
  } catch {
    // Silently ignore — no valid session
  }
  next();
};

module.exports = { verifyAccessToken, optionalAuth };
