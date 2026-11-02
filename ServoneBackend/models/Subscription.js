const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  subscriptionNumber: {
    type: String,
    unique: true,
    index: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: { type: String, required: true },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant', // Partner store
    required: true
  },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, required: true },
  
  // Frequency: daily, alternate_days, weekly, custom
  frequency: {
    type: String,
    enum: ['daily', 'alternate_days', 'weekly', 'custom_days'],
    default: 'daily'
  },
  deliveryDays: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  preferredTimeSlot: {
    type: String,
    default: '06:00 AM - 08:00 AM'
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date },

  deliveryAddress: {
    addressLine: { type: String, required: true },
    city: { type: String, default: 'Indore' },
    area: { type: String },
    pincode: { type: String },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [75.8577, 22.7196] }
    }
  },

  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'cancelled'],
    default: 'active',
    index: true
  },
  pausedUntil: { type: Date },
  walletDeductionPerDelivery: { type: Boolean, default: true },

  city: { type: String, default: 'Indore', index: true }
}, {
  timestamps: true
});

subscriptionSchema.pre('save', async function(next) {
  if (!this.subscriptionNumber) {
    const rand = Math.floor(10000 + Math.random() * 90000);
    this.subscriptionNumber = `SUB-${Date.now().toString().slice(-4)}-${rand}`;
  }
  if (typeof next === 'function') next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema);

