const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * Helper: find or create a MongoDB user from the Clerk userId.
 * On first API call after Clerk signup, this auto-creates the user doc.
 */
async function findOrCreateUser(clerkId) {
  let user = await User.findOne({ clerkId });
  if (!user) {
    // Auto-create user on first API request after Clerk signup
    user = await User.create({
      clerkId,
      email: `${clerkId}@clerk.pending`, // placeholder until webhook or profile update
      name: 'New User',
    });
  }
  return user;
}

/**
 * GET /api/v1/users/profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await findOrCreateUser(req.user.id);
  res.json({ success: true, data: user });
});

/**
 * PATCH /api/v1/users/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, settings } = req.body;
  const updateData = {};

  if (name) updateData.name = name;
  if (settings) updateData.settings = settings;

  let user = await User.findOne({ clerkId: req.user.id });
  if (!user) {
    user = await findOrCreateUser(req.user.id);
  }

  const updated = await User.findOneAndUpdate({ clerkId: req.user.id }, updateData, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, data: updated });
});

/**
 * GET /api/v1/users/stats
 */
const getStats = asyncHandler(async (req, res) => {
  const Application = require('../models/Application');
  const Analysis = require('../models/Analysis');
  const CoverLetter = require('../models/CoverLetter');

  const userId = req.user.id;

  const [totalApps, analyses, coverLetters, interviews] = await Promise.all([
    Application.countDocuments({ userId }),
    Analysis.find({ userId }).select('score'),
    CoverLetter.countDocuments({ userId }),
    Application.countDocuments({ userId, status: 'interview' }),
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

  const userId = req.user.id;

  // Delete all user data
  await Promise.all([
    Resume.deleteMany({ userId }),
    Analysis.deleteMany({ userId }),
    CoverLetter.deleteMany({ userId }),
    Application.deleteMany({ userId }),
    User.findOneAndDelete({ clerkId: userId }),
  ]);

  res.json({ success: true, message: 'Account deleted successfully' });
});

module.exports = { getProfile, updateProfile, getStats, deleteAccount };
