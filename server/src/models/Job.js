const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agency',
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    department: { type: String, default: '', trim: true },
    location: { type: String, default: '', trim: true },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship'],
      default: 'full-time',
    },
    experienceMin: { type: Number, default: 0 },
    salaryMin: { type: Number, default: null },
    salaryMax: { type: Number, default: null },
    currency: { type: String, default: 'INR' },
    description: { type: String, default: '' }, // full JD text
    requirements: [String],
    niceToHave: [String],
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'filled', 'archived'],
      default: 'active',
      index: true,
    },
    applicantCount: { type: Number, default: 0 },
    postedAt: { type: Date, default: Date.now },
    closingDate: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

jobSchema.index({ agencyId: 1, status: 1 });

module.exports = mongoose.model('Job', jobSchema);
