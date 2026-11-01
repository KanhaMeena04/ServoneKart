const mongoose = require('mongoose');

const serviceProviderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  providerCode: {
    type: String,
    unique: true,
    index: true
  },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  avatar: { type: String },
  
  // Professional details
  skills: [{ type: String }], // e.g. ['Electrician', 'Wiring', 'Inverter Repair', 'Appliance']
  primaryCategory: { type: String, required: true, index: true }, // e.g. 'electrician'
  experienceYears: { type: Number, default: 2 },
  bio: { type: String, default: '' },

  // Verification & KYC
  isVerified: { type: Boolean, default: false },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'suspended'],
    default: 'pending',
    index: true
  },
  documents: {
    aadharNumber: { type: String },
    aadharFront: { type: String },
    aadharBack: { type: String },
    panNumber: { type: String },
    panCard: { type: String },
    policeVerificationCertificate: { type: String },
    tradeLicense: { type: String }
  },

  // Operational status
  isOnline: { type: Boolean, default: false, index: true },
  isAvailable: { type: Boolean, default: true },
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [75.8577, 22.7196] } // [lng, lat]
  },
  serviceCity: { type: String, default: 'Indore', index: true },
  serviceAreas: [{ type: String }], // e.g. ['Vijay Nagar', 'Palasia', 'Bhawarkua']
  serviceRadiusKm: { type: Number, default: 15 },

  // Performance & Earnings
  rating: { type: Number, default: 4.8 },
  ratingCount: { type: Number, default: 0 },
  completedBookingsCount: { type: Number, default: 0 },
  walletBalance: { type: Number, default: 0 },
  commissionRate: { type: Number, default: 15 }, // 15% platform commission

  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

serviceProviderSchema.index({ currentLocation: '2dsphere' });

serviceProviderSchema.pre('save', async function(next) {
  if (!this.providerCode) {
    const rand = Math.floor(10000 + Math.random() * 90000);
    this.providerCode = `PRO-${rand}`;
  }
  if (typeof next === 'function') next();
});

module.exports = mongoose.model('ServiceProvider', serviceProviderSchema);

