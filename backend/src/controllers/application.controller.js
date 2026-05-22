const Application = require('../models/Application');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * POST /api/v1/applications
 */
const create = asyncHandler(async (req, res) => {
  const { company, jobTitle, jobUrl, status, fitScore, tags, notes, analysisId, coverLetterId } = req.body;

  if (!company || !jobTitle) {
    throw ApiError.badRequest('Company and jobTitle are required');
  }

  const app = await Application.create({
    userId: req.user.id,
    company,
    jobTitle,
    jobUrl,
    status: status || 'saved',
    fitScore,
    tags,
    notes,
    analysisId,
    coverLetterId,
    ...(status === 'applied' && { appliedAt: new Date() }),
  });

  res.status(201).json({ success: true, data: app });
});

/**
 * GET /api/v1/applications
 * Returns applications grouped by status for Kanban board.
 */
const getAll = asyncHandler(async (req, res) => {
  const { status, sort = '-updatedAt' } = req.query;
  const filter = { userId: req.user.id };
  if (status) filter.status = status;

  const applications = await Application.find(filter)
    .sort(sort)
    .populate('analysisId', 'score')
    .populate('coverLetterId', 'version');

  res.json({ success: true, data: applications });
});

/**
 * GET /api/v1/applications/kanban
 * Returns applications grouped by status columns.
 */
const getKanban = asyncHandler(async (req, res) => {
  const applications = await Application.find({ userId: req.user.id })
    .sort('-updatedAt')
    .populate('analysisId', 'score');

  const kanban = {
    saved: applications.filter(a => a.status === 'saved'),
    applied: applications.filter(a => a.status === 'applied'),
    interview: applications.filter(a => a.status === 'interview'),
    offer: applications.filter(a => a.status === 'offer'),
    rejected: applications.filter(a => a.status === 'rejected'),
  };

  res.json({ success: true, data: kanban });
});

/**
 * GET /api/v1/applications/:id
 */
const getOne = asyncHandler(async (req, res) => {
  const app = await Application.findOne({ _id: req.params.id, userId: req.user.id })
    .populate('analysisId')
    .populate('coverLetterId');
  if (!app) throw ApiError.notFound('Application not found');
  res.json({ success: true, data: app });
});

/**
 * PATCH /api/v1/applications/:id
 */
const update = asyncHandler(async (req, res) => {
  const allowed = ['company', 'jobTitle', 'jobUrl', 'status', 'fitScore', 'tags', 'notes', 'interviewAt'];
  const updates = {};
  allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

  // Track when status changes to 'applied'
  if (updates.status === 'applied') updates.appliedAt = new Date();

  const app = await Application.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    updates,
    { new: true, runValidators: true }
  );

  if (!app) throw ApiError.notFound('Application not found');
  res.json({ success: true, data: app });
});

/**
 * DELETE /api/v1/applications/:id
 */
const remove = asyncHandler(async (req, res) => {
  const app = await Application.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!app) throw ApiError.notFound('Application not found');
  res.json({ success: true, message: 'Application deleted' });
});

module.exports = { create, getAll, getKanban, getOne, update, remove };
