const mongoose = require('mongoose');

const PaymentMessageSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, index: true },
    from: { type: String, default: 'unknown' },
    fullMessage: { type: String, required: true },
    trxID: { type: String, required: true, index: true },
    provider: { type: String, lowercase: true },
    date: { type: String },
    time: { type: String },
    deviceId: { type: String, required: true, index: true },
    deviceName: { type: String },
    ownerCompany: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    verify: { type: Boolean, default: false },
    apiAccessToken: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PaymentSession',
    },
    deviceTime: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaymentMessage', PaymentMessageSchema);
