const Analysis = require('../models/Analysis');
const Resume = require('../models/Resume');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { analyzeResume } = require('../services/ai.service');

/**
 * POST /api/v1/analyses
 * Run AI analysis on a resume against a job description.
 */
const createAnalysis = asyncHandler(async (req, res) => {
  const { resumeId, jobDescription, jobTitle, company } = req.body;

  if (!resumeId || !jobDescription) {
    throw ApiError.badRequest('resumeId and jobDescription are required');
  }

  // Fetch resume
  const resume = await Resume.findOne({ _id: resumeId, userId: req.user.id });
  if (!resume) throw ApiError.notFound('Resume not found');

  // Run AI analysis
  const result = await analyzeResume(resume.extractedText, jobDescription);

  // Save analysis
  const analysis = await Analysis.create({
    userId: req.user.id,
    resumeId,
    jobDescription,
    jobTitle: jobTitle || '',
    company: company || '',
    score: result.score,
    strengths: result.strengths,
    gaps: result.gaps,
    matchedKeywords: result.matchedKeywords,
    missingKeywords: result.missingKeywords,
    suggestions: result.suggestions,
  });

  res.status(201).json({ success: true, data: analysis });
});

/**
 * GET /api/v1/analyses
 */
const getAnalyses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const [analyses, total] = await Promise.all([
    Analysis.find({ userId: req.user.id })
      .select('-rawAiResponse -jobDescription')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .populate('resumeId', 'fileName'),
    Analysis.countDocuments({ userId: req.user.id }),
  ]);

  res.json({
    success: true,
    data: analyses,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
  });
});

/**
 * GET /api/v1/analyses/:id
 */
const getAnalysis = asyncHandler(async (req, res) => {
  const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.user.id })
    .populate('resumeId', 'fileName fileType');
  if (!analysis) throw ApiError.notFound('Analysis not found');
  res.json({ success: true, data: analysis });
});

/**
 * DELETE /api/v1/analyses/:id
 */
const deleteAnalysis = asyncHandler(async (req, res) => {
  const analysis = await Analysis.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!analysis) throw ApiError.notFound('Analysis not found');
  res.json({ success: true, message: 'Analysis deleted' });
});

module.exports = { createAnalysis, getAnalyses, getAnalysis, deleteAnalysis };
