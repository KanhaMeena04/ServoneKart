const mongoose = require('mongoose');

const serviceCatalogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    index: true // e.g. 'electrician', 'plumber', 'ac_repair', 'cleaning', 'carpenter', 'appliance'
  },
  subCategory: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  inspectionCharge: {
    type: Number,
    default: 99
  },
  basePrice: {
    type: Number,
    required: true
  },
  durationMinutes: {
    type: Number,
    default: 60
  },
  included: [{
    type: String
  }],
  excluded: [{
    type: String
  }],
  warrantyDays: {
    type: Number,
    default: 30
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  position: {
    type: Number,
    default: 0
  },
  city: {
    type: String,
    default: 'Indore',
    index: true
  }
}, {
  timestamps: true
});

serviceCatalogSchema.index({ category: 1, position: 1 });

module.exports = mongoose.model('ServiceCatalog', serviceCatalogSchema);
