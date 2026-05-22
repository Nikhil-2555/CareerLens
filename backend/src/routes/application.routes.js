const router = require('express').Router();
const { create, getAll, getKanban, getOne, update, remove } = require('../controllers/application.controller');
const { verifyAccessToken } = require('../middleware/auth');

router.use(verifyAccessToken);

router.post('/', create);
router.get('/', getAll);
router.get('/kanban', getKanban);
router.get('/:id', getOne);
router.patch('/:id', update);
router.delete('/:id', remove);

module.exports = router;
