const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema(
  {
    deviceCode: { type: String, required: true, unique: true, index: true }, // Android Secure ID
    deviceName: { type: String, required: true, trim: true },
    ownerCompany: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserSubscription',
    },
    state: { type: Boolean, default: false }, // Online/Offline
    batteryLevel: { type: Number, default: 100 },
    isCharging: { type: Boolean, default: false },
    networkType: { type: String, default: 'WiFi' },
    networkName: { type: String, default: 'N/A' },
    fcmToken: { type: String },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Device', DeviceSchema);
