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
    atsScore: result.atsScore,
    badFormatting: result.badFormatting,
    atsRecommendations: result.atsRecommendations,
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

/**
 * POST /api/v1/analyses/analyze-direct
 * Run AI analysis from raw resume text + JD (no resumeId needed).
 */
const analyzeDirect = asyncHandler(async (req, res) => {
  const { resumeText, jobDescription, jobTitle, company } = req.body;

  if (!resumeText || !jobDescription) {
    throw ApiError.badRequest('resumeText and jobDescription are required');
  }

  if (resumeText.trim().length < 50) {
    throw ApiError.badRequest('Resume text is too short. Please provide a complete resume.');
  }

  // Run AI analysis
  const result = await analyzeResume(resumeText, jobDescription);

  res.status(200).json({
    success: true,
    data: {
      score: result.score,
      atsScore: result.atsScore,
      badFormatting: result.badFormatting,
      atsRecommendations: result.atsRecommendations,
      strengths: result.strengths,
      gaps: result.gaps,
      matchedKeywords: result.matchedKeywords,
      missingKeywords: result.missingKeywords,
      suggestions: result.suggestions,
      jobTitle: jobTitle || '',
      company: company || '',
    },
  });
});

/**
 * POST /api/v1/analyses/optimize
 * Optimize resume text directly based on a job description.
 */
const optimize = asyncHandler(async (req, res) => {
  const { resumeText, jobDescription } = req.body;

  if (!resumeText || !jobDescription) {
    throw ApiError.badRequest('resumeText and jobDescription are required');
  }

  const result = await require('../services/ai.service').optimizeResume(resumeText, jobDescription);

  res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * POST /api/v1/analyses/match-jobs
 * Suggest best-fit job roles based on a resume.
 */
const matchJobs = asyncHandler(async (req, res) => {
  const { resumeText } = req.body;
  if (!resumeText) throw ApiError.badRequest('resumeText is required');

  const result = await require('../services/ai.service').matchJobs(resumeText);
  res.status(200).json({ success: true, data: result });
});

module.exports = { createAnalysis, analyzeDirect, getAnalyses, getAnalysis, deleteAnalysis, optimize, matchJobs };
