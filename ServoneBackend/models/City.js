const mongoose = require('mongoose');
const deliveryChargeSchema = new mongoose.Schema({
  min: { type: Number, default: 0 },
  max: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  type: { type: String, default: '' }
}, { _id: false });
const zoneSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  name: { type: String, required: true },
  supportedVerticals: [{
      type: String,
      enum: ['food', 'grocery', 'home_services', 'medicine', 'courier', 'laundry', 'gifts_bakery', 'essentials'],
      default: 'food'
    }],
    verticalConfigs: { type: Object, default: {} },
    isActive: { type: Boolean, default: true },
  deliveryCharges: [deliveryChargeSchema],
  polygon: {
    type: { type: String, enum: ['Polygon','MultiPolygon'], default: 'Polygon' },
    coordinates: { type: Array }
  },
  center: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0,0] }
  },
  meta: { type: mongoose.Schema.Types.Mixed },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
const citySchema = new mongoose.Schema({
  name: { type: String, required: true },
  state: { type: String, default: 'Haryana' },
  country: { type: String, default: 'India' },
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false },
  slug: { type: String },
  meta: { type: mongoose.Schema.Types.Mixed },
  zones: [zoneSchema]
}, { timestamps: true });
citySchema.index({ name: 1, country: 1 }, { unique: true, sparse: true });
citySchema.index({ 'zones.polygon': '2dsphere' });
module.exports = mongoose.model('City', citySchema);
