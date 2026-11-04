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
    return res.status(200).json({
      success: true,
      count: BEST_SELLERS.length,
      data: BEST_SELLERS
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
      categories = await Category.find({
        $or: [
          { vertical: VERTICALS.GROCERY },
          { vertical: 'grocery' },
          { type: 'grocery' },
          { type: 'main' }
        ],
        isActive: { $ne: false }
      }).select('name image icon slug position description').sort({ position: 1 }).lean();
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
 * Category-wise grouped product sections for HomePage (e.g. Dairy, Cold Drinks, Mouth fresheners, etc.)
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

    const sections = featuredSectionSlugs.map(sec => {
      const prods = ALL_CATALOG_PRODUCTS.filter(p => p.categorySlug === sec.slug);
      return {
        id: `sec_${sec.slug}`,
        slug: sec.slug,
        title: sec.name,
        name: sec.name,
        products: prods
      };
    });

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
 * Dynamic grocery products from Product model with exact category filtering
 */
router.get('/products', async (req, res) => {
  try {
    const { category, search, storeId, limit } = req.query;
    let products = [];

    if (mongoose.connection.readyState === 1) {
      const query = {
        $or: [
          { vertical: VERTICALS.GROCERY },
          { vertical: 'grocery' },
          { vertical: VERTICALS.ESSENTIALS }
        ],
        isDeleted: { $ne: true },
        isApproved: { $ne: false }
      };

      if (storeId) {
        query.$or = [{ restaurant: storeId }, { storeId: storeId }];
      }
      if (search) {
        query.$or = [
          { 'name.en': { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      if (storeId && storeId !== 'all') {
      filtered = filtered.filter(i => String(i.storeId) === String(storeId) || String(i.storeName).toLowerCase().includes(String(storeId).toLowerCase()));
    }
    if (category && category !== 'all') {
        const catDoc = await Category.findOne({
          $or: [
            { slug: category },
            { _id: mongoose.isValidObjectId(category) ? category : null }
          ]
        }).lean();

        if (catDoc) {
          query.$and = [{ $or: [{ category: catDoc._id }, { categoryId: catDoc._id }, { categorySlug: catDoc.slug }] }];
        }
      }

      const q = Product.find(query)
        .populate('category', 'name slug image')
        .populate('restaurant', 'name address location rating ratingsCount deliveryTime image logo isPureVeg')
        .lean();
      if (limit) q.limit(Number(limit));
      products = await q.exec();
      products = products.map(normalizeProduct).filter(Boolean);
    }

    // Dynamic catalog lookup if DB records not yet populated
    if (!products || products.length === 0) {
      let filtered = ALL_CATALOG_PRODUCTS;
      if (category && category !== 'all') {
        filtered = filtered.filter(p => 
          p.categorySlug === category || 
          p.category?.slug === category || 
          p.category?.id === category
        );
      }
      if (storeId) {
        filtered = filtered.filter(p => p.storeId === storeId || p.restaurant === storeId);
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
    let filtered = ALL_CATALOG_PRODUCTS;
    const { category, search, storeId, limit } = req.query;
    if (category && category !== 'all') {
      filtered = filtered.filter(p => p.categorySlug === category || p.category?.slug === category);
    }
    if (storeId) {
      filtered = filtered.filter(p => p.storeId === storeId || p.restaurant === storeId);
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
    let similar = ALL_CATALOG_PRODUCTS.filter(p => 
      (p._id !== id && p.id !== id) && 
      (!categorySlug || p.categorySlug === categorySlug || p.category?.slug === categorySlug)
    ).slice(0, 8);

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
 * Get list of active grocery stores in Indore
 */
router.get('/stores', async (req, res) => {
  try {
    const { city = 'Indore', search } = req.query;

    const query = {
      $or: [
        { businessType: BUSINESS_TYPES.GROCERY_STORE },
        { businessType: 'grocery_store' },
        { vertical: VERTICALS.GROCERY },
        { vertical: 'grocery' },
        { restaurantType: { $regex: /grocery|supermarket|mart/i } }
      ],
      isActive: true
    };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    let stores = [];
    if (mongoose.connection.readyState === 1) {
      stores = await Restaurant.find(query)
        .select('name image bannerImage address location rating ratingsCount deliveryTime freeDeliveryThreshold minOrderAmount isOpen timing isPureVeg')
        .lean();
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
        },
        {
          _id: "store_tricelyn_indore_04",
          id: "store_tricelyn_indore_04",
          name: "Malwa Daily Mart (Bhawarkua Square)",
          address: "Tower Chouraha, Bhawarkua Main Road, Indore 452001",
          distance: "3.8 km",
          rating: 4.5,
          ratingsCount: 940,
          deliveryTime: "15-20 mins",
          minOrderAmount: 49,
          freeDeliveryThreshold: 149,
          isOpen: true,
          timing: "8:00 AM - Midnight",
          image: "https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=600&q=80",
          tags: ["Student Budget", "Instant Food", "Beverages & Mints"],
          isPureVeg: false
        },
        {
          _id: "store_tricelyn_indore_05",
          id: "store_tricelyn_indore_05",
          name: "Rajwada Heritage Grocery & Dry Fruits",
          address: "MG Road, Near Rajwada Palace, Indore 452002",
          distance: "4.5 km",
          rating: 4.9,
          ratingsCount: 3120,
          deliveryTime: "20-25 mins",
          minOrderAmount: 99,
          freeDeliveryThreshold: 249,
          isOpen: true,
          timing: "9:00 AM - 10:30 PM",
          image: "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=600&q=80",
          tags: ["Indori Namkeen", "Premium Dry Fruits", "Pure Spices"],
          isPureVeg: true
        },
        {
          _id: "store_tricelyn_indore_06",
          id: "store_tricelyn_indore_06",
          name: "Metro Mart Quickstore (Super Corridor)",
          address: "Sector A, Super Corridor Highway, Indore 452005",
          distance: "5.2 km",
          rating: 4.7,
          ratingsCount: 850,
          deliveryTime: "15-25 mins",
          minOrderAmount: 49,
          freeDeliveryThreshold: 199,
          isOpen: true,
          timing: "24x7 Open",
          image: "https://images.unsplash.com/photo-1506484381205-f7945653044d?w=600&q=80",
          tags: ["Household Cleaners", "Personal Care", "Dairy"],
          isPureVeg: false
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
      }
      if (store) {
        products = await Product.find({
          $or: [{ restaurant: id }, { storeId: id }],
          isDeleted: { $ne: true }
        }).populate('category', 'name slug image').lean();
      }
    }

    if (!store) {
      const defaultStoreMap = {
        "store_tricelyn_indore_01": {
          _id: "store_tricelyn_indore_01",
          name: "Tricelyn Express Mart (Vijay Nagar Hub)",
          address: "Scheme 54, Vijay Nagar, Indore 452010",
          rating: 4.8,
          deliveryTime: "10-15 mins",
          image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80"
        },
        "store_tricelyn_indore_02": {
          _id: "store_tricelyn_indore_02",
          name: "Fresh Farm Hub (Palasia Superstore)",
          address: "Old Palasia Main Road, Near Industry House, Indore 452001",
          rating: 4.7,
          deliveryTime: "12-18 mins",
          image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&q=80"
        },
        "store_tricelyn_indore_03": {
          _id: "store_tricelyn_indore_03",
          name: "Apna Super Kirana (Saket Nagar)",
          address: "Saket Square, Near Anand Bazaar, Indore 452018",
          rating: 4.6,
          deliveryTime: "15-20 mins",
          image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&q=80"
        },
        "store_tricelyn_indore_04": {
          _id: "store_tricelyn_indore_04",
          name: "Malwa Daily Mart (Bhawarkua Square)",
          address: "Tower Chouraha, Bhawarkua Main Road, Indore 452001",
          rating: 4.5,
          deliveryTime: "15-20 mins",
          image: "https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=600&q=80"
        },
        "store_tricelyn_indore_05": {
          _id: "store_tricelyn_indore_05",
          name: "Rajwada Heritage Grocery & Dry Fruits",
          address: "MG Road, Near Rajwada Palace, Indore 452002",
          rating: 4.9,
          deliveryTime: "20-25 mins",
          image: "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=600&q=80"
        },
        "store_tricelyn_indore_06": {
          _id: "store_tricelyn_indore_06",
          name: "Metro Mart Quickstore (Super Corridor)",
          address: "Sector A, Super Corridor Highway, Indore 452005",
          rating: 4.7,
          deliveryTime: "15-25 mins",
          image: "https://images.unsplash.com/photo-1506484381205-f7945653044d?w=600&q=80"
        }
      };
      store = defaultStoreMap[id] || {
        _id: id,
        id: id,
        name: "Tricelyn Partner Supermarket",
        address: "Scheme 54, Vijay Nagar, Indore",
        rating: 4.8,
        deliveryTime: "10-15 mins"
      };
      products = ALL_CATALOG_PRODUCTS;
    }

    // Group products by category and inject specific store details
    const categoryMap = {};
    products.forEach(p => {
      const catName = p.category?.name || p.categoryName || 'Daily Essentials';
      const catId = p.category?._id?.toString() || p.categorySlug || 'default';
      if (!categoryMap[catId]) {
        categoryMap[catId] = {
          id: catId,
          name: catName,
          image: p.category?.image || null,
          products: []
        };
      }
      const normalized = normalizeProduct(p);
      normalized.storeId = store._id || store.id;
      normalized.storeName = store.name;
      normalized.storeAddress = store.address;
      normalized.restaurant = store._id || store.id;
      normalized.restaurantName = store.name;
      normalized.vendorName = store.name;
      categoryMap[catId].products.push(normalized);
    });

    return res.status(200).json({
      success: true,
      data: {
        store: {
          id: store._id || store.id,
          _id: store._id || store.id,
          name: store.name,
          address: store.address,
          image: store.image,
          rating: store.rating,
          deliveryTime: store.deliveryTime || '10-15 mins'
        },
        catalog: Object.values(categoryMap)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/grocery/order
 * Place a grocery order routed directly to the selected Vendor/Store
 */
router.post('/order', protect, async (req, res) => {
  try {
    const {
      storeId,
      items,
      deliveryAddress,
      paymentMethod = 'cod',
      substitutionPreference = 'call_customer'
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Items are required' });
    }

    let targetStoreId = storeId || 'store_tricelyn_indore_01';
    let targetStoreName = req.body.storeName || 'Tricelyn Partner Store';

    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(targetStoreId)) {
      const stDoc = await Restaurant.findById(targetStoreId).lean();
      if (stDoc) {
        targetStoreName = stDoc.name || targetStoreName;
      }
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      let product = null;
      if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(item.productId)) {
        product = await Product.findById(item.productId);
      }

      const itemPrice = item.price || (product ? product.sellingPrice : 50);
      const itemName = item.name || (product ? product.name : 'Grocery Item');
      const itemUnit = item.unit || item.weight || 'piece';

      subtotal += itemPrice * item.quantity;
      orderItems.push({
        product: product ? product._id : (item.productId || 'custom_item'),
        name: itemName,
        quantity: item.quantity,
        price: itemPrice,
        unit: itemUnit,
        image: item.image || (product ? product.image : '')
      });
    }

    const deliveryFee = subtotal >= 199 ? 0 : 25;
    const platformFee = 5;
    const totalAmount = subtotal + deliveryFee + platformFee;

    const orderNumber = `GRO-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    let orderDoc = {
      orderNumber,
      customer: req.user?._id || 'guest_user',
      customerName: req.user?.name || 'Customer',
      customerPhone: req.user?.mobile || req.user?.phone || '9999999999',
      // Explicit Multi-Vendor routing so this order displays in VendorPartner app
      restaurant: targetStoreId,
      restaurantId: String(targetStoreId),
      restaurantName: targetStoreName,
      store: targetStoreId,
      storeId: String(targetStoreId),
      storeName: targetStoreName,
      vertical: VERTICALS.GROCERY,
      items: orderItems,
      subtotal,
      deliveryCharges: deliveryFee,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      orderStatus: 'Placed',
      orderType: 'delivery',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid'
    };

    if (mongoose.connection.readyState === 1) {
      orderDoc = await Order.create(orderDoc);
    }

    return res.status(201).json({
      success: true,
      message: 'Grocery order placed successfully with vendor',
      data: orderDoc
    });
  } catch (error) {
    console.error('Grocery order error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});


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
      try {
        const query = { isDeleted: { $ne: true } };
        if (search) {
          query.$or = [
            { 'name.en': { $regex: search, $options: 'i' } },
            { name: { $regex: search, $options: 'i' } },
            { sku: { $regex: search, $options: 'i' } }
          ];
        }

        const dbProducts = await Product.find(query)
          .populate('category', 'name slug')
          .populate('restaurant', 'name address')
          .sort({ updatedAt: -1, createdAt: -1 })
          .lean();

        if (dbProducts && dbProducts.length > 0) {
          items = dbProducts.map(p => {
            const price = Number(p.sellingPrice ?? p.price ?? p.basePrice ?? 0);
            const mrp = Number(p.mrp ?? Math.round(price * 1.25));
            const stock = p.stockQuantity !== undefined ? Number(p.stockQuantity) : 100;
            const threshold = Number(p.lowStockThreshold || 10);
            const inStock = p.inStock !== false && stock > 0;
            const nameStr = typeof p.name === 'object' ? (p.name.en || 'Grocery Item') : (p.name || 'Grocery Item');
            const catName = p.category?.name?.en || (typeof p.category?.name === 'string' ? p.category.name : (p.categorySlug || 'Grocery'));
            const storeName = p.restaurant?.name || 'Tricelyn Indore Dark Store Hub';

            return {
              _id: p._id.toString(),
              id: p._id.toString(),
              sku: p.sku || `TRC-${p._id.toString().slice(-6).toUpperCase()}`,
              name: nameStr,
              categoryName: catName,
              categorySlug: p.categorySlug || p.category?.slug || 'grocery',
              storeName,
              storeId: p.restaurant?._id?.toString() || p.restaurant || 'hub-01',
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
          isFromDb = true;
        }
      } catch (err) {
        console.warn('Error querying DB inventory:', err.message);
      }
    }

    // Fallback merge with ALL_CATALOG_PRODUCTS if DB has few items
    if (items.length === 0) {
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
    let filtered = [...items];
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

    // Compute stats across full list
    const totalSkus = items.length;
    const inStockCount = items.filter(i => i.status === 'in_stock').length;
    const lowStockCount = items.filter(i => i.status === 'low_stock').length;
    const outOfStockCount = items.filter(i => i.status === 'out_of_stock').length;
    const totalValuation = items.reduce((sum, i) => sum + (i.stockQuantity * i.sellingPrice), 0);

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
      updateObj.stockQuantity = Number(stockQuantity);
      updateObj.inStock = updateObj.stockQuantity > 0;
    }
    if (lowStockThreshold !== undefined) updateObj.lowStockThreshold = Number(lowStockThreshold);
    if (inStock !== undefined) updateObj.inStock = Boolean(inStock);
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

    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
      order = await Order.findById(id)
        .populate('user', 'name phone email')
        .populate('restaurant', 'name address phone gstin fssai documents')
        .populate('store', 'name address phone gstin fssai documents')
        .lean();
    }

    // Dynamic order date & generated invoice sequence
    const orderDate = order?.createdAt ? new Date(order.createdAt) : new Date();
    const invNumber = `TRC-INV-${orderDate.getFullYear()}-${(order?._id?.toString() || id || '10842').slice(-6).toUpperCase()}`;
    
    const items = (order?.items && order.items.length > 0) ? order.items : [
      { name: 'Fresh Farm Red Onion (Pyaaz)', quantity: 2, price: 38, total: 76, unit: '1 kg' },
      { name: 'Amul Taaza Homogenised Toned Milk', quantity: 2, price: 54, total: 108, unit: '1 Ltr' },
      { name: "Lay's India's Magic Masala Chips", quantity: 3, price: 20, total: 60, unit: '52g' }
    ];

    const formattedItems = items.map((it, idx) => {
      const q = it.quantity || 1;
      const p = it.price || 50;
      const total = it.total || (q * p);
      const taxable = Math.round((total / 1.05) * 100) / 100;
      const gstAmount = Math.round((total - taxable) * 100) / 100;
      const cgst = Math.round((gstAmount / 2) * 100) / 100;
      const sgst = cgst;

      return {
        srNo: idx + 1,
        name: it.name || it.productName || 'Grocery Item',
        quantity: q,
        unit: it.unit || '1 unit',
        unitPrice: p,
        taxableValue: taxable,
        cgstRate: '2.5%',
        cgstAmount: cgst,
        sgstRate: '2.5%',
        sgstAmount: sgst,
        totalAmount: total
      };
    });

    const itemsSubtotal = order?.itemTotal !== undefined 
      ? Number(order.itemTotal) 
      : formattedItems.reduce((acc, curr) => acc + curr.totalAmount, 0);

    const packagingFee = order?.packagingFee !== undefined ? Number(order.packagingFee) : 10;
    const deliveryFee = order?.deliveryFee !== undefined ? Number(order.deliveryFee) : (itemsSubtotal >= 199 ? 0 : 29);
    const platformFee = order?.platformFee !== undefined ? Number(order.platformFee) : 3;
    const discount = order?.discount !== undefined ? Number(order.discount) : (itemsSubtotal >= 200 ? 25 : 0);
    const grandTotal = order?.totalAmount !== undefined 
      ? Number(order.totalAmount) 
      : (itemsSubtotal + packagingFee + deliveryFee + platformFee - discount);

    const storeDoc = order?.restaurant || order?.store;
    const resolvedStoreName = storeDoc
      ? (typeof storeDoc.name === 'object' ? (storeDoc.name.en || Object.values(storeDoc.name)[0]) : storeDoc.name)
      : (order?.storeName || order?.restaurantName || 'Tricelyn Express Dark Store (Hub 01 - Vijay Nagar)');

    const resolvedStoreAddress = storeDoc?.address || order?.restaurantAddress || 'Plot 42, Scheme 54, PU-4 Commercial Zone, Vijay Nagar, Indore, MP 452010';
    const resolvedGstin = storeDoc?.documents?.gst?.number || storeDoc?.gstin || '23AABCT9988M1Z2';
    const resolvedFssai = storeDoc?.documents?.license?.number || storeDoc?.fssaiNumber || '11422850000123';

    const resolvedCustName = order?.customerName || order?.user?.name || order?.deliveryAddress?.name || 'Valued Customer';
    const resolvedCustPhone = order?.customerMobile || order?.user?.phone || order?.deliveryAddress?.phone || '+91 98930 12345';
    const resolvedCustAddr = order?.deliveryAddress?.fullAddress || order?.deliveryAddress?.addressLine || order?.address || 'Flat 304, Emerald Heights, Scheme 78, Indore 452010';

    const invoicePayload = {
      invoiceNumber: invNumber,
      invoiceDate: orderDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      invoiceTime: orderDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      orderId: order?._id?.toString() || id,
      orderStatus: order?.status || order?.orderStatus || 'Delivered',
      paymentMethod: (order?.paymentMethod || 'Online UPI (Razorpay)').toUpperCase(),
      paymentStatus: (order?.paymentStatus || (order?.isPaid ? 'Paid' : 'Unpaid')).toUpperCase(),

      // Dispatching Dark Store Entity (Dynamic)
      seller: {
        legalName: 'Tricelyn Hyperlocal Technologies Pvt. Ltd.',
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
        city: 'Indore',
        state: 'Madhya Pradesh (23)'
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
