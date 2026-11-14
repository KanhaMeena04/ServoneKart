const mongoose = require('mongoose');

const membershipPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    targetAudience: {
      type: String,
      enum: ['user', 'rider', 'vendor'],
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    billingCycle: {
      type: String,
      enum: ['day', 'week', 'month', 'quarter', 'year', 'one-time'],
      default: 'month',
    },
    tag: {
      type: String,
      default: '', // e.g. 'PREMIER', 'PRO, DAY PASS', 'POPULAR', 'RECOMMENDED'
      trim: true,
    },
    badge: {
      type: String,
      default: 'PREMIER', // Badge text shown next to user name
      trim: true,
    },
    badgeColor: {
      type: String,
      default: '#0B3EDB',
    },
    subtitle: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    perks: [
      {
        title: { type: String, default: '' },
        description: { type: String, default: '' },
      },
    ],
    commissionRate: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

membershipPlanSchema.index({ targetAudience: 1, isActive: 1, sortOrder: 1 });

module.exports = mongoose.model('MembershipPlan', membershipPlanSchema);
