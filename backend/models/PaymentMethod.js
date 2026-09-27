const mongoose = require('mongoose');

const PaymentMethodSchema = new mongoose.Schema(
  {
    ownerCompany: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ['bkash', 'nagad', 'rocket', 'upay'],
      required: true,
      lowercase: true,
    },
    gateway: {
      type: String,
      enum: ['personal', 'agent', 'merchant'],
      default: 'personal',
    },
    accountNumber: { type: String, required: true, trim: true },
    simIndex: { type: Number, enum: [1, 2], required: true },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaymentMethod', PaymentMethodSchema);
