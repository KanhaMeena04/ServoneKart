const MembershipPlan = require('../models/MembershipPlan');
const UserMembership = require('../models/UserMembership');
const MembershipEnquiry = require('../models/MembershipEnquiry');
const User = require('../models/User');
const Rider = require('../models/Rider');
const Restaurant = require('../models/Restaurant');

// Seed realistic default plans matching screenshots if none exist
const DEFAULT_PLANS = [
  // ================= 1. USER / CUSTOMER PREMIER PLANS =================
  {
    name: 'Tricelyn Premier Monthly',
    targetAudience: 'user',
    price: 99,
    originalPrice: 199,
    billingCycle: 'month',
    tag: 'PREMIER',
    badge: 'PREMIER',
    badgeColor: '#0B3EDB',
    subtitle: 'Real perks, no free-delivery tricks.',
    description: 'Priority delivery, zero surge fees, COD access, and VIP freshness guarantee.',
    features: [
      'Peak-hour fees stay the same as normal hours',
      'Priority delivery when riders are short',
      'Scheduled delivery slots',
      'Monthly savings summary',
      'Priority support lane for refunds and chat',
      'Member-only deals from stores and brands',
      'Early access to new stores and limited items',
      'Ripeness notes for fruits and vegetables',
      'Cash on delivery on eligible orders',
    ],
    perks: [
      {
        title: 'Cash on delivery',
        description: 'Available to Premier members. Other customers can pay online or by UPI at the door.',
      },
      {
        title: 'Priority is fair',
        description: 'Priority applies when riders are short, and non-members never wait beyond a set limit.',
      },
    ],
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'Tricelyn Premier Quarterly',
    targetAudience: 'user',
    price: 249,
    originalPrice: 399,
    billingCycle: 'quarter',
    tag: 'POPULAR',
    badge: 'PREMIER PLUS',
    badgeColor: '#0A2B6B',
    subtitle: '3 Months of peak savings & VIP delivery.',
    description: 'Save 20% compared to monthly. Includes extra cashback & instant re-delivery.',
    features: [
      'All monthly Premier perks included',
      'Extra 5% instant cashback on all grocery orders',
      'Free express delivery on orders above ₹149',
      'Dedicated VIP 24/7 priority customer helpline',
      'Instant zero-question re-delivery on quality issues',
      'Exclusive seasonal fest & Diwali gift boxes',
    ],
    perks: [
      {
        title: 'Guaranteed Slot Booking',
        description: 'Reserve prime 6 AM - 8 AM early morning milk & vegetable slots 24 hours in advance.',
      },
    ],
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'Tricelyn Premier Annual',
    targetAudience: 'user',
    price: 799,
    originalPrice: 1199,
    billingCycle: 'year',
    tag: 'BEST VALUE',
    badge: 'PREMIER VIP',
    badgeColor: '#07162E',
    subtitle: 'Ultimate peace of mind for the entire year.',
    description: 'Best rate at just ₹66/month. Unlimited zero-surge deliveries 365 days a year.',
    features: [
      'Full 365 days of peak-hour fee protection',
      'Unlimited zero-surge deliveries across all categories',
      'Flat ₹50 off voucher every weekend for party orders',
      'Dedicated personal concierge for bulk and rare orders',
      'Free surprise gourmet tasting box every quarter',
      'Highest priority dispatch on rainy and high-demand days',
    ],
    perks: [
      {
        title: 'Concierge Support',
        description: 'Direct phone line to executive support team for instantaneous order resolution.',
      },
    ],
    isActive: true,
    sortOrder: 3,
  },

  // ================= 2. RIDER PARTNER PLANS =================
  {
    name: 'Base (Free)',
    targetAudience: 'rider',
    price: 0,
    originalPrice: 0,
    billingCycle: 'month',
    tag: 'BASE',
    badge: 'STANDARD RIDER',
    badgeColor: '#0A2B6B',
    subtitle: 'Start earning immediately with zero upfront fee.',
    description: 'Short rides near your station, clear pay shown after delivery.',
    features: [
      '₹9 cut per order, payout shown after delivery',
      'Weekly milestone bonuses',
      'Station with water and charging access',
      'Bank account weekly payouts',
      'Standard dispatch queue',
    ],
    perks: [
      {
        title: 'What you need',
        description: 'ID proof & driving licence, Vehicle registration and helmet, Bank account, Wallet balance for cash orders.',
      },
    ],
    commissionRate: '₹9 cut per order',
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'Pro Day Pass',
    targetAudience: 'rider',
    price: 99,
    originalPrice: 149,
    billingCycle: 'day',
    tag: 'PRO, DAY PASS',
    badge: 'PRO RIDER',
    badgeColor: '#0B3EDB',
    subtitle: 'Max earnings on busy days with high order density.',
    description: 'Plus ₹4 to ₹9 per order, set by basket size. See your payout before you accept.',
    features: [
      'Plus ₹4 to ₹9 extra per order, set by basket size',
      'See your payout before you accept each delivery',
      'Priority on new order dispatch queue',
      'Higher weekly milestone bonus slabs',
      'Zero cancellation penalty buffer on emergency',
    ],
    perks: [
      {
        title: 'Payoff Guarantee',
        description: 'Pro pays off on busy days with many orders. Keep up to 35% more of total earnings.',
      },
    ],
    commissionRate: '+₹4 to ₹9 bonus/order',
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'Pro Monthly Super Rider',
    targetAudience: 'rider',
    price: 1499,
    originalPrice: 2499,
    billingCycle: 'month',
    tag: 'MAX EARNINGS',
    badge: 'ELITE RIDER',
    badgeColor: '#07162E',
    subtitle: 'Full month pass for dedicated delivery professionals.',
    description: 'Save 50% vs daily pass. Maximum priority on high-ticket supermarket orders.',
    features: [
      'Unlimited 30-day Pro Day Pass privileges included',
      'Top-tier priority dispatch across all grocery hubs',
      'Lowest platform fee cut across all order sizes',
      'Weekly automated priority payouts directly to bank',
      'Dedicated 24/7 rider emergency roadside assistance',
      'Free Tricelyn premium rain jacket & delivery bag gear',
    ],
    perks: [
      {
        title: 'Elite Status',
        description: 'Get verified Elite Rider badge on your profile and customer tracking screen.',
      },
    ],
    commissionRate: 'Lowest platform commission (flat 4%)',
    isActive: true,
    sortOrder: 3,
  },

  // ================= 3. VENDOR / SUPERMARKET PLANS =================
  {
    name: 'Supermarket Launch (< 3,000 items)',
    targetAudience: 'vendor',
    price: 10000,
    originalPrice: 15000,
    billingCycle: 'one-time',
    tag: 'STARTER',
    badge: 'VERIFIED MERCHANT',
    badgeColor: '#0A2B6B',
    subtitle: 'Onboarding & complete catalogue digitization under 3,000 items.',
    description: 'Reach customers nearby, keep your name & rating in front of them.',
    features: [
      'Complete onboarding for under 3,000 live items',
      'Published rates by category (5% to 8% commission)',
      'Store brand & rating displayed to nearby customers',
      'No fleet needed — Tricelyn riders pick & deliver in 10-15 mins',
      'Daily or weekly settlement to your bank account',
    ],
    perks: [
      {
        title: 'What we need from your store',
        description: 'GST, shop licence, FSSAI & bank account. Catalogue with barcodes & prices. Dedicated staff to pack in 2:30 mins.',
      },
    ],
    commissionRate: '5% to 8% commission',
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'Supermarket Pro (3,000+ items)',
    targetAudience: 'vendor',
    price: 25000,
    originalPrice: 35000,
    billingCycle: 'one-time',
    tag: 'RECOMMENDED',
    badge: 'SUPERMARKET PARTNER',
    badgeColor: '#0B3EDB',
    subtitle: 'Full hypermarket digitization with 3,000+ live items & barcode sync.',
    description: 'Complete catalogue with barcodes, prices & shelf codes. Priority store ranking.',
    features: [
      'Full store digitization for 3,000+ live supermarket items',
      'Flat 5% lowest commission tier across all categories',
      'Barcode, shelf-code & live POS inventory sync support',
      'Featured placement on the City Grocery homepage',
      'Daily automated settlement directly to your bank',
      'Dedicated partner success manager & operational training',
    ],
    perks: [
      {
        title: 'Operational SLA',
        description: 'A person to accept order in 30 seconds and pack in about 2:30 mins. Live stock sync so customers never get surprises.',
      },
    ],
    commissionRate: 'Flat 5% commission',
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'Merchant Growth Club',
    targetAudience: 'vendor',
    price: 2999,
    originalPrice: 4999,
    billingCycle: 'month',
    tag: 'HIGH GROWTH',
    badge: 'PREMIER STORE',
    badgeColor: '#07162E',
    subtitle: 'Marketing accelerator to dominate your 5km hyperlocal radius.',
    description: 'Sponsored visibility, locality push notifications, and 0% commission on pickup.',
    features: [
      'Top sponsored banner slot in your neighborhood',
      '2x monthly push notification broadcast to nearby customers',
      '0% commission on all customer self-pickup orders',
      'Advanced basket analytics and trending grocery insights',
      'Dedicated dispute resolution support manager',
    ],
    perks: [
      {
        title: 'Marketing Power',
        description: 'Keep your store top-of-mind for thousands of households in your postal code.',
      },
    ],
    commissionRate: '0% on self-pickup / standard online',
    isActive: true,
    sortOrder: 3,
  },
];

