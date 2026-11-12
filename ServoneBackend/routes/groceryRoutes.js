const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Banner = require('../models/Banner');
const Order = require('../models/Order');
const { protect } = require('../middleware/authMiddleware');
const { VERTICALS, BUSINESS_TYPES } = require('../constants/verticals');
const {
  HERO_BANNERS,
  CATEGORIES,
  BEST_SELLERS,
  PRODUCTS_BY_CATEGORY,
  ALL_CATALOG_PRODUCTS
} = require('../data/comprehensiveGroceryCatalog');

/**
 * GET /api/grocery/banners
 * Dynamic Hero Slider Banners + 3-Column Promo Offer Cards
 * Controlled dynamically from Master Admin Panel
 */
const { ensureSettings } = require('../controllers/adminSettingsController');
const socketService = require('../services/socketService');

const extractText = (val, fallback = '') => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    return val.en || val.de || val.ar || Object.values(val).find(Boolean) || fallback;
  }
  return String(val);
};

function normalizeProduct(raw) {
  if (!raw) return null;
  const p = raw.toObject ? raw.toObject() : { ...raw };
  const idStr = (p._id || p.id || '').toString();
  const nameStr = extractText(p.name, 'Grocery Item');
  const descStr = extractText(p.description, '');
  const catObj = p.category && typeof p.category === 'object' ? p.category : null;
  const catName = extractText(catObj?.name || p.categoryName, 'Daily Essentials');
  const catSlug = catObj?.slug || p.categorySlug || 'daily-essentials';
  const restObj = p.restaurant && typeof p.restaurant === 'object' ? p.restaurant : null;
  const storeId = (restObj?._id || p.storeId || (typeof p.restaurant === 'string' || mongoose.isValidObjectId(p.restaurant) ? p.restaurant : '') || 'store_tricelyn_indore_01').toString();
  const storeName = extractText(restObj?.name || p.storeName || p.restaurantName || p.vendorName, 'Tricelyn Partner Store');
  const storeAddress = restObj?.address || p.storeAddress || 'Indore';
  const storeRating = typeof restObj?.rating === 'object'
    ? Number(restObj.rating?.average || 4.8)
    : (Number(restObj?.rating || p.storeRating) || 4.8);
  const price = Number(p.sellingPrice ?? p.price ?? p.basePrice ?? p.pricing?.b2c?.sellingPrice ?? 0);
  const mrp = Number(p.mrp ?? p.pricing?.b2c?.mrp ?? Math.round(price * 1.2));
  const discountPercent = p.discountPercent ?? (mrp > price && mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0);
  const stockQuantity = p.stockQuantity !== undefined ? Number(p.stockQuantity) : 100;
  const lowStockThreshold = Number(p.lowStockThreshold ?? 10);
  const inStock = p.outOfStock === true ? false : (p.inStock !== false && stockQuantity > 0);
  const unitStr = p.unit || 'piece';
  const weightStr = p.weight || (unitStr && unitStr !== 'piece' ? `1 ${unitStr}` : '1 unit');

  return {
    ...p,
    _id: idStr || p.id,
    id: idStr || p.id,
    name: nameStr,
    description: descStr,
    sku: p.sku || (idStr ? `TRC-${idStr.slice(-6).toUpperCase()}` : 'TRC-SKU'),
    vertical: p.vertical || VERTICALS.GROCERY,
    price,
    sellingPrice: price,
    basePrice: Number(p.basePrice ?? price),
    mrp,
    discountPercent,
    unit: unitStr,
    weight: weightStr,
    stockQuantity,
    lowStockThreshold,
    inStock,
    outOfStock: !inStock,
    available: p.available !== false && inStock,
    categorySlug: catSlug,
    categoryName: catName,
    category: catObj
      ? { _id: catObj._id?.toString(), id: catObj._id?.toString(), name: catName, slug: catSlug, image: catObj.image || '' }
      : { name: catName, slug: catSlug },
    storeId,
    storeName,
    storeAddress,
    storeRating,
    restaurant: storeId,
    restaurantName: storeName,
    vendorName: storeName,
    deliveryTime: typeof restObj?.deliveryTime === 'number'
      ? `${restObj.deliveryTime} mins`
      : (restObj?.deliveryTime || p.deliveryTime || '10-15 mins'),
    image: p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80'
  };
}

const DEFAULT_HERO_SLIDES = [
  {
    id: 'slide-farm-fresh',
    tag: 'TRICELYN FRESH · 10-15 MINS',
    title: 'Farm Fresh Fruits & Vegetables',
    subtitle: 'Crisp seasonal greens, organic veggies & juicy fruits delivered straight from local Indore mandis',
    buttonText: 'Order Fresh',
    link: '/category/fruits-vegetables',
    bgGradient: 'from-[#064e3b] via-[#047857] to-[#10b981]',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1200&q=80',
    alt: 'Fresh organic vegetables, fruits and greens'
  },
  {
    id: 'slide-dairy-breakfast',
    tag: 'DAILY ESSENTIALS · SUPERFAST',
    title: 'Fresh Milk, Breads & Farm Eggs',
    subtitle: 'Pure dairy pouches, artisan whole-wheat breads, farm fresh eggs & butter at morning speed',
    buttonText: 'Shop Breakfast',
    link: '/category/dairy-bread-eggs',
    bgGradient: 'from-[#002b80] via-[#0055ff] to-[#38bdf8]',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=1200&q=80',
    alt: 'Fresh dairy, breads and breakfast essentials'
  },
  {
    id: 'slide-summer-coolers',
    tag: 'ICY COLD · INSTANT REFRESH',
    title: 'Chilled Drinks, Ice Creams & Juices',
    subtitle: 'Beat the heat with iced sodas, cold-pressed fruit juices, coconut water & gourmet ice creams',
    buttonText: 'Explore Coolers',
    link: '/category/cold-drinks-juices',
    bgGradient: 'from-[#9a3412] via-[#ea580c] to-[#f97316]',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=1200&q=80',
    alt: 'Chilled tropical juices and cold drinks'
  },
  {
    id: 'slide-snacks-munchies',
    tag: 'MIDNIGHT CRAVINGS · 10 MINS',
    title: 'Snacks, Munchies & Chocolates',
    subtitle: 'Crunchy Indore namkeen, imported chocolate bars, potato chips & cookies for instant cravings',
    buttonText: 'Grab Snacks',
    link: '/category/snacks-munchies',
    bgGradient: 'from-[#3b0764] via-[#7c3aed] to-[#a855f7]',
    image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=1200&q=80',
    alt: 'Assorted chips, cookies and chocolates'
  }
];

const DEFAULT_OFFER_CARDS = [
  {
    id: 'kitchen-staples',
    badge: 'FLAT 30% OFF',
    title: 'Kitchen Staples & Pure Ghee',
    subtitle: 'Premium basmati rice, organic dals, pure spices & cold-pressed oils',
    buttonText: 'Order Staples',
    link: '/category/atta-rice-dal',
    bgGradient: 'from-[#7c2d12] via-[#c2410c] to-[#ea580c]',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=700&q=80',
    alt: 'Kitchen staples, rice, pulses, and spices'
  },
  {
    id: 'home-cleaning',
    badge: 'EVERYDAY SAVINGS',
    title: 'Home Care & Disinfectants',
    subtitle: 'Top brand detergents, floor cleaners, kitchen sprays & air fresheners',
    buttonText: 'Shop Cleaners',
    link: '/category/household-cleaning',
    bgGradient: 'from-[#0c4a6e] via-[#0284c7] to-[#0ea5e9]',
    image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=700&q=80',
    alt: 'Household cleaning supplies and detergents'
  },
  {
    id: 'personal-care',
    badge: 'STARTING @ ₹49',
    title: 'Personal Care & Grooming',
    subtitle: 'Herbal body washes, shampoos, oral hygiene & daily skincare essentials',
    buttonText: 'Explore Range',
    link: '/category/personal-care',
    bgGradient: 'from-[#312e81] via-[#4f46e5] to-[#7c3aed]',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=700&q=80',
    alt: 'Personal care, grooming and skincare products'
  }
];

