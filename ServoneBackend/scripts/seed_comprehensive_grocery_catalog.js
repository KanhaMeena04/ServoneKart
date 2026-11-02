/**
 * Seed Comprehensive Dynamic Grocery Catalog into MongoDB
 * Seeds 20 Categories, 160+ Products, and Hero / Promo Banners
 */
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Banner = require('../models/Banner');
const Restaurant = require('../models/Restaurant');
const { HERO_BANNERS, CATEGORIES, ALL_CATALOG_PRODUCTS } = require('../data/comprehensiveGroceryCatalog');

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/servonekart";

async function seedCatalog() {
  try {
    console.log("🌱 [SeedCatalog] Connecting to MongoDB:", mongoUri);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ MongoDB Connected!");

    // 1. Ensure a primary grocery fulfillment dark store / vendor exists
    let groceryStore = await Restaurant.findOne({
      $or: [
        { businessType: "grocery_store" },
        { vertical: "grocery" },
        { slug: "tricelyn-mart-indore" }
      ]
    });

    if (!groceryStore) {
      console.log("🏪 Creating primary Tricelyn Express Mart Dark Store...");
      groceryStore = await Restaurant.create({
        name: "Tricelyn Express Mart (Indore Super Store)",
        slug: "tricelyn-mart-indore",
        businessType: "grocery_store",
        vertical: "grocery",
        restaurantType: "grocery",
        address: "Scheme 54, Vijay Nagar, Indore, Madhya Pradesh 452010",
        city: "Indore",
        state: "Madhya Pradesh",
        location: {
          type: "Point",
          coordinates: [75.8900, 22.7500] // Indore
        },
        deliveryTime: "8 - 12 mins",
        rating: 4.8,
        ratingsCount: 2450,
        isOpen: true,
        isActive: true,
        restaurantApproved: true,
        menuApproved: true,
        acceptingOrders: true,
        minOrderAmount: 49,
        freeDeliveryThreshold: 199,
        deliveryFee: 15
      });
      console.log("✅ Dark store created with ID:", groceryStore._id);
    } else {
      console.log("✅ Using existing grocery store:", groceryStore.name, "(ID:", groceryStore._id, ")");
    }

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

    // 3. Upsert 160+ Products
    console.log(`📦 Upserting ${ALL_CATALOG_PRODUCTS.length} Products...`);
    let prodCount = 0;

    for (const p of ALL_CATALOG_PRODUCTS) {
      const catId = categoryDocMap[p.categorySlug];
      await Product.findOneAndUpdate(
        { name: { $in: [p.name, { en: p.name }] } },
        {
          $set: {
            name: { en: p.name },
            description: { en: p.description },
            basePrice: p.price,
            sellingPrice: p.price,
            mrp: p.mrp,
            discountPercent: p.discountPercent,
            weight: p.weight,
            unit: p.unit,
            image: p.image,
            category: catId,
            categoryId: catId,
            restaurant: groceryStore._id,
            vertical: "grocery",
            inStock: true,
            stockQuantity: p.stockQuantity,
            available: true,
            isApproved: true,
            isPublished: true,
            approvalStatus: "approved",
            deliveryTime: p.deliveryTime || "8 MINS"
          }
        },
        { upsert: true, new: true }
      );
      prodCount++;
    }
    console.log(`✅ ${prodCount} Products upserted successfully.`);

    // 4. Upsert Banners
    console.log("🎨 Upserting Hero and Promo Banners...");
    await Banner.deleteMany({ vertical: "grocery" });

    // Top hero banner
    await Banner.create({
      title: HERO_BANNERS.topBanner.title,
      description: HERO_BANNERS.topBanner.subtitle,
      image: HERO_BANNERS.topBanner.image,
      type: "static",
      link: HERO_BANNERS.topBanner.link,
      tag: HERO_BANNERS.topBanner.badge,
      vertical: "grocery",
      position: 1,
      isActive: true
    });

    // Sub banners
    for (let i = 0; i < HERO_BANNERS.subBanners.length; i++) {
      const sb = HERO_BANNERS.subBanners[i];
      await Banner.create({
        title: sb.title,
        description: sb.subtitle,
        image: sb.image,
        type: "static",
        link: sb.link,
        tag: sb.tag,
        vertical: "grocery",
        position: i + 2,
        isActive: true
      });
    }
    console.log("✅ Banners seeded successfully.");

    console.log("\n🎉 [SUCCESS] Entire Comprehensive Grocery Catalog Seeded!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed Catalog Error:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  seedCatalog();
}

module.exports = { seedCatalog };

