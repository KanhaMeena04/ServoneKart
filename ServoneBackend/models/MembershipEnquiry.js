const mongoose = require('mongoose');

const membershipEnquirySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['rider', 'vendor', 'user'],
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      default: '',
      trim: true,
    },
    storeName: {
      type: String,
      default: '',
      trim: true,
    },
    ownerName: {
      type: String,
      default: '',
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    vehicleType: {
      type: String,
      default: '',
      trim: true,
    },
    area: {
      type: String,
      default: '',
      trim: true,
    },
    liveItems: {
      type: String,
      default: '',
      trim: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MembershipPlan',
    },
    planName: {
      type: String,
      default: '',
    },
    planPrice: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'free', 'failed'],
      default: 'free',
    },
    paymentMethod: {
      type: String,
      default: 'None',
    },
    transactionId: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

membershipEnquirySchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('MembershipEnquiry', membershipEnquirySchema);

