const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agency',
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: ['candidate', 'job', 'user'],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    action: {
      type: String,
      required: true,
      // e.g. 'stage_changed', 'candidate_synced', 'notes_updated',
      // 'recruiter_score_set', 'candidate_created', 'job_created'
    },
    performedBy: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      // ObjectId for users, 'riya_ai' or 'system' for automated actions
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

activitySchema.index({ agencyId: 1, createdAt: -1 });
activitySchema.index({ agencyId: 1, entityId: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
