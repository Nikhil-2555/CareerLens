const Resume = require('../models/Resume');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { extractText } = require('../services/extract.service');

/**
 * POST /api/v1/resumes/upload
 */
const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded');

  const { originalname, mimetype, size, buffer } = req.file;

  // Extract text from file
  const extractedText = await extractText(buffer, mimetype, originalname);

  // Determine file type
  const fileType = mimetype.includes('pdf') ? 'pdf' : mimetype.includes('wordprocessing') ? 'docx' : 'txt';

  // Check if user already has 5 resumes
  const count = await Resume.countDocuments({ userId: req.user.id });
  if (count >= 5) {
    throw ApiError.badRequest('Maximum 5 resumes allowed. Please delete one first.');
  }

  const resume = await Resume.create({
    userId: req.user.id,
    fileName: originalname,
    fileType,
    fileSize: size,
    extractedText,
    isDefault: count === 0, // First resume is default
  });

  res.status(201).json({
    success: true,
    data: {
      id: resume._id,
      fileName: resume.fileName,
      fileType: resume.fileType,
      fileSize: resume.fileSize,
      isDefault: resume.isDefault,
      createdAt: resume.createdAt,
    },
  });
});

/**
 * GET /api/v1/resumes
 */
const getResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ userId: req.user.id })
    .select('-extractedText')
    .sort('-createdAt');

  res.json({ success: true, data: resumes });
});

/**
 * GET /api/v1/resumes/:id
 */
const getResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
  if (!resume) throw ApiError.notFound('Resume not found');
  res.json({ success: true, data: resume });
});

/**
 * DELETE /api/v1/resumes/:id
 */
const deleteResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!resume) throw ApiError.notFound('Resume not found');
  res.json({ success: true, message: 'Resume deleted' });
});

/**
 * PATCH /api/v1/resumes/:id/default
 */
const setDefaultResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
  if (!resume) throw ApiError.notFound('Resume not found');

  resume.isDefault = true;
  await resume.save(); // Pre-save hook handles unsetting other defaults

  res.json({ success: true, data: resume });
});

module.exports = { uploadResume, getResumes, getResume, deleteResume, setDefaultResume };
