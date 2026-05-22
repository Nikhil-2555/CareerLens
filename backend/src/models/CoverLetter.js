const mongoose = require('mongoose');

const coverLetterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    analysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Analysis',
    },
    jobTitle: {
      type: String,
      default: '',
    },
    company: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      required: [true, 'Cover letter content is required'],
    },
    version: {
      type: Number,
      default: 1,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CoverLetter', coverLetterSchema);
