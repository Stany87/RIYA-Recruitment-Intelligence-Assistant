const mongoose = require('mongoose');

const STAGES = [
  'new_application',
  'ai_screened',
  'under_review',
  'shortlisted',
  'interview',
  'offer',
  'hired',
  'rejected',
];

const stageHistorySchema = new mongoose.Schema(
  {
    stage: { type: String, enum: STAGES, required: true },
    movedBy: { type: mongoose.Schema.Types.Mixed, required: true }, // ObjectId or 'riya_ai'
    movedAt: { type: Date, default: Date.now },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const aiScreeningDataSchema = new mongoose.Schema(
  {
    criteriaBreakdown: [
      {
        criterion: String,
        score: Number,
        note: String,
      },
    ],
    strengths: [String],
    gaps: [String],
    redFlags: [String],
    confidence: { type: Number, min: 0, max: 100 },
    modelVersion: { type: String, default: '' },
    screenedAt: { type: Date },
  },
  { _id: false }
);

const candidateSchema = new mongoose.Schema(
  {
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agency',
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      default: null,
    },

    // Personal info
    name: {
      type: String,
      required: [true, 'Candidate name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Candidate email is required'],
      lowercase: true,
      trim: true,
    },
    phone: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    location: { type: String, default: '' },

    // CV data
    cvFileKey: { type: String, default: '' }, // S3/R2 key (future)
    cvFileUrl: { type: String, default: '' }, // signed URL (future)
    cvParsedText: { type: String, default: '' },

    // Job applied for (from Sheet or manual entry)
    jobAppliedFor: { type: String, default: '' },

    // AI Screening
    aiScore: { type: Number, min: 0, max: 100, default: null },
    aiRecommendation: {
      type: String,
      enum: ['SHORTLIST', 'MAYBE', 'REJECT', null],
      default: null,
    },
    aiScreeningData: {
      type: aiScreeningDataSchema,
      default: () => ({}),
    },

    // Pipeline
    stage: {
      type: String,
      enum: STAGES,
      default: 'new_application',
      index: true,
    },
    stageHistory: [stageHistorySchema],

    // Recruiter fields
    recruiterScore: { type: Number, min: 1, max: 10, default: null },
    recruiterNotes: { type: String, default: '' },
    nextAction: { type: String, default: '' },
    nextActionDate: { type: Date, default: null },

    // Meta
    source: {
      type: String,
      enum: ['gmail_trigger', 'manual', 'csv_import', 'sheet_sync'],
      default: 'manual',
    },
    emailThreadId: { type: String, default: '' },
    acknowledgedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for tenant-scoped queries
candidateSchema.index({ agencyId: 1, email: 1 }, { unique: true });
candidateSchema.index({ agencyId: 1, stage: 1 });
candidateSchema.index({ agencyId: 1, aiScore: -1 });
candidateSchema.index({ agencyId: 1, createdAt: -1 });

// Export stages for use in routes/controllers
candidateSchema.statics.STAGES = STAGES;

module.exports = mongoose.model('Candidate', candidateSchema);
