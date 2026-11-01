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

    const products = await Product.find(query).populate('restaurant', 'name address rating').lean();

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
