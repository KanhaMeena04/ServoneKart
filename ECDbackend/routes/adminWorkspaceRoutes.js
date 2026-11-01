const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const Product = require('../models/Product');
const Booking = require('../models/Booking');
const ServiceProvider = require('../models/ServiceProvider');
const Rider = require('../models/Rider');
const { protect, admin } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/rbac');
const { VERTICALS } = require('../constants/verticals');

/**
 * GET /api/admin/workspaces/summary
 * Multi-service control tower overview for all 8 verticals (real database aggregations)
 */
router.get('/summary', protect, admin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Aggregated order stats across commerce verticals
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$vertical', 'food'] },
          totalOrders: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [
                { $in: ['$orderStatus', ['Delivered', 'completed']] },
                { $ifNull: ['$totalAmount', 0] },
                0
              ]
            }
          },
          todayOrders: {
            $sum: {
              $cond: [{ $gte: ['$createdAt', today] }, 1, 0]
            }
          },
          activeOrders: {
            $sum: {
              $cond: [
                { $in: ['$orderStatus', ['Placed', 'Confirmed', 'Preparing', 'Ready', 'Picked Up', 'Out for Delivery']] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // 2. Home services bookings stats
    const bookingStats = await Booking.aggregate([
      {
        $group: {
          _id: '$category',
          totalBookings: { $sum: 1 },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          activeBookings: {
            $sum: {
              $cond: [
                { $in: ['$status', ['requested', 'assigned', 'provider_accepted', 'en_route', 'inspecting', 'quotation_sent', 'quotation_approved', 'in_progress']] },
                1,
                0
              ]
            }
          },
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, { $ifNull: ['$totalAmount', 0] }, 0]
            }
          }
        }
      }
    ]);

    // 3. Partner counts by businessType
    const partnerCounts = await Restaurant.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$businessType', 'restaurant'] },
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } }
        }
      }
    ]);

    // 4. Riders count
    const totalRiders = await Rider.countDocuments({ isDeleted: { $ne: true } });
    const onlineRiders = await Rider.countDocuments({ isOnline: true, isDeleted: { $ne: true } });

    // 5. Service providers count
    const totalProviders = await ServiceProvider.countDocuments({ isActive: true });
    const verifiedProviders = await ServiceProvider.countDocuments({ isVerified: true });

    // Format map
    const verticalSummary = {};
    Object.values(VERTICALS).forEach(v => {
      verticalSummary[v] = {
        vertical: v,
        totalOrders: 0,
        totalRevenue: 0,
        todayOrders: 0,
        activeOrders: 0,
        totalPartners: 0
      };
    });

    orderStats.forEach(stat => {
      const vert = stat._id;
      if (verticalSummary[vert]) {
        verticalSummary[vert].totalOrders = stat.totalOrders;
        verticalSummary[vert].totalRevenue = Math.round(stat.totalRevenue * 100) / 100;
        verticalSummary[vert].todayOrders = stat.todayOrders;
        verticalSummary[vert].activeOrders = stat.activeOrders;
      }
    });

    partnerCounts.forEach(pc => {
      const type = pc._id;
      // Map businessType to vertical
      const mapping = {
        restaurant: VERTICALS.FOOD,
        grocery_store: VERTICALS.GROCERY,
        pharmacy: VERTICALS.MEDICINE,
        laundry: VERTICALS.LAUNDRY,
        home_service_provider: VERTICALS.HOME_SERVICES,
        bakery_gifts: VERTICALS.GIFTS_BAKERY,
        water_dairy_supplier: VERTICALS.ESSENTIALS
      };
      const vKey = mapping[type] || VERTICALS.FOOD;
      if (verticalSummary[vKey]) {
        verticalSummary[vKey].totalPartners = pc.total;
      }
    });

    // Populate Home Services explicitly
    const totalHomeBookings = bookingStats.reduce((acc, curr) => acc + curr.totalBookings, 0);
    const totalHomeRevenue = bookingStats.reduce((acc, curr) => acc + curr.totalRevenue, 0);
    const activeHomeBookings = bookingStats.reduce((acc, curr) => acc + curr.activeBookings, 0);

    verticalSummary[VERTICALS.HOME_SERVICES].totalOrders = totalHomeBookings;
    verticalSummary[VERTICALS.HOME_SERVICES].totalRevenue = Math.round(totalHomeRevenue * 100) / 100;
    verticalSummary[VERTICALS.HOME_SERVICES].activeOrders = activeHomeBookings;
    verticalSummary[VERTICALS.HOME_SERVICES].totalPartners = totalProviders;

    return res.status(200).json({
      success: true,
      data: {
        verticalSummary,
        fleet: {
          totalRiders,
          onlineRiders,
          totalProviders,
          verifiedProviders
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching workspaces summary:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/admin/workspaces/:vertical/overview
 * Real database analytics for a specific vertical workspace
 */
router.get('/:vertical/overview', protect, admin, async (req, res) => {
  try {
    const { vertical } = req.params;
    const city = req.query.city || 'Indore';

    if (vertical === VERTICALS.HOME_SERVICES) {
      const totalBookings = await Booking.countDocuments();
      const activeBookings = await Booking.countDocuments({
        status: { $in: ['requested', 'assigned', 'provider_accepted', 'en_route', 'inspecting', 'quotation_sent', 'quotation_approved', 'in_progress'] }
      });
      const completedBookings = await Booking.countDocuments({ status: 'completed' });
      const recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(10);
      const totalProviders = await ServiceProvider.countDocuments();
      const onlineProviders = await ServiceProvider.countDocuments({ isOnline: true });

      const revenueAgg = await Booking.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, revenue: { $sum: '$totalAmount' } } }
      ]);
      const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].revenue : 0;

      return res.status(200).json({
        success: true,
        data: {
          vertical,
          city,
          metrics: {
            totalOrders: totalBookings,
            activeOrders: activeBookings,
            completedOrders: completedBookings,
            totalRevenue,
            totalPartners: totalProviders,
            activePartners: onlineProviders
          },
          recentRecords: recentBookings
        }
      });
    }

    // Product & Order based verticals
    const partnerTypeMapping = {
      [VERTICALS.FOOD]: 'restaurant',
      [VERTICALS.GROCERY]: 'grocery_store',
      [VERTICALS.MEDICINE]: 'pharmacy',
      [VERTICALS.LAUNDRY]: 'laundry',
      [VERTICALS.GIFTS_BAKERY]: 'bakery_gifts',
      [VERTICALS.ESSENTIALS]: 'water_dairy_supplier',
      [VERTICALS.COURIER]: 'restaurant'
    };

    const bType = partnerTypeMapping[vertical] || 'restaurant';

    const totalPartners = await Restaurant.countDocuments({
      $or: [{ businessType: bType }, { vertical }]
    });

    const activePartners = await Restaurant.countDocuments({
      $or: [{ businessType: bType }, { vertical }],
      isActive: true
    });

    const totalOrders = await Order.countDocuments({ vertical });
    const activeOrders = await Order.countDocuments({
      vertical,
      orderStatus: { $in: ['Placed', 'Confirmed', 'Preparing', 'Ready', 'Picked Up', 'Out for Delivery'] }
    });
    const completedOrders = await Order.countDocuments({
      vertical,
      orderStatus: { $in: ['Delivered', 'completed'] }
    });

    const revenueAgg = await Order.aggregate([
      { $match: { vertical, orderStatus: { $in: ['Delivered', 'completed'] } } },
      { $group: { _id: null, revenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].revenue : 0;

    const recentOrders = await Order.find({ vertical })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderNumber customerName restaurantName storeName totalAmount orderStatus paymentMethod createdAt');

    return res.status(200).json({
      success: true,
      data: {
        vertical,
        city,
        metrics: {
          totalOrders,
          activeOrders,
          completedOrders,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalPartners,
          activePartners
        },
        recentRecords: recentOrders
      }
    });
  } catch (error) {
    console.error(`Error fetching ${req.params.vertical} overview:`, error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/admin/workspaces/:vertical/partners
 * List partners belonging to a specific vertical
 */
router.get('/:vertical/partners', protect, admin, async (req, res) => {
  try {
    const { vertical } = req.params;
    const { page = 1, limit = 20, search } = req.query;

    if (vertical === VERTICALS.HOME_SERVICES) {
      const query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { primaryCategory: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ];
      }
      const total = await ServiceProvider.countDocuments(query);
      const partners = await ServiceProvider.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

      return res.status(200).json({
        success: true,
        data: {
          partners,
          pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
        }
      });
    }

    const partnerTypeMapping = {
      [VERTICALS.FOOD]: 'restaurant',
      [VERTICALS.GROCERY]: 'grocery_store',
      [VERTICALS.MEDICINE]: 'pharmacy',
      [VERTICALS.LAUNDRY]: 'laundry',
      [VERTICALS.GIFTS_BAKERY]: 'bakery_gifts',
      [VERTICALS.ESSENTIALS]: 'water_dairy_supplier'
    };

    const bType = partnerTypeMapping[vertical] || 'restaurant';
    const query = {
      $or: [{ businessType: bType }, { vertical }]
    };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const total = await Restaurant.countDocuments(query);
    const partners = await Restaurant.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      data: {
        partners,
        pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/admin/workspaces/:vertical/orders
 * List orders or bookings belonging to a specific vertical
 */
router.get('/:vertical/orders', protect, admin, async (req, res) => {
  try {
    const { vertical } = req.params;
    const { page = 1, limit = 20, status, search } = req.query;

    if (vertical === VERTICALS.HOME_SERVICES) {
      const query = {};
      if (status && status !== 'all') query.status = status;
      if (search) {
        query.$or = [
          { bookingNumber: { $regex: search, $options: 'i' } },
          { customerName: { $regex: search, $options: 'i' } },
          { customerPhone: { $regex: search, $options: 'i' } }
        ];
      }

      const total = await Booking.countDocuments(query);
      const orders = await Booking.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

      return res.status(200).json({
        success: true,
        data: {
          orders,
          pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
        }
      });
    }

    const query = { vertical };
    if (status && status !== 'all') query.orderStatus = status;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