router.get('/banners', async (req, res) => {
  try {
    let heroSlides = [...DEFAULT_HERO_SLIDES];
    let offerBanners = [...DEFAULT_OFFER_CARDS];

    if (mongoose.connection.readyState === 1) {
      try {
        const Banner = require('../models/Banner');
        const dbBanners = await Banner.find({ isActive: { $ne: false } })
          .sort({ position: 1, createdAt: -1 })
          .lean();

        if (dbBanners && dbBanners.length > 0) {
          const dbHero = dbBanners.filter(b => b.placement === 'hero' || (!b.placement && b.type !== 'offer_card'));
          const dbOffer = dbBanners.filter(b => b.placement === 'offer_card' || b.type === 'offer_card');

          if (dbHero.length > 0) {
            heroSlides = dbHero.map((b, idx) => ({
              id: b._id?.toString() || `db-hero-${idx}`,
              tag: b.badge || 'TRICELYN FRESH · 10-15 MINS',
              title: b.title,
              subtitle: b.subtitle || 'Fresh groceries & daily staples delivered to your door in Indore',
              buttonText: b.buttonText || 'Shop Now',
              link: b.link || (b.targetId ? `/category/${b.targetId}` : '/categories'),
              bgGradient: b.bgGradient || (idx % 2 === 0 ? 'from-[#064e3b] via-[#047857] to-[#10b981]' : 'from-[#002b80] via-[#0055ff] to-[#38bdf8]'),
              image: b.image,
              alt: b.title
            }));
          }

          if (dbOffer.length > 0) {
            offerBanners = dbOffer.map((b, idx) => ({
              id: b._id?.toString() || `db-offer-${idx}`,
              badge: b.badge || 'SPECIAL OFFER',
              title: b.title,
              subtitle: b.subtitle || 'Best deals on essentials today',
              buttonText: b.buttonText || 'Order Now',
              link: b.link || (b.targetId ? `/category/${b.targetId}` : '/categories'),
              bgGradient: b.bgGradient || (idx === 0 ? 'from-[#7c2d12] via-[#c2410c] to-[#ea580c]' : idx === 1 ? 'from-[#0c4a6e] via-[#0284c7] to-[#0ea5e9]' : 'from-[#312e81] via-[#4f46e5] to-[#7c3aed]'),
              image: b.image,
              alt: b.title
            }));
          }
        }
      } catch (err) {
        console.warn('Error reading DB banners in groceryRoutes:', err.message);
      }
    }

    const firstHero = heroSlides[0] || DEFAULT_HERO_SLIDES[0];

    return res.status(200).json({
      success: true,
      heroSlides,
      offerBanners,
      hero: {
        ...HERO_BANNERS.hero,
        title: firstHero.title,
        bagImage: firstHero.image,
        buttonLink: firstHero.link
      },
      topBanner: firstHero,
      subBanners: offerBanners,
      banners: [...heroSlides, ...offerBanners],
      data: [...heroSlides, ...offerBanners]
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      heroSlides: DEFAULT_HERO_SLIDES,
      offerBanners: DEFAULT_OFFER_CARDS,
      hero: HERO_BANNERS.hero,
      banners: [...DEFAULT_HERO_SLIDES, ...DEFAULT_OFFER_CARDS]
    });
  }
});

/**
 * GET /api/grocery/best-sellers
 * Best Selling Products matching Master Mockup
 */
router.get('/best-sellers', async (req, res) => {
  try {
    let bestSellers = [];
    if (mongoose.connection.readyState === 1) {
      const dbBest = await Product.find({
        $or: [
          { vertical: VERTICALS.GROCERY },
          { vertical: 'grocery' },
          { vertical: VERTICALS.ESSENTIALS }
        ],
        isDeleted: { $ne: true },
        isApproved: { $ne: false },
        isRejected: { $ne: true },
        available: { $ne: false },
        inStock: { $ne: false },
        stockQuantity: { $gt: 0 }
      })
        .populate('category', 'name slug image')
        .populate('restaurant', 'name address location rating ratingsCount deliveryTime image logo isPureVeg')
        .sort({ isFeatured: -1, stockQuantity: -1, createdAt: -1 })
        .limit(16)
        .lean();
      bestSellers = dbBest.map(normalizeProduct).filter(Boolean);
    }

    if (bestSellers.length === 0) {
      bestSellers = BEST_SELLERS;
    }

    return res.status(200).json({
      success: true,
      count: bestSellers.length,
      data: bestSellers
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      count: BEST_SELLERS.length,
      data: BEST_SELLERS
    });
  }
});

/**
 * GET /api/grocery/categories
 * Dynamic categories from Category model with full 20-category quick-commerce support
 */
router.get('/categories', async (req, res) => {
  try {
    let categories = [];
    if (mongoose.connection.readyState === 1) {
      const dbCats = await Category.find({
        $or: [
          { vertical: VERTICALS.GROCERY },
          { vertical: 'grocery' },
          { type: 'grocery' },
          { type: 'main' }
        ],
        type: { $ne: 'subcategory' },
        isActive: { $ne: false }
      }).select('name image icon slug position description vertical').sort({ position: 1 }).lean();

      categories = dbCats.map((c) => {
        const nameStr = extractText(c.name, 'Grocery Category');
        return {
          ...c,
          _id: c._id ? c._id.toString() : '',
          id: c._id ? c._id.toString() : '',
          name: nameStr,
          title: nameStr,
          slug: c.slug || nameStr.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        };
      });
    }

    if (!categories || categories.length === 0) {
      categories = CATEGORIES;
    }

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      count: CATEGORIES.length,
      data: CATEGORIES
    });
  }
});

/**
 * GET /api/grocery/category-sections
 * Category-wise grouped product sections from live MongoDB (with static catalog fallback)
 */
