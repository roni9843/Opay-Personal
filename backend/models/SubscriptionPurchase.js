const mongoose = require('mongoose');

const subscriptionPurchaseSchema = new mongoose.Schema(
  {
    companyOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubscriptionPackage',
      required: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    sessionCode: {
      type: String,
    },
    transactionId: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'REJECTED', 'FAILED'],
      default: 'PENDING',
    },
    bank: {
      type: String,
    },
    proofImages: [{
      type: String,
    }],
    paymentPageUrl: {
      type: String,
    },
    rawWebhookData: {
      type: Object,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SubscriptionPurchase', subscriptionPurchaseSchema);