// Helper to seed plans if empty
const seedDefaultPlansIfEmpty = async () => {
  try {
    const count = await MembershipPlan.countDocuments();
    if (count === 0) {
      await MembershipPlan.insertMany(DEFAULT_PLANS);
      console.log('✅ Successfully seeded 9 default membership plans for User, Rider, Vendor.');
    }
  } catch (err) {
    console.error('Error seeding membership plans:', err.message);
  }
};

// Calculate end date based on billing cycle
const calculateEndDate = (billingCycle, fromDate = new Date()) => {
  const date = new Date(fromDate);
  switch (billingCycle) {
    case 'day':
      date.setDate(date.getDate() + 1);
      break;
    case 'week':
      date.setDate(date.getDate() + 7);
      break;
    case 'month':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarter':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'year':
      date.setFullYear(date.getFullYear() + 1);
      break;
    case 'one-time':
    default:
      date.setFullYear(date.getFullYear() + 10); // 10 years for one-time
      break;
  }
  return date;
};

// ================= PUBLIC / APP / WEB CONTROLLERS =================

// 1. GET /api/memberships/plans?targetAudience=user|rider|vendor
exports.getPlans = async (req, res) => {
  try {
    await seedDefaultPlansIfEmpty();

    const query = { isActive: true };
    if (req.query.targetAudience) {
      query.targetAudience = req.query.targetAudience.toLowerCase();
    }

    const plans = await MembershipPlan.find(query).sort({ sortOrder: 1, price: 1 });
    return res.status(200).json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    console.error('getPlans error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch membership plans', error: error.message });
  }
};

