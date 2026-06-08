const mongoose = require('mongoose');

const agencySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Agency name is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    logoUrl: {
      type: String,
      default: '',
    },
    plan: {
      type: String,
      enum: ['starter', 'growth', 'enterprise'],
      default: 'starter',
    },
    settings: {
      sheetsId: { type: String, default: '' },
      autoScreening: { type: Boolean, default: true },
      connectedGmail: { type: String, default: '' },
      riyaAgentId: { type: String, default: '' },
      riyaApiKey: { type: String, default: '' },
      riyaProjectId: { type: String, default: '' },
      riyaRegionCode: { type: String, default: '' },
      notifyOnShortlist: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug from name before validation
agencySchema.pre('validate', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug =
      this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') +
      '-' +
      Date.now().toString(36);
  }
  next();
});

agencySchema.methods.toJSON = function () {
  const obj = this.toObject();
  // Strip internal settings from API responses unless explicitly needed
  if (obj.settings) {
    delete obj.settings.riyaApiKey;
  }
  return obj;
};

module.exports = mongoose.model('Agency', agencySchema);
