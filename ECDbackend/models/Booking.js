const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true }
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  bookingNumber: {
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
  category: {
    type: String,
    required: true, // e.g. 'electrician', 'plumber', 'ac_repair', 'cleaning', 'carpenter'
    index: true
  },
  subService: { type: String },
  problemDescription: { type: String, required: true },
  serviceAddress: {
    addressLine: { type: String, required: true },
    city: { type: String, default: 'Indore' },
    area: { type: String },
    pincode: { type: String },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [75.8577, 22.7196] } // [lng, lat]
    }
  },
  scheduledDate: { type: Date, required: true },
  timeSlot: { type: String, required: true }, // e.g. "10:00 AM - 12:00 PM"
  attachments: [{ type: String }], // Photos of the issue
  
  // Assigned Professional
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    index: true
  },
  providerName: { type: String },
  providerPhone: { type: String },

  // Status Lifecycle: requested -> assigned -> provider_accepted -> en_route -> inspecting -> quotation_sent -> quotation_approved -> in_progress -> completed -> cancelled
  status: {
    type: String,
    enum: [
      'requested',
      'assigned',
      'provider_accepted',
      'en_route',
      'inspecting',
      'quotation_sent',
      'quotation_approved',
      'in_progress',
      'completed',
      'cancelled'
    ],
    default: 'requested',
    index: true
  },
  cancellationReason: { type: String },
  cancelledBy: { type: String, enum: ['customer', 'provider', 'admin'] },

  // Financials & Quotation
  inspectionFee: { type: Number, default: 99 },
  quotation: {
    items: [quotationItemSchema],
    laborCharges: { type: Number, default: 0 },
    partsCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalPayable: { type: Number, default: 0 },
    isApprovedByCustomer: { type: Boolean, default: false },
    approvedAt: { type: Date }
  },
  totalAmount: { type: Number, default: 99 },
  paymentMethod: { type: String, enum: ['cod', 'online', 'wallet'], default: 'cod' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  paymentTransactionId: { type: String },

  // Completion & Verification
  completionOtp: { type: String },
  completedAt: { type: Date },
  beforePhotos: [{ type: String }],
  afterPhotos: [{ type: String }],
  warrantyExpiresAt: { type: Date }, // e.g. 30 days service warranty

  // Ratings & Feedback
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String },

  city: { type: String, default: 'Indore', index: true }
}, {
  timestamps: true
});

bookingSchema.index({ 'serviceAddress.location': '2dsphere' });

bookingSchema.pre('save', async function(next) {
  if (!this.bookingNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.bookingNumber = `BK-${timestamp}-${rand}`;
  }
  if (!this.completionOtp) {
    this.completionOtp = Math.floor(1000 + Math.random() * 9000).toString();
  }
  if (typeof next === 'function') next();
});

module.exports = mongoose.model('Booking', bookingSchema);