// 2. POST /api/memberships/subscribe
exports.subscribePlan = async (req, res) => {
  try {
    const { planId, paymentMethod = 'Online', targetAudience = 'user', userId: passedUserId, userName, userPhone, userEmail } = req.body;

    if (!planId) {
      return res.status(400).json({ success: false, message: 'Plan ID is required' });
    }

    const plan = await MembershipPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Membership plan not found' });
    }

    // Resolve user ID from auth token or body
    let userId = req.user?._id || passedUserId;
    if (!userId) {
      // If dev / guest mode, fallback or create placeholder
      userId = '000000000000000000000001';
    }

    const userModel = targetAudience === 'rider' ? 'Rider' : targetAudience === 'vendor' ? 'Restaurant' : 'User';
    const now = new Date();
    const endDate = calculateEndDate(plan.billingCycle, now);

    // Deactivate previous active memberships for this user
    await UserMembership.updateMany(
      { userId, targetAudience: plan.targetAudience, status: 'active' },
      { $set: { status: 'expired' } }
    );

    const subscription = await UserMembership.create({
      userId,
      userModel,
      userName: userName || req.user?.name || 'Customer',
      userEmail: userEmail || req.user?.email || '',
      userPhone: userPhone || req.user?.mobile || req.user?.phone || '',
      targetAudience: plan.targetAudience,
      planId: plan._id,
      planName: plan.name,
      pricePaid: plan.price,
      billingCycle: plan.billingCycle,
      startDate: now,
      endDate,
      status: 'active',
      paymentMethod,
      paymentStatus: 'completed',
      badgeText: plan.badge,
    });

    // Update entity badge in User / Rider / Restaurant collection
    try {
      if (userModel === 'User') {
        await User.findByIdAndUpdate(userId, {
          $set: {
            membershipBadge: plan.badge,
            isPremier: true,
            membershipExpiresAt: endDate,
          },
        });
      } else if (userModel === 'Rider') {
        await Rider.findByIdAndUpdate(userId, {
          $set: {
            membershipBadge: plan.badge,
            isProRider: true,
            membershipExpiresAt: endDate,
          },
        });
      } else if (userModel === 'Restaurant') {
        await Restaurant.findByIdAndUpdate(userId, {
          $set: {
            membershipBadge: plan.badge,
            isVerifiedMerchant: true,
            membershipExpiresAt: endDate,
          },
        });
      }
    } catch (e) {
      console.warn('Entity model update warning:', e.message);
    }

    return res.status(201).json({
      success: true,
      message: `Successfully subscribed to ${plan.name}! Your ${plan.badge} badge is now active.`,
      data: subscription,
      badge: {
        text: plan.badge,
        color: plan.badgeColor || '#0B3EDB',
        active: true,
        expiresAt: endDate,
      },
    });
  } catch (error) {
    console.error('subscribePlan error:', error);
    return res.status(500).json({ success: false, message: 'Failed to activate subscription', error: error.message });
  }
};

