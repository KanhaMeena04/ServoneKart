const mongoose = require('mongoose');

const deliverySlabSchema = new mongoose.Schema({
  minDistanceKm: { type: Number, required: true, min: 0 },
  maxDistanceKm: { type: Number, required: true, min: 0 },
  fee: { type: Number, required: true, min: 0 },
  perKmFee: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true }
});

const AdminSettingSchema = new mongoose.Schema(
  {
    appName: { type: String, trim: true, default: 'Tricelyn' },
    platformMode: {
      type: String,
      enum: ['grocery', 'food', 'both'],
      default: 'grocery',
    },
    primaryVertical: { type: String, trim: true, default: 'grocery' },
    enableFoodDelivery: { type: Boolean, default: false },
    enableGroceryDelivery: { type: Boolean, default: true },
    isCodEnabled: { type: Boolean, default: true },
    metaTitle: { type: String, trim: true, default: 'Tricelyn - Instant Grocery & Hyperlocal Delivery' },
    metaDescription: { type: String, trim: true, default: 'Tricelyn | Multi-Vendor Quick Commerce Grocery Delivery' },
    iosAppLink: { type: String, trim: true, default: '' },
    androidAppLink: { type: String, trim: true, default: '' },
    siteEmail: { type: String, trim: true, default: 'care@tricelyn.com' },
    siteContact: { type: String, trim: true, default: '+91 731-4099880' },
    menuColors: { type: String, trim: true, default: '#0F62FE' },
    highlightColors: { type: String, trim: true, default: '#248C70' },
    adminCommission: { type: String, trim: true, default: '20' },
    restaurantCommission: { type: String, trim: true, default: '80' },
    globalGeofenceRadius: { type: String, trim: true, default: '5000' },
    defaultUnit: { type: String, trim: true, default: 'KM' },
    orderPrefix: { type: String, trim: true, default: 'TRC' },
    primaryLanguage: { type: String, trim: true, default: 'English' },
    secondaryLanguage: { type: String, trim: true, default: 'Hindi' },
    facebook: { type: String, trim: true, default: '' },
    instagram: { type: String, trim: true, default: '' },
    emailEnable: { type: String, trim: true, default: 'Yes' },
    smsEnable: { type: String, trim: true, default: 'Yes' },
    codEnable: { type: String, trim: true, default: 'Yes' },
    onlinePaymentEnable: { type: String, trim: true, default: 'Yes' },
    freeDeliveryEnable: { type: String, trim: true, default: 'Yes' },
    isTaxInclusive: { type: String, trim: true, default: 'Yes' },
    logoUrl: { type: String, trim: true, default: '' },
    contactEmail: { type: String, trim: true, default: '' },
    contactPhone: { type: String, trim: true, default: '' },
    termsUrl: { type: String, trim: true, default: '' },
    privacyUrl: { type: String, trim: true, default: '' },

    // Delivery Fee Configuration
    deliveryFeeConfig: {
      enabled: { type: Boolean, default: true },
      baseFee: { type: Number, default: 30 },
      baseDistanceKm: { type: Number, default: 3 },
      maxDeliveryRadiusKm: { type: Number, default: 12 },
      isFreeDeliveryEnabled: { type: Boolean, default: true },
      freeDeliveryThreshold: { type: Number, default: 500 },
      slabs: {
        type: [deliverySlabSchema],
        default: [
          { minDistanceKm: 0, maxDistanceKm: 3, fee: 30, perKmFee: 0, isActive: true },
          { minDistanceKm: 3, maxDistanceKm: 5, fee: 40, perKmFee: 0, isActive: true },
          { minDistanceKm: 5, maxDistanceKm: 8, fee: 60, perKmFee: 0, isActive: true },
          { minDistanceKm: 8, maxDistanceKm: 12, fee: 80, perKmFee: 0, isActive: true }
        ]
      }
    },

    // Surge Charges Configuration
    surgeConfig: {
      peakHour: {
        enabled: { type: Boolean, default: false },
        fee: { type: Number, default: 15 },
        startTime: { type: String, default: '12:00' },
        endTime: { type: String, default: '15:00' }
      },
      nightCharge: {
        enabled: { type: Boolean, default: false },
        fee: { type: Number, default: 25 },
        startTime: { type: String, default: '23:00' },
        endTime: { type: String, default: '06:00' }
      },
      rainCharge: {
        enabled: { type: Boolean, default: false },
        fee: { type: Number, default: 20 }
      },
      highDemandCharge: {
        enabled: { type: Boolean, default: false },
        fee: { type: Number, default: 15 }
      }
    },

    // Commission Configuration
    commissionConfig: {
      globalCommissionPercent: { type: Number, default: 20 },
      categoryCommissions: [{
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
        categoryName: { type: String },
        commissionPercent: { type: Number, required: true }
      }]
    },

    // Platform Fee Configuration
    platformFeeConfig: {
      enabled: { type: Boolean, default: true },
      type: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' },
      fee: { type: Number, default: 5 },
      minFee: { type: Number, default: 5 },
      maxFee: { type: Number, default: 20 }
    },

    // Packaging Fee Configuration
    packagingFeeConfig: {
      enabled: { type: Boolean, default: true },
      globalPackagingFee: { type: Number, default: 10 }
    },

    // Rider Tip Configuration
    tipConfig: {
      enabled: { type: Boolean, default: true },
      options: { type: [Number], default: [5, 10, 20] }
    },

    // Tax Configuration (GST)
    taxConfig: {
      enabled: { type: Boolean, default: true },
      gstPercent: { type: Number, default: 5 }
    },

    // Self Pickup Master Configuration (Requirement 18)
    selfPickupConfig: {
      enabled: { type: Boolean, default: true },
      pickupCapacityPerHour: { type: Number, default: 20 },
      preparationBufferMins: { type: Number, default: 10 },
      gracePeriodMins: { type: Number, default: 15 },
      cancellationWindowMins: { type: Number, default: 5 },
      customerArrivalTimeoutMins: { type: Number, default: 30 }
    },

    // Rider Earning Configuration (Requirement 13)
    riderEarningConfig: {
      baseEarning: { type: Number, default: 20 },
      baseDistanceKm: { type: Number, default: 2 },
      perKmEarning: { type: Number, default: 8 },
      peakBonus: { type: Number, default: 10 },
      isPeakBonusActive: { type: Boolean, default: false },
      rainBonus: { type: Number, default: 15 },
      isRainBonusActive: { type: Boolean, default: false },
      nightBonus: { type: Number, default: 15 },
      isNightBonusActive: { type: Boolean, default: false }
    },

    // Order Timing & Cancellation Configuration (Platform-wide)
    orderTimingConfig: {
      cancellationWindowMins: { type: Number, default: 5 },
      riderPickupGracePeriodMins: { type: Number, default: 15 },
      selfPickupGracePeriodMins: { type: Number, default: 15 },
      preparationBufferMins: { type: Number, default: 10 }
    },

    // Settlement Cycle Configuration (Requirement 11)
    settlementConfig: {
      defaultCycle: { type: String, enum: ['T+1', 'T+2', 'T+3', 'Weekly', 'Custom'], default: 'T+2' },
      autoPayoutDay: { type: String, default: 'Sunday' }
    },

    // Customer Reward & Points Configuration (Requirement 8)
    rewardConfig: {
      enabled: { type: Boolean, default: true },
      rewardPercentage: { type: Number, default: 5 }, // 5% of order value
      minOrderAmountForReward: { type: Number, default: 0 },
      maxRewardPerOrder: { type: Number, default: 200 },
      creditToWallet: { type: Boolean, default: true } // Credit cashback to user wallet
    }
  },
  { timestamps: true }
);

AdminSettingSchema.statics.getSettings = async function() {
  let doc = await this.findOne({});
  if (!doc) {
    doc = await this.create({});
  }
  return doc;
};

module.exports = mongoose.model('AdminSetting', AdminSettingSchema);
