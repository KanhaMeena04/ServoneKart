const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const { protect } = require('../middleware/authMiddleware');
const { VERTICALS, BUSINESS_TYPES } = require('../constants/verticals');

/**
 * GET /api/laundry/stores
 * List laundry and dry cleaning partners
 */
router.get('/stores', async (req, res) => {
  try {
    const { city = 'Indore', search } = req.query;

    const query = {
      $or: [
        { businessType: BUSINESS_TYPES.LAUNDRY },
        { vertical: VERTICALS.LAUNDRY },
        { restaurantType: { $regex: /laundry|dryclean|cleaners/i } }
      ],
      isActive: true
    };

    if (search) query.name = { $regex: search, $options: 'i' };

    const stores = await Restaurant.find(query)
      .select('name image bannerImage address location rating deliveryTime timing minOrderAmount')
      .lean();

    return res.status(200).json({
      success: true,
      count: stores.length,
      data: stores
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/laundry/services
 * Get laundry service price catalog
 */
router.get('/services', async (req, res) => {
  try {
    const services = [
      { id: 'wash_and_fold', name: 'Wash & Fold', unitType: 'kg', pricePerUnit: 59, minUnits: 3, description: 'Daily wear clothes washed and neatly folded' },
      { id: 'wash_and_iron', name: 'Wash & Steam Iron', unitType: 'kg', pricePerUnit: 89, minUnits: 3, description: 'Washed, softened and crisp steam pressed' },
      { id: 'steam_iron_only', name: 'Steam Ironing Only', unitType: 'piece', pricePerUnit: 15, minUnits: 5, description: 'Wrinkle-free high quality steam iron' },
      { id: 'dry_clean_suit', name: 'Dry Clean - 2 Pc Suit', unitType: 'piece', pricePerUnit: 299, description: 'Gentle dry clean with hanger packaging' },
      { id: 'dry_clean_saree', name: 'Dry Clean - Silk/Heavy Saree', unitType: 'piece', pricePerUnit: 249, description: 'Specialized delicate dry cleaning and roller press' },
      { id: 'shoe_cleaning', name: 'Premium Shoe Cleaning', unitType: 'pair', pricePerUnit: 299, description: 'Deep sole & fabric cleaning, deodorizing' },
      { id: 'blanket_dryclean', name: 'Blanket / Quilt Dry Clean', unitType: 'piece', pricePerUnit: 299, description: 'Sanitized deep wash & mite extraction' }
    ];

    return res.status(200).json({
      success: true,
      data: services
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/laundry/book
 * Book laundry pickup with dual slot (pickup & return)
 */
router.post('/book', protect, async (req, res) => {
  try {
    const {
      storeId,
      serviceType,
      clothesCount,
      estimatedWeightKg = 3,
      pickupSlot,
      deliverySlot,
      pickupAddress,
      specialInstructions = '',
      paymentMethod = 'cod'
    } = req.body;

    if (!pickupSlot || !deliverySlot || !pickupAddress) {
      return res.status(400).json({
        success: false,
        message: 'Pickup slot, delivery slot, and address are required'
      });
    }

    const store = storeId ? await Restaurant.findById(storeId) : await Restaurant.findOne({
      $or: [{ businessType: BUSINESS_TYPES.LAUNDRY }, { vertical: VERTICALS.LAUNDRY }]
    });

    const orderNumber = `LND-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const estimatedAmount = (estimatedWeightKg || 3) * 79 + 40; // Base estimate

    const order = await Order.create({
      orderNumber,
      customer: req.user._id,
      customerName: req.user.name || 'Customer',
      customerPhone: req.user.mobile || req.user.phone || '9999999999',
      restaurant: store ? store._id : null,
      restaurantName: store ? store.name : 'ECDKART Laundry Partner',
      vertical: VERTICALS.LAUNDRY,
      orderType: 'delivery',
      subtotal: estimatedAmount,
      totalAmount: estimatedAmount,
      deliveryCharges: 40,
      deliveryAddress: pickupAddress,
      paymentMethod,
      orderStatus: 'Placed',
      laundryDetails: {
        serviceType: serviceType || 'Wash & Steam Iron',
        clothesCount: Number(clothesCount || 10),
        weightKg: Number(estimatedWeightKg || 3),
        pickupSlot: new Date(pickupSlot),
        deliverySlot: new Date(deliverySlot)
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Laundry pickup scheduled successfully',
      data: order
    });
  } catch (error) {
    console.error('Laundry booking error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

