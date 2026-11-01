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

const Category = require('../models/Category');

/**
 * GET /api/laundry/categories
 * Get laundry categories from Category collection
 */
router.get('/categories', async (req, res) => {
  try {
    let categories = await Category.find({
      vertical: 'laundry',
      isActive: { $ne: false }
    }).select('name slug icon startingPrice position').sort({ position: 1 }).lean();

    if (!categories || categories.length === 0) {
      const defaultCategories = [
        { name: 'Wash & Fold', slug: 'wash-and-fold', vertical: 'laundry', startingPrice: 59, position: 1, type: 'main', isActive: true },
        { name: 'Wash & Steam Iron', slug: 'wash-and-iron', vertical: 'laundry', startingPrice: 89, position: 2, type: 'main', isActive: true },
        { name: 'Steam Ironing Only', slug: 'steam-iron-only', vertical: 'laundry', startingPrice: 15, position: 3, type: 'main', isActive: true },
        { name: 'Dry Clean - Suits', slug: 'dry-clean-suits', vertical: 'laundry', startingPrice: 299, position: 4, type: 'main', isActive: true },
        { name: 'Dry Clean - Sarees', slug: 'dry-clean-sarees', vertical: 'laundry', startingPrice: 249, position: 5, type: 'main', isActive: true },
        { name: 'Shoe & Sneaker Care', slug: 'shoe-care', vertical: 'laundry', startingPrice: 299, position: 6, type: 'main', isActive: true }
      ];
      categories = await Category.insertMany(defaultCategories).catch(() => defaultCategories);
    }

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/laundry/services
 * Get laundry service price catalog (Dynamic)
 */
router.get('/services', async (req, res) => {
  try {
    const categories = await Category.find({
      vertical: 'laundry',
      isActive: { $ne: false }
    }).sort({ position: 1 }).lean();

    if (categories && categories.length > 0) {
      const services = categories.map(c => ({
        id: c.slug || c._id,
        _id: c._id,
        name: c.name,
        unitType: c.slug.includes('iron') ? 'piece' : (c.slug.includes('wash') ? 'kg' : 'piece'),
        pricePerUnit: c.startingPrice || 59,
        minUnits: c.slug.includes('wash') ? 3 : 1,
        description: c.description || `${c.name} with premium fabric care & sanitized wash`
      }));
      return res.status(200).json({ success: true, data: services });
    }

    const defaultServices = [
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
      data: defaultServices
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

