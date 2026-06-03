const crypto = require('crypto');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { issueTokenPair, rotateRefreshToken, revokeAllTokens } = require('../services/token.service');
const { sendPasswordResetEmail } = require('../services/email.service');

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

/**
 * Validate password strength.
 * At least 8 chars, 1 uppercase, 1 number.
 */
function validatePassword(password) {
  const errors = [];
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
  if (!/[0-9]/.test(password)) errors.push('Password must contain at least one number');
  return errors;
}

/**
 * POST /auth/refresh
 * Rotate refresh token and issue new pair.
 */
const refreshTokens = asyncHandler(async (req, res) => {
  const oldRefreshToken = req.cookies.refreshToken;
  if (!oldRefreshToken) {
    throw ApiError.unauthorized('No refresh token provided');
  }

  const { accessToken, refreshToken } = await rotateRefreshToken(oldRefreshToken);

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

  res.json({
    success: true,
    data: { accessToken },
  });
});

/**
 * POST /auth/logout
 * Clear refresh cookie and revoke all tokens.
 */
const logout = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  
  if (userId) {
    await revokeAllTokens(userId);
  }

  res.clearCookie('refreshToken', { path: '/' });

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * GET /auth/me
 * Get current authenticated user profile.
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-refreshTokens');
  if (!user) throw ApiError.notFound('User not found');

  res.json({
    success: true,
    data: user,
  });
});

/**
 * POST /auth/register
 * Register a new user with email and password.
 * Enforces strong password validation.
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw ApiError.badRequest('Name, email, and password are required');
  }

  // Strong password validation
  const passwordErrors = validatePassword(password);
  if (passwordErrors.length > 0) {
    throw ApiError.badRequest('Password does not meet requirements', {
      password: passwordErrors,
    });
  }

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.badRequest('Email already in use');
  }

  const user = await User.create({
    name,
    email,
    password,
    provider: 'local'
  });

  const { accessToken, refreshToken } = await issueTokenPair(user);

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

  res.status(201).json({
    success: true,
    data: {
      accessToken,
      user
    }
  });
});

/**
 * POST /auth/login
 * Login with email and password
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw ApiError.badRequest('Email and password are required');
  }

  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !user.password) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const { accessToken, refreshToken } = await issueTokenPair(user);

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

  res.json({
    success: true,
    data: {
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        settings: user.settings
      }
    }
  });
});

/**
 * POST /auth/forgot-password
 * Generates a reset token, saves its hash to DB, and emails the raw token link.
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw ApiError.badRequest('Email is required');
  }

  const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpire');

  // Always return success to avoid email enumeration
  if (!user) {
    return res.json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.',
    });
  }

  // Generate token
  const rawToken = user.generateResetToken();
  await user.save({ validateBeforeSave: false });

  // Build reset URL — frontend page that calls /auth/reset-password
  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0];
  const resetUrl = `${clientUrl}/reset-password/${rawToken}`;

  try {
    await sendPasswordResetEmail(user.email, resetUrl);
  } catch {
    // Rollback token on email failure
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    throw ApiError.internal('Email could not be sent. Please try again later.');
  }

  res.json({
    success: true,
    message: 'If an account with that email exists, a reset link has been sent.',
  });
});

/**
 * POST /auth/reset-password/:token
 * Verifies the token, checks expiry, and sets the new password.
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  if (!password) {
    throw ApiError.badRequest('New password is required');
  }

  // Validate new password strength
  const passwordErrors = validatePassword(password);
  if (passwordErrors.length > 0) {
    throw ApiError.badRequest('Password does not meet requirements', {
      password: passwordErrors,
    });
  }

  // Hash the incoming raw token the same way we hashed it during generation
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpire +password');

  if (!user) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  // Set new password & clear reset fields
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  // Revoke all existing refresh tokens (force re-login on other devices)
  user.refreshTokens = [];

  await user.save();

  // Issue fresh token pair so the user is logged in immediately
  const { accessToken, refreshToken } = await issueTokenPair(user);

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

  res.json({
    success: true,
    message: 'Password reset successful',
    data: { accessToken },
  });
});

module.exports = { refreshTokens, logout, getMe, register, login, forgotPassword, resetPassword };
