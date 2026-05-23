const router = require('express').Router();
const { uploadResume, getResumes, getResume, deleteResume, setDefaultResume } = require('../controllers/resume.controller');
const { verifyAccessToken, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { extractText } = require('../services/extract.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// Public route — extract text from uploaded file (no auth required)
router.post('/extract-text', optionalAuth, upload.single('resume'), asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded');
  const { originalname, mimetype, buffer } = req.file;
  const text = await extractText(buffer, mimetype, originalname);
  res.json({ success: true, data: { text, fileName: originalname } });
}));

// Protected routes
router.use(verifyAccessToken);

router.post('/upload', upload.single('resume'), uploadResume);
router.get('/', getResumes);
router.get('/:id', getResume);
router.delete('/:id', deleteResume);
router.patch('/:id/default', setDefaultResume);

module.exports = router;
