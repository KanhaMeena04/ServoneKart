/**
 * Comprehensive Rich Production Seeding Script for Tricelyn Quick Commerce
 * Populates:
 * 1. Membership Plans (3 for User, 3 for Rider, 3 for Supermarket Vendor)
 * 2. High-Converting Promocodes
 * 3. Verified Supermarket Stores with 10-15 min delivery SLAs
 * 4. Hero Carousel Banners & 3-Column Promo Offer Cards
 * 5. Admin Settings with dynamic announcements, delivery timings & thresholds
 */
const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const MembershipPlan = require('../models/MembershipPlan');
const Promocode = require('../models/Promocode');
const Restaurant = require('../models/Restaurant');
const Banner = require('../models/Banner');
const AdminSetting = require('../models/AdminSetting');

async function seedRichData() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment!');
  }

  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(uri);
  console.log('Connected successfully!');

  // ==========================================
  // 1. MEMBERSHIP PLANS (User, Rider, Vendor)
  // ==========================================
  console.log('\n--- Seeding Membership Plans ---');
  await MembershipPlan.deleteMany({}); // Fresh reset of membership plans

  const membershipPlans = [
    // --- USER / CUSTOMER PLANS ---
    {
      name: 'Base Customer',
      targetAudience: 'user',
      price: 0,
      originalPrice: 0,
      billingCycle: 'month',
      tag: 'STANDARD',
      badge: 'FREE',
      badgeColor: '#6B7280',
      subtitle: 'Standard quick-commerce shopping',
      description: 'Standard access to fresh groceries, vegetables, and daily essentials.',
      features: [
        'Doorstep grocery delivery in 10-15 mins',
        'Standard delivery charges apply under ₹199',
        'Live GPS tracking with delivery OTP',
        'Cash on Delivery & online payments'
      ],
      perks: [
        { title: 'Standard Delivery', description: 'Available across all serviceable zones' },
        { title: 'Customer Support', description: 'Standard chat & ticket support' }
      ],
      isDefault: true,
      isActive: true,
      sortOrder: 1
    },
    {
      name: 'Tricelyn Premier',
      targetAudience: 'user',
      price: 99,
      originalPrice: 199,
      billingCycle: 'month',
      tag: 'MOST POPULAR',
      badge: 'PREMIER',
      badgeColor: '#0B3EDB',
      subtitle: 'Real perks, no free-delivery tricks',
      description: 'The ultimate grocery membership for daily fresh essentials without surge fees.',
      features: [
        'Peak-hour fees stay the same as normal hours',
        'Priority delivery when riders are short',
        'Scheduled delivery slots',
        'Monthly savings summary',
        'Priority support lane for refunds and chat',
        'Member-only deals from stores and brands',
        'Early access to new stores and limited items',
        'Ripeness notes for fruits and vegetables',
        'Cash on delivery on eligible orders'
      ],
      perks: [
        { title: 'Zero Surge Fee', description: 'Peak-hour delivery fees stay identical to normal hours' },
        { title: 'Priority Dispatch', description: 'Your orders get allocated first during rain or rush hours' },
        { title: 'VIP Support Lane', description: 'Direct 60-second response from senior support' }
      ],
      isDefault: false,
      isActive: true,
      sortOrder: 2
    },
    {
      name: 'Premier Annual Pass',
      targetAudience: 'user',
      price: 799,
      originalPrice: 1188,
      billingCycle: 'year',
      tag: 'BEST VALUE (SAVE 33%)',
      badge: 'PREMIER VIP',
      badgeColor: '#D97706',
      subtitle: 'Full 365 days of VIP quick grocery perks',
      description: 'Year-round unlimited free delivery on orders above ₹99 plus festive priority access.',
      features: [
        'All Tricelyn Premier Monthly perks included for full 365 days',
        'Zero delivery fees on all orders above ₹99',
        'Free surprise sample box on festival seasons',
        'Guaranteed replacement on produce quality within 2 hours',
        'Dedicated personal concierge WhatsApp line'
      ],
      perks: [
        { title: 'Annual Savings', description: 'Save over ₹3,600/year on delivery & packaging charges' },
        { title: 'Quality Guarantee', description: 'Instant no-question refund on fruits & veggies' }
      ],
      isDefault: false,
      isActive: true,
      sortOrder: 3
    },

    // --- RIDER / DELIVERY PARTNER PLANS ---
    {
      name: 'Base Rider Partner',
      targetAudience: 'rider',
      price: 0,
      originalPrice: 0,
      billingCycle: 'day',
      tag: 'BASE PASS',
      badge: 'STANDARD',
      badgeColor: '#6B7280',
      subtitle: 'Flexible delivery partner earnings',
      description: 'Standard pay per delivery with weekly settlement into your verified bank account.',
      features: [
        '₹9 cut per order, payout shown after delivery',
        'Weekly milestone bonuses',
        'Station with water and phone charging facility',
        'Accident insurance assistance'
      ],
      perks: [
        { title: 'Milestone Bonuses', description: 'Weekly targets to earn extra income' },
        { title: 'Rest Hub Access', description: 'Complimentary tea, water and EV charging at partner hubs' }
      ],
      isDefault: true,
      isActive: true,
      sortOrder: 1
    },
    {
      name: 'Pro Day Pass',
      targetAudience: 'rider',
      price: 99,
      originalPrice: 149,
      billingCycle: 'day',
      tag: 'HIGH EARNER',
      badge: 'PRO RIDER',
      badgeColor: '#0B3EDB',
      subtitle: 'Maximum earnings on busy grocery days',
      description: 'Keep higher payout per order, priority allocation on order batching and instant daily payouts.',
      features: [
        'Plus ₹4 to ₹9 per order, set by basket size',
        'See your payout before you accept',
        'Priority on new nearby orders',
        'Higher weekly bonus slabs',
        'Instant daily payout settlement at 11 PM'
      ],
      perks: [
        { title: 'Transparent Payout', description: 'Clear exact earnings displayed upfront before accepting ride' },
        { title: 'Priority Dispatch', description: 'First in line for short 1-2 km express deliveries' }
      ],
      isDefault: false,
      isActive: true,
      sortOrder: 2
    },
    {
      name: 'Pro Weekly Fleet Pass',
      targetAudience: 'rider',
      price: 499,
      originalPrice: 693,
      billingCycle: 'week',
      tag: 'SAVE ₹194 / WEEK',
      badge: 'TOP FLEET',
      badgeColor: '#059669',
      subtitle: 'Full week unlimited pro delivery earnings',
      description: 'Includes full Pro Day Pass features all 7 days with zero per-order platform cut.',
      features: [
        'All Pro Day Pass benefits for entire 7 days',
        'Zero deduction on tips — 100% tip goes to you',
        'Priority emergency roadside support',
        'Highest weekly milestone bonus tier'
      ],
      perks: [
        { title: '100% Tips Kept', description: 'Zero commission cut on customer tips' },
        { title: 'Daily Instant Settlement', description: 'Automatic transfer every evening' }
      ],
      isDefault: false,
      isActive: true,
      sortOrder: 3
    },

    // --- VENDOR / SUPERMARKET MERCHANT PLANS ---
    {
      name: 'Standard Supermarket Partner',
      targetAudience: 'vendor',
      price: 0,
      originalPrice: 0,
      billingCycle: 'month',
      tag: 'BASE PARTNER',
      badge: 'VERIFIED',
      badgeColor: '#6B7280',
      subtitle: 'List your supermarket catalog on Tricelyn',
      description: 'Reach local customers nearby without managing your own delivery riders or app.',
      features: [
        'Customers pick your store and see your rating, ETA & full catalogue',
        'Standard commission: 8% to 10% on groceries',
        'We assign riders, collect payments and settle to bank account',
        'Weekly bank settlement'
      ],
      commissionRate: '8% - 10%',
      perks: [
        { title: 'No Fleet Needed', description: 'Tricelyn riders pick up and deliver in minutes' },
        { title: 'Store Listing', description: 'Visible to 50,000+ local customers in your pin code' }
      ],
      isDefault: true,
      isActive: true,
      sortOrder: 1
    },
    {
      name: 'Pro Supermarket Merchant',
      targetAudience: 'vendor',
      price: 10000,
      originalPrice: 15000,
      billingCycle: 'one-time',
      tag: 'RECOMMENDED FOR MARTS',
      badge: 'PREMIER STORE',
      badgeColor: '#0B3EDB',
      subtitle: 'Lower commission & catalog digitization',
      description: 'Ideal for local supermarkets with under 3,000 live items. Full barcode catalogue setup included.',
      features: [
        'Onboarding: under 3,000 live items catalog barcode setup',
        'Lower commission: 5% to 8% for supermarkets',
        'Dedicated merchant soundbox & Bluetooth receipt printer support',
        'Fast 30-sec order acceptance merchant app',
        'Daily or weekly bank settlement choice'
      ],
      commissionRate: '5% - 8%',
      perks: [
        { title: 'Lower Commission', description: 'Save thousands every month with 5-8% published rates' },
        { title: 'Barcode Integration', description: 'Rapid scanning prevents stock mismatch or out-of-stock items' }
      ],
      isDefault: false,
      isActive: true,
      sortOrder: 2
    },
    {
      name: 'Enterprise Hypermarket & Dark Store',
      targetAudience: 'vendor',
      price: 25000,
      originalPrice: 35000,
      billingCycle: 'one-time',
      tag: 'ENTERPRISE',
      badge: 'HYPERMARKET',
      badgeColor: '#7C3AED',
      subtitle: 'Full warehouse & hypermarket solution',
      description: 'For large 3,000+ live item supermarkets and exclusive dark stores with multi-counter packing.',
      features: [
        'Onboarding: 3,000+ live items with automated ERP/POS sync',
        'Lowest commission tier: 4% to 6%',
        'Dedicated Key Account Manager (KAM)',
        'Multi-station packing queue and barcode verification scan',
        'T+1 Next-Day automatic bank settlement'
      ],
      commissionRate: '4% - 6%',
      perks: [
        { title: 'Lowest Commission Rate', description: 'Maximum margins for high-volume grocery distributors' },
        { title: 'Dedicated KAM', description: 'Direct relationship manager for promotions and inventory sync' }
      ],
      isDefault: false,
      isActive: true,
      sortOrder: 3
    }
  ];

  const createdPlans = await MembershipPlan.insertMany(membershipPlans);
  console.log(`Successfully seeded ${createdPlans.length} Membership Plans!`);

  // ==========================================
  // 2. PROMOCODES & DISCOUNT COUPONS
  // ==========================================
  console.log('\n--- Seeding Promocodes ---');
  await Promocode.deleteMany({});

  const validFrom = new Date();
  const validTill = new Date();
  validTill.setFullYear(validTill.getFullYear() + 1); // Valid for next 12 months

  const promocodes = [
    {
      title: 'Flat ₹100 Off on Groceries',
      description: 'Save ₹100 instantly on all fresh grocery orders above ₹399',
      code: 'TRICELYN100',
      offerType: 'amount',
      discountValue: 100,
      maxDiscountAmount: 100,
      minOrderValue: 399,
      fundingSource: 'ECDKART',
      usageLimitPerCoupon: 10000,
      usageLimitPerUser: 5,
      availableFrom: validFrom,
      expiryDate: validTill,
      promoType: 'general',
      status: 'active'
    },
    {
      title: 'Free Delivery Express',
      description: 'Get 100% Free Doorstep Delivery on all orders above ₹149',
      code: 'FREEDEL',
      offerType: 'free_delivery',
      discountValue: 30,
      maxDiscountAmount: 30,
      minOrderValue: 149,
      fundingSource: 'ECDKART',
      usageLimitPerCoupon: 20000,
      usageLimitPerUser: 10,
      availableFrom: validFrom,
      expiryDate: validTill,
      promoType: 'general',
      status: 'active'
    },
    {
      title: 'First Order Welcome Offer',
      description: 'Flat 25% Off on your first order of farm fresh veggies & daily needs',
      code: 'WELCOME25',
      offerType: 'percent',
      discountValue: 25,
      maxDiscountAmount: 150,
      minOrderValue: 199,
      fundingSource: 'ECDKART',
      usageLimitPerCoupon: 50000,
      usageLimitPerUser: 1,
      availableFrom: validFrom,
      expiryDate: validTill,
      promoType: 'general',
      status: 'active'
    },
    {
      title: 'Super Fresh Produce Discount',
      description: 'Get 50% discount up to ₹75 on seasonal fruits and farm veggies',
      code: 'SUPER50',
      offerType: 'percent',
      discountValue: 50,
      maxDiscountAmount: 75,
      minOrderValue: 249,
      fundingSource: 'ECDKART',
      usageLimitPerCoupon: 15000,
      usageLimitPerUser: 3,
      availableFrom: validFrom,
      expiryDate: validTill,
      promoType: 'general',
      status: 'active'
    }
  ];

  const createdPromos = await Promocode.insertMany(promocodes);
  console.log(`Successfully seeded ${createdPromos.length} Promocodes!`);

  // ==========================================
  // 3. TOP HERO BANNERS & 3-COLUMN OFFER CARDS
  // ==========================================
  console.log('\n--- Seeding Banners & Promo Cards ---');
  await Banner.deleteMany({});

  const banners = [
    // Hero Carousel Banners (Web & Mobile Slider)
    {
      title: 'Farm Fresh Fruits & Veggies',
      subtitle: 'Crisp, handpicked produce delivered in 10-15 mins from local markets.',
      badge: 'UP TO 40% OFF',
      buttonText: 'Order Farm Fresh',
      link: '/category/fruits-vegetables',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1200&q=85',
      bgGradient: 'from-[#07162E] via-[#0A2B6B] to-[#0B3EDB]',
      placement: 'hero',
      type: 'static',
      position: 1,
      isActive: true
    },
    {
      title: 'Daily Dairy, Fresh Bread & Eggs',
      subtitle: 'Pure milk, butter, creamy paneer & breakfast bread at MRP discount.',
      badge: '10-15 MIN DELIVERY',
      buttonText: 'Shop Breakfast',
      link: '/category/dairy-bread-eggs',
      image: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=1200&q=85',
      bgGradient: 'from-[#0A2B6B] via-[#0B3EDB] to-[#0D5AA6]',
      placement: 'hero',
      type: 'static',
      position: 2,
      isActive: true
    },
    {
      title: 'Atta, Basmati Rice & Pure Ghee',
      subtitle: 'Pantry staples from trusted brands: Fortune, Aashirvaad & India Gate.',
      badge: 'FLAT ₹100 OFF',
      buttonText: 'Stock Pantry',
      link: '/category/atta-rice-dal',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1200&q=85',
      bgGradient: 'from-[#07162E] via-[#0A2B6B] to-[#0B3EDB]',
      placement: 'hero',
      type: 'static',
      position: 3,
      isActive: true
    },
    // 3-Column Promo Offer Cards Under Hero
    {
      title: 'Munchies & Chilled Cold Drinks',
      subtitle: 'Chips, colas, namkeens and midnight cravings sorted in minutes.',
      badge: 'INSTANT REFRESH',
      buttonText: 'Explore Munchies',
      link: '/category/snacks-munchies',
      image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&q=80',
      bgGradient: 'from-amber-600 to-orange-500',
      placement: 'offer_card',
      type: 'static',
      position: 1,
      isActive: true
    },
    {
      title: 'Cleaning & Household Supplies',
      subtitle: 'Detergents, floor cleaners, mosquito repellents & paper towels.',
      badge: 'SAVE UP TO 35%',
      buttonText: 'Shop Household',
      link: '/category/cleaning-essentials',
      image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600&q=80',
      bgGradient: 'from-emerald-700 to-teal-600',
      placement: 'offer_card',
      type: 'static',
      position: 2,
      isActive: true
    },
    {
      title: 'Personal Care & Wellness',
      subtitle: 'Shampoos, soaps, dental hygiene & baby care products.',
      badge: 'BEST BRANDS',
      buttonText: 'View Wellness',
      link: '/category/personal-care',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80',
      bgGradient: 'from-purple-800 to-indigo-600',
      placement: 'offer_card',
      type: 'static',
      position: 3,
      isActive: true
    }
  ];

  const createdBanners = await Banner.insertMany(banners);
  console.log(`Successfully seeded ${createdBanners.length} Banners!`);

  // ==========================================
  // 4. SUPERMARKET STORES ENHANCEMENT
  // ==========================================
  console.log('\n--- Verifying Supermarket Stores ---');
  const stores = await Restaurant.find({});
  if (stores.length > 0) {
    for (let i = 0; i < stores.length; i++) {
      const s = stores[i];
      s.isAcceptingOrders = true;
      s.status = 'approved';
      s.estimatedDeliveryTime = '10-15 Mins';
      s.isFreeDelivery = true;
      s.minOrderAmount = 149;
      await s.save();
    }
    console.log(`Updated ${stores.length} Supermarket Stores with 10-15 min delivery & active order status.`);
  }

  // ==========================================
  // 5. ADMIN SETTINGS ENHANCEMENT
  // ==========================================
  console.log('\n--- Syncing Admin Settings ---');
  let settings = await AdminSetting.findOne();
  if (!settings) {
    settings = new AdminSetting();
  }

  settings.appName = 'Tricelyn';
  settings.platformMode = 'grocery';
  settings.primaryVertical = 'grocery';
  settings.enableGroceryDelivery = true;
  settings.enableFoodDelivery = false;
  settings.isCodEnabled = true;
  settings.estimatedDeliveryTime = '10-15 Mins';
  settings.deliveryHeadline = 'HYPERLOCAL EXPRESS • 10-15 MINS';
  settings.deliverySubtext = 'Groceries in minutes, from your own Supermarket';
  settings.firstOrderFreeDelivery = true;
  settings.freeDeliveryMinAmount = 199;
  settings.announcement = {
    enabled: true,
    text: 'Welcome to TRICELYN • "Groceries in minutes, from your own Supermarket" • Fast, Fresh & Doorstep Delivery in 10-15 Mins!',
    color: '#0B3EDB'
  };
  settings.deliveryFeeConfig = {
    enabled: true,
    baseFee: 30,
    baseDistanceKm: 3,
    maxDeliveryRadiusKm: 12,
    isFreeDeliveryEnabled: true,
    freeDeliveryThreshold: 199,
    slabs: [
      { minDistanceKm: 0, maxDistanceKm: 3, fee: 30, perKmFee: 0, isActive: true },
      { minDistanceKm: 3, maxDistanceKm: 6, fee: 45, perKmFee: 0, isActive: true },
      { minDistanceKm: 6, maxDistanceKm: 12, fee: 65, perKmFee: 0, isActive: true }
    ]
  };

  await settings.save();
  console.log('Admin Settings updated with announcement ticker, 10-15 min delivery & ₹199 free delivery threshold.');

  console.log('\n=============================================');
  console.log('DATABASE SEEDING COMPLETE WITH RICH DATA!');
  console.log('=============================================\n');

  await mongoose.disconnect();
}

seedRichData().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});

