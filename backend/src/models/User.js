const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: [true, 'Clerk ID is required'],
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    avatar: {
      type: String,
      default: '',
    },
    provider: {
      type: String,
      enum: ['clerk', 'local'],
      default: 'clerk',
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    settings: {
      theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
      emailNotifications: { type: Boolean, default: true },
      analysisNotifications: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('User', userSchema);
