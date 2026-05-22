const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generate JWT access token (short-lived, 15 min)
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  );
};

/**
 * Generate JWT refresh token (long-lived, 7 days)
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }
  );
};

/**
 * Issue token pair and save refresh token to user document
 */
const issueTokenPair = async (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store refresh token
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  user.refreshTokens.push({ token: refreshToken, expiresAt });
  
  // Keep only last 5 refresh tokens
  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5);
  }
  
  await user.save();

  return { accessToken, refreshToken };
};

/**
 * Verify refresh token and rotate (issue new pair)
 */
const rotateRefreshToken = async (oldRefreshToken) => {
  const decoded = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) throw new Error('User not found');

  // Check if token exists in stored tokens
  const tokenIndex = user.refreshTokens.findIndex(rt => rt.token === oldRefreshToken);
  if (tokenIndex === -1) throw new Error('Refresh token revoked');

  // Remove old token
  user.refreshTokens.splice(tokenIndex, 1);

  // Issue new pair
  return issueTokenPair(user);
};

/**
 * Revoke all refresh tokens for a user (logout)
 */
const revokeAllTokens = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshTokens: [] });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  issueTokenPair,
  rotateRefreshToken,
  revokeAllTokens,
};