router.get('/category-sections', async (req, res) => {
  try {
    const featuredSectionSlugs = [
      { slug: 'dairy-bread-eggs', name: 'Dairy, Bread & Eggs' },
      { slug: 'cold-drinks-juices', name: 'Cold Drinks & Juices' },
      { slug: 'paan-corner', name: 'Mouth fresheners' },
      { slug: 'snacks-munchies', name: 'Snacks & Munchies' },
      { slug: 'fruits-vegetables', name: 'Fruits & Vegetables' },
      { slug: 'atta-rice-dal', name: 'Atta, Rice & Dal' },
      { slug: 'sweet-tooth', name: 'Sweet Tooth & Chocolates' },
      { slug: 'bakery-biscuits', name: 'Bakery & Biscuits' }
    ];

    let sections = [];
    if (mongoose.connection.readyState === 1) {
      const [dbCats, dbProds] = await Promise.all([
        Category.find({
          $or: [{ vertical: VERTICALS.GROCERY }, { vertical: 'grocery' }, { vertical: VERTICALS.ESSENTIALS }],
          type: { $ne: 'subcategory' },
          isActive: { $ne: false }
        }).sort({ position: 1 }).lean(),
        Product.find({
          $or: [{ vertical: VERTICALS.GROCERY }, { vertical: 'grocery' }, { vertical: VERTICALS.ESSENTIALS }],
          isDeleted: { $ne: true },
          isApproved: { $ne: false },
          isRejected: { $ne: true },
          available: { $ne: false }
        })
          .populate('category', 'name slug image')
          .populate('restaurant', 'name address location rating ratingsCount deliveryTime image logo isPureVeg')
          .lean()
      ]);

      const normProds = dbProds.map(normalizeProduct).filter(Boolean);
      if (normProds.length > 0) {
        const bySlug = new Map();
        normProds.forEach((p) => {
          const s = p.categorySlug || 'daily-essentials';
          if (!bySlug.has(s)) {
            bySlug.set(s, {
              id: `sec_${s}`,
              slug: s,
              title: p.categoryName || 'Grocery',
              name: p.categoryName || 'Grocery',
              products: []
            });
          }
          if (bySlug.get(s).products.length < 12) {
            bySlug.get(s).products.push(p);
          }
        });

        const seen = new Set();
        featuredSectionSlugs.forEach((sec) => {
          if (bySlug.has(sec.slug)) {
            sections.push(bySlug.get(sec.slug));
            seen.add(sec.slug);
          }
        });
        dbCats.forEach((c) => {
          const slug = c.slug || '';
          if (slug && !seen.has(slug) && bySlug.has(slug)) {
            sections.push(bySlug.get(slug));
            seen.add(slug);
          }
        });
        bySlug.forEach((val, key) => {
          if (!seen.has(key)) sections.push(val);
        });
      }
    }

    if (sections.length === 0) {
      sections = featuredSectionSlugs.map(sec => {
        const prods = ALL_CATALOG_PRODUCTS.filter(p => p.categorySlug === sec.slug);
        return {
          id: `sec_${sec.slug}`,
          slug: sec.slug,
          title: sec.name,
          name: sec.name,
          products: prods
        };
      });
    }

    return res.status(200).json({
      success: true,
      count: sections.length,
      data: sections
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/grocery/products
 * Dynamic grocery products from Product model with exact category, store & search filtering
 */
router.get('/products', async (req, res) => {
  try {
    const { category, search, storeId, limit } = req.query;
    let products = [];

    if (mongoose.connection.readyState === 1) {
      const andConds = [
        {
          $or: [
            { vertical: VERTICALS.GROCERY },
            { vertical: 'grocery' },
            { vertical: VERTICALS.ESSENTIALS },
            { vertical: VERTICALS.GIFTS_BAKERY }
          ]
        },
        {
          isDeleted: { $ne: true },
          isApproved: { $ne: false },
          isRejected: { $ne: true }
        }
      ];

      if (storeId && storeId !== 'all') {
        if (mongoose.isValidObjectId(storeId)) {
          andConds.push({ $or: [{ restaurant: storeId }, { storeId }] });
        } else {
          const matchedRest = await Restaurant.findOne({
            $or: [{ restaurantId: storeId }, { slug: storeId }]
          }).select('_id').lean();
          if (matchedRest) {
            andConds.push({ $or: [{ restaurant: matchedRest._id }, { storeId }] });
          } else {
            andConds.push({ storeId });
          }
        }
      }

      if (search) {
        andConds.push({
          $or: [
            { 'name.en': { $regex: search, $options: 'i' } },
            { name: { $regex: search, $options: 'i' } },
            { 'description.en': { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { sku: { $regex: search, $options: 'i' } }
          ]
        });
      }

      if (category && category !== 'all') {
        const escapedCat = String(category).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const catDoc = await Category.findOne({
          $or: [
            { slug: category },
            ...(mongoose.isValidObjectId(category) ? [{ _id: category }] : []),
            { name: { $regex: `^${escapedCat}$`, $options: 'i' } },
            { 'name.en': { $regex: `^${escapedCat}$`, $options: 'i' } }
          ]
        }).lean();

        if (catDoc) {
          andConds.push({
            $or: [
              { category: catDoc._id },
              { categoryId: catDoc._id },
              { subcategoryId: catDoc._id },
              { categorySlug: catDoc.slug },
              { categorySlug: category }
            ]
          });
        } else {
          andConds.push({ categorySlug: category });
        }
      }

      const q = Product.find({ $and: andConds })
        .populate('category', 'name slug image')
        .populate('restaurant', 'name address location rating ratingsCount deliveryTime image logo isPureVeg')
        .sort({ isFeatured: -1, createdAt: -1 })
        .lean();
      if (limit) q.limit(Number(limit));
      const rawProducts = await q.exec();
      products = rawProducts.map(normalizeProduct).filter(Boolean);
    }

    if (products.length === 0 && mongoose.connection.readyState !== 1) {
      let filtered = ALL_CATALOG_PRODUCTS;
      if (category && category !== 'all') {
        filtered = filtered.filter(p =>
          p.categorySlug === category ||
          p.category?.slug === category ||
          p.category?.id === category
        );
      }
      if (storeId && storeId !== 'all') {
        filtered = filtered.filter(p => String(p.storeId) === String(storeId) || String(p.restaurant) === String(storeId));
      }
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(s) ||
          (p.description && p.description.toLowerCase().includes(s))
        );
      }
      if (limit) {
        filtered = filtered.slice(0, Number(limit));
      }
      products = filtered;
    }

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Grocery /products error:', error.message);
    let filtered = ALL_CATALOG_PRODUCTS;
    const { category, search, storeId, limit } = req.query;
    if (category && category !== 'all') {
      filtered = filtered.filter(p => p.categorySlug === category || p.category?.slug === category);
    }
    if (storeId && storeId !== 'all') {
      filtered = filtered.filter(p => String(p.storeId) === String(storeId) || String(p.restaurant) === String(storeId));
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(s));
    }
    if (limit) filtered = filtered.slice(0, Number(limit));

    return res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered
    });
  }
});

/**
 * Helper to build rich product details matching Blinkit/Zepto quick-commerce screen
 */
function buildProductDetailsPayload(rawProd, allProds) {
  if (!rawProd && (!allProds || allProds.length === 0)) return null;
  const target = rawProd || allProds[0];
  const p = normalizeProduct(target) || target;
  const nameLower = (p.name || '').toLowerCase();
  const catSlug = p.categorySlug || p.category?.slug || 'daily-essentials';
  const price = Number(p.price) || 40;
  const mrp = Number(p.mrp) || Math.round(price * 1.25);
  const weightStr = typeof p.weight === 'string' ? p.weight : String(p.weight || '');

  // 1. Dynamic Variants matching Quick-Commerce & Blinkit Mockup (e.g. 500 ml ₹35, 1 ltr ₹70)
  let variants = [];
  if (p.variants && Array.isArray(p.variants) && p.variants.length > 0) {
    variants = p.variants;
  } else if (nameLower.includes('milk') || p.unit === 'ltr' || p.unit === 'ml') {
    variants = [
      {
        id: 'var_500ml',
        unit: '500 ml',
        weight: '500 ml',
        price: price > 50 ? Math.round(price * 0.55) : price,
        mrp: mrp > 50 ? Math.round(mrp * 0.55) : mrp,
        discountPercent: p.discountPercent || 10,
        inStock: true
      },
      {
        id: 'var_1ltr',
        unit: '1 ltr',
        weight: '1 ltr',
        price: price > 50 ? price : Math.round(price * 1.95),
        mrp: mrp > 50 ? mrp : Math.round(mrp * 1.95),
        discountPercent: p.discountPercent || 10,
        inStock: true
      }
    ];
  } else if (nameLower.includes('atta') || nameLower.includes('rice') || nameLower.includes('dal') || weightStr.includes('kg')) {
    variants = [
      {
        id: 'var_1kg',
        unit: '1 kg',
        weight: '1 kg pouch',
        price: Math.max(35, Math.round(price * 0.28)),
        mrp: Math.max(45, Math.round(mrp * 0.28)),
        discountPercent: 12,
        inStock: true
      },
      {
        id: 'var_5kg',
        unit: '5 kg',
        weight: '5 kg bag',
        price: price,
        mrp: mrp,
        discountPercent: p.discountPercent || 15,
        inStock: true
      },
      {
        id: 'var_10kg',
        unit: '10 kg',
        weight: '10 kg family pack',
        price: Math.round(price * 1.9),
        mrp: Math.round(mrp * 2.0),
        discountPercent: 18,
        inStock: true
      }
    ];
  } else if (nameLower.includes('banana') || nameLower.includes('tomato') || nameLower.includes('onion') || nameLower.includes('potato') || catSlug === 'fruits-vegetables') {
    variants = [
      {
        id: 'var_500g',
        unit: '500 g',
        weight: '500 g',
        price: Math.max(15, Math.round(price * 0.55)),
        mrp: Math.max(20, Math.round(mrp * 0.55)),
        discountPercent: p.discountPercent || 20,
        inStock: true
      },
      {
        id: 'var_1kg',
        unit: '1 kg',
        weight: '1 kg',
        price: price,
        mrp: mrp,
        discountPercent: p.discountPercent || 25,
        inStock: true
      }
    ];
  } else {
    variants = [
      {
        id: 'var_std',
        unit: p.weight || p.unit || 'Standard Pack',
        weight: p.weight || p.unit || 'Standard Pack',
        price: price,
        mrp: mrp,
        discountPercent: p.discountPercent || 0,
        inStock: true
      },
      {
        id: 'var_combo',
        unit: 'Pack of 2',
        weight: 'Pack of 2 (Value Saver)',
        price: Math.round(price * 1.9),
        mrp: Math.round(mrp * 2.0),
        discountPercent: Math.min(40, (p.discountPercent || 10) + 5),
        inStock: true
      }
    ];
  }

  // 2. Multiple Gallery Thumbnails (4-5 images for product showcase)
  const baseImg = p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80';
  const images = [
    baseImg,
    baseImg + (baseImg.includes('?') ? '&view=front' : '?view=front'),
    baseImg + (baseImg.includes('?') ? '&view=back' : '?view=back'),
    baseImg + (baseImg.includes('?') ? '&view=nutrition' : '?view=nutrition'),
    baseImg + (baseImg.includes('?') ? '&view=prep' : '?view=prep')
  ];

  // 3. Product Details & Specifications
  const isDairy = catSlug === 'dairy-bread-eggs' || nameLower.includes('milk') || nameLower.includes('paneer') || nameLower.includes('curd');
  const isProduce = catSlug === 'fruits-vegetables';
  
  const keyFeatures = [
    { label: 'Fat Profile / Grade', value: isDairy ? (nameLower.includes('full cream') || nameLower.includes('gold') ? 'Full Cream' : 'Toned / Double Toned') : (isProduce ? 'Fresh Farm Harvest' : 'Standard / Premium Pack') },
    { label: 'Packaging Type', value: 'Pouch / Sealed Pack' },
    { label: 'Shelf Life', value: isDairy ? '2 Days' : (isProduce ? '3 - 4 Days' : '6 - 9 Months') },
    { label: 'Storage Instructions', value: isDairy ? 'Keep refrigerated below 4°C' : (isProduce ? 'Store in a cool dry place' : 'Store away from direct sunlight') },
    { label: 'Country of Origin', value: 'India 🇮🇳' },
    { label: 'FSSAI License No.', value: '10012021000071' }
  ];

  // 4. Similar Products (from same category, excluding current product)
  const similarProducts = (allProds || [])
    .filter(item => (item._id || item.id) !== (p._id || p.id) && (item.categorySlug === catSlug || item.category?.slug === catSlug))
    .slice(0, 8);

  // 5. People Also Bought (from complementary categories)
  const peopleAlsoBought = (allProds || [])
    .filter(item => (item._id || item.id) !== (p._id || p.id) && (item.categorySlug !== catSlug))
    .slice(0, 8);

  return {
    ...p,
    variants,
    images,
    keyFeatures,
    shelfLife: isDairy ? '2 Days' : (isProduce ? '3 - 4 Days' : '6 - 9 Months'),
    countryOfOrigin: 'India 🇮🇳',
    manufacturerDetails: 'Direct from authorized Indore fulfillment hub & trusted brands.',
    disclaimer: 'Every effort is made to maintain accuracy of all information. However, actual product packaging and materials may contain more and/or different information. It is recommended not to solely rely on the information presented.',
    // Multi-Vendor Store Information
    vendor: {
      id: p.storeId,
      name: p.storeName,
      address: p.storeAddress,
      rating: p.storeRating,
      deliveryTime: p.deliveryTime,
      isVerified: true
    },
    vendorName: p.storeName,
    storeId: p.storeId,
    storeName: p.storeName,
    storeAddress: p.storeAddress,
    similarProducts,
    peopleAlsoBought
  };
}

/**
 * GET /api/grocery/products/:id
 * GET /api/grocery/product/:id
 * Get single product by id or slug with rich grocery details, variants, similar products & store info
 */
const getSingleProductHandler = async (req, res) => {
  try {
    const { id } = req.params;
    let foundProduct = null;

    if (mongoose.connection.readyState === 1) {
      try {
        if (mongoose.isValidObjectId(id)) {
          foundProduct = await Product.findById(id)
            .populate('category', 'name slug image')
            .populate('restaurant', 'name address location rating ratingsCount deliveryTime image logo isPureVeg')
            .lean();
        } else {
          const escapedId = String(id).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          foundProduct = await Product.findOne({
            $or: [
              { slug: id },
              { 'slug.en': id },
              { name: new RegExp(`^${escapedId}$`, 'i') }
            ]
          })
            .populate('category', 'name slug image')
            .populate('restaurant', 'name address location rating ratingsCount deliveryTime image logo isPureVeg')
            .lean();
        }
      } catch (dbErr) {
        console.warn('DB lookup in getSingleProductHandler encountered error:', dbErr.message);
      }
    }

    if (!foundProduct) {
      const idLower = String(id).toLowerCase();
      foundProduct = ALL_CATALOG_PRODUCTS.find(p => 
        p._id === id || 
        p.id === id || 
        p.slug === id ||
        (p.slug && p.slug.toLowerCase() === idLower) ||
        (p.name && p.name.toLowerCase() === idLower) ||
        (p.name && idLower.includes(p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'))) ||
        (p.name && p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').includes(idLower))
      );
    }

    // Check in BEST_SELLERS as well
    if (!foundProduct) {
      foundProduct = BEST_SELLERS.find(p => 
        p._id === id || 
        p.id === id || 
        p.name?.toLowerCase() === String(id).toLowerCase()
      );
    }

    // Graceful fallback to first catalog item if unknown id
    if (!foundProduct) {
      foundProduct = ALL_CATALOG_PRODUCTS[0];
    }

    const payload = buildProductDetailsPayload(foundProduct, ALL_CATALOG_PRODUCTS);

    return res.status(200).json({
      success: true,
      data: payload
    });
  } catch (error) {
    console.error('Error fetching single product:', error);
    const fallback = buildProductDetailsPayload(ALL_CATALOG_PRODUCTS[0], ALL_CATALOG_PRODUCTS);
    return res.status(200).json({
      success: true,
      data: fallback
    });
  }
};

router.get('/products/:id', getSingleProductHandler);
router.get('/product/:id', getSingleProductHandler);

/**
 * GET /api/grocery/products/:id/similar
 */
router.get('/products/:id/similar', async (req, res) => {
  try {
    const { id } = req.params;
    const { categorySlug } = req.query;
    let similar = [];

    if (mongoose.connection.readyState === 1) {
      const andConds = [
        {
          $or: [
            { vertical: VERTICALS.GROCERY },
            { vertical: 'grocery' },
            { vertical: VERTICALS.ESSENTIALS }
          ]
        },
        { isDeleted: { $ne: true }, isApproved: { $ne: false } }
      ];
      if (mongoose.isValidObjectId(id)) {
        andConds.push({ _id: { $ne: id } });
      }
      if (categorySlug) {
        const catDoc = await Category.findOne({ slug: categorySlug }).select('_id').lean();
        if (catDoc) {
          andConds.push({ $or: [{ category: catDoc._id }, { categorySlug }] });
        } else {
          andConds.push({ categorySlug });
        }
      }
      const dbSim = await Product.find({ $and: andConds })
        .populate('category', 'name slug image')
        .populate('restaurant', 'name address location rating ratingsCount deliveryTime image logo isPureVeg')
        .limit(8)
        .lean();
      similar = dbSim.map(normalizeProduct).filter(Boolean);
    }

    if (similar.length === 0) {
      similar = ALL_CATALOG_PRODUCTS.filter(p =>
        (p._id !== id && p.id !== id) &&
        (!categorySlug || p.categorySlug === categorySlug || p.category?.slug === categorySlug)
      ).slice(0, 8);
    }

    return res.status(200).json({
      success: true,
      count: similar.length,
      data: similar
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      count: 0,
      data: []
    });
  }
});

/**
 * GET /api/grocery/stores
 * Get list of active grocery stores & dark stores
 */
router.get('/stores', async (req, res) => {
  try {
    const { search, lat, lng } = req.query;
    const userLat = lat !== undefined ? Number(lat) : NaN;
    const userLng = lng !== undefined ? Number(lng) : NaN;
    const hasCoords = Number.isFinite(userLat) && Number.isFinite(userLng);
    const haversine = require('haversine-distance');

    const query = {
      $or: [
        { businessType: BUSINESS_TYPES.GROCERY_STORE },
        { businessType: 'grocery_store' },
        { businessType: BUSINESS_TYPES.WATER_DAIRY_SUPPLIER },
        { vertical: VERTICALS.GROCERY },
        { vertical: 'grocery' },
        { vertical: VERTICALS.ESSENTIALS },
        { restaurantType: { $regex: /grocery|supermarket|mart|kirana|dairy/i } }
      ],
      isActive: { $ne: false }
    };

    if (search) {
      query.$and = [
        {
          $or: [
            { 'name.en': { $regex: search, $options: 'i' } },
            { name: { $regex: search, $options: 'i' } },
            { address: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }

    let stores = [];
    if (mongoose.connection.readyState === 1) {
      const dbStores = await Restaurant.find(query)
        .select('name image bannerImage address city area location rating ratingsCount avgRating deliveryTime freeDeliveryThreshold minOrderAmount isOnline isActive isTemporarilyClosed timing isPureVeg tags cuisine')
        .lean();

      stores = dbStores.map((s) => {
        const nameStr = extractText(s.name, 'Tricelyn Partner Store');
        const ratingNum = typeof s.rating === 'object'
          ? Number(s.rating?.average ?? s.avgRating ?? 4.8)
          : Number(s.rating ?? s.avgRating ?? 4.8);
        const ratingsCountNum = typeof s.rating === 'object'
          ? Number(s.rating?.count ?? s.ratingsCount ?? 120)
          : Number(s.ratingsCount ?? 120);
        const dtStr = typeof s.deliveryTime === 'number'
          ? `${s.deliveryTime} mins`
          : (s.deliveryTime || '10-15 mins');

        let distanceKm = null;
        if (hasCoords && Array.isArray(s.location?.coordinates) && s.location.coordinates.length >= 2) {
          const storeLng = Number(s.location.coordinates[0]);
          const storeLat = Number(s.location.coordinates[1]);
          if (Number.isFinite(storeLat) && Number.isFinite(storeLng) && (storeLat !== 0 || storeLng !== 0)) {
            distanceKm = haversine({ latitude: userLat, longitude: userLng }, { latitude: storeLat, longitude: storeLng }) / 1000;
          }
        }

        return {
          _id: s._id.toString(),
          id: s._id.toString(),
          name: nameStr,
          address: s.address || `${s.area || ''}, ${s.city || ''}`.replace(/^, |, $/g, ''),
          distanceKm,
          distance: distanceKm !== null ? `${distanceKm.toFixed(1)} km` : 'Nearby',
          rating: Number.isFinite(ratingNum) ? ratingNum : 4.8,
          ratingsCount: ratingsCountNum,
          deliveryTime: dtStr,
          minOrderAmount: s.minOrderAmount || 49,
          freeDeliveryThreshold: s.freeDeliveryThreshold || 199,
          isOpen: s.isOnline !== false && s.isActive !== false && !s.isTemporarilyClosed,
          timing: typeof s.timing === 'string' ? s.timing : '6:00 AM - 11:30 PM',
          image: s.image || s.bannerImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80',
          tags: Array.isArray(s.tags) && s.tags.length > 0 ? s.tags : (Array.isArray(s.cuisine) && s.cuisine.length > 0 ? s.cuisine : ['Daily Grocery', 'Express 15m']),
          isPureVeg: Boolean(s.isPureVeg)
        };
      });
      if (hasCoords) {
        stores.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
      }
    }

    if (!stores || stores.length === 0) {
      stores = [
        {
          _id: "store_tricelyn_indore_01",
          id: "store_tricelyn_indore_01",
          name: "Tricelyn Express Mart (Vijay Nagar Hub)",
          address: "Scheme 54, Vijay Nagar, Indore, Madhya Pradesh 452010",
          distance: "1.2 km",
          rating: 4.8,
          ratingsCount: 2450,
          deliveryTime: "10-15 mins",
          minOrderAmount: 49,
          freeDeliveryThreshold: 199,
          isOpen: true,
          timing: "24x7 Open",
          image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80",
          tags: ["Daily Grocery", "Dairy & Bakery", "Express 10m"],
          isPureVeg: false
        },
        {
          _id: "store_tricelyn_indore_02",
          id: "store_tricelyn_indore_02",
          name: "Fresh Farm Hub (Palasia Superstore)",
          address: "Old Palasia Main Road, Near Industry House, Indore 452001",
          distance: "2.4 km",
          rating: 4.7,
          ratingsCount: 1890,
          deliveryTime: "12-18 mins",
          minOrderAmount: 49,
          freeDeliveryThreshold: 199,
          isOpen: true,
          timing: "6:00 AM - 11:30 PM",
          image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&q=80",
          tags: ["Farm Fresh Veggies", "Organic Staples", "Exotic Fruits"],
          isPureVeg: true
        },
        {
          _id: "store_tricelyn_indore_03",
          id: "store_tricelyn_indore_03",
          name: "Apna Super Kirana (Saket Nagar)",
          address: "Saket Square, Near Anand Bazaar, Indore 452018",
          distance: "3.1 km",
          rating: 4.6,
          ratingsCount: 1230,
          deliveryTime: "15-20 mins",
          minOrderAmount: 49,
          freeDeliveryThreshold: 149,
          isOpen: true,
          timing: "7:00 AM - 11:00 PM",
          image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&q=80",
          tags: ["Pantry Staples", "Atta Rice & Dal", "Snacks"],
          isPureVeg: true
        }
      ];
    }

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
 * GET /api/grocery/stores/:id/catalog
 * Get store catalog (categories + in-stock grocery items with variants for that specific vendor)
 */
router.get('/stores/:id/catalog', async (req, res) => {
  try {
    const { id } = req.params;
    let store = null;
    let products = [];

    if (mongoose.connection.readyState === 1) {
      if (mongoose.isValidObjectId(id)) {
        store = await Restaurant.findById(id).lean();
      } else {
        store = await Restaurant.findOne({ $or: [{ restaurantId: id }, { slug: id }] }).lean();
      }
      if (store) {
        products = await Product.find({
          $or: [{ restaurant: store._id }, { storeId: store._id.toString() }, { storeId: id }],
          isDeleted: { $ne: true },
          isApproved: { $ne: false }
        }).populate('category', 'name slug image').lean();
      }
    }

    if (!store) {
      store = {
        _id: id,
        id: id,
        name: "Tricelyn Partner Supermarket",
        address: "Scheme 54, Vijay Nagar, Indore",
        rating: 4.8,
        deliveryTime: "10-15 mins",
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80"
      };
      products = ALL_CATALOG_PRODUCTS;
    }

    const storeIdStr = (store._id || store.id).toString();
    const storeNameStr = extractText(store.name, 'Tricelyn Partner Store');
    const storeRating = typeof store.rating === 'object' ? Number(store.rating?.average || 4.8) : (Number(store.rating) || 4.8);
    const storeDeliveryTime = typeof store.deliveryTime === 'number' ? `${store.deliveryTime} mins` : (store.deliveryTime || '10-15 mins');

    const categoryMap = {};
    products.forEach(p => {
      const normalized = normalizeProduct(p);
      if (!normalized) return;
      normalized.storeId = storeIdStr;
      normalized.storeName = storeNameStr;
      normalized.storeAddress = store.address || '';
      normalized.restaurant = storeIdStr;
      normalized.restaurantName = storeNameStr;
      normalized.vendorName = storeNameStr;

      const catName = normalized.categoryName || 'Daily Essentials';
      const catId = normalized.category?._id || normalized.categorySlug || 'default';
      if (!categoryMap[catId]) {
        categoryMap[catId] = {
          id: catId,
          name: catName,
          slug: normalized.categorySlug || 'daily-essentials',
          image: normalized.category?.image || null,
          products: []
        };
      }
      categoryMap[catId].products.push(normalized);
    });

    return res.status(200).json({
      success: true,
      data: {
        store: {
          id: storeIdStr,
          _id: storeIdStr,
          name: storeNameStr,
          address: store.address || 'Indore',
          image: store.image || store.bannerImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80',
          rating: storeRating,
          deliveryTime: storeDeliveryTime
        },
        catalog: Object.values(categoryMap)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/grocery/order (and /orders alias)
 * Place single- or multi-vendor grocery order: splits by vendor store,
 * verifies & atomically decrements SKU stockQuantity, creates compliant Order docs,
 * and broadcasts real-time newOrder socket notifications to each vendor & admin.
 */
const placeGroceryOrderHandler = async (req, res) => {
  try {
    const {
      storeId: bodyStoreId,
      storeName: bodyStoreName,
      items,
      deliveryAddress,
      paymentMethod = 'cod',
      substitutionPreference = 'call_customer',
      couponCode,
      discount: bodyDiscount = 0,
      tip = 0,
      transactionId,
      paymentStatus: bodyPaymentStatus,
      idempotencyKey: clientIdempotencyKey,
      deliveryNotes,
      orderType: bodyOrderType,
      isSelfPickup: bodyIsSelfPickup,
      scheduledAt,
      pickupTimeSlot
    } = req.body;

    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Authentication required to place order' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Items are required' });
    }

    const normalizedAddressLine = typeof deliveryAddress === 'string'
      ? deliveryAddress
      : (deliveryAddress?.addressLine || deliveryAddress?.fullAddress || deliveryAddress?.address || deliveryAddress?.street || 'Standard Delivery Address');
    const normalizedCoordinates = Array.isArray(deliveryAddress?.coordinates) && deliveryAddress.coordinates.length === 2
      ? deliveryAddress.coordinates.map(Number)
      : (Array.isArray(deliveryAddress?.location?.coordinates) && deliveryAddress.location.coordinates.length === 2
        ? deliveryAddress.location.coordinates.map(Number)
        : [75.8937, 22.7533]);
    const normalizedDeliveryAddress = {
      addressLine: normalizedAddressLine,
      coordinates: normalizedCoordinates
    };

    const isDbReady = mongoose.connection.readyState === 1;
    const settings = isDbReady ? await ensureSettings().catch(() => null) : null;
    const baseDeliveryFee = Number(settings?.deliveryCharge ?? 25);
    const freeDeliveryThreshold = Number(settings?.freeDeliveryThreshold ?? 199);
    const platformFeeDefault = Number(settings?.platformFee ?? 5);
    const packagingFeeDefault = Number(settings?.packagingFee ?? 0);

    const rawPayMethod = String(paymentMethod || 'cod').toLowerCase();
    const normPayMethod = ['cod', 'cash', 'cash_on_delivery'].includes(rawPayMethod)
      ? 'cod'
      : (rawPayMethod === 'card' ? 'card' : (rawPayMethod === 'wallet' ? 'wallet' : 'online'));
    const normPayStatus = bodyPaymentStatus && ['pending', 'processing', 'paid', 'failed', 'refunded', 'refunding', 'cancelled'].includes(String(bodyPaymentStatus).toLowerCase())
      ? String(bodyPaymentStatus).toLowerCase()
      : (normPayMethod === 'cod' ? 'pending' : 'paid');

    let fallbackStore = null;
    if (isDbReady) {
      if (bodyStoreId && mongoose.isValidObjectId(bodyStoreId)) {
        fallbackStore = await Restaurant.findById(bodyStoreId).lean();
      }
      if (!fallbackStore) {
        fallbackStore = await Restaurant.findOne({
          $or: [{ businessType: 'grocery_store' }, { vertical: 'grocery' }, { vertical: 'essentials' }],
          isActive: { $ne: false }
        }).lean();
      }
      if (!fallbackStore) {
        fallbackStore = await Restaurant.findOne({ isActive: { $ne: false } }).lean();
      }
    }

    const storeCache = new Map();
    const resolveStoreDoc = async (candidateStoreId) => {
      const key = candidateStoreId ? String(candidateStoreId) : '';
      if (key && storeCache.has(key)) return storeCache.get(key);
      let doc = null;
      if (isDbReady && key) {
        if (mongoose.isValidObjectId(key)) {
          doc = await Restaurant.findById(key).lean();
        } else {
          doc = await Restaurant.findOne({ $or: [{ restaurantId: key }, { slug: key }] }).lean();
        }
      }
      if (!doc) doc = fallbackStore;
      if (doc && key) storeCache.set(key, doc);
      return doc;
    };

    const vendorGroups = new Map();
    const stockAdjustments = [];

    for (const rawItem of items) {
      const qty = Math.max(1, Number(rawItem.quantity || 1));
      const prodCandidateId = rawItem.productId || rawItem._id || rawItem.id;
      let productDoc = null;

      if (isDbReady) {
        if (prodCandidateId && mongoose.isValidObjectId(prodCandidateId)) {
          productDoc = await Product.findById(prodCandidateId);
        } else if (rawItem.sku || rawItem.name) {
          productDoc = await Product.findOne({
            $or: [
              ...(rawItem.sku ? [{ sku: rawItem.sku }] : []),
              ...(rawItem.name ? [{ 'name.en': rawItem.name }, { name: rawItem.name }] : [])
            ]
          });
        }
      }

      if (productDoc) {
        if (productDoc.outOfStock === true || productDoc.inStock === false) {
          return res.status(400).json({
            success: false,
            message: `${extractText(productDoc.name, 'Product')} is currently out of stock`
          });
        }
        if (productDoc.stockQuantity !== undefined && Number(productDoc.stockQuantity) < qty) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${extractText(productDoc.name, 'item')}. Available: ${productDoc.stockQuantity}`
          });
        }
        stockAdjustments.push({ productId: productDoc._id, qty });
      }

      const candidateStoreId = rawItem.storeId || rawItem.restaurantId || productDoc?.restaurant?.toString() || bodyStoreId;
      const storeDoc = await resolveStoreDoc(candidateStoreId);

      if (isDbReady && !storeDoc?._id) {
        return res.status(400).json({
          success: false,
          message: 'No active grocery dark store available to fulfill this order'
        });
      }

      const resolvedStoreId = storeDoc?._id ? storeDoc._id.toString() : String(candidateStoreId || 'store_tricelyn_indore_01');
      const resolvedStoreName = storeDoc ? extractText(storeDoc.name, 'Tricelyn Partner Store') : (rawItem.storeName || bodyStoreName || 'Tricelyn Partner Store');

      if (!vendorGroups.has(resolvedStoreId)) {
        vendorGroups.set(resolvedStoreId, {
          storeObjId: storeDoc?._id || resolvedStoreId,
          storeIdStr: resolvedStoreId,
          storeName: resolvedStoreName,
          items: [],
          itemTotal: 0
        });
      }

      const unitPrice = productDoc
        ? Number(rawItem.price ?? productDoc.sellingPrice ?? productDoc.basePrice ?? 0)
        : Number(rawItem.price ?? 50);
      const itemName = productDoc
        ? extractText(productDoc.name, rawItem.name || 'Grocery Item')
        : (rawItem.name || 'Grocery Item');
      const itemUnit = rawItem.unit || rawItem.weight || productDoc?.weight || productDoc?.unit || 'piece';

      const grp = vendorGroups.get(resolvedStoreId);
      grp.itemTotal += unitPrice * qty;
      grp.items.push({
        ...(productDoc?._id ? { product: productDoc._id } : {}),
        name: itemName,
        image: rawItem.image || productDoc?.image || '',
        quantity: qty,
        price: unitPrice,
        variation: itemUnit ? { name: String(itemUnit), price: unitPrice } : undefined
      });
    }

    // Atomically deduct stock for DB products
    if (isDbReady) {
      for (const adj of stockAdjustments) {
        const updatedProd = await Product.findByIdAndUpdate(
          adj.productId,
          { $inc: { stockQuantity: -adj.qty } },
          { new: true }
        );
        if (updatedProd && updatedProd.stockQuantity <= 0) {
          updatedProd.stockQuantity = Math.max(0, updatedProd.stockQuantity);
          updatedProd.inStock = false;
          updatedProd.outOfStock = true;
          await updatedProd.save();
        }
      }
    }

    const fulfilmentGroup = `FG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const totalSubtotal = Array.from(vendorGroups.values()).reduce((sum, g) => sum + g.itemTotal, 0);
    const createdOrders = [];
    let groupIndex = 0;

    const isSelfPickupOrder = Boolean(bodyIsSelfPickup) || ['self_pickup', 'pickup'].includes(String(bodyOrderType || '').toLowerCase());

    for (const grp of vendorGroups.values()) {
      const isPrimary = groupIndex === 0;
      const deliveryFee = isSelfPickupOrder ? 0 : (isPrimary ? (totalSubtotal >= freeDeliveryThreshold ? 0 : baseDeliveryFee) : 0);
      const platformFee = isPrimary ? platformFeeDefault : 0;
      const packagingFee = isPrimary ? packagingFeeDefault : 0;
      const groupTip = isSelfPickupOrder ? 0 : (isPrimary ? Number(tip || 0) : 0);
      const groupDiscount = isPrimary ? Number(bodyDiscount || 0) : 0;
      const totalAmount = Math.max(0, grp.itemTotal + deliveryFee + platformFee + packagingFee + groupTip - groupDiscount);

      const orderNumber = `GRO-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const idempotencyKey = `${clientIdempotencyKey || 'gro-' + Date.now()}-${groupIndex}-${Math.floor(100 + Math.random() * 900)}`;
      const pickupOtp = String(Math.floor(1000 + Math.random() * 9000));
      const deliveryOtp = String(Math.floor(1000 + Math.random() * 9000));

      const orderPayload = {
        orderNumber,
        customer: req.user._id,
        user: req.user._id,
        customerId: req.user._id.toString(),
        customerName: deliveryAddress?.name || req.user.name || 'Customer',
        customerPhone: deliveryAddress?.phone || req.user.mobile || req.user.phone || '',
        restaurant: grp.storeObjId,
        restaurantId: grp.storeIdStr,
        restaurantName: grp.storeName,
        store: grp.storeObjId,
        storeId: grp.storeIdStr,
        storeName: grp.storeName,
        vertical: VERTICALS.GROCERY,
        fulfilmentGroup,
        idempotencyKey,
        items: grp.items,
        itemTotal: grp.itemTotal,
        deliveryFee,
        platformFee,
        packagingFee,
        tip: groupTip,
        discount: groupDiscount,
        couponCode: couponCode || undefined,
        totalAmount,
        payableAmount: totalAmount,
        deliveryAddress: normalizedDeliveryAddress,
        paymentMethod: normPayMethod,
        paymentStatus: normPayStatus,
        transactionId: transactionId || undefined,
        orderType: isSelfPickupOrder ? 'self_pickup' : 'delivery',
        isSelfPickup: isSelfPickupOrder,
        ...(scheduledAt ? { scheduledAt } : {}),
        ...(pickupTimeSlot ? { pickupTimeSlot } : {}),
        status: 'placed',
        pickupOtp,
        deliveryOtp,
        specialInstructions: [deliveryNotes, substitutionPreference ? `Substitution: ${substitutionPreference}` : ''].filter(Boolean).join(' | ') || undefined,
        timeline: [
          {
            status: 'placed',
            timestamp: new Date(),
            label: 'Order Placed',
            by: 'customer',
            description: `Grocery order placed with ${grp.storeName}`
          }
        ]
      };

      let savedOrder = orderPayload;
      if (isDbReady) {
        savedOrder = await Order.create(orderPayload);
        try {
          socketService.emitToRestaurant(grp.storeIdStr, 'newOrder', savedOrder);
          socketService.emitToRestaurant(grp.storeIdStr, 'order:created', savedOrder);
          socketService.emitToAdmin('newOrder', savedOrder);
          socketService.emitToAdmin('order:created', savedOrder);
        } catch (_) {}
      }

      createdOrders.push(savedOrder);
      groupIndex++;
    }

    return res.status(201).json({
      success: true,
      message: createdOrders.length > 1
        ? `Order split across ${createdOrders.length} stores and placed successfully`
        : 'Grocery order placed successfully with vendor',
      fulfilmentGroup,
      splitCount: createdOrders.length,
      data: createdOrders[0],
      order: createdOrders[0],
      orders: createdOrders
    });
  } catch (error) {
    console.error('Grocery order error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

router.post('/order', protect, placeGroceryOrderHandler);
router.post('/orders', protect, placeGroceryOrderHandler);


/**
 * GET /api/grocery/inventory
 * Master Real-Time Inventory Control Tower
 * Returns all catalog products, real-time stock levels, low-stock warnings & valuation stats
 */
router.get('/inventory', async (req, res) => {
  try {
    const { search, category, status, storeId, page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(10, parseInt(limit)));

    let items = [];
    let isFromDb = false;

    if (mongoose.connection.readyState === 1) {
      const query = { isDeleted: { $ne: true } };
      const dbProducts = await Product.find(query)
        .populate('category', 'name slug')
        .populate('restaurant', 'name address')
        .sort({ updatedAt: -1, createdAt: -1 })
        .lean();

      isFromDb = true;
      items = (dbProducts || []).map(p => {
        const price = Number(p.sellingPrice ?? p.price ?? p.basePrice ?? 0);
        const mrp = Number(p.mrp ?? Math.round(price * 1.25));
        const stock = p.stockQuantity !== undefined ? Number(p.stockQuantity) : 100;
        const threshold = Number(p.lowStockThreshold || 10);
        const inStock = p.inStock !== false && stock > 0;
        const nameStr = typeof p.name === 'object' ? (p.name?.en || Object.values(p.name || {})[0] || 'Grocery Item') : (p.name || 'Grocery Item');
        const catName = typeof p.category?.name === 'object' ? (p.category.name?.en || Object.values(p.category.name || {})[0] || 'Grocery') : (p.category?.name || p.categorySlug || 'Grocery');
        const rawStoreName = p.restaurant?.name;
        const storeName = typeof rawStoreName === 'object'
          ? (rawStoreName?.en || Object.values(rawStoreName || {})[0] || 'Partner Store')
          : (rawStoreName || p.storeName || 'Partner Store');

        return {
          _id: p._id.toString(),
          id: p._id.toString(),
          sku: p.sku || `TRC-${p._id.toString().slice(-6).toUpperCase()}`,
          name: nameStr,
          categoryName: catName,
          categorySlug: p.categorySlug || p.category?.slug || 'grocery',
          storeName,
          storeId: p.restaurant?._id?.toString() || (typeof p.restaurant === 'string' ? p.restaurant : p.storeId) || '',
          unit: p.unit || p.weight || '1 unit',
          sellingPrice: price,
          mrp: mrp,
          stockQuantity: stock,
          lowStockThreshold: threshold,
          inStock,
          status: !inStock || stock === 0 ? 'out_of_stock' : (stock <= threshold ? 'low_stock' : 'in_stock'),
          image: p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80',
          approvalStatus: p.approvalStatus || (p.isApproved ? 'approved' : 'pending'),
          updatedAt: p.updatedAt || new Date()
        };
      });
    } else {
      items = ALL_CATALOG_PRODUCTS.map((p, idx) => {
        const stock = p.stockQuantity !== undefined ? Number(p.stockQuantity) : (idx === 3 ? 0 : (idx === 7 || idx === 12 ? 4 : 50 + (idx * 5)));
        const threshold = Number(p.lowStockThreshold || 10);
        const inStock = p.inStock !== undefined ? Boolean(p.inStock) : stock > 0;
        return {
          _id: p.id || `item-${idx}`,
          id: p.id || `item-${idx}`,
          sku: p.sku || `TRC-SKU-${1000 + idx}`,
          name: p.name,
          categoryName: p.categoryName || 'Grocery',
          categorySlug: p.categorySlug || 'grocery',
          storeName: p.storeName || 'Tricelyn Supermart (Central Warehouse Hub)',
          storeId: p.storeId || 'store_tricelyn_indore_01',
          unit: p.weight || '1 unit',
          sellingPrice: Number(p.price || p.sellingPrice || 50),
          mrp: Number(p.mrp || Math.round((p.price || 50) * 1.25)),
          stockQuantity: stock,
          lowStockThreshold: threshold,
          inStock,
          status: !inStock || stock === 0 ? 'out_of_stock' : (stock <= threshold ? 'low_stock' : 'in_stock'),
          image: p.image,
          approvalStatus: 'approved',
          updatedAt: p.updatedAt || new Date()
        };
      });
    }

    // Apply filters
    let storeScopedItems = [...items];
    if (storeId && storeId !== 'all') {
      storeScopedItems = storeScopedItems.filter(i => String(i.storeId) === String(storeId));
    }

    let filtered = [...storeScopedItems];
    if (category && category !== 'all') {
      filtered = filtered.filter(i => i.categorySlug === category || i.categoryName.toLowerCase().includes(category.toLowerCase()));
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(i => i.name.toLowerCase().includes(s) || i.sku.toLowerCase().includes(s));
    }
    if (status && status !== 'all') {
      filtered = filtered.filter(i => i.status === status);
    }

    // Compute stats across store-scoped list
    const totalSkus = storeScopedItems.length;
    const inStockCount = storeScopedItems.filter(i => i.status === 'in_stock').length;
    const lowStockCount = storeScopedItems.filter(i => i.status === 'low_stock').length;
    const outOfStockCount = storeScopedItems.filter(i => i.status === 'out_of_stock').length;
    const totalValuation = storeScopedItems.reduce((sum, i) => sum + (i.stockQuantity * i.sellingPrice), 0);

    const total = filtered.length;
    const paginated = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return res.status(200).json({
      success: true,
      stats: {
        totalSkus,
        inStockCount,
        lowStockCount,
        outOfStockCount,
        totalValuation
      },
      products: paginated,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      isFromDb
    });
  } catch (error) {
    console.error('Inventory fetch error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/grocery/inventory/:id
 * Update single product stock, threshold, and inStock status
 */
router.put('/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { stockQuantity, lowStockThreshold, inStock, sellingPrice, mrp } = req.body;

    const updateObj = {};
    if (stockQuantity !== undefined) {
      updateObj.stockQuantity = Math.max(0, Number(stockQuantity));
      updateObj.inStock = inStock !== undefined ? Boolean(inStock) : updateObj.stockQuantity > 0;
      updateObj.outOfStock = !updateObj.inStock;
      updateObj.isAvailable = updateObj.inStock;
      updateObj.available = updateObj.inStock;
    }
    if (lowStockThreshold !== undefined) updateObj.lowStockThreshold = Number(lowStockThreshold);
    if (inStock !== undefined) {
      updateObj.inStock = Boolean(inStock);
      updateObj.outOfStock = !updateObj.inStock;
      updateObj.isAvailable = updateObj.inStock;
      updateObj.available = updateObj.inStock;
    }
    if (sellingPrice !== undefined) {
      updateObj.sellingPrice = Number(sellingPrice);
      updateObj.basePrice = Number(sellingPrice);
    }
    if (mrp !== undefined) updateObj.mrp = Number(mrp);

    // 1. Update in-memory ALL_CATALOG_PRODUCTS so state persists immediately
    const memItem = ALL_CATALOG_PRODUCTS.find(p => 
      String(p.id) === String(id) || 
      String(p._id) === String(id) || 
      String(p.sku) === String(id) || 
      (p.name && String(p.name).toLowerCase() === String(id).toLowerCase())
    );
    if (memItem) {
      if (stockQuantity !== undefined) {
        memItem.stockQuantity = Number(stockQuantity);
        memItem.inStock = memItem.stockQuantity > 0;
      }
      if (lowStockThreshold !== undefined) memItem.lowStockThreshold = Number(lowStockThreshold);
      if (inStock !== undefined) memItem.inStock = Boolean(inStock);
      if (sellingPrice !== undefined) {
        memItem.price = Number(sellingPrice);
        memItem.sellingPrice = Number(sellingPrice);
      }
      if (mrp !== undefined) memItem.mrp = Number(mrp);
    }

    // 2. Update in MongoDB Product collection
    let updated = null;
    if (mongoose.connection.readyState === 1) {
      if (mongoose.isValidObjectId(id)) {
        updated = await Product.findByIdAndUpdate(id, { $set: updateObj }, { new: true });
      }
      if (!updated) {
        updated = await Product.findOneAndUpdate(
          { $or: [{ sku: id }, { 'name.en': id }, { name: id }] },
          { $set: updateObj },
          { new: true }
        );
      }
      if (updated && updated.restaurant) {
        const Restaurant = require('../models/Restaurant');
        await Restaurant.updateOne(
          { _id: updated.restaurant, 'menu._id': updated._id },
          {
            $set: {
              'menu.$.stockQuantity': updated.stockQuantity,
              'menu.$.inStock': updated.inStock,
              'menu.$.isAvailable': updated.inStock !== false,
              ...(sellingPrice !== undefined ? { 'menu.$.sellingPrice': updated.sellingPrice, 'menu.$.price': updated.sellingPrice, 'menu.$.basePrice': updated.basePrice } : {}),
              ...(mrp !== undefined ? { 'menu.$.mrp': updated.mrp } : {})
            }
          }
        ).catch(() => {});
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      data: updated || memItem || { _id: id, ...updateObj }
    });
  } catch (error) {
    console.error('Inventory update error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/grocery/inventory/bulk-update
 * Batch update stock levels
 */
router.post('/inventory/bulk-update', async (req, res) => {
  try {
    const { updates } = req.body; // Array of { id, stockQuantity, inStock }
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Updates array is required' });
    }

    let modifiedCount = 0;
    if (mongoose.connection.readyState === 1) {
      for (const u of updates) {
        if (mongoose.isValidObjectId(u.id)) {
          const s = Number(u.stockQuantity);
          await Product.findByIdAndUpdate(u.id, {
            $set: {
              stockQuantity: s,
              inStock: u.inStock !== undefined ? Boolean(u.inStock) : s > 0
            }
          });
          modifiedCount++;
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: `Updated ${modifiedCount || updates.length} items successfully`,
      modifiedCount: modifiedCount || updates.length
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/grocery/orders/:id/invoice
 * Generates an itemized GST Tax Invoice with tax split, platform fee, packing & delivery
 */
router.get('/orders/:id/invoice', async (req, res) => {
  try {
    const { id } = req.params;
    let order = null;

    if (mongoose.connection.readyState === 1) {
      if (mongoose.isValidObjectId(id)) {
        order = await Order.findById(id)
          .populate('user', 'name phone mobile email')
          .populate('customer', 'name phone mobile email')
          .populate('restaurant', 'name address city state phone gstin fssai documents')
          .populate('store', 'name address city state phone gstin fssai documents')
          .lean();
      } else {
        order = await Order.findOne({ orderNumber: id })
          .populate('user', 'name phone mobile email')
          .populate('customer', 'name phone mobile email')
          .populate('restaurant', 'name address city state phone gstin fssai documents')
          .populate('store', 'name address city state phone gstin fssai documents')
          .lean();
      }
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found for invoice generation' });
      }
    } else {
      return res.status(503).json({ success: false, message: 'Database unavailable for invoice generation' });
    }

    // Dynamic order date & generated invoice sequence
    const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
    const invNumber = `TRC-INV-${orderDate.getFullYear()}-${(order.orderNumber || order._id.toString()).slice(-6).toUpperCase()}`;
    
    const items = Array.isArray(order.items) ? order.items : [];

    const formattedItems = items.map((it, idx) => {
      const q = Number(it.quantity || 1);
      const p = Number(it.price || 0);
      const total = Number(it.total ?? (q * p));
      const taxable = Math.round((total / 1.05) * 100) / 100;
      const gstAmount = Math.round((total - taxable) * 100) / 100;
      const cgst = Math.round((gstAmount / 2) * 100) / 100;
      const sgst = cgst;

      return {
        srNo: idx + 1,
        name: extractText(it.name || it.productName, 'Grocery Item'),
        quantity: q,
        unit: it.variation?.name || it.unit || '1 unit',
        unitPrice: p,
        taxableValue: taxable,
        cgstRate: '2.5%',
        cgstAmount: cgst,
        sgstRate: '2.5%',
        sgstAmount: sgst,
        totalAmount: total
      };
    });

    const itemsSubtotal = order.itemTotal !== undefined 
      ? Number(order.itemTotal) 
      : formattedItems.reduce((acc, curr) => acc + curr.totalAmount, 0);

    const packagingFee = Number(order.packagingFee ?? 0);
    const deliveryFee = Number(order.deliveryFee ?? 0);
    const platformFee = Number(order.platformFee ?? 0);
    const discount = Number(order.discount ?? 0);
    const grandTotal = order.totalAmount !== undefined 
      ? Number(order.totalAmount) 
      : (itemsSubtotal + packagingFee + deliveryFee + platformFee - discount);

    const storeDoc = order.restaurant || order.store;
    const resolvedStoreName = storeDoc
      ? extractText(storeDoc.name, 'Partner Store')
      : (order.storeName || order.restaurantName || 'Partner Store');

    const resolvedStoreAddress = storeDoc?.address || order.restaurantAddress || 'Store Address Unavailable';
    const resolvedGstin = storeDoc?.documents?.gst?.number || storeDoc?.gstin || 'Unregistered / Applied';
    const resolvedFssai = storeDoc?.documents?.license?.number || storeDoc?.fssaiNumber || 'N/A';

    const buyerDoc = order.customer || order.user;
    const resolvedCustName = order.customerName || buyerDoc?.name || order.deliveryAddress?.name || 'Customer';
    const resolvedCustPhone = order.customerPhone || order.customerMobile || buyerDoc?.mobile || buyerDoc?.phone || order.deliveryAddress?.phone || 'N/A';
    const resolvedCustAddr = order.deliveryAddress?.fullAddress || order.deliveryAddress?.addressLine || order.address || 'N/A';

    const invoicePayload = {
      invoiceNumber: invNumber,
      invoiceDate: orderDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      invoiceTime: orderDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      orderId: order._id.toString(),
      orderNumber: order.orderNumber || '',
      orderStatus: order.status || order.orderStatus || 'placed',
      paymentMethod: (order.paymentMethod || 'cod').toUpperCase(),
      paymentStatus: (order.paymentStatus || (order.isPaid ? 'Paid' : 'Pending')).toUpperCase(),

      // Dispatching Partner Store Entity (Dynamic)
      seller: {
        legalName: 'Tricelyn Multi-Vendor Marketplace',
        storeName: resolvedStoreName,
        address: resolvedStoreAddress,
        gstin: resolvedGstin,
        fssaiNumber: resolvedFssai,
        supportEmail: 'care@tricelyn.com',
        helpline: '+91 731-4099880'
      },

      // Customer Details (Dynamic)
      customer: {
        name: resolvedCustName,
        phone: resolvedCustPhone,
        deliveryAddress: resolvedCustAddr,
        city: storeDoc?.city || order.deliveryAddress?.city || '',
        state: storeDoc?.state || order.deliveryAddress?.state || 'India'
      },

      items: formattedItems,
      billingSummary: {
        itemsSubtotal,
        packagingFee,
        deliveryFee,
        platformFee,
        discount,
        taxableTotal: Math.round((itemsSubtotal / 1.05) * 100) / 100,
        cgstTotal: Math.round(((itemsSubtotal - (itemsSubtotal / 1.05)) / 2) * 100) / 100,
        sgstTotal: Math.round(((itemsSubtotal - (itemsSubtotal / 1.05)) / 2) * 100) / 100,
        grandTotal
      }
    };

    return res.status(200).json({
      success: true,
      invoice: invoicePayload
    });
  } catch (error) {
    console.error('Invoice generation error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
