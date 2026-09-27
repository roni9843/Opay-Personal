const mongoose = require('mongoose');

const SubscriptionPackageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true }, // e.g. "Monthly Starter", "Enterprise Yearly"
    durationMonths: { type: Number, required: true, min: 1 }, // 1, 3, 6, 12
    price: { type: Number, required: true, default: 0 },
    maxDevices: { type: Number, required: true, default: 1 },
    maxAgents: { type: Number, required: true, default: 2 },
    features: [{ type: String }],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SubscriptionPackage', SubscriptionPackageSchema);
