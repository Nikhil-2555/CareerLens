const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    jobDescription: {
      type: String,
      required: [true, 'Job description is required'],
    },
    jobTitle: {
      type: String,
      default: '',
    },
    company: {
      type: String,
      default: '',
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    strengths: [{
      type: String,
    }],
    gaps: [{
      type: String,
    }],
    matchedKeywords: [{
      type: String,
    }],
    missingKeywords: [{
      type: String,
    }],
    suggestions: [{
      type: String,
    }],
    atsScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    badFormatting: [{
      type: String,
    }],
    atsRecommendations: [{
      type: String,
    }],
    rawAiResponse: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Analysis', analysisSchema);
