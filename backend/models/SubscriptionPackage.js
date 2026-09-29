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
    freeSmsCount: { type: Number, default: 1000 }, // Number of free SMS included
    chargeType: { type: String, enum: ['percentage', 'flat'], default: 'percentage' }, // Charge type: percentage (%) or flat (BDT)
    chargeValue: { type: Number, default: 0 }, // Charge rate/amount per transaction
    features: [{ type: String }],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SubscriptionPackage', SubscriptionPackageSchema);
