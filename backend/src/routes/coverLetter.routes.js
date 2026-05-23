const router = require('express').Router();
const { generate, generateDirect, getAll, getOne, update, remove } = require('../controllers/coverLetter.controller');
const { verifyAccessToken, optionalAuth } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

// Public-ish route (works with or without auth)
router.post('/generate-direct', optionalAuth, aiLimiter, generateDirect);

// Protected routes
router.use(verifyAccessToken);

router.post('/generate', aiLimiter, generate);
router.get('/', getAll);
router.get('/:id', getOne);
router.patch('/:id', update);
router.delete('/:id', remove);

module.exports = router;
