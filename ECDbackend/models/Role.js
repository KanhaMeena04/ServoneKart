const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  accountType: {
    type: String,
    enum: [
      'Super Admin',
      'Admin',
      'Food Manager',
      'Grocery Manager',
      'Home Services Manager',
      'Pharmacy Manager',
      'Courier Manager',
      'Laundry Manager',
      'Finance Manager',
      'Rider Manager',
      'Restaurant Admin',
      'Support',
      'Operations Manager'
    ],
    default: 'Admin'
  },
  description: {
    type: String,
    default: ''
  },
  permissions: [{
    type: String
  }],
  allowedVerticals: [{
    type: String,
    default: 'all'
  }],
  allowedCities: [{
    type: String,
    default: 'all'
  }],
  isSystemDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Role', roleSchema);
