const mongoose = require('mongoose');

const GlobalSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true }, // e.g. 'sms_rate_settings'
    smsPerRate: { type: Number, default: 0.50 }, // BDT rate per extra/purchased SMS (e.g. 0.50 BDT)
    minSmsPurchaseQty: { type: Number, default: 100 }, // Minimum SMS purchase quantity
    gatewayNotice: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GlobalSetting', GlobalSettingSchema);
