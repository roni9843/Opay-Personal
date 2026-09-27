const mongoose = require('mongoose');

const PaymentSessionSchema = new mongoose.Schema(
  {
    sessionToken: { type: String, required: true, unique: true, index: true },
    companyOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserSubscription',
    },
    amount: { type: Number, required: true },
    customerRef: { type: String, required: true },
    callbackUrl: { type: String },
    successRedirectUrl: { type: String },
    status: {
      type: String,
      enum: ['pending', 'paid', 'expired', 'cancelled'],
      default: 'pending',
      index: true,
    },
    paymentMethod: { type: String }, // e.g. 'bkash', 'nagad'
    accountNumber: { type: String },
    trxID: { type: String },
    matchedMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PaymentMessage',
    },
    webhookStatus: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
    },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaymentSession', PaymentSessionSchema);
