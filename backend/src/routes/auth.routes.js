const router = require('express').Router();
const { refreshTokens, logout, getMe, register, login } = require('../controllers/auth.controller');
const { verifyAccessToken } = require('../middleware/auth');

// Local Auth
router.post('/register', register);
router.post('/login', login);

// Refresh token
router.post('/refresh', refreshTokens);

// Logout (requires auth)
router.post('/logout', verifyAccessToken, logout);

// Get current user
router.get('/me', verifyAccessToken, getMe);

module.exports = router;
