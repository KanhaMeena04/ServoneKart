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

