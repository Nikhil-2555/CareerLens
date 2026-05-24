const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { issueTokenPair, rotateRefreshToken, revokeAllTokens } = require('../services/token.service');

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

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
 * Register a new user with email and password
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw ApiError.badRequest('Name, email, and password are required');
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

module.exports = { refreshTokens, logout, getMe, register, login };
