const router = require('express').Router();
const { refreshTokens, logout, getMe, register, login, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const { verifyAccessToken } = require('../middleware/auth');

// Local Auth
router.post('/register', register);
router.post('/login', login);

// Password reset flow
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Refresh token
router.post('/refresh', refreshTokens);

// Logout (requires auth)
router.post('/logout', verifyAccessToken, logout);

// Get current user
router.get('/me', verifyAccessToken, getMe);

module.exports = router;
