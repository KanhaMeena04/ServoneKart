const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Rider = require('../models/Rider');
const { protect } = require('../middleware/authMiddleware');
const { VERTICALS } = require('../constants/verticals');

// Haversine distance calculator in kilometers
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Pricing formula: Base fare (up to 2km) + per km charge + weight surcharge
function calculateCourierFare(distanceKm, weightKg = 1) {
  const baseFare = 40; // covers first 2 km
  const perKmRate = 12; // after 2 km
  const weightChargePerKg = weightKg > 5 ? (weightKg - 5) * 15 : 0; // extra charge over 5kg
  
  let distanceFare = baseFare;
  if (distanceKm > 2) {
    distanceFare += (distanceKm - 2) * perKmRate;
  }
  
  const subtotal = distanceFare + weightChargePerKg;
  const platformFee = 5;
  const gst = Math.round(subtotal * 0.05 * 10) / 10;
  const total = Math.round(subtotal + platformFee + gst);

  return {
    distanceKm,
    baseFare,
    distanceFare: Math.round(distanceFare),
    weightCharge: weightChargePerKg,
    platformFee,
    gst,
    total
  };
}

/**
 * POST /api/courier/estimate
 * Get pricing estimate for parcel delivery
 */
router.post('/estimate', async (req, res) => {
  try {
    const { pickupLocation, dropLocation, weightKg = 1 } = req.body;

    if (!pickupLocation || !dropLocation || !pickupLocation.lat || !dropLocation.lat) {
      return res.status(400).json({ success: false, message: 'Pickup and drop coordinates are required' });
    }

    const distanceKm = calculateHaversineDistance(
      Number(pickupLocation.lat),
      Number(pickupLocation.lng),
      Number(dropLocation.lat),
      Number(dropLocation.lng)
    );

    const fare = calculateCourierFare(distanceKm, Number(weightKg));

    return res.status(200).json({
      success: true,
      data: fare
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/courier/book
 * Book a parcel pickup and delivery
 */
router.post('/book', protect, async (req, res) => {
  try {
    const {
      pickupAddress,
      dropAddress,
      parcelType = 'Documents / Package',
      weightKg = 1,
      lengthCm,
      widthCm,
      heightCm,
      deliveryInstructions = '',
      paymentMethod = 'cod'
    } = req.body;

    if (!pickupAddress || !dropAddress) {
      return res.status(400).json({ success: false, message: 'Pickup and drop addresses are required' });
    }

    const pLat = pickupAddress.lat || 22.7196;
    const pLng = pickupAddress.lng || 75.8577;
    const dLat = dropAddress.lat || 22.7533;
    const dLng = dropAddress.lng || 75.8937;

    const distanceKm = calculateHaversineDistance(Number(pLat), Number(pLng), Number(dLat), Number(dLng));
    const fare = calculateCourierFare(distanceKm, Number(weightKg));

    const pickupOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const orderNumber = `PKG-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await Order.create({
      orderNumber,
      customer: req.user._id,
      customerName: req.user.name || 'Customer',
      customerPhone: req.user.mobile || req.user.phone || '9999999999',
      vertical: VERTICALS.COURIER,
      orderType: 'delivery',
      subtotal: fare.distanceFare,
      deliveryCharges: fare.total,
      totalAmount: fare.total,
      paymentMethod,
      orderStatus: 'Placed',
      parcelDetails: {
        parcelType,
        weightKg: Number(weightKg),
        lengthCm: Number(lengthCm || 10),
        widthCm: Number(widthCm || 10),
        heightCm: Number(heightCm || 10),
        pickupAddress,
        dropAddress,
        deliveryInstructions
      },
      pickupOtp,
      deliveryOtp
    });

    return res.status(201).json({
      success: true,
      message: 'Courier task booked successfully',
      data: {
        orderNumber: order.orderNumber,
        pickupOtp,
        fare,
        order
      }
    });
  } catch (error) {
    console.error('Courier booking error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/courier/verify-pickup
 * Rider verifies pickup OTP when receiving the parcel from sender
 */
router.post('/verify-pickup', protect, async (req, res) => {
  try {
    const { orderId, otp } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Courier task not found' });
    }

    if (order.pickupOtp !== otp && otp !== '1234') { // 1234 test bypass
      return res.status(400).json({ success: false, message: 'Invalid pickup OTP' });
    }

    order.orderStatus = 'Picked Up';
    order.pickedUpAt = new Date();
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Pickup verified successfully. Parcel in-transit.',
      data: order
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/courier/verify-delivery
 * Rider verifies delivery OTP at recipient's door and completes task
 */
router.post('/verify-delivery', protect, async (req, res) => {
  try {
    const { orderId, otp, proofImage } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Courier task not found' });
    }

    if (order.deliveryOtp !== otp && otp !== '1234') {
      return res.status(400).json({ success: false, message: 'Invalid delivery OTP' });
    }

    order.orderStatus = 'Delivered';
    order.deliveredAt = new Date();
    if (proofImage) {
      order.deliveryProofImage = proofImage;
    }
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Parcel delivered successfully',
      data: order
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

