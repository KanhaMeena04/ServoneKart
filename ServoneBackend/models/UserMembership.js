const mongoose = require('mongoose');

const userMembershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'userModel',
      index: true,
    },
    userModel: {
      type: String,
      required: true,
      enum: ['User', 'Rider', 'Restaurant'],
      default: 'User',
    },
    userName: {
      type: String,
      default: '',
    },
    userEmail: {
      type: String,
      default: '',
    },
    userPhone: {
      type: String,
      default: '',
    },
    targetAudience: {
      type: String,
      enum: ['user', 'rider', 'vendor'],
      required: true,
      index: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MembershipPlan',
      required: true,
    },
    planName: {
      type: String,
      required: true,
    },
    pricePaid: {
      type: Number,
      required: true,
      default: 0,
    },
    billingCycle: {
      type: String,
      default: 'month',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
      index: true,
    },
    paymentMethod: {
      type: String,
      default: 'Online',
    },
    paymentStatus: {
      type: String,
      enum: ['completed', 'pending', 'failed'],
      default: 'completed',
    },
    badgeText: {
      type: String,
      default: 'PREMIER',
    },
    transactionId: {
      type: String,
      default: () => `TXN-MEM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    },
  },
  {
    timestamps: true,
  }
);

userMembershipSchema.index({ userId: 1, status: 1 });
userMembershipSchema.index({ targetAudience: 1, status: 1 });

module.exports = mongoose.model('UserMembership', userMembershipSchema);