// 3. GET /api/memberships/my-subscription
exports.getMySubscription = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;
    const targetAudience = req.query.targetAudience || 'user';

    if (!userId) {
      return res.status(200).json({
        success: true,
        hasActiveSubscription: false,
        subscription: null,
        badge: null,
      });
    }

    const subscription = await UserMembership.findOne({
      userId,
      targetAudience,
      status: 'active',
    })
      .sort({ createdAt: -1 })
      .populate('planId');

    if (!subscription) {
      return res.status(200).json({
        success: true,
        hasActiveSubscription: false,
        subscription: null,
        badge: null,
      });
    }

    // Check expiration
    if (new Date() > new Date(subscription.endDate)) {
      subscription.status = 'expired';
      await subscription.save();

      return res.status(200).json({
        success: true,
        hasActiveSubscription: false,
        isExpired: true,
        subscription,
        badge: null,
      });
    }

    return res.status(200).json({
      success: true,
      hasActiveSubscription: true,
      subscription,
      badge: {
        text: subscription.badgeText || 'PREMIER',
        color: subscription.planId?.badgeColor || '#0B3EDB',
        planName: subscription.planName,
        expiresAt: subscription.endDate,
      },
    });
  } catch (error) {
    console.error('getMySubscription error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch subscription', error: error.message });
  }
};

// 4. GET /api/memberships/badge/:type/:id
exports.checkBadge = async (req, res) => {
  try {
    const { type, id } = req.params;
    const targetAudience = type === 'rider' ? 'rider' : type === 'vendor' ? 'vendor' : 'user';

    const sub = await UserMembership.findOne({
      userId: id,
      targetAudience,
      status: 'active',
      endDate: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!sub) {
      return res.status(200).json({
        hasBadge: false,
        badge: null,
      });
    }

    return res.status(200).json({
      hasBadge: true,
      badge: {
        text: sub.badgeText || (targetAudience === 'rider' ? 'PRO RIDER' : targetAudience === 'vendor' ? 'VERIFIED MERCHANT' : 'PREMIER'),
        color: '#0B3EDB',
        planName: sub.planName,
        expiresAt: sub.endDate,
      },
    });
  } catch (error) {
    return res.status(200).json({ hasBadge: false, badge: null });
  }
};

// 5. POST /api/memberships/enquiry (For "Apply to ride" and "Apply to join supermarket")
exports.submitEnquiry = async (req, res) => {
  try {
    const { type, fullName, storeName, ownerName, mobile, vehicleType, area, liveItems, notes } = req.body;

    if (!mobile) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }

    const enquiry = await MembershipEnquiry.create({
      type: type || 'rider',
      fullName,
      storeName,
      ownerName,
      mobile,
      vehicleType,
      area,
      liveItems,
      notes,
    });

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully! Our onboarding team will contact you shortly.',
      data: enquiry,
    });
  } catch (error) {
    console.error('submitEnquiry error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit enquiry', error: error.message });
  }
};

