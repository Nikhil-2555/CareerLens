const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * GET /api/v1/users/profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw ApiError.notFound('User not found');

  res.json({ success: true, data: user });
});

/**
 * PATCH /api/v1/users/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, settings } = req.body;
  const updateData = {};

  if (name) updateData.name = name;
  if (settings) updateData.settings = { ...req.user.settings, ...settings };

  const user = await User.findByIdAndUpdate(req.user.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) throw ApiError.notFound('User not found');
  res.json({ success: true, data: user });
});

/**
 * GET /api/v1/users/stats
 */
const getStats = asyncHandler(async (req, res) => {
  const Application = require('../models/Application');
  const Analysis = require('../models/Analysis');
  const CoverLetter = require('../models/CoverLetter');

  const [totalApps, analyses, coverLetters, interviews] = await Promise.all([
    Application.countDocuments({ userId: req.user.id }),
    Analysis.find({ userId: req.user.id }).select('score'),
    CoverLetter.countDocuments({ userId: req.user.id }),
    Application.countDocuments({ userId: req.user.id, status: 'interview' }),
  ]);

  const avgScore = analyses.length > 0
    ? Math.round(analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length)
    : 0;

  res.json({
    success: true,
    data: {
      totalApplications: totalApps,
      averageFitScore: avgScore,
      coverLettersGenerated: coverLetters,
      interviewsScheduled: interviews,
    },
  });
});

/**
 * DELETE /api/v1/users/account
 */
const deleteAccount = asyncHandler(async (req, res) => {
  const Resume = require('../models/Resume');
  const Analysis = require('../models/Analysis');
  const CoverLetter = require('../models/CoverLetter');
  const Application = require('../models/Application');

  // Delete all user data
  await Promise.all([
    Resume.deleteMany({ userId: req.user.id }),
    Analysis.deleteMany({ userId: req.user.id }),
    CoverLetter.deleteMany({ userId: req.user.id }),
    Application.deleteMany({ userId: req.user.id }),
    User.findByIdAndDelete(req.user.id),
  ]);

  res.clearCookie('refreshToken', { path: '/' });
  res.json({ success: true, message: 'Account deleted successfully' });
});

module.exports = { getProfile, updateProfile, getStats, deleteAccount };
