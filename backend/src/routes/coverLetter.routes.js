const router = require('express').Router();
const { generate, getAll, getOne, update, remove } = require('../controllers/coverLetter.controller');
const { verifyAccessToken } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(verifyAccessToken);

router.post('/generate', aiLimiter, generate);
router.get('/', getAll);
router.get('/:id', getOne);
router.patch('/:id', update);
router.delete('/:id', remove);

module.exports = router;
