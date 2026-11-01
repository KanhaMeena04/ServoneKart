const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Subscription = require('../models/Subscription');
const Restaurant = require('../models/Restaurant');
const { protect } = require('../middleware/authMiddleware');
const { VERTICALS, BUSINESS_TYPES } = require('../constants/verticals');

/**
 * GET /api/essentials/categories
 * Get essential categories
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { id: 'water_cans', name: '20L Water Cans', icon: 'water_drop', badge: 'Same Day' },
      { id: 'dairy_milk', name: 'Daily Fresh Milk & Dairy', icon: 'local_drink', badge: 'Morning 7 AM' },
      { id: 'bakery_breads', name: 'Artisan Bakery & Breads', icon: 'bakery_dining', badge: 'Fresh Oven' },
      { id: 'pet_supplies', name: 'Pet Food & Care', icon: 'pets', badge: 'Fast Delivery' },
      { id: 'pooja_needs', name: 'Pooja & Spiritual Flowers', icon: 'spa', badge: 'Daily Fresh' }
    ];

    return res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/essentials/products
 * Get essential products (water, milk, bakery, pet supplies)
 */
router.get('/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {
      vertical: { $in: [VERTICALS.ESSENTIALS, VERTICALS.GIFTS_BAKERY] },
      isDeleted: { $ne: true }
    };

    if (search) query.name = { $regex: search, $options: 'i' };

    let products = await Product.find(query).populate('restaurant', 'name rating address').lean();

    if (products.length === 0) {
      const presetEssentials = [
        {
          name: 'Bisleri 20 Litre Mineral Water Can',
          price: 90,
          mrp: 100,
          unit: 'can',
          vertical: VERTICALS.ESSENTIALS,
          stockQuantity: 200,
          inStock: true,
          description: 'Sealed & sanitized 20 Litre pure drinking water jar with doorstep exchange.',
          isSubscriptionEligible: true
        },
        {
          name: 'Kinley 20L Purified Water Jar',
          price: 85,
          mrp: 95,
          unit: 'can',
          vertical: VERTICALS.ESSENTIALS,
          stockQuantity: 150,
          inStock: true,
          description: 'Pure drinking water with added minerals.',
          isSubscriptionEligible: true
        },
        {
          name: 'Indore Fresh RO Pure 20L Can',
          price: 45,
          mrp: 60,
          unit: 'can',
          vertical: VERTICALS.ESSENTIALS,
          stockQuantity: 300,
          inStock: true,
          description: 'Budget daily pure RO water jar with doorstep delivery in Indore.',
          isSubscriptionEligible: true
        },
        {
          name: 'Sanchi Smart Toned Milk (Indore)',
          price: 27,
          mrp: 27,
          unit: '500 ml pouch',
          vertical: VERTICALS.ESSENTIALS,
          stockQuantity: 400,
          inStock: true,
          description: 'Fresh pasteurized toned milk delivered fresh every morning before 7:00 AM.',
          isSubscriptionEligible: true
        },
        {
          name: 'Amul Gold Full Cream Milk',
          price: 34,
          mrp: 34,
          unit: '500 ml pouch',
          vertical: VERTICALS.ESSENTIALS,
          stockQuantity: 250,
          inStock: true,
          description: 'Fresh rich full cream pasteurized milk, ideal for tea, coffee, and sweets.',
          isSubscriptionEligible: true
        }
      ];
      products = await Product.insertMany(presetEssentials);
    }

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/essentials/subscribe
 * Create a recurring subscription for milk or water cans
 */
router.post('/subscribe', protect, async (req, res) => {
  try {
    const {
      productId,
      productName,
      unitPrice,
      quantity = 1,
      frequency = 'daily', // 'daily', 'alternate_days', 'weekly'
      startDate,
      deliveryAddress,
      preferredTimeSlot = '06:00 AM - 08:00 AM'
    } = req.body;

    if (!productName || !unitPrice || !startDate || !deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: 'Product, price, start date and address are required'
      });
    }

    const defaultStore = await Restaurant.findOne({
      $or: [{ businessType: BUSINESS_TYPES.WATER_DAIRY_SUPPLIER }, { vertical: VERTICALS.ESSENTIALS }]
    });

    const subscription = await Subscription.create({
      customer: req.user._id,
      customerName: req.user.name || 'Customer',
      customerPhone: req.user.mobile || req.user.phone || '9999999999',
      product: productId ? new mongoose.Types.ObjectId(productId) : new mongoose.Types.ObjectId(),
      productName,
      unitPrice: Number(unitPrice),
      quantity: Number(quantity),
      store: defaultStore ? defaultStore._id : new mongoose.Types.ObjectId(),
      frequency,
      startDate: new Date(startDate),
      preferredTimeSlot,
      deliveryAddress,
      status: 'active'
    });

    return res.status(201).json({
      success: true,
      message: 'Subscription created successfully. Daily deliveries will start on your chosen date.',
      data: subscription
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/essentials/my-subscriptions
 * View authenticated customer's subscriptions
 */
router.get('/my-subscriptions', protect, async (req, res) => {
  try {
    const subs = await Subscription.find({ customer: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: subs.length,
      data: subs
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/essentials/subscriptions/:id/toggle
 * Pause or resume subscription
 */
router.put('/subscriptions/:id/toggle', protect, async (req, res) => {
  try {
    const { status, pausedUntil } = req.body; // status: 'active' | 'paused' | 'cancelled'
    const sub = await Subscription.findById(req.params.id);
    if (!sub) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    if (status) sub.status = status;
    if (pausedUntil) sub.pausedUntil = new Date(pausedUntil);

    await sub.save();

    return res.status(200).json({
      success: true,
      message: `Subscription status updated to ${sub.status}`,
      data: sub
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

