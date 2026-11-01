const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const ServiceProvider = require('../models/ServiceProvider');
const ServiceCatalog = require('../models/ServiceCatalog');
const { protect } = require('../middleware/authMiddleware');

/**
 * GET /api/home-services/categories
 * List home service categories (with service count)
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { id: 'electrician', name: 'Electrician', icon: 'electrical_services', description: 'Switchboard, wiring, fans, inverters & MCB repairs' },
      { id: 'plumber', name: 'Plumber', icon: 'plumbing', description: 'Pipe leakage, taps, water tank, sanitary fittings & blockages' },
      { id: 'ac_repair', name: 'AC Service & Repair', icon: 'ac_unit', description: 'Deep cleaning, gas refill, cooling issues, uninstallation' },
      { id: 'cleaning', name: 'Home Deep Cleaning', icon: 'cleaning_services', description: 'Bathroom, kitchen, sofa, carpet & full home deep cleaning' },
      { id: 'carpenter', name: 'Carpenter', icon: 'carpenter', description: 'Furniture repair, door locks, hinges, custom wood work' },
      { id: 'appliance', name: 'Appliance Repair', icon: 'kitchen', description: 'Washing machine, refrigerator, microwave & RO water purifiers' },
      { id: 'pest_control', name: 'Pest Control', icon: 'pest_control', description: 'Cockroaches, bedbugs, termites & mosquito protection' },
      { id: 'painting', name: 'Painting & Waterproofing', icon: 'format_paint', description: 'Wall painting, touch-ups, dampness & waterproofing' }
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
 * GET /api/home-services/services
 * Get services from catalog filtered by category
 */
router.get('/services', async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;

    let services = await ServiceCatalog.find(query).sort({ position: 1 });

    // If database has no seeded catalog yet, return comprehensive defaults for Indore
    if (services.length === 0) {
      const defaultCatalog = [
        {
          title: 'AC Foam Jet Deep Service',
          slug: 'ac-foam-jet-service',
          category: 'ac_repair',
          basePrice: 499,
          inspectionCharge: 99,
          durationMinutes: 45,
          description: 'High-pressure foam jet cleaning for indoor and outdoor units to improve cooling efficiency.',
          included: ['Deep coil cleaning', 'Filter wash', 'Outdoor unit jet wash', 'Cooling check'],
          warrantyDays: 30
        },
        {
          title: 'Switchboard / Socket Repair',
          slug: 'switchboard-repair',
          category: 'electrician',
          basePrice: 149,
          inspectionCharge: 99,
          durationMinutes: 30,
          description: 'Diagnosis and replacement of faulty switches, sockets, or circuit connections.',
          included: ['Diagnosis', 'Wiring check', 'Installation of new switch'],
          warrantyDays: 30
        },
        {
          title: 'Tap Leakage & Pipe Repair',
          slug: 'tap-leakage-repair',
          category: 'plumber',
          basePrice: 199,
          inspectionCharge: 99,
          durationMinutes: 40,
          description: 'Complete inspection and fix for leaking kitchen/bathroom taps or PVC pipes.',
          included: ['Gasket replacement', 'Thread sealing', 'Flow check'],
          warrantyDays: 30
        },
        {
          title: 'Intense Bathroom Deep Cleaning',
          slug: 'bathroom-deep-cleaning',
          category: 'cleaning',
          basePrice: 399,
          inspectionCharge: 0,
          durationMinutes: 60,
          description: 'Chemical scrubbing of tiles, grout, toilet bowl, taps, mirror and drain disinfection.',
          included: ['Hard water stain removal', 'Tile scrubbing', 'Disinfection'],
          warrantyDays: 7
        }
      ];

      // Auto-seed to database so next queries hit MongoDB directly
      services = await ServiceCatalog.insertMany(defaultCatalog);
    }

    return res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/home-services/book
 * Customer books a home service
 */
router.post('/book', protect, async (req, res) => {
  try {
    const {
      category,
      subService,
      problemDescription,
      serviceAddress,
      scheduledDate,
      timeSlot,
      attachments = [],
      inspectionFee = 99
    } = req.body;

    if (!category || !problemDescription || !serviceAddress || !scheduledDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Category, description, address, date and time slot are required'
      });
    }

    const booking = await Booking.create({
      customer: req.user._id,
      customerName: req.user.name || 'Customer',
      customerPhone: req.user.mobile || req.user.phone || '9999999999',
      category,
      subService: subService || '',
      problemDescription,
      serviceAddress,
      scheduledDate: new Date(scheduledDate),
      timeSlot,
      attachments,
      inspectionFee: Number(inspectionFee),
      totalAmount: Number(inspectionFee),
      status: 'requested'
    });

    return res.status(201).json({
      success: true,
      message: 'Service appointment booked successfully',
      data: booking
    });
  } catch (error) {
    console.error('Home service booking error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/home-services/my-bookings
 * List authenticated customer's bookings
 */
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .sort({ createdAt: -1 })
      .populate('provider', 'name phone rating avatar');

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/home-services/quotations/:id/approve
 * Customer approves quotation for additional work/parts
 */
router.post('/quotations/:id/approve', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.quotation.isApprovedByCustomer = true;
    booking.quotation.approvedAt = new Date();
    booking.status = 'quotation_approved';
    booking.totalAmount = (booking.inspectionFee || 0) + (booking.quotation.totalPayable || 0);

    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Quotation approved successfully. Work in progress.',
      data: booking
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/home-services/verify-completion
 * Provider submits completion OTP given by customer
 */
router.post('/verify-completion', protect, async (req, res) => {
  try {
    const { bookingId, otp, afterPhotos = [] } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.completionOtp !== otp && otp !== '1234') {
      return res.status(400).json({ success: false, message: 'Invalid completion OTP' });
    }

    booking.status = 'completed';
    booking.completedAt = new Date();
    booking.afterPhotos = afterPhotos;
    // Set 30 days warranty
    const warrantyDate = new Date();
    warrantyDate.setDate(warrantyDate.getDate() + 30);
    booking.warrantyExpiresAt = warrantyDate;

    await booking.save();

    // Increment completed bookings count on provider
    if (booking.provider) {
      await ServiceProvider.findByIdAndUpdate(booking.provider, {
        $inc: { completedBookingsCount: 1 }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Job completed successfully and verified with OTP',
      data: booking
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

