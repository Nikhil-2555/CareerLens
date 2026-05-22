const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    jobUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['saved', 'applied', 'interview', 'offer', 'rejected'],
      default: 'saved',
      index: true,
    },
    analysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Analysis',
    },
    coverLetterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CoverLetter',
    },
    fitScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    notes: {
      type: String,
      default: '',
    },
    tags: [{
      type: String,
      trim: true,
    }],
    appliedAt: Date,
    interviewAt: Date,
  },
  {
    timestamps: true,
  }
);

// Compound index for kanban queries
applicationSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
