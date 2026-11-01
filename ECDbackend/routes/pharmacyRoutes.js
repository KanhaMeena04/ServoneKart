const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect } = require('../middleware/authMiddleware');
const { VERTICALS, BUSINESS_TYPES } = require('../constants/verticals');

/**
 * GET /api/pharmacy/stores
 * List licensed pharmacies in Indore
 */
router.get('/stores', async (req, res) => {
  try {
    const { city = 'Indore', search } = req.query;

    const query = {
      $or: [
        { businessType: BUSINESS_TYPES.PHARMACY },
        { vertical: VERTICALS.MEDICINE },
        { restaurantType: { $regex: /pharmacy|medical|chemist/i } }
      ],
      isActive: true
    };

    if (search) query.name = { $regex: search, $options: 'i' };

    const pharmacies = await Restaurant.find(query)
      .select('name image bannerImage address location rating deliveryTime timing minOrderAmount')
      .lean();

    return res.status(200).json({
      success: true,
      count: pharmacies.length,
      data: pharmacies
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/pharmacy/products
 * List medicines and healthcare products
 */
router.get('/products', async (req, res) => {
  try {
    const { pharmacyId, search, prescriptionRequired } = req.query;
    const query = {
      vertical: VERTICALS.MEDICINE,
      isDeleted: { $ne: true }
    };

    if (pharmacyId) query.restaurant = pharmacyId;
    if (search) query.name = { $regex: search, $options: 'i' };
    if (prescriptionRequired !== undefined) query.prescriptionRequired = prescriptionRequired === 'true';

        let products = await Product.find(query).populate('restaurant', 'name address rating').lean();

    if (!products || products.length === 0) {
      const defaultMedicines = [
        {
          name: 'Dolo 650mg Paracetamol Tablets',
          brand: 'Micro Labs',
          price: 30,
          mrp: 34,
          unit: '15 Tablets',
          vertical: VERTICALS.MEDICINE,
          prescriptionRequired: false,
          stockQuantity: 150,
          inStock: true,
          description: 'Effective fever and mild to moderate pain relief'
        },
        {
          name: 'Vicks Vaporub Balm Relief (50ml)',
          brand: 'P&G Health',
          price: 145,
          mrp: 160,
          unit: '50 ml Jar',
          vertical: VERTICALS.MEDICINE,
          prescriptionRequired: false,
          stockQuantity: 80,
          inStock: true,
          description: 'Fast relief from cold, cough and body ache'
        },
        {
          name: 'Becosules Z Multivitamin Capsules',
          brand: 'Pfizer',
          price: 48,
          mrp: 55,
          unit: '20 Capsules',
          vertical: VERTICALS.MEDICINE,
          prescriptionRequired: false,
          stockQuantity: 120,
          inStock: true,
          description: 'B-Complex with Vitamin C & Zinc for daily immunity'
        },
        {
          name: 'Dettol Antiseptic Liquid (250ml)',
          brand: 'Reckitt',
          price: 120,
          mrp: 135,
          unit: '250 ml Bottle',
          vertical: VERTICALS.MEDICINE,
          prescriptionRequired: false,
          stockQuantity: 90,
          inStock: true,
          description: 'First aid antiseptic liquid for wound care'
        },
        {
          name: 'Volini Pain Relief Spray (55g)',
          brand: 'Sun Pharma',
          price: 175,
          mrp: 199,
          unit: '55 g Spray',
          vertical: VERTICALS.MEDICINE,
          prescriptionRequired: false,
          stockQuantity: 60,
          inStock: true,
          description: 'Instant spray for joint, back and muscle pain'
        }
      ];
      products = await Product.insertMany(defaultMedicines);
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
 * POST /api/pharmacy/upload-prescription
 * Upload prescription document for pharmacist review
 */
router.post('/upload-prescription', protect, async (req, res) => {
  try {
    const { pharmacyId, prescriptionUrl, patientName, patientAge, deliveryAddress, notes } = req.body;

    if (!prescriptionUrl || !pharmacyId) {
      return res.status(400).json({ success: false, message: 'Prescription URL and pharmacy are required' });
    }

    const pharmacy = await Restaurant.findById(pharmacyId);
    if (!pharmacy) {
      return res.status(404).json({ success: false, message: 'Pharmacy not found' });
    }

    const orderNumber = `RX-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await Order.create({
      orderNumber,
      customer: req.user._id,
      customerName: patientName || req.user.name || 'Customer',
      customerPhone: req.user.mobile || req.user.phone || '9999999999',
      restaurant: pharmacy._id,
      restaurantName: pharmacy.name,
      vertical: VERTICALS.MEDICINE,
      orderType: 'delivery',
      prescriptionUrl,
      prescriptionVerification: {
        status: 'pending',
        pharmacistNotes: notes || ''
      },
      orderStatus: 'Placed',
      subtotal: 0,
      totalAmount: 0, // Will be set after pharmacist approves medicines & adds items
      deliveryAddress,
      paymentMethod: 'cod',
      paymentStatus: 'pending'
    });

    return res.status(201).json({
      success: true,
      message: 'Prescription uploaded successfully. The pharmacist will verify and confirm your order.',
      data: order
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/pharmacy/prescriptions/:orderId/verify
 * Pharmacist reviews & approves/rejects prescription
 */
router.put('/prescriptions/:orderId/verify', protect, async (req, res) => {
  try {
    const { status, pharmacistNotes, items = [], totalAmount = 0 } = req.body; // status: 'approved' | 'rejected'
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Prescription order not found' });
    }

    order.prescriptionVerification = {
      status,
      pharmacistNotes: pharmacistNotes || '',
      verifiedBy: req.user.name || 'Registered Pharmacist',
      verifiedAt: new Date()
    };

    if (status === 'approved') {
      order.orderStatus = 'Confirmed';
      if (items.length > 0) order.items = items;
      if (totalAmount > 0) {
        order.subtotal = totalAmount;
        order.totalAmount = totalAmount + 25; // delivery fee
      }
    } else {
      order.orderStatus = 'Cancelled';
      order.cancellationReason = pharmacistNotes || 'Prescription rejected by pharmacist';
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: `Prescription ${status} successfully`,
      data: order
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

