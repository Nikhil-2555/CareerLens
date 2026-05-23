const CoverLetter = require('../models/CoverLetter');
const Analysis = require('../models/Analysis');
const Resume = require('../models/Resume');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { generateCoverLetter } = require('../services/ai.service');

/**
 * POST /api/v1/coverletter/generate
 */
const generate = asyncHandler(async (req, res) => {
  const { analysisId } = req.body;
  if (!analysisId) throw ApiError.badRequest('analysisId is required');

  const analysis = await Analysis.findOne({ _id: analysisId, userId: req.user.id });
  if (!analysis) throw ApiError.notFound('Analysis not found');

  const resume = await Resume.findById(analysis.resumeId);
  if (!resume) throw ApiError.notFound('Resume not found');

  const content = await generateCoverLetter(
    resume.extractedText,
    analysis.jobDescription,
    analysis.jobTitle,
    analysis.company
  );

  // Count existing versions
  const versionCount = await CoverLetter.countDocuments({ analysisId, userId: req.user.id });

  const coverLetter = await CoverLetter.create({
    userId: req.user.id,
    analysisId,
    jobTitle: analysis.jobTitle,
    company: analysis.company,
    content,
    version: versionCount + 1,
  });

  res.status(201).json({ success: true, data: coverLetter });
});

/**
 * GET /api/v1/coverletter
 */
const getAll = asyncHandler(async (req, res) => {
  const coverLetters = await CoverLetter.find({ userId: req.user.id })
    .sort('-createdAt')
    .populate('analysisId', 'score jobTitle company');
  res.json({ success: true, data: coverLetters });
});

/**
 * GET /api/v1/coverletter/:id
 */
const getOne = asyncHandler(async (req, res) => {
  const cl = await CoverLetter.findOne({ _id: req.params.id, userId: req.user.id });
  if (!cl) throw ApiError.notFound('Cover letter not found');
  res.json({ success: true, data: cl });
});

/**
 * PATCH /api/v1/coverletter/:id
 */
const update = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) throw ApiError.badRequest('Content is required');

  const cl = await CoverLetter.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { content, isEdited: true },
    { new: true }
  );
  if (!cl) throw ApiError.notFound('Cover letter not found');
  res.json({ success: true, data: cl });
});

/**
 * DELETE /api/v1/coverletter/:id
 */
const remove = asyncHandler(async (req, res) => {
  const cl = await CoverLetter.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!cl) throw ApiError.notFound('Cover letter not found');
  res.json({ success: true, message: 'Cover letter deleted' });
});

/**
 * POST /api/v1/coverletter/generate-direct
 * Generate cover letter from raw resume text + JD (no analysisId needed)
 */
const generateDirect = asyncHandler(async (req, res) => {
  const { resumeText, jobDescription, jobTitle, company } = req.body;

  if (!resumeText || !jobDescription) {
    throw ApiError.badRequest('resumeText and jobDescription are required');
  }

  const content = await generateCoverLetter(
    resumeText,
    jobDescription,
    jobTitle || '',
    company || ''
  );

  res.status(200).json({ success: true, data: { content, jobTitle, company } });
});

module.exports = { generate, generateDirect, getAll, getOne, update, remove };
