const router = require('express').Router();
const { createAnalysis, getAnalyses, getAnalysis, deleteAnalysis } = require('../controllers/analysis.controller');
const { verifyAccessToken } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(verifyAccessToken);

router.post('/', aiLimiter, createAnalysis);
router.get('/', getAnalyses);
router.get('/:id', getAnalysis);
router.delete('/:id', deleteAnalysis);

module.exports = router;