// ================= ADMIN CONTROLLERS =================

// GET /api/admin/memberships/plans
exports.adminGetPlans = async (req, res) => {
  try {
    await seedDefaultPlansIfEmpty();
    const { targetAudience } = req.query;
    const filter = {};
    if (targetAudience) {
      filter.targetAudience = targetAudience;
    }

    const plans = await MembershipPlan.find(filter).sort({ targetAudience: 1, sortOrder: 1, price: 1 });
    return res.status(200).json({ success: true, count: plans.length, data: plans });
  } catch (error) {
    console.error('adminGetPlans error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch plans', error: error.message });
  }
};

// POST /api/admin/memberships/plans
exports.adminCreatePlan = async (req, res) => {
  try {
    const {
      name,
      targetAudience,
      price,
      originalPrice,
      billingCycle,
      tag,
      badge,
      badgeColor,
      subtitle,
      description,
      features,
      perks,
      commissionRate,
      isActive,
      sortOrder,
    } = req.body;

    if (!name || !targetAudience || price === undefined) {
      return res.status(400).json({ success: false, message: 'Name, targetAudience, and price are required' });
    }

    const newPlan = await MembershipPlan.create({
      name,
      targetAudience,
      price: Number(price),
      originalPrice: Number(originalPrice || 0),
      billingCycle: billingCycle || 'month',
      tag: tag || '',
      badge: badge || 'PREMIER',
      badgeColor: badgeColor || '#0B3EDB',
      subtitle: subtitle || '',
      description: description || '',
      features: Array.isArray(features) ? features : typeof features === 'string' ? features.split('\n').filter(Boolean) : [],
      perks: Array.isArray(perks) ? perks : [],
      commissionRate: commissionRate || '',
      isActive: isActive !== undefined ? isActive : true,
      sortOrder: Number(sortOrder || 0),
    });

    return res.status(201).json({ success: true, message: 'Membership plan created successfully', data: newPlan });
  } catch (error) {
    console.error('adminCreatePlan error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create plan', error: error.message });
  }
};

// PUT /api/admin/memberships/plans/:id
exports.adminUpdatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.features && typeof updateData.features === 'string') {
      updateData.features = updateData.features.split('\n').map((f) => f.trim()).filter(Boolean);
    }
    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.originalPrice !== undefined) updateData.originalPrice = Number(updateData.originalPrice);

    const updatedPlan = await MembershipPlan.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedPlan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    return res.status(200).json({ success: true, message: 'Plan updated successfully', data: updatedPlan });
  } catch (error) {
    console.error('adminUpdatePlan error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update plan', error: error.message });
  }
};

// DELETE /api/admin/memberships/plans/:id
exports.adminDeletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPlan = await MembershipPlan.findByIdAndDelete(id);
    if (!deletedPlan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    return res.status(200).json({ success: true, message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('adminDeletePlan error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete plan', error: error.message });
  }
};

// GET /api/admin/memberships/subscriptions
exports.adminGetSubscriptions = async (req, res) => {
  try {
    const { targetAudience, status, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (targetAudience) filter.targetAudience = targetAudience;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userPhone: { $regex: search, $options: 'i' } },
        { planName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [subscriptions, total] = await Promise.all([
      UserMembership.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('planId'),
      UserMembership.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      data: subscriptions,
    });
  } catch (error) {
    console.error('adminGetSubscriptions error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch subscriptions', error: error.message });
  }
};

// GET /api/admin/memberships/enquiries
exports.adminGetEnquiries = async (req, res) => {
  try {
    const { type, status } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const enquiries = await MembershipEnquiry.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: enquiries.length, data: enquiries });
  } catch (error) {
    console.error('adminGetEnquiries error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch enquiries', error: error.message });
  }
};

// PUT /api/admin/memberships/enquiries/:id/status
exports.adminUpdateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const enquiry = await MembershipEnquiry.findByIdAndUpdate(
      id,
      { $set: { status, ...(notes !== undefined && { notes }) } },
      { new: true }
    );

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    return res.status(200).json({ success: true, message: 'Enquiry updated successfully', data: enquiry });
  } catch (error) {
    console.error('adminUpdateEnquiryStatus error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update enquiry', error: error.message });
  }
};
