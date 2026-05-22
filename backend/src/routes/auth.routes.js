const router = require('express').Router();
const passport = require('passport');
const { googleCallback, refreshTokens, logout, getMe, register, login } = require('../controllers/auth.controller');
const { verifyAccessToken } = require('../middleware/auth');

// Local Auth
router.post('/register', register);
router.post('/login', login);

// Google OAuth - initiate
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
}));

// Google OAuth - callback
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed` }),
  googleCallback
);

// Refresh token
router.post('/refresh', refreshTokens);

// Logout (requires auth)
router.post('/logout', verifyAccessToken, logout);

// Get current user
router.get('/me', verifyAccessToken, getMe);

module.exports = router;
