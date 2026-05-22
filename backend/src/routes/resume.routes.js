const router = require('express').Router();
const { uploadResume, getResumes, getResume, deleteResume, setDefaultResume } = require('../controllers/resume.controller');
const { verifyAccessToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(verifyAccessToken);

router.post('/upload', upload.single('resume'), uploadResume);
router.get('/', getResumes);
router.get('/:id', getResume);
router.delete('/:id', deleteResume);
router.patch('/:id/default', setDefaultResume);

module.exports = router;
