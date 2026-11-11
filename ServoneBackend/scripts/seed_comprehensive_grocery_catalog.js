/**
 * Seed Comprehensive Dynamic Grocery Catalog into MongoDB
 * Seeds Dark Store Partners, 20 Categories, 160+ Products, and Hero / Offer Banners
 */
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Banner = require('../models/Banner');
const Restaurant = require('../models/Restaurant');
const { CATEGORIES, ALL_CATALOG_PRODUCTS } = require('../data/comprehensiveGroceryCatalog');

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/servonekart";

const SEED_STORES = [
  {
    key: "store_tricelyn_indore_01",
    name: "Tricelyn Supermart (Central Warehouse Hub)",
    slug: "tricelyn-mart-central-hub",
    ownerName: "Vikas Agrawal",
    phone: "9826022002",
    email: "freshmart@servonekart.com",
    address: "Scheme 54, PU-4 Commercial Zone, Vijay Nagar, Indore, MP 452010",
    city: "Indore",
    area: "Vijay Nagar",
    coordinates: [75.8900, 22.7500],
    pin: "1234",
    assignedRole: "Full Store Manager",
    permissions: ["orders", "inventory", "products", "payouts", "settings", "analytics"]
  },
  {
    key: "store_tricelyn_indore_02",
    name: "Fresh Farm Hub (Palasia Superstore)",
    slug: "fresh-farm-hub-palasia",
    ownerName: "Rajesh Sharma",
    phone: "9826011001",
    email: "palasia@servonekart.com",
    address: "12-B, Old Palasia Main Road, Indore, MP 452001",
    city: "Indore",
    area: "Old Palasia",
    coordinates: [75.8850, 22.7240],
    pin: "1234",
    assignedRole: "Inventory Manager",
    permissions: ["inventory", "orders", "products"]
  },
  {
    key: "store_tricelyn_indore_03",
    name: "Apna Super Kirana (Saket Nagar)",
    slug: "apna-super-kirana-saket",
    ownerName: "Sanjay Gupta",
    phone: "9893077123",
    email: "apnakirana@servonekart.com",
    address: "14, Saket Square, Saket Nagar, Indore, MP 452018",
    city: "Indore",
    area: "Saket Nagar",
    coordinates: [75.8960, 22.7235],
    pin: "4321",
    assignedRole: "Full Store Manager",
    permissions: ["orders", "inventory", "products", "payouts"]
  }
];

const SEED_HERO_SLIDES = [
  {
    badge: "TRICELYN FRESH · 10-15 MINS",
    title: "Farm Fresh Fruits & Vegetables",
    subtitle: "Crisp seasonal greens, organic veggies & juicy fruits delivered straight from local farms",
    buttonText: "Order Fresh",
    link: "/category/fruits-vegetables",
    bgGradient: "from-[#064e3b] via-[#047857] to-[#10b981]",
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1200&q=80",
    placement: "hero",
    position: 1
  },
  {
    badge: "DAILY ESSENTIALS · SUPERFAST",
    title: "Fresh Milk, Breads & Farm Eggs",
    subtitle: "Pure dairy pouches, artisan whole-wheat breads, farm fresh eggs & butter at morning speed",
    buttonText: "Shop Breakfast",
    link: "/category/dairy-bread-eggs",
    bgGradient: "from-[#002b80] via-[#0055ff] to-[#38bdf8]",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=1200&q=80",
    placement: "hero",
    position: 2
  },
  {
    badge: "ICY COLD · INSTANT REFRESH",
    title: "Chilled Drinks, Ice Creams & Juices",
    subtitle: "Beat the heat with iced sodas, cold-pressed fruit juices, coconut water & gourmet ice creams",
    buttonText: "Explore Coolers",
    link: "/category/cold-drinks-juices",
    bgGradient: "from-[#9a3412] via-[#ea580c] to-[#f97316]",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=1200&q=80",
    placement: "hero",
    position: 3
  },
  {
    badge: "MIDNIGHT CRAVINGS · 10 MINS",
    title: "Snacks, Munchies & Chocolates",
    subtitle: "Crunchy namkeen, imported chocolate bars, potato chips & cookies for instant cravings",
    buttonText: "Grab Snacks",
    link: "/category/snacks-munchies",
    bgGradient: "from-[#3b0764] via-[#7c3aed] to-[#a855f7]",
    image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=1200&q=80",
    placement: "hero",
    position: 4
  }
];

const SEED_OFFER_CARDS = [
  {
    badge: "FLAT 30% OFF",
    title: "Kitchen Staples & Pure Ghee",
    subtitle: "Premium basmati rice, organic dals, pure spices & cold-pressed oils",
    buttonText: "Order Staples",
    link: "/category/atta-rice-dal",
    bgGradient: "from-[#7c2d12] via-[#c2410c] to-[#ea580c]",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=700&q=80",
    placement: "offer_card",
    position: 10
  },
  {
    badge: "EVERYDAY SAVINGS",
    title: "Home Care & Disinfectants",
    subtitle: "Top brand detergents, floor cleaners, kitchen sprays & air fresheners",
    buttonText: "Shop Cleaners",
    link: "/category/household-cleaning",
    bgGradient: "from-[#0c4a6e] via-[#0284c7] to-[#0ea5e9]",
    image: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=700&q=80",
    placement: "offer_card",
    position: 11
  },
  {
    badge: "STARTING @ ₹49",
    title: "Personal Care & Grooming",
    subtitle: "Herbal body washes, shampoos, oral hygiene & daily skincare essentials",
    buttonText: "Explore Range",
    link: "/category/personal-care",
    bgGradient: "from-[#312e81] via-[#4f46e5] to-[#7c3aed]",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=700&q=80",
    placement: "offer_card",
    position: 12
  }
];

