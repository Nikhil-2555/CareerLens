const router = require('express').Router();
const { createAnalysis, analyzeDirect, getAnalyses, getAnalysis, deleteAnalysis, optimize, matchJobs } = require('../controllers/analysis.controller');
const { verifyAccessToken, optionalAuth } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

// Public-ish route (works with or without auth)
router.post('/analyze-direct', optionalAuth, aiLimiter, analyzeDirect);
router.post('/optimize', optionalAuth, aiLimiter, optimize);
router.post('/match-jobs', optionalAuth, aiLimiter, matchJobs);

// Protected routes
router.use(verifyAccessToken);

router.post('/', aiLimiter, createAnalysis);
router.get('/', getAnalyses);
router.get('/:id', getAnalysis);
router.delete('/:id', deleteAnalysis);

module.exports = router;
