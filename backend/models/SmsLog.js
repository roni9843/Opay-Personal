const mongoose = require('mongoose');

const SmsLogSchema = new mongoose.Schema(
  {
    recipient: { type: String, required: true, index: true },
    message: { type: String },
    type: { type: String, enum: ['otp', 'single', 'bulk'], default: 'otp' },
    otp: { type: String },
    status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
    response: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SmsLog', SmsLogSchema);
