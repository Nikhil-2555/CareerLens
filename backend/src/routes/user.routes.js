const router = require('express').Router();
const { getProfile, updateProfile, getStats, deleteAccount } = require('../controllers/user.controller');
const { verifyAccessToken } = require('../middleware/auth');

router.use(verifyAccessToken);

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.get('/stats', getStats);
router.delete('/account', deleteAccount);

module.exports = router;
