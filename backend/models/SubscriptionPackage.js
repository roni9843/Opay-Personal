const mongoose = require('mongoose');

const SubscriptionPackageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    durationMonths: { type: Number, required: true, min: 1 },
    regularPrice: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 }, // Offer Price
    maxAdminDevices: { type: Number, required: true, default: 1 }, // Devices for Company Owner/Admin
    maxAgents: { type: Number, required: true, default: 2 }, // Staff Agents limit
    maxDevicesPerAgent: { type: Number, required: true, default: 1 }, // Max devices allowed per Staff Agent
    maxDevices: { type: Number, default: 3 }, // Total combined capacity
    features: [{ type: String }],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SubscriptionPackage', SubscriptionPackageSchema);
