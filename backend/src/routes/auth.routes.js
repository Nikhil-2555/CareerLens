// Auth routes are now handled by Clerk.
// This file is kept as a placeholder for any custom auth-adjacent endpoints.
const router = require('express').Router();

// Health check for auth
router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'Authentication is handled by Clerk. Visit the frontend to sign in.',
  });
});

module.exports = router;