async function seedCatalog() {
  try {
    console.log("🌱 [SeedCatalog] Connecting to MongoDB:", mongoUri);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000, family: 4 });
    console.log("✅ MongoDB Connected!");

    // 1. Upsert Dark Store / Supermarket Partners
    const storeDocMap = {};
    for (const s of SEED_STORES) {
      const doc = await Restaurant.findOneAndUpdate(
        { slug: s.slug },
        {
          $set: {
            name: s.name,
            slug: s.slug,
            businessType: "grocery_store",
            vertical: "grocery",
            restaurantType: "Quick-Commerce Dark Store & Supermarket",
            ownerName: s.ownerName,
            phone: s.phone,
            contactNumber: s.phone,
            email: s.email,
            address: s.address,
            city: s.city,
            area: s.area,
            pin: s.pin,
            ownerPin: s.pin,
            assignedRole: s.assignedRole,
            permissions: s.permissions,
            location: {
              type: "Point",
              coordinates: s.coordinates
            },
            deliveryTime: 12,
            rating: { average: 4.8, count: 2450 },
            isOnline: true,
            isActive: true,
            restaurantApproved: true,
            menuApproved: true,
            verificationStatus: "verified",
            minOrderValue: 49,
            adminCommission: 10
          }
        },
        { upsert: true, new: true }
      );
      storeDocMap[s.key] = doc._id;
    }
    const defaultStoreId = storeDocMap[SEED_STORES[0].key];
    console.log(`🏪 ${Object.keys(storeDocMap).length} Dark Store Hubs synced successfully.`);

    // 2. Upsert 20 Categories
    console.log(`📁 Upserting ${CATEGORIES.length} Categories...`);
    const categoryDocMap = {};

    for (const cat of CATEGORIES) {
      const doc = await Category.findOneAndUpdate(
        { slug: cat.slug },
        {
          $set: {
            name: cat.name,
            slug: cat.slug,
            vertical: "grocery",
            type: "main",
            image: cat.image,
            icon: cat.icon,
            description: cat.description,
            position: cat.position,
            isActive: true,
            isVisible: true,
            userAppVisible: true
          }
        },
        { upsert: true, new: true }
      );
      categoryDocMap[cat.slug] = doc._id;
    }
    console.log(`✅ ${Object.keys(categoryDocMap).length} Categories upserted successfully.`);

    // 3. Upsert All Catalog Products
    console.log(`📦 Upserting ${ALL_CATALOG_PRODUCTS.length} Products...`);
    let prodCount = 0;

    for (let idx = 0; idx < ALL_CATALOG_PRODUCTS.length; idx++) {
      const p = ALL_CATALOG_PRODUCTS[idx];
      const catId = categoryDocMap[p.categorySlug];
      const assignedStoreId = storeDocMap[p.storeId] || defaultStoreId;
      const sku = p.sku || `TRC-SKU-${1000 + idx}`;

      await Product.findOneAndUpdate(
        { "name.en": p.name },
        {
          $set: {
            sku,
            name: { en: p.name },
            description: { en: p.description || "" },
            basePrice: Number(p.price) || 50,
            sellingPrice: Number(p.price) || 50,
            mrp: Number(p.mrp) || Math.round((Number(p.price) || 50) * 1.25),
            discountPercent: Number(p.discountPercent) || 0,
            weight: p.weight,
            unit: p.unit || "unit",
            image: p.image,
            category: catId,
            categoryId: catId,
            categorySlug: p.categorySlug,
            restaurant: assignedStoreId,
            vertical: "grocery",
            inStock: true,
            outOfStock: false,
            stockQuantity: Number(p.stockQuantity) || 100,
            lowStockThreshold: 10,
            available: true,
            isApproved: true,
            isPublished: true,
            isDeleted: false,
            approvalStatus: "approved",
            deliveryTime: p.deliveryTime || "10 MINS"
          }
        },
        { upsert: true, new: true }
      );
      prodCount++;
    }
    console.log(`✅ ${prodCount} Products upserted successfully.`);

    // 4. Upsert Hero Carousel & Offer Banners
    console.log("🎨 Upserting Hero Carousel & Offer Card Banners...");
    await Banner.deleteMany({ type: "static" });

    for (const b of [...SEED_HERO_SLIDES, ...SEED_OFFER_CARDS]) {
      await Banner.create({
        title: b.title,
        subtitle: b.subtitle,
        badge: b.badge,
        buttonText: b.buttonText,
        image: b.image,
        type: "static",
        placement: b.placement,
        link: b.link,
        bgGradient: b.bgGradient,
        position: b.position,
        isActive: true
      });
    }
    console.log("✅ 4 Hero Slides & 3 Offer Cards seeded successfully.");

    console.log("\n🎉 [SUCCESS] Entire Comprehensive Grocery Catalog Seeded into Local MongoDB!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed Catalog Error:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedCatalog();
}

module.exports = { seedCatalog };
