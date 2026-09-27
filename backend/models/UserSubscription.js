const mongoose = require('mongoose');
const crypto = require('crypto');

const UserSubscriptionSchema = new mongoose.Schema(
  {
    companyOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubscriptionPackage',
      required: true,
    },
    apiKey: { type: String, unique: true, index: true },
    apiKeyActive: { type: Boolean, default: true },
    apiCallbackUrl: { type: String, trim: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    active: { type: Boolean, default: true },
    maxAdminDevicesSnapshot: { type: Number, default: 1 },
    maxAgentsSnapshot: { type: Number, default: 2 },
    maxDevicesPerAgentSnapshot: { type: Number, default: 1 },
    maxDevicesSnapshot: { type: Number, default: 3 },
  },
  { timestamps: true }
);

// Helper to generate API key
UserSubscriptionSchema.statics.generateApiKey = function () {
  return 'opay_live_' + crypto.randomBytes(24).toString('hex');
};

module.exports = mongoose.model('UserSubscription', UserSubscriptionSchema);
