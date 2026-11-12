/**
 * Tricelyn Multi-Vendor Quick Commerce Atlas Seed Script
 * Populates MongoDB Atlas with:
 * - AdminSetting (Tricelyn grocery-first mode)
 * - 1 City (Indore) with 5 Zones + 5 ServiceAreas
 * - 5 Verified Customers (role: customer, Indore addresses)
 * - 5 Approved Online Vendors / Grocery Dark Stores + 5 Linked Owners (role: restaurant_owner)
 * - 5 Approved Online Delivery Partners + 5 Linked Rider Users (role: rider)
 * - 20 Main Grocery Categories + 60 Subcategories (3 properly named subcategories each)
 * - 80 Complete Products across all 20 Categories & 60 Subcategories, mapped to their owning Vendor
 * - Banners, Promocodes, Units & Brands
 *
 * Idempotent: Safe to re-run without creating duplicate entries.
 * Never hardcodes database credentials — reads MONGO_URI / MONGODB_URI from .env.
 */

const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Rider = require("../models/Rider");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Banner = require("../models/Banner");
const City = require("../models/City");
const ServiceArea = require("../models/ServiceArea");
const Promocode = require("../models/Promocode");
const Brand = require("../models/Brand");
const Unit = require("../models/Unit");
const AdminSetting = require("../models/AdminSetting");
const Counter = require("../models/Counter");

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error("ERROR: MONGO_URI / MONGODB_URI is not set in ServoneBackend/.env");
  process.exit(1);
}

const ALL_WEEK_TIMING = {
  monday: { open: "06:00", close: "23:30", isOpen: true, isClosed: false },
  tuesday: { open: "06:00", close: "23:30", isOpen: true, isClosed: false },
  wednesday: { open: "06:00", close: "23:30", isOpen: true, isClosed: false },
  thursday: { open: "06:00", close: "23:30", isOpen: true, isClosed: false },
  friday: { open: "06:00", close: "23:30", isOpen: true, isClosed: false },
  saturday: { open: "06:00", close: "23:30", isOpen: true, isClosed: false },
  sunday: { open: "06:00", close: "23:30", isOpen: true, isClosed: false },
  isHoliday: false,
};

// ---------------------------------------------------------------------------
// 1. 5 INDORE ZONES & SERVICE AREAS
// ---------------------------------------------------------------------------
const INDORE_ZONES = [
  {
    name: "Vijay Nagar Hub",
    pincode: "452010",
    lat: 22.7533,
    lng: 75.8937,
    addressSuffix: "Scheme No. 54, Vijay Nagar, Indore, MP 452010",
  },
  {
    name: "Old Palasia",
    pincode: "452001",
    lat: 22.7244,
    lng: 75.8878,
    addressSuffix: "AB Road, Old Palasia, Indore, MP 452001",
  },
  {
    name: "Saket Nagar",
    pincode: "452018",
    lat: 22.7219,
    lng: 75.8992,
    addressSuffix: "Saket Square, Saket Nagar, Indore, MP 452018",
  },
  {
    name: "Bhawarkua Square",
    pincode: "452009",
    lat: 22.6951,
    lng: 75.8648,
    addressSuffix: "Main Road, Bhawarkua Square, Indore, MP 452009",
  },
  {
    name: "Rajwada MG Road",
    pincode: "452002",
    lat: 22.7177,
    lng: 75.8473,
    addressSuffix: "Near Rajwada Palace, MG Road, Indore, MP 452002",
  },
];

// ---------------------------------------------------------------------------
// 2. 5 CUSTOMERS
// ---------------------------------------------------------------------------
const CUSTOMERS = [
  {
    customerId: "C001",
    firstName: "Aarav",
    lastName: "Sharma",
    email: "aarav.sharma@tricelyn.in",
    mobile: "+919826011001",
    walletBalance: 450,
    rewardPoints: 120,
    addressLine: "Flat 402, Satya Sai Residency, Vijay Nagar",
    landmark: "Near Sayaji Hotel",
    zoneIndex: 0,
  },
  {
    customerId: "C002",
    firstName: "Priya",
    lastName: "Verma",
    email: "priya.verma@tricelyn.in",
    mobile: "+919826011002",
    walletBalance: 780,
    rewardPoints: 240,
    addressLine: "18B, Navratan Bagh, Old Palasia",
    landmark: "Behind TI Mall",
    zoneIndex: 1,
  },
  {
    customerId: "C003",
    firstName: "Rohan",
    lastName: "Patidar",
    email: "rohan.patidar@tricelyn.in",
    mobile: "+919826011003",
    walletBalance: 250,
    rewardPoints: 90,
    addressLine: "Plot 24, Saket Club Road, Saket Nagar",
    landmark: "Opposite Saket Garden",
    zoneIndex: 2,
  },
  {
    customerId: "C004",
    firstName: "Neha",
    lastName: "Joshi",
    email: "neha.joshi@tricelyn.in",
    mobile: "+919826011004",
    walletBalance: 1120,
    rewardPoints: 350,
    addressLine: "305, Vishnupuri Annex, Bhawarkua",
    landmark: "Near Holkar Science College",
    zoneIndex: 3,
  },
  {
    customerId: "C005",
    firstName: "Karan",
    lastName: "Agrawal",
    email: "karan.agrawal@tricelyn.in",
    mobile: "+919826011005",
    walletBalance: 600,
    rewardPoints: 185,
    addressLine: "72, Sarafa Bazar Lane, Rajwada",
    landmark: "Near Gopal Mandir",
    zoneIndex: 4,
  },
];

// ---------------------------------------------------------------------------
// 3. 5 VENDORS (GROCERY DARK STORES / SUPERMARTS)
// ---------------------------------------------------------------------------
const VENDORS = [
  {
    key: "v1",
    restaurantId: "RNT001",
    slug: "tricelyn-express-mart-vijay-nagar",
    name: "Tricelyn Express Mart - Vijay Nagar",
    description: "24x7 quick-commerce dark store stocking dairy, bakery, morning breakfast, and coffee essentials.",
    ownerName: "Rajeshwar Singh",
    ownerEmail: "vendor.vijaynagar@tricelyn.in",
    ownerMobile: "+919893022001",
    pin: "1111",
    address: "Shop 12-14, Ground Floor, Scheme 54 Commercial, Vijay Nagar",
    area: "Vijay Nagar",
    zoneIndex: 0,
    deliveryTime: 12,
    ratingAvg: 4.8,
    ratingCount: 412,
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
    bannerImage: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1200&q=80",
    gst: "23AABCT1001A1Z5",
    pan: "AABCT1001A",
    fssai: "11424850001001",
    upi: "tricelynvijay@ybl",
    offers: [
      { title: "Morning Fresh Combo", code: "MORNING15", discountPercent: 15, maxDiscount: 100, minOrder: 249, description: "15% OFF on Dairy & Breakfast" },
    ],
  },
  {
    key: "v2",
    restaurantId: "RNT002",
    slug: "fresh-farm-hub-palasia",
    name: "Fresh Farm Hub - Old Palasia",
    description: "Farm-to-door organic produce, hydroponic greens, seasonal fruits, poultry, meat & wellness selection.",
    ownerName: "Meera Kulkarni",
    ownerEmail: "vendor.palasia@tricelyn.in",
    ownerMobile: "+919893022002",
    pin: "2222",
    address: "G-4, Palasia Square Plaza, AB Road, Old Palasia",
    area: "Old Palasia",
    zoneIndex: 1,
    deliveryTime: 14,
    ratingAvg: 4.9,
    ratingCount: 386,
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=80",
    bannerImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80",
    gst: "23AABCF2002B1Z3",
    pan: "AABCF2002B",
    fssai: "11424850002002",
    upi: "freshfarmpalasia@okaxis",
    offers: [
      { title: "Farm Fresh Harvest", code: "FARM20", discountPercent: 20, maxDiscount: 150, minOrder: 399, description: "20% OFF on Fresh Fruits & Vegetables" },
    ],
  },
  {
    key: "v3",
    restaurantId: "RNT003",
    slug: "apna-super-kirana-saket",
    name: "Apna Super Kirana - Saket Nagar",
    description: "Trusted Indore staple hub for chakki atta, aged basmati rice, pulses, pure ghee, spices, and pantry sauces.",
    ownerName: "Suresh Jain",
    ownerEmail: "vendor.saket@tricelyn.in",
    ownerMobile: "+919893022003",
    pin: "3333",
    address: "Plot 9, Saket Square Market, Saket Nagar",
    area: "Saket Nagar",
    zoneIndex: 2,
    deliveryTime: 15,
    ratingAvg: 4.7,
    ratingCount: 295,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80",
    bannerImage: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1200&q=80",
    gst: "23AABCA3003C1Z1",
    pan: "AABCA3003C",
    fssai: "11424850003003",
    upi: "apnakiranasaket@ibl",
    offers: [
      { title: "Monthly Ration Saver", code: "RATION10", discountPercent: 10, maxDiscount: 200, minOrder: 799, description: "Flat 10% OFF on Staples & Oil" },
    ],
  },
  {
    key: "v4",
    restaurantId: "RNT004",
    slug: "malwa-daily-mart-bhawarkua",
    name: "Malwa Daily Mart - Bhawarkua",
    description: "Late-night snacks, chilled cold drinks, gourmet chocolates, Indore namkeen & paan corner hub.",
    ownerName: "Vikram Rathore",
    ownerEmail: "vendor.bhawarkua@tricelyn.in",
    ownerMobile: "+919893022004",
    pin: "4444",
    address: "Shop 5, Gurukul Tower, Bhawarkua Square",
    area: "Bhawarkua Square",
    zoneIndex: 3,
    deliveryTime: 11,
    ratingAvg: 4.6,
    ratingCount: 518,
    image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800&q=80",
    bannerImage: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=1200&q=80",
    gst: "23AABCM4004D1Z9",
    pan: "AABCM4004D",
    fssai: "11424850004004",
    upi: "malwadailymart@ybl",
    offers: [
      { title: "Party Munchies Deal", code: "PARTY25", discountPercent: 25, maxDiscount: 120, minOrder: 299, description: "25% OFF on Snacks & Beverages" },
    ],
  },
  {
    key: "v5",
    restaurantId: "RNT005",
    slug: "rajwada-heritage-mart-mg-road",
    name: "Rajwada Heritage Mart - MG Road",
    description: "Complete family & home store for personal care, household cleaners, baby care, pet care, pharma & stationery.",
    ownerName: "Ankita Gupta",
    ownerEmail: "vendor.rajwada@tricelyn.in",
    ownerMobile: "+919893022005",
    pin: "5555",
    address: "104, Krishnapura Market, MG Road, Rajwada",
    area: "Rajwada MG Road",
    zoneIndex: 4,
    deliveryTime: 15,
    ratingAvg: 4.8,
    ratingCount: 340,
    image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=800&q=80",
    bannerImage: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200&q=80",
    gst: "23AABCR5005E1Z7",
    pan: "AABCR5005E",
    fssai: "11424850005005",
    upi: "rajwadamart@okicici",
    offers: [
      { title: "Home Care Mega Sale", code: "HOMECARE15", discountPercent: 15, maxDiscount: 180, minOrder: 499, description: "15% OFF on Personal & Household Care" },
    ],
  },
];

// ---------------------------------------------------------------------------
// 4. 5 DELIVERY PARTNERS (RIDERS)
// ---------------------------------------------------------------------------
const RIDERS = [
  {
    riderId: "RDR001",
    name: "Deepak Yadav",
    email: "rider.deepak@tricelyn.in",
    mobile: "+919755033001",
    pin: "1001",
    zoneIndex: 0,
    vehicleType: "Motorcycle",
    vehicleModel: "Hero Splendor Plus",
    vehicleNumber: "MP09QA4511",
    vehicleColor: "Black & Silver",
    profilePic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
    rating: 4.9,
    totalDeliveries: 142,
    totalEarnings: 18450,
    currentBalance: 1650,
    upi: "deepak.rider@ybl",
  },
  {
    riderId: "RDR002",
    name: "Arjun Malviya",
    email: "rider.arjun@tricelyn.in",
    mobile: "+919755033002",
    pin: "1002",
    zoneIndex: 1,
    vehicleType: "Scooter",
    vehicleModel: "Honda Activa 6G",
    vehicleNumber: "MP09QB7822",
    vehicleColor: "Matte Blue",
    profilePic: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80",
    rating: 4.8,
    totalDeliveries: 118,
    totalEarnings: 15320,
    currentBalance: 1240,
    upi: "arjun.rider@okaxis",
  },
  {
    riderId: "RDR003",
    name: "Sandeep Tiwari",
    email: "rider.sandeep@tricelyn.in",
    mobile: "+919755033003",
    pin: "1003",
    zoneIndex: 2,
    vehicleType: "Electric Scooter",
    vehicleModel: "Ather 450X",
    vehicleNumber: "MP09EV3309",
    vehicleColor: "Space Grey",
    profilePic: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80",
    rating: 4.9,
    totalDeliveries: 164,
    totalEarnings: 21200,
    currentBalance: 2180,
    upi: "sandeep.ev@ibl",
  },
  {
    riderId: "RDR004",
    name: "Manish Chouhan",
    email: "rider.manish@tricelyn.in",
    mobile: "+919755033004",
    pin: "1004",
    zoneIndex: 3,
    vehicleType: "Motorcycle",
    vehicleModel: "Bajaj Platina 110",
    vehicleNumber: "MP09QC9104",
    vehicleColor: "Cocktail Red",
    profilePic: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80",
    rating: 4.7,
    totalDeliveries: 97,
    totalEarnings: 12800,
    currentBalance: 940,
    upi: "manish.rider@ybl",
  },
  {
    riderId: "RDR005",
    name: "Farhan Khan",
    email: "rider.farhan@tricelyn.in",
    mobile: "+919755033005",
    pin: "1005",
    zoneIndex: 4,
    vehicleType: "Scooter",
    vehicleModel: "TVS Jupiter 125",
    vehicleNumber: "MP09QD5630",
    vehicleColor: "Titanium White",
    profilePic: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&q=80",
    rating: 4.85,
    totalDeliveries: 131,
    totalEarnings: 17100,
    currentBalance: 1520,
    upi: "farhan.rider@okicici",
  },
];

// ---------------------------------------------------------------------------
// 5. ALL 20 MAIN GROCERY CATEGORIES + 60 SUBCATEGORIES + 80 PRODUCTS
//    Each category lists vendorKey ('v1'..'v5') for clear product-vendor ownership
// ---------------------------------------------------------------------------
const CATALOG_TREE = [
  {
    name: "Fruits & Vegetables",
    slug: "fruits-vegetables",
    position: 1,
    isFeatured: true,
    startingPrice: 18,
    icon: "🥦",
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&q=80",
    description: "Farm-fresh vegetables, seasonal exotic fruits & organic produce",
    vendorKey: "v2",
    subcategories: [
      {
        name: "Fresh Vegetables",
        slug: "fresh-vegetables",
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80",
        products: [
          {
            sku: "TRC-FV-001",
            name: "Hybrid Red Tomato",
            weight: "1 kg",
            unit: "kg",
            price: 34,
            mrp: 48,
            stock: 85,
            featured: true,
            image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80",
            desc: "Juicy farm-picked red hybrid tomatoes ideal for daily curries and salads.",
            variants: [
              { name: "500 g", sku: "TRC-FV-001-500G", price: 18, mrp: 25, stockQuantity: 45, unit: "g", inStock: true },
              { name: "1 kg", sku: "TRC-FV-001-1KG", price: 34, mrp: 48, stockQuantity: 85, unit: "kg", inStock: true },
            ],
          },
          {
            sku: "TRC-FV-002",
            name: "Malwa Fresh Potato",
            weight: "1 kg",
            unit: "kg",
            price: 32,
            mrp: 40,
            stock: 140,
            featured: false,
            image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80",
            desc: "Signature Indore Malwa low-sugar potatoes, thin-skinned and rich in flavour.",
            variants: [
              { name: "1 kg", sku: "TRC-FV-002-1KG", price: 32, mrp: 40, stockQuantity: 140, unit: "kg", inStock: true },
              { name: "2 kg", sku: "TRC-FV-002-2KG", price: 60, mrp: 78, stockQuantity: 70, unit: "kg", inStock: true },
            ],
          },
        ],
      },
      {
        name: "Fresh Fruits",
        slug: "fresh-fruits",
        image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&q=80",
        products: [
          {
            sku: "TRC-FV-003",
            name: "Yelakki Fresh Banana",
            weight: "1 kg",
            unit: "kg",
            price: 45,
            mrp: 60,
            stock: 95,
            featured: true,
            image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400&q=80",
            desc: "Naturally ripened sweet yellow bananas packed with potassium.",
          },
          {
            sku: "TRC-FV-004",
            name: "Himachal Royal Gala Apple",
            weight: "500 g",
            unit: "g",
            price: 119,
            mrp: 155,
            stock: 60,
            featured: true,
            image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80",
            desc: "Crisp, hand-sorted Himachal apples with sweet crunch.",
          },
        ],
      },
      {
        name: "Herbs & Leafy Greens",
        slug: "herbs-leafy-greens",
        image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80",
        products: [
          {
            sku: "TRC-FV-005",
            name: "Desi Fresh Coriander & Mint Combo",
            weight: "200 g",
            unit: "g",
            price: 22,
            mrp: 30,
            stock: 52,
            featured: false,
            image: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&q=80",
            desc: "Aromatic morning-cut dhaniya and pudina bunches washed cleanly.",
          },
        ],
      },
    ],
  },
  {
    name: "Dairy & Bakery",
    slug: "dairy-bread-eggs",
    position: 2,
    isFeatured: true,
    startingPrice: 27,
    icon: "🥛",
    image: "https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=400&q=80",
    description: "Fresh milk, curd, butter, paneer, eggs, artisan bread and bakery treats",
    vendorKey: "v1",
    subcategories: [
      {
        name: "Milk & Curd",
        slug: "milk-curd",
        image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80",
        products: [
          {
            sku: "TRC-DB-001",
            name: "Amul Taaza Toned Milk",
            weight: "1 ltr",
            unit: "ltr",
            price: 54,
            mrp: 60,
            stock: 150,
            featured: true,
            image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80",
            desc: "Pasteurized homogenized toned milk sealed fresh every morning.",
            variants: [
              { name: "500 ml", sku: "TRC-DB-001-500", price: 27, mrp: 30, stockQuantity: 90, unit: "ml", inStock: true },
              { name: "1 ltr", sku: "TRC-DB-001-1L", price: 54, mrp: 60, stockQuantity: 150, unit: "ltr", inStock: true },
            ],
          },
          {
            sku: "TRC-DB-002",
            name: "Sanchi Masti Dahi Cup",
            weight: "400 g",
            unit: "g",
            price: 38,
            mrp: 45,
            stock: 64,
            featured: false,
            image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80",
            desc: "Thick creamy probiotic curd crafted from pure MP dairy milk.",
          },
        ],
      },
      {
        name: "Paneer, Butter & Cheese",
        slug: "paneer-butter-cheese",
        image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80",
        products: [
          {
            sku: "TRC-DB-003",
            name: "Amul Pasteurised Salted Butter",
            weight: "100 g",
            unit: "g",
            price: 56,
            mrp: 60,
            stock: 7, // Intentional Low Stock Alert for Admin Inventory!
            featured: true,
            image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80",
            desc: "Classic creamy Amul butter for parathas, toast, and baking.",
          },
          {
            sku: "TRC-DB-004",
            name: "Amul Malai Fresh Paneer",
            weight: "200 g",
            unit: "g",
            price: 88,
            mrp: 95,
            stock: 48,
            featured: true,
            image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80",
            desc: "Soft cottage cheese cubes rich in dairy protein.",
          },
        ],
      },
      {
        name: "Breads & Farm Eggs",
        slug: "breads-farm-eggs",
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
        products: [
          {
            sku: "TRC-DB-005",
            name: "Harvest Gold Whole Wheat Brown Bread",
            weight: "400 g",
            unit: "pack",
            price: 48,
            mrp: 55,
            stock: 42,
            featured: false,
            image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
            desc: "Zero-maida soft whole wheat sandwich bread baked daily.",
          },
          {
            sku: "TRC-DB-006",
            name: "Farm Fresh Protein White Eggs",
            weight: "6 pcs",
            unit: "tray",
            price: 52,
            mrp: 60,
            stock: 60,
            featured: false,
            foodType: "egg",
            isVeg: false,
            image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=80",
            desc: "Hygienically cleaned and date-stamped poultry farm eggs.",
          },
        ],
      },
    ],
  },
  {
    name: "Snacks & Beverages",
    slug: "snacks-munchies",
    position: 3,
    isFeatured: true,
    startingPrice: 20,
    icon: "🍟",
    image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80",
    description: "Chips, Indore namkeen, extruded munchies, popcorn and nachos",
    vendorKey: "v4",
    subcategories: [
      {
        name: "Potato Chips & Crisps",
        slug: "potato-chips-crisps",
        image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80",
        products: [
          {
            sku: "TRC-SM-001",
            name: "Lay's India's Magic Masala Chips",
            weight: "90 g",
            unit: "pack",
            price: 45,
            mrp: 50,
            stock: 130,
            featured: true,
            image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80",
            desc: "Crispy kettle-cooked potato chips dusted with tangy Indian spices.",
          },
        ],
      },
      {
        name: "Bhujia & Indore Namkeen",
        slug: "bhujia-indore-namkeen",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80",
        products: [
          {
            sku: "TRC-SM-002",
            name: "Haldiram's Aloo Bhujia Family Pack",
            weight: "400 g",
            unit: "pack",
            price: 92,
            mrp: 105,
            stock: 80,
            featured: true,
            image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80",
            desc: "Classic crispy potato & besan bhujia spiced with mint and black salt.",
          },
          {
            sku: "TRC-SM-003",
            name: "Indore Special Ratlami Sev",
            weight: "250 g",
            unit: "pack",
            price: 68,
            mrp: 80,
            stock: 95,
            featured: false,
            image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&q=80",
            desc: "Authentic Malwa clove & black-pepper spiced crunchy gram-flour sev.",
          },
        ],
      },
      {
        name: "Popcorn & Nachos",
        slug: "popcorn-nachos",
        image: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400&q=80",
        products: [
          {
            sku: "TRC-SM-004",
            name: "ACT II Golden Sizzle Butter Popcorn",
            weight: "90 g",
            unit: "pack",
            price: 38,
            mrp: 45,
            stock: 72,
            featured: false,
            image: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400&q=80",
            desc: "3-minute instant golden butter popcorn for movie nights.",
          },
        ],
      },
    ],
  },
  {
    name: "Atta, Rice & Dal",
    slug: "atta-rice-dal",
    position: 4,
    isFeatured: true,
    startingPrice: 69,
    icon: "🌾",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80",
    description: "Chakki fresh atta, premium basmati rice, lentils and cooking grains",
    vendorKey: "v3",
    subcategories: [
      {
        name: "Chakki Atta & Flours",
        slug: "chakki-atta-flours",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80",
        products: [
          {
            sku: "TRC-AR-001",
            name: "Aashirvaad Shudh Chakki Atta",
            weight: "5 kg",
            unit: "kg",
            price: 245,
            mrp: 295,
            stock: 110,
            featured: true,
            image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80",
            desc: "100% MP Sharbati whole wheat chakki-ground flour for ultra-soft rotis.",
            variants: [
              { name: "5 kg", sku: "TRC-AR-001-5KG", price: 245, mrp: 295, stockQuantity: 110, unit: "kg", inStock: true },
              { name: "10 kg", sku: "TRC-AR-001-10KG", price: 465, mrp: 560, stockQuantity: 55, unit: "kg", inStock: true },
            ],
          },
          {
            sku: "TRC-AR-002",
            name: "Fortune Besan Chana Dal Flour",
            weight: "500 g",
            unit: "g",
            price: 58,
            mrp: 72,
            stock: 64,
            featured: false,
            image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&q=80",
            desc: "Fine-milled pure Bengal gram flour for pakoras and sweets.",
          },
        ],
      },
      {
        name: "Basmati & Daily Rice",
        slug: "basmati-daily-rice",
        image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80",
        products: [
          {
            sku: "TRC-AR-003",
            name: "Daawat Rozana Gold Basmati Rice",
            weight: "1 kg",
            unit: "kg",
            price: 115,
            mrp: 145,
            stock: 85,
            featured: true,
            image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80",
            desc: "Aged aromatic long-grain basmati rice with fluffy non-sticky finish.",
          },
        ],
      },
      {
        name: "Toor, Moong & Chana Dal",
        slug: "toor-moong-chana-dal",
        image: "https://images.unsplash.com/photo-1585996963040-7f051be2ee2d?w=400&q=80",
        products: [
          {
            sku: "TRC-AR-004",
            name: "Tata Sampann Unpolished Toor Dal",
            weight: "1 kg",
            unit: "kg",
            price: 168,
            mrp: 199,
            stock: 6, // Intentional Low Stock Alert!
            featured: true,
            image: "https://images.unsplash.com/photo-1585996963040-7f051be2ee2d?w=400&q=80",
            desc: "Naturally protein-rich unpolished arhar lentils with rich aroma.",
          },
          {
            sku: "TRC-AR-005",
            name: "Tata Sampann Yellow Moong Dal",
            weight: "1 kg",
            unit: "kg",
            price: 149,
            mrp: 175,
            stock: 54,
            featured: false,
            image: "https://images.unsplash.com/photo-1585996963040-7f051be2ee2d?w=400&q=80",
            desc: "Easy-to-digest unpolished split yellow moong lentils.",
          },
        ],
      },
    ],
  },
  {
    name: "Personal Care",
    slug: "personal-care",
    position: 5,
    isFeatured: true,
    startingPrice: 45,
    icon: "🧴",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80",
    description: "Haircare, body wash, oral care, skincare and grooming essentials",
    vendorKey: "v5",
    subcategories: [
      {
        name: "Bath & Body Care",
        slug: "bath-body-care",
        image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80",
        products: [
          {
            sku: "TRC-PC-001",
            name: "Dove Cream Beauty Bathing Bar (Pack of 3)",
            weight: "3 x 100 g",
            unit: "pack",
            price: 162,
            mrp: 185,
            stock: 74,
            featured: true,
            image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80",
            desc: "1/4 moisturizing cream bathing bar for soft hydrated skin.",
          },
        ],
      },
      {
        name: "Hair Care & Shampoos",
        slug: "hair-care-shampoos",
        image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&q=80",
        products: [
          {
            sku: "TRC-PC-002",
            name: "L'Oreal Total Repair 5 Shampoo",
            weight: "340 ml",
            unit: "bottle",
            price: 265,
            mrp: 329,
            stock: 42,
            featured: false,
            image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&q=80",
            desc: "Pro-keratin & ceramide formula that restores strength and shine.",
          },
        ],
      },
      {
        name: "Oral & Skin Care",
        slug: "oral-skin-care",
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80",
        products: [
          {
            sku: "TRC-PC-003",
            name: "Colgate MaxFresh Spicy Fresh Toothpaste",
            weight: "150 g",
            unit: "pack",
            price: 99,
            mrp: 120,
            stock: 90,
            featured: false,
            image: "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=400&q=80",
            desc: "Cooling crystal toothpaste for long-lasting fresh breath.",
          },
        ],
      },
    ],
  },
  {
    name: "Household Essentials",
    slug: "cleaning-essentials",
    position: 6,
    isFeatured: true,
    startingPrice: 49,
    icon: "🧼",
    image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&q=80",
    description: "Detergents, floor cleaners, dishwash liquids, and disinfectants",
    vendorKey: "v5",
    subcategories: [
      {
        name: "Laundry Detergents",
        slug: "laundry-detergents",
        image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&q=80",
        products: [
          {
            sku: "TRC-HE-001",
            name: "Surf Excel Matic Top Load Liquid",
            weight: "1 ltr",
            unit: "bottle",
            price: 215,
            mrp: 250,
            stock: 58,
            featured: true,
            image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&q=80",
            desc: "Low-foam liquid detergent engineered for washing machines.",
          },
        ],
      },
      {
        name: "Dishwash & Kitchen Care",
        slug: "dishwash-kitchen-care",
        image: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&q=80",
        products: [
          {
            sku: "TRC-HE-002",
            name: "Vim Lemon Dishwash Gel",
            weight: "750 ml",
            unit: "bottle",
            price: 149,
            mrp: 175,
            stock: 82,
            featured: false,
            image: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&q=80",
            desc: "Concentrated real lemon formula that removes tough grease easily.",
          },
        ],
      },
      {
        name: "Floor & Surface Cleaners",
        slug: "floor-surface-cleaners",
        image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&q=80",
        products: [
          {
            sku: "TRC-HE-003",
            name: "Dettol Antiseptic Floor Disinfectant Pine",
            weight: "975 ml",
            unit: "bottle",
            price: 185,
            mrp: 219,
            stock: 65,
            featured: false,
            image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&q=80",
            desc: "Kills 99.9% germs while leaving a fresh pine fragrance.",
          },
        ],
      },
    ],
  },
  {
    name: "Pet Care",
    slug: "pet-care",
    position: 7,
    isFeatured: false,
    startingPrice: 99,
    icon: "🐾",
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80",
    description: "Dog food, cat food, pet treats, hygiene products and pet accessories",
    vendorKey: "v5",
    subcategories: [
      {
        name: "Dog Food & Treats",
        slug: "dog-food-treats",
        image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80",
        products: [
          {
            sku: "TRC-PT-001",
            name: "Pedigree Adult Chicken & Veg Dry Dog Food",
            weight: "1.2 kg",
            unit: "pack",
            price: 279,
            mrp: 310,
            stock: 36,
            featured: false,
            foodType: "non-veg",
            isVeg: false,
            image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80",
            desc: "Complete nutrition kibble with Omega 6 & zinc for coat shine.",
          },
        ],
      },
      {
        name: "Cat Food & Litter",
        slug: "cat-food-litter",
        image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80",
        products: [
          {
            sku: "TRC-PT-002",
            name: "Whiskas Ocean Fish Adult Cat Food",
            weight: "480 g",
            unit: "pack",
            price: 185,
            mrp: 210,
            stock: 28,
            featured: false,
            foodType: "non-veg",
            isVeg: false,
            image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80",
            desc: "Crunchy fish-flavour pockets tailored for adult cats.",
          },
        ],
      },
      {
        name: "Pet Grooming & Toys",
        slug: "pet-grooming-toys",
        image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400&q=80",
        products: [
          {
            sku: "TRC-PT-003",
            name: "Captain Zack Barking Up Tick Pet Shampoo",
            weight: "200 ml",
            unit: "bottle",
            price: 249,
            mrp: 299,
            stock: 20,
            featured: false,
            image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400&q=80",
            desc: "pH-balanced herbal citronella shampoo for dogs and cats.",
          },
        ],
      },
    ],
  },
  {
    name: "Baby Care",
    slug: "baby-care",
    position: 8,
    isFeatured: false,
    startingPrice: 75,
    icon: "🍼",
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80",
    description: "Baby diapers, wet wipes, baby lotions, shampoos and infant nutrition",
    vendorKey: "v5",
    subcategories: [
      {
        name: "Diapers & Pants",
        slug: "diapers-pants",
        image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80",
        products: [
          {
            sku: "TRC-BC-001",
            name: "Pampers Active Baby Pants Size M (20 pcs)",
            weight: "20 pcs",
            unit: "pack",
            price: 349,
            mrp: 410,
            stock: 46,
            featured: true,
            image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80",
            desc: "Up to 12-hour dryness with cotton-soft breathable waistband.",
          },
        ],
      },
      {
        name: "Baby Bath & Wipes",
        slug: "baby-bath-wipes",
        image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&q=80",
        products: [
          {
            sku: "TRC-BC-002",
            name: "Himalaya Gentle Baby Wipes (72 pcs)",
            weight: "72 pcs",
            unit: "pack",
            price: 135,
            mrp: 175,
            stock: 55,
            featured: false,
            image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&q=80",
            desc: "Aloe vera & Indian lotus alcohol-free skin-safe baby wipes.",
          },
        ],
      },
      {
        name: "Baby Food & Formula",
        slug: "baby-food-formula",
        image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&q=80",
        products: [
          {
            sku: "TRC-BC-003",
            name: "Nestle Cerelac Wheat Apple Stage 1",
            weight: "300 g",
            unit: "box",
            price: 255,
            mrp: 280,
            stock: 34,
            featured: false,
            image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&q=80",
            desc: "Iron-fortified infant cereal for babies from 6 months onwards.",
          },
        ],
      },
    ],
  },
  {
    name: "Paan Corner & Mints",
    slug: "paan-corner",
    position: 9,
    isFeatured: false,
    startingPrice: 15,
    icon: "🍃",
    image: "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=400&q=80",
    description: "Mouth fresheners, digestive candies, mint sprays & chewing gums",
    vendorKey: "v4",
    subcategories: [
      {
        name: "Mouth Fresheners & Mukhwas",
        slug: "mouth-fresheners-mukhwas",
        image: "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=400&q=80",
        products: [
          {
            sku: "TRC-PN-001",
            name: "Pass Pass Sweet Magic Mouth Freshener Jar",
            weight: "120 g",
            unit: "box",
            price: 110,
            mrp: 130,
            stock: 60,
            featured: false,
            image: "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=400&q=80",
            desc: "Traditional roasted fennel, coconut & dates digestive mix.",
          },
        ],
      },
      {
        name: "Mints & Chewing Gums",
        slug: "mints-chewing-gums",
        image: "https://images.unsplash.com/photo-1575224526797-5730d09d781d?w=400&q=80",
        products: [
          {
            sku: "TRC-PN-002",
            name: "Center Fresh Spearmint Gum Bottle",
            weight: "45 pcs",
            unit: "bottle",
            price: 85,
            mrp: 100,
            stock: 84,
            featured: false,
            image: "https://images.unsplash.com/photo-1575224526797-5730d09d781d?w=400&q=80",
            desc: "Liquid-filled mint chewing gums for instant fresh breath.",
          },
        ],
      },
      {
        name: "Digestives & Candies",
        slug: "digestives-candies",
        image: "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=400&q=80",
        products: [
          {
            sku: "TRC-PN-003",
            name: "Dabur Hajmola Regular Digestive Bottle",
            weight: "120 tablets",
            unit: "bottle",
            price: 55,
            mrp: 65,
            stock: 92,
            featured: false,
            image: "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=400&q=80",
            desc: "Chatpata ayurvedic tablets for post-meal digestion.",
          },
        ],
      },
    ],
  },
  {
    name: "Cold Drinks & Juices",
    slug: "cold-drinks-juices",
    position: 10,
    isFeatured: true,
    startingPrice: 20,
    icon: "🥤",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80",
    description: "Chilled soft drinks, sparkling sodas, packaged water & real fruit juices",
    vendorKey: "v4",
    subcategories: [
      {
        name: "Soft Drinks & Soda",
        slug: "soft-drinks-soda",
        image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80",
        products: [
          {
            sku: "TRC-CD-001",
            name: "Coca-Cola Zero Sugar Can",
            weight: "300 ml",
            unit: "pcs",
            price: 38,
            mrp: 40,
            stock: 110,
            featured: true,
            image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80",
            desc: "Ice-cold fizzy Coca-Cola zero calories, served chilled.",
          },
          {
            sku: "TRC-CD-002",
            name: "Thums Up Party Bottle",
            weight: "1.25 ltr",
            unit: "bottle",
            price: 72,
            mrp: 75,
            stock: 90,
            featured: false,
            image: "https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=400&q=80",
            desc: "Strong fizzy cola beverage perfect for meals and gatherings.",
          },
        ],
      },
      {
        name: "Fruit Juices & Smoothies",
        slug: "fruit-juices-smoothies",
        image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80",
        products: [
          {
            sku: "TRC-CD-003",
            name: "Real Activ 100% Mixed Fruit Juice",
            weight: "1 ltr",
            unit: "pack",
            price: 115,
            mrp: 135,
            stock: 64,
            featured: false,
            image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80",
            desc: "No added sugar mixed fruit blend rich in Vitamin C.",
          },
        ],
      },
      {
        name: "Mineral Water & Energy Drinks",
        slug: "mineral-water-energy-drinks",
        image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80",
        products: [
          {
            sku: "TRC-CD-004",
            name: "Bisleri Packaged Drinking Water",
            weight: "1 ltr",
            unit: "bottle",
            price: 20,
            mrp: 20,
            stock: 200,
            featured: false,
            image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80",
            desc: "10-stage purified mineral drinking water bottle.",
          },
        ],
      },
    ],
  },
  {
    name: "Breakfast & Instant Food",
    slug: "breakfast-instant-food",
    position: 11,
    isFeatured: true,
    startingPrice: 28,
    icon: "🥣",
    image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&q=80",
    description: "Maggi, noodles, oats, muesli, cornflakes & ready-to-cook mixes",
    vendorKey: "v1",
    subcategories: [
      {
        name: "Noodles & Pasta",
        slug: "noodles-pasta",
        image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&q=80",
        products: [
          {
            sku: "TRC-BF-001",
            name: "MAGGI 2-Minute Masala Noodles (4-Pack)",
            weight: "280 g",
            unit: "pack",
            price: 54,
            mrp: 60,
            stock: 145,
            featured: true,
            image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&q=80",
            desc: "Classic 2-minute masala noodles loved across all ages.",
          },
        ],
      },
      {
        name: "Oats, Muesli & Cornflakes",
        slug: "oats-muesli-cornflakes",
        image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400&q=80",
        products: [
          {
            sku: "TRC-BF-002",
            name: "Quaker Rolled Oats Pouch",
            weight: "1 kg",
            unit: "pack",
            price: 169,
            mrp: 199,
            stock: 60,
            featured: false,
            image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400&q=80",
            desc: "100% wholegrain high-fibre rolled oats for healthy mornings.",
          },
        ],
      },
      {
        name: "Instant Mixes & Batters",
        slug: "instant-mixes-batters",
        image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80",
        products: [
          {
            sku: "TRC-BF-003",
            name: "iD Fresh Idli & Dosa Batter",
            weight: "1 kg",
            unit: "pack",
            price: 88,
            mrp: 98,
            stock: 38,
            featured: false,
            image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80",
            desc: "Preservative-free stone-ground fermented rice & urad dal batter.",
          },
        ],
      },
    ],
  },
  {
    name: "Sweet Tooth",
    slug: "sweet-tooth",
    position: 12,
    isFeatured: false,
    startingPrice: 35,
    icon: "🍫",
    image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&q=80",
    description: "Chocolates, Indian mithai, ice cream tubs, desserts and candies",
    vendorKey: "v4",
    subcategories: [
      {
        name: "Chocolates & Truffles",
        slug: "chocolates-truffles",
        image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&q=80",
        products: [
          {
            sku: "TRC-ST-001",
            name: "Cadbury Dairy Milk Silk Bubbly",
            weight: "112 g",
            unit: "pcs",
            price: 155,
            mrp: 175,
            stock: 85,
            featured: true,
            image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&q=80",
            desc: "Smooth aerated Belgian-style milk chocolate bar.",
          },
        ],
      },
      {
        name: "Ice Creams & Frozen Desserts",
        slug: "ice-creams-frozen-desserts",
        image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80",
        products: [
          {
            sku: "TRC-ST-002",
            name: "Amul Gold Belgian Chocolate Ice Cream Tub",
            weight: "750 ml",
            unit: "box",
            price: 195,
            mrp: 225,
            stock: 5, // Intentional Low Stock Alert!
            featured: false,
            image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80",
            desc: "Rich dark chocolate dairy ice cream loaded with choco chips.",
          },
        ],
      },
      {
        name: "Indian Mithai",
        slug: "indian-mithai",
        image: "https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?w=400&q=80",
        products: [
          {
            sku: "TRC-ST-003",
            name: "Haldiram's Tin Gulab Jamun",
            weight: "1 kg",
            unit: "box",
            price: 215,
            mrp: 245,
            stock: 44,
            featured: false,
            image: "https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?w=400&q=80",
            desc: "Melt-in-mouth khoya gulab jamuns in fragrant cardamom syrup.",
          },
        ],
      },
    ],
  },
  {
    name: "Bakery & Biscuits",
    slug: "bakery-biscuits",
    position: 13,
    isFeatured: false,
    startingPrice: 25,
    icon: "🍪",
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80",
    description: "Cookies, cream biscuits, crispy rusk, muffins, cakes & tea-time snacks",
    vendorKey: "v1",
    subcategories: [
      {
        name: "Cookies & Cream Biscuits",
        slug: "cookies-cream-biscuits",
        image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80",
        products: [
          {
            sku: "TRC-BK-001",
            name: "Britannia Good Day Butter Cookies",
            weight: "250 g",
            unit: "pack",
            price: 48,
            mrp: 60,
            stock: 112,
            featured: false,
            image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80",
            desc: "Crunchy golden baked butter cookies loaded with richness.",
          },
        ],
      },
      {
        name: "Rusk, Khari & Toast",
        slug: "rusk-khari-toast",
        image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80",
        products: [
          {
            sku: "TRC-BK-002",
            name: "Britannia Toastea Premium Elaichi Rusk",
            weight: "273 g",
            unit: "pack",
            price: 44,
            mrp: 50,
            stock: 76,
            featured: false,
            image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80",
            desc: "Twice-baked crispy wheat rusks flavoured with green cardamom.",
          },
        ],
      },
      {
        name: "Cakes & Muffins",
        slug: "cakes-muffins",
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80",
        products: [
          {
            sku: "TRC-BK-003",
            name: "Britannia Gobbles Choco Chill Slice Cake",
            weight: "120 g",
            unit: "pack",
            price: 38,
            mrp: 45,
            stock: 54,
            featured: false,
            image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80",
            desc: "Moist chocolate sponge cake slices ready to snack.",
          },
        ],
      },
    ],
  },
  {
    name: "Tea, Coffee & Drinks",
    slug: "tea-coffee-milk-drinks",
    position: 14,
    isFeatured: false,
    startingPrice: 89,
    icon: "☕",
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80",
    description: "Assam chai patti, green tea, instant coffee & nutritional milk mixes",
    vendorKey: "v1",
    subcategories: [
      {
        name: "Leaf Tea & Green Tea",
        slug: "leaf-tea-green-tea",
        image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80",
        products: [
          {
            sku: "TRC-TC-001",
            name: "Tata Tea Gold Assam Leaf Blend",
            weight: "500 g",
            unit: "pack",
            price: 255,
            mrp: 295,
            stock: 68,
            featured: true,
            image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80",
            desc: "Rich Assam CTC granules blended with 15% fragrant long leaves.",
          },
        ],
      },
      {
        name: "Instant & Roast Coffee",
        slug: "instant-roast-coffee",
        image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&q=80",
        products: [
          {
            sku: "TRC-TC-002",
            name: "Nescafe Classic 100% Pure Coffee Jar",
            weight: "90 g",
            unit: "bottle",
            price: 285,
            mrp: 325,
            stock: 52,
            featured: false,
            image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&q=80",
            desc: "Medium-dark roasted instant coffee beans for unmistakable aroma.",
          },
        ],
      },
      {
        name: "Health Drink Mixes",
        slug: "health-drink-mixes",
        image: "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400&q=80",
        products: [
          {
            sku: "TRC-TC-003",
            name: "Cadbury Bournvita Chocolate Health Drink",
            weight: "500 g",
            unit: "box",
            price: 235,
            mrp: 270,
            stock: 46,
            featured: false,
            image: "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400&q=80",
            desc: "Malted chocolate nutrition with Vitamin D, B2 & calcium.",
          },
        ],
      },
    ],
  },
  {
    name: "Masala, Oil & More",
    slug: "masala-oil-more",
    position: 15,
    isFeatured: true,
    startingPrice: 55,
    icon: "🧂",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80",
    description: "Cooking oils, cow ghee, turmeric, garam masala, salt & dry spices",
    vendorKey: "v3",
    subcategories: [
      {
        name: "Cooking Oils & Desi Ghee",
        slug: "cooking-oils-desi-ghee",
        image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80",
        products: [
          {
            sku: "TRC-MO-001",
            name: "Fortune Sunlite Refined Sunflower Oil",
            weight: "1 ltr",
            unit: "pack",
            price: 132,
            mrp: 155,
            stock: 96,
            featured: true,
            image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80",
            desc: "Light everyday cooking oil fortified with Vitamins A & D.",
          },
          {
            sku: "TRC-MO-002",
            name: "Amul Pure Cow Desi Ghee",
            weight: "500 ml",
            unit: "box",
            price: 315,
            mrp: 350,
            stock: 44,
            featured: true,
            image: "https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=400&q=80",
            desc: "Granular aromatic cow ghee crafted by India's trusted dairy.",
          },
        ],
      },
      {
        name: "Powdered & Blended Spices",
        slug: "powdered-blended-spices",
        image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80",
        products: [
          {
            sku: "TRC-MO-003",
            name: "Everest Royal Garam Masala",
            weight: "100 g",
            unit: "box",
            price: 84,
            mrp: 98,
            stock: 70,
            featured: false,
            image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80",
            desc: "Balanced aromatic spice blend for curries, paneer and dals.",
          },
        ],
      },
      {
        name: "Salt, Sugar & Jaggery",
        slug: "salt-sugar-jaggery",
        image: "https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=400&q=80",
        products: [
          {
            sku: "TRC-MO-004",
            name: "Tata Salt Vacuum Evaporated Iodised",
            weight: "1 kg",
            unit: "pack",
            price: 26,
            mrp: 28,
            stock: 160,
            featured: false,
            image: "https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=400&q=80",
            desc: "Desh ki Sehat, Desh ka Namak — clean iodine-fortified salt.",
          },
        ],
      },
    ],
  },
  {
    name: "Sauces & Spreads",
    slug: "sauces-spreads",
    position: 16,
    isFeatured: false,
    startingPrice: 75,
    icon: "🍯",
    image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400&q=80",
    description: "Tomato ketchup, mayonnaise, peanut butter, jams, pickles & pasta dips",
    vendorKey: "v3",
    subcategories: [
      {
        name: "Ketchup & Cooking Sauces",
        slug: "ketchup-cooking-sauces",
        image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400&q=80",
        products: [
          {
            sku: "TRC-SS-001",
            name: "Kissan Fresh Tomato Ketchup Squeeze",
            weight: "850 g",
            unit: "bottle",
            price: 118,
            mrp: 140,
            stock: 64,
            featured: false,
            image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400&q=80",
            desc: "Made from 100% real vine-ripened tomatoes without added starch.",
          },
        ],
      },
      {
        name: "Peanut Butter & Fruit Jams",
        slug: "peanut-butter-fruit-jams",
        image: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&q=80",
        products: [
          {
            sku: "TRC-SS-002",
            name: "Pintola All Natural Unsweetened Peanut Butter",
            weight: "350 g",
            unit: "bottle",
            price: 169,
            mrp: 199,
            stock: 42,
            featured: false,
            image: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&q=80",
            desc: "30g protein per 100g high-fibre creamy roasted peanut spread.",
          },
        ],
      },
      {
        name: "Dips, Mayo & Pickles",
        slug: "dips-mayo-pickles",
        image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&q=80",
        products: [
          {
            sku: "TRC-SS-003",
            name: "Dr. Oetker FunFoods Veg Mayonnaise",
            weight: "500 g",
            unit: "bottle",
            price: 129,
            mrp: 149,
            stock: 50,
            featured: false,
            image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&q=80",
            desc: "Silky eggless mayonnaise for sandwiches, wraps & burger dips.",
          },
        ],
      },
    ],
  },
  {
    name: "Chicken, Meat & Fish",
    slug: "chicken-meat-fish",
    position: 17,
    isFeatured: false,
    startingPrice: 169,
    icon: "🍗",
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&q=80",
    description: "Antibiotic-free fresh chicken cuts, tender mutton & hygienically packed fish",
    vendorKey: "v2",
    subcategories: [
      {
        name: "Fresh Chicken Cuts",
        slug: "fresh-chicken-cuts",
        image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&q=80",
        products: [
          {
            sku: "TRC-CM-001",
            name: "Farm Fresh Chicken Curry Cut (Skinless)",
            weight: "500 g",
            unit: "pack",
            price: 169,
            mrp: 205,
            stock: 32,
            featured: false,
            foodType: "non-veg",
            isVeg: false,
            image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&q=80",
            desc: "Chill-chain maintained antibiotic-free bone-in chicken pieces.",
          },
        ],
      },
      {
        name: "Tender Mutton",
        slug: "tender-mutton",
        image: "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400&q=80",
        products: [
          {
            sku: "TRC-CM-002",
            name: "Premium Goat Mutton Curry Cut",
            weight: "500 g",
            unit: "pack",
            price: 449,
            mrp: 499,
            stock: 18,
            featured: false,
            foodType: "non-veg",
            isVeg: false,
            image: "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400&q=80",
            desc: "Succulent rich shoulder & rib goat cuts ready for slow-cooked curry.",
          },
        ],
      },
      {
        name: "Freshwater & Sea Fish",
        slug: "freshwater-sea-fish",
        image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=80",
        products: [
          {
            sku: "TRC-CM-003",
            name: "Fresh Rohu Fish Steaks (Cleaned)",
            weight: "500 g",
            unit: "pack",
            price: 229,
            mrp: 265,
            stock: 22,
            featured: false,
            foodType: "non-veg",
            isVeg: false,
            image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=80",
            desc: "Daily catch freshwater Rohu steaks scaled, gutted, and vacuum sealed.",
          },
        ],
      },
    ],
  },
  {
    name: "Organic & Healthy Living",
    slug: "organic-healthy-living",
    position: 18,
    isFeatured: false,
    startingPrice: 95,
    icon: "🥗",
    image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&q=80",
    description: "Raw forest honey, superfoods, chia seeds, millets, dry fruits & almonds",
    vendorKey: "v2",
    subcategories: [
      {
        name: "Dry Fruits & Almonds",
        slug: "dry-fruits-almonds",
        image: "https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=400&q=80",
        products: [
          {
            sku: "TRC-OH-001",
            name: "Happilo Premium California Almonds",
            weight: "250 g",
            unit: "pack",
            price: 249,
            mrp: 315,
            stock: 58,
            featured: true,
            image: "https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=400&q=80",
            desc: "Crunchy non-pareil Grade-A California badam rich in Vitamin E.",
          },
        ],
      },
      {
        name: "Seeds & Superfoods",
        slug: "seeds-superfoods",
        image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&q=80",
        products: [
          {
            sku: "TRC-OH-002",
            name: "Organic India Raw Chia Seeds",
            weight: "200 g",
            unit: "pack",
            price: 165,
            mrp: 195,
            stock: 40,
            featured: false,
            image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&q=80",
            desc: "Plant-based Omega-3 & fibre superfood for smoothies and puddings.",
          },
        ],
      },
      {
        name: "Honey & Organic Millets",
        slug: "honey-organic-millets",
        image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80",
        products: [
          {
            sku: "TRC-OH-003",
            name: "Dabur 100% Pure Squeezy Honey",
            weight: "400 g",
            unit: "bottle",
            price: 195,
            mrp: 230,
            stock: 72,
            featured: false,
            image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80",
            desc: "NMR-tested pure natural honey with zero sugar adulteration.",
          },
        ],
      },
    ],
  },
  {
    name: "Pharma & Wellness",
    slug: "pharma-wellness",
    position: 19,
    isFeatured: false,
    startingPrice: 25,
    icon: "💊",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80",
    description: "First aid kits, pain relief balms, electrolytes, ORS, band-aids & vitamins",
    vendorKey: "v5",
    subcategories: [
      {
        name: "First Aid & Bandages",
        slug: "first-aid-bandages",
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80",
        products: [
          {
            sku: "TRC-PW-001",
            name: "Dettol Antiseptic Liquid First Aid",
            weight: "250 ml",
            unit: "bottle",
            price: 138,
            mrp: 150,
            stock: 64,
            featured: false,
            image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80",
            desc: "Doctor-recommended antiseptic solution for minor cuts & skin hygiene.",
          },
        ],
      },
      {
        name: "Hydration, ORS & Antacids",
        slug: "hydration-ors-antacids",
        image: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&q=80",
        products: [
          {
            sku: "TRC-PW-002",
            name: "Electral ORS Apple Drink Pack (Pack of 3)",
            weight: "3 x 200 ml",
            unit: "pack",
            price: 108,
            mrp: 120,
            stock: 7, // Intentional Low Stock Alert!
            featured: false,
            image: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&q=80",
            desc: "Ready-to-drink WHO-formula hydration electrolytes.",
          },
        ],
      },
      {
        name: "Pain Relief & Balms",
        slug: "pain-relief-balms",
        image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&q=80",
        products: [
          {
            sku: "TRC-PW-003",
            name: "Volini Fast Pain Relief Spray",
            weight: "60 g",
            unit: "bottle",
            price: 195,
            mrp: 215,
            stock: 46,
            featured: false,
            image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&q=80",
            desc: "Quick-absorbing spray for backache, sprains, and muscle soreness.",
          },
        ],
      },
    ],
  },
  {
    name: "Home & Office",
    slug: "home-office",
    position: 20,
    isFeatured: false,
    startingPrice: 39,
    icon: "💡",
    image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80",
    description: "Alkaline batteries, LED bulbs, notebooks, pens, tissues & kitchen foils",
    vendorKey: "v5",
    subcategories: [
      {
        name: "Batteries & Electricals",
        slug: "batteries-electricals",
        image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80",
        products: [
          {
            sku: "TRC-HO-001",
            name: "Duracell Ultra Alkaline AA Batteries (Pack of 4)",
            weight: "4 pcs",
            unit: "pack",
            price: 165,
            mrp: 190,
            stock: 54,
            featured: false,
            image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80",
            desc: "Long-lasting Duralock alkaline cells for remotes and clocks.",
          },
        ],
      },
      {
        name: "Stationery & Notebooks",
        slug: "stationery-notebooks",
        image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&q=80",
        products: [
          {
            sku: "TRC-HO-002",
            name: "Classmate Single Line Long Notebook (172 Pages)",
            weight: "1 pc",
            unit: "pcs",
            price: 62,
            mrp: 70,
            stock: 80,
            featured: false,
            image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&q=80",
            desc: "High-brightness elemental chlorine-free spiral-bound notebook.",
          },
        ],
      },
      {
        name: "Tissues & Kitchen Foils",
        slug: "tissues-kitchen-foils",
        image: "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=400&q=80",
        products: [
          {
            sku: "TRC-HO-003",
            name: "Origami 2-Ply Facial Tissue Car & Desk Box",
            weight: "100 pulls",
            unit: "box",
            price: 92,
            mrp: 110,
            stock: 68,
            featured: false,
            image: "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=400&q=80",
            desc: "Ultra-soft absorbent 2-ply virgin pulp facial tissues.",
          },
        ],
      },
    ],
  },
];

// Additional curated SKUs per category to reach 70+ rich grocery products across all vendors
const EXTRA_PRODUCTS = [
  {
    sku: "TRC-FV-006",
    catSlug: "fruits-vegetables",
    subSlug: "fresh-vegetables",
    vendorKey: "v2",
    name: "Nasik Red Onion",
    weight: "1 kg",
    unit: "kg",
    price: 39,
    mrp: 50,
    stock: 120,
    featured: true,
    image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&q=80",
    desc: "Pungent medium-sized red onions sorted for zero spoilage.",
  },
  {
    sku: "TRC-FV-007",
    catSlug: "fruits-vegetables",
    subSlug: "fresh-fruits",
    vendorKey: "v2",
    name: "Seedless Green Grapes",
    weight: "500 g",
    unit: "g",
    price: 74,
    mrp: 95,
    stock: 46,
    featured: false,
    image: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&q=80",
    desc: "Sweet, crisp seedless Sonaka grapes packed hygienically.",
  },
  {
    sku: "TRC-DB-007",
    catSlug: "dairy-bread-eggs",
    subSlug: "milk-curd",
    vendorKey: "v1",
    name: "Amul Gold Full Cream Milk",
    weight: "1 ltr",
    unit: "ltr",
    price: 66,
    mrp: 68,
    stock: 98,
    featured: false,
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80",
    desc: "6% rich milk fat ideal for thick tea, coffee and kheer.",
  },
  {
    sku: "TRC-SM-005",
    catSlug: "snacks-munchies",
    subSlug: "potato-chips-crisps",
    vendorKey: "v4",
    name: "Kurkure Masala Munch Family Bag",
    weight: "150 g",
    unit: "pack",
    price: 36,
    mrp: 40,
    stock: 110,
    featured: false,
    image: "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400&q=80",
    desc: "Crunchy puffed corn & rice collets spiced with zesty masala.",
  },
  {
    sku: "TRC-CD-005",
    catSlug: "cold-drinks-juices",
    subSlug: "fruit-juices-smoothies",
    vendorKey: "v4",
    name: "Paper Boat Swing Lush Mango",
    weight: "600 ml",
    unit: "bottle",
    price: 38,
    mrp: 45,
    stock: 80,
    featured: false,
    image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=400&q=80",
    desc: "Chilled thick Alphonso mango drink with zero preservatives.",
  },
  {
    sku: "TRC-BF-004",
    catSlug: "breakfast-instant-food",
    subSlug: "oats-muesli-cornflakes",
    vendorKey: "v1",
    name: "Kellogg's Original Corn Flakes",
    weight: "475 g",
    unit: "box",
    price: 179,
    mrp: 205,
    stock: 48,
    featured: false,
    image: "https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=400&q=80",
    desc: "Golden toasted corn flakes enriched with Iron and 8 essential vitamins.",
  },
  {
    sku: "TRC-MO-005",
    catSlug: "masala-oil-more",
    subSlug: "powdered-blended-spices",
    vendorKey: "v3",
    name: "Tata Sampann Turmeric Powder (Haldi)",
    weight: "200 g",
    unit: "pack",
    price: 68,
    mrp: 82,
    stock: 76,
    featured: false,
    image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&q=80",
    desc: "Sourced from Salem with guaranteed 3% natural curcumin content.",
  },
  {
    sku: "TRC-HE-004",
    catSlug: "cleaning-essentials",
    subSlug: "floor-surface-cleaners",
    vendorKey: "v5",
    name: "Harpic Power Plus Toilet Cleaner Original",
    weight: "1 ltr",
    unit: "bottle",
    price: 192,
    mrp: 215,
    stock: 72,
    featured: false,
    image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&q=80",
    desc: "10x better stain removal and hospital-grade disinfection.",
  },
];

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function seedDatabase() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGO_URI);
  console.log("Connected to DB:", mongoose.connection.name);

  const hashedPassword = await bcrypt.hash("Tricelyn@123", 10);

  // -------------------------------------------------------------------------
  // 1. Admin Settings
  // -------------------------------------------------------------------------
  console.log("1. Updating AdminSettings...");
  let adminSetting = await AdminSetting.findOne({});
  if (!adminSetting) {
    adminSetting = new AdminSetting({});
  }
  adminSetting.appName = "Tricelyn";
  adminSetting.platformMode = "grocery";
  adminSetting.primaryVertical = "grocery";
  adminSetting.enableGroceryDelivery = true;
  adminSetting.enableFoodDelivery = false;
  adminSetting.isCodEnabled = true;
  adminSetting.metaTitle = "Tricelyn - Instant Grocery & Hyperlocal Delivery";
  adminSetting.metaDescription = "Tricelyn | Multi-Vendor Quick Commerce Grocery Delivery";
  adminSetting.siteEmail = "care@tricelyn.com";
  adminSetting.siteContact = "+91 731-4099880";
  adminSetting.orderPrefix = "TRC";
  await adminSetting.save();

  // -------------------------------------------------------------------------
  // 2. City (Indore) + 5 ServiceAreas
  // -------------------------------------------------------------------------
  console.log("2. Seeding Indore City, Zones & 5 ServiceAreas...");
  const serviceAreaDocs = [];
  const cityZones = [];

  for (const z of INDORE_ZONES) {
    const d = 0.025;
    const polygonCoords = [
      [
        [z.lng - d, z.lat - d],
        [z.lng + d, z.lat - d],
        [z.lng + d, z.lat + d],
        [z.lng - d, z.lat + d],
        [z.lng - d, z.lat - d],
      ],
    ];
    cityZones.push({
      name: z.name,
      supportedVerticals: ["grocery", "essentials", "medicine", "gifts_bakery"],
      isActive: true,
      deliveryCharges: [
        { min: 0, max: 3, price: 20, type: "flat" },
        { min: 3, max: 8, price: 35, type: "distance" },
      ],
      polygon: { type: "Polygon", coordinates: polygonCoords },
      center: { type: "Point", coordinates: [z.lng, z.lat] },
    });

    const sa = await ServiceArea.findOneAndUpdate(
      { city: "Indore", zone: z.name, pincode: z.pincode },
      {
        $set: {
          state: "Madhya Pradesh",
          district: "Indore",
          city: "Indore",
          zone: z.name,
          pincode: z.pincode,
          isServiceActive: true,
          deliveryRadiusKm: 8,
          baseDeliveryFee: 25,
          minimumOrderValue: 99,
          peakCharge: 0,
          coordinates: { lat: z.lat, lng: z.lng },
        },
      },
      { upsert: true, new: true }
    );
    serviceAreaDocs.push(sa);
  }

  await City.findOneAndUpdate(
    { name: "Indore", country: "India" },
    {
      $set: {
        name: "Indore",
        state: "Madhya Pradesh",
        country: "India",
        isActive: true,
        isDefault: true,
        slug: "indore",
        zones: cityZones,
      },
    },
    { upsert: true, new: true }
  );

  // -------------------------------------------------------------------------
  // 3. 5 Customers (role: customer)
  // -------------------------------------------------------------------------
  console.log("3. Seeding 5 Customers...");
  const customerDocs = [];
  for (const c of CUSTOMERS) {
    const zone = INDORE_ZONES[c.zoneIndex];
    let user = await User.findOne({ $or: [{ email: c.email }, { mobile: c.mobile }] });
    if (!user) {
      user = new User({ email: c.email, mobile: c.mobile });
    }
    user.customerId = c.customerId;
    user.firstName = c.firstName;
    user.lastName = c.lastName;
    user.name = `${c.firstName} ${c.lastName}`;
    user.email = c.email;
    user.mobile = c.mobile;
    user.phone = c.mobile;
    user.password = hashedPassword;
    user.pin = "1234";
    user.role = "customer";
    user.walletBalance = c.walletBalance;
    user.rewardPoints = c.rewardPoints;
    user.loyaltyPoints = c.rewardPoints;
    user.isVerified = true;
    user.isBlocked = false;
    user.isDeleted = false;
    user.codActive = true;
    user.isCodBlocked = false;
    user.savedAddresses = [
      {
        label: "Home",
        addressLine: c.addressLine,
        fullAddress: `${c.addressLine}, ${zone.addressSuffix}`,
        landmark: c.landmark,
        city: "Indore",
        state: "Madhya Pradesh",
        pincode: zone.pincode,
        zipCode: zone.pincode,
        phone: c.mobile,
        location: { type: "Point", coordinates: [zone.lng, zone.lat] },
        isDefault: true,
      },
    ];
    await user.save();
    customerDocs.push(user);
  }

  // -------------------------------------------------------------------------
  // 4. 5 Vendors + 5 Linked Owner Users (role: restaurant_owner)
  // -------------------------------------------------------------------------
  console.log("4. Seeding 5 Grocery Vendors + Owner Accounts...");
  const vendorByKey = new Map();

  for (const v of VENDORS) {
    const zone = INDORE_ZONES[v.zoneIndex];
    let ownerUser = await User.findOne({ $or: [{ email: v.ownerEmail }, { mobile: v.ownerMobile }] });
    if (!ownerUser) {
      ownerUser = new User({ email: v.ownerEmail, mobile: v.ownerMobile });
    }
    const nameParts = v.ownerName.split(" ");
    ownerUser.firstName = nameParts[0];
    ownerUser.lastName = nameParts.slice(1).join(" ");
    ownerUser.name = v.ownerName;
    ownerUser.email = v.ownerEmail;
    ownerUser.mobile = v.ownerMobile;
    ownerUser.phone = v.ownerMobile;
    ownerUser.password = hashedPassword;
    ownerUser.pin = v.pin;
    ownerUser.role = "restaurant_owner";
    ownerUser.isVerified = true;
    ownerUser.isBlocked = false;
    ownerUser.isDeleted = false;
    await ownerUser.save();

    let rest = await Restaurant.findOne({
      $or: [{ slug: v.slug }, { restaurantId: v.restaurantId }, { owner: ownerUser._id }],
    });
    if (!rest) {
      rest = new Restaurant({ slug: v.slug, restaurantId: v.restaurantId });
    }
    rest.owner = ownerUser._id;
    rest.restaurantId = v.restaurantId;
    rest.slug = v.slug;
    rest.name = { en: v.name };
    rest.description = { en: v.description };
    rest.restaurantType = "grocery_store";
    rest.businessType = "grocery_store";
    rest.vertical = "grocery";
    rest.brand = v.name;
    rest.image = v.image;
    rest.logo = v.image;
    rest.bannerImage = v.bannerImage;
    rest.restaurantImages = [v.image, v.bannerImage];
    rest.email = v.ownerEmail;
    rest.contactNumber = v.ownerMobile;
    rest.phone = v.ownerMobile;
    rest.ownerName = v.ownerName;
    rest.ownerEmail = v.ownerEmail;
    rest.ownerMobile = v.ownerMobile;
    rest.ownerPin = v.pin;
    rest.pin = v.pin;
    rest.restaurantKey = v.pin;
    rest.upi = v.upi;
    rest.address = v.address;
    rest.city = "Indore";
    rest.state = "Madhya Pradesh";
    rest.area = v.area;
    rest.location = { type: "Point", coordinates: [zone.lng, zone.lat] };
    rest.deliveryTime = v.deliveryTime;
    rest.estimatedPreparationTime = 8;
    rest.geofenceRadius = 8;
    rest.deliveringZones = [zone.name, "Indore"];
    rest.deliveryType = ["Home Delivery", "Pickup", "Both"];
    rest.isSelfPickupEnabled = true;
    rest.paymentMethods = "Both";
    rest.adminCommission = 12;
    rest.minOrderValue = 99;
    rest.isActive = true;
    rest.isOnline = true;
    rest.isFeatured = true;
    rest.isTemporarilyClosed = false;
    rest.restaurantApproved = true;
    rest.menuApproved = true;
    rest.autoApproveMenu = true;
    rest.verificationStatus = "verified";
    rest.avgRating = v.ratingAvg;
    rest.rating = {
      average: v.ratingAvg,
      count: v.ratingCount,
      breakdown: { five: Math.round(v.ratingCount * 0.72), four: Math.round(v.ratingCount * 0.2), three: Math.round(v.ratingCount * 0.05), two: Math.round(v.ratingCount * 0.02), one: Math.round(v.ratingCount * 0.01) },
    };
    rest.timing = ALL_WEEK_TIMING;
    rest.offers = v.offers;
    rest.bankDetails = {
      accountName: v.name,
      bankName: "HDFC Bank",
      branchName: `${v.area}, Indore`,
      accountNumber: `50200048${v.restaurantId.slice(-3)}10`,
      routingNumber: "HDFC0000248",
      swiftCode: "HDFCINBB",
    };
    rest.documents = {
      license: { url: v.image, number: v.fssai },
      pan: { url: v.image, number: v.pan },
      gst: { url: v.image, number: v.gst },
    };
    rest.taxConfig = { gstNumber: v.gst, gstPercent: 5 };
    rest.product = [];
    await rest.save();

    vendorByKey.set(v.key, rest);
  }

  // -------------------------------------------------------------------------
  // 5. 5 Delivery Partners (Riders + Linked Rider Users)
  // -------------------------------------------------------------------------
  console.log("5. Seeding 5 Delivery Partners (Riders)...");
  const riderDocs = [];
  for (const r of RIDERS) {
    const zone = INDORE_ZONES[r.zoneIndex];
    const saDoc = serviceAreaDocs[r.zoneIndex];
    const nameParts = r.name.split(" ");

    let riderUser = await User.findOne({ $or: [{ email: r.email }, { mobile: r.mobile }] });
    if (!riderUser) {
      riderUser = new User({ email: r.email, mobile: r.mobile });
    }
    riderUser.firstName = nameParts[0];
    riderUser.lastName = nameParts.slice(1).join(" ");
    riderUser.name = r.name;
    riderUser.email = r.email;
    riderUser.mobile = r.mobile;
    riderUser.phone = r.mobile;
    riderUser.password = hashedPassword;
    riderUser.pin = r.pin;
    riderUser.role = "rider";
    riderUser.profilePic = r.profilePic;
    riderUser.avatar = r.profilePic;
    riderUser.isVerified = true;
    riderUser.isBlocked = false;
    riderUser.isDeleted = false;
    await riderUser.save();

    let riderDoc = await Rider.findOne({ $or: [{ riderId: r.riderId }, { user: riderUser._id }] });
    if (!riderDoc) {
      riderDoc = new Rider({ user: riderUser._id, riderId: r.riderId });
    }
    riderDoc.user = riderUser._id;
    riderDoc.riderId = r.riderId;
    riderDoc.name = r.name;
    riderDoc.email = r.email;
    riderDoc.mobile = r.mobile;
    riderDoc.phone = r.mobile;
    riderDoc.pin = r.pin;
    riderDoc.profilePic = r.profilePic;
    riderDoc.profileImage = r.profilePic;
    riderDoc.avatar = r.profilePic;
    riderDoc.workCity = "Indore";
    riderDoc.workZone = zone.name;
    riderDoc.serviceArea = saDoc._id;
    riderDoc.riderVerified = true;
    riderDoc.verificationStatus = "approved";
    riderDoc.isOnline = true;
    riderDoc.isAvailable = true;
    riderDoc.breakMode = false;
    riderDoc.currentLocation = { type: "Point", coordinates: [zone.lng, zone.lat] };
    riderDoc.lastLocationUpdateAt = new Date();
    riderDoc.address = {
      street: zone.name,
      city: "Indore",
      state: "Madhya Pradesh",
      pincode: zone.pincode,
    };
    riderDoc.permanentAddress = {
      addressLine: `Quarter 14, ${zone.name}`,
      city: "Indore",
      state: "Madhya Pradesh",
      pincode: zone.pincode,
    };
    riderDoc.localAddress = {
      addressLine: `Quarter 14, ${zone.name}`,
      city: "Indore",
      state: "Madhya Pradesh",
      pincode: zone.pincode,
    };
    riderDoc.emergencyContactNumber = "+919826099999";
    riderDoc.vehicle = {
      type: r.vehicleType,
      model: r.vehicleModel,
      number: r.vehicleNumber,
      regNumber: r.vehicleNumber,
      color: r.vehicleColor,
      vehicleVerified: true,
      vehicleApproval: { status: "approved", verifiedAt: new Date() },
    };
    riderDoc.documents = {
      license: { number: `MP09-DL-${r.riderId}`, frontUrl: r.profilePic, verified: true, verifiedAt: new Date() },
      rc: { number: r.vehicleNumber, frontUrl: r.profilePic, verified: true, verifiedAt: new Date() },
      insurance: { number: `INS-${r.riderId}-2026`, frontUrl: r.profilePic, verified: true, verifiedAt: new Date() },
      panCard: { number: `ABCDE${r.riderId.slice(-3)}1F`, frontUrl: r.profilePic, verified: true, verifiedAt: new Date() },
      aadharCard: { number: `XXXX-XXXX-${r.pin}`, frontUrl: r.profilePic, verified: true, verifiedAt: new Date() },
    };
    riderDoc.bankDetails = {
      accountHolderName: r.name,
      bankName: "State Bank of India",
      accountNumber: `38920014${r.riderId.slice(-3)}9`,
      ifscCode: "SBIN0003018",
      upiId: r.upi,
      verified: true,
      verificationStatus: "verified",
    };
    riderDoc.averageRating = r.rating;
    riderDoc.rating = {
      average: r.rating,
      count: r.totalDeliveries,
      breakdown: { five: r.totalDeliveries - 6, four: 5, three: 1, two: 0, one: 0 },
    };
    riderDoc.totalDeliveries = r.totalDeliveries;
    riderDoc.totalOrders = r.totalDeliveries;
    riderDoc.totalEarnings = r.totalEarnings;
    riderDoc.currentBalance = r.currentBalance;
    await riderDoc.save();
    riderDocs.push(riderDoc);
  }

  // -------------------------------------------------------------------------
  // 6. 20 Main Categories + 60 Subcategories + Products Mapped to Vendors
  // -------------------------------------------------------------------------
  console.log("6. Seeding 20 Main Categories, 60 Subcategories & All Products...");
  const mainCatBySlug = new Map();
  const subCatBySlug = new Map();
  const vendorProductIdsMap = new Map(VENDORS.map((v) => [v.key, []]));
  const vendorCatNamesMap = new Map(VENDORS.map((v) => [v.key, new Set()]));
  let totalMainCats = 0;
  let totalSubCats = 0;
  let totalProducts = 0;

  for (const catSpec of CATALOG_TREE) {
    const ownerVendor = vendorByKey.get(catSpec.vendorKey);

    let mainCat = await Category.findOne({ slug: catSpec.slug, type: "main" });
    if (!mainCat) {
      mainCat = new Category({ slug: catSpec.slug, type: "main" });
    }
    mainCat.name = catSpec.name;
    mainCat.slug = catSpec.slug;
    mainCat.vertical = "grocery";
    mainCat.type = "main";
    mainCat.parentCategoryId = null;
    mainCat.restaurant = ownerVendor._id;
    mainCat.description = catSpec.description;
    mainCat.image = catSpec.image;
    mainCat.icon = catSpec.icon;
    mainCat.startingPrice = catSpec.startingPrice;
    mainCat.position = catSpec.position;
    mainCat.isActive = true;
    mainCat.isVisible = true;
    mainCat.isFeatured = Boolean(catSpec.isFeatured);
    mainCat.userAppVisible = true;
    mainCat.restaurantAppVisible = true;
    mainCat.approvalStatus = "approved";

    // Create / Update Child Subcategories
    const embeddedSubs = [];
    for (let sIdx = 0; sIdx < catSpec.subcategories.length; sIdx++) {
      const subSpec = catSpec.subcategories[sIdx];
      let subCat = await Category.findOne({ slug: subSpec.slug, type: "subcategory" });
      if (!subCat) {
        subCat = new Category({ slug: subSpec.slug, type: "subcategory" });
      }
      subCat.name = subSpec.name;
      subCat.slug = subSpec.slug;
      subCat.vertical = "grocery";
      subCat.type = "subcategory";
      subCat.parentCategoryId = mainCat._id;
      subCat.restaurant = ownerVendor._id;
      subCat.description = `${subSpec.name} under ${catSpec.name}`;
      subCat.image = subSpec.image;
      subCat.icon = catSpec.icon;
      subCat.startingPrice = catSpec.startingPrice;
      subCat.position = sIdx + 1;
      subCat.isActive = true;
      subCat.isVisible = true;
      subCat.isFeatured = false;
      subCat.userAppVisible = true;
      subCat.restaurantAppVisible = true;
      subCat.approvalStatus = "approved";
      await subCat.save();

      totalSubCats++;
      subCatBySlug.set(subSpec.slug, subCat);
      embeddedSubs.push({
        name: subSpec.name,
        image: subSpec.image,
        isActive: true,
        priority: sIdx + 1,
      });

      // Seed products for this subcategory
      for (const pSpec of subSpec.products) {
        await upsertProduct({
          pSpec,
          ownerVendor,
          vendorKey: catSpec.vendorKey,
          mainCat,
          subCat,
          vendorProductIdsMap,
          vendorCatNamesMap,
        });
        totalProducts++;
      }
    }

    mainCat.subcategories = embeddedSubs;
    await mainCat.save();
    mainCatBySlug.set(catSpec.slug, mainCat);
    totalMainCats++;
  }

  // Seed Extra Curated Products
  for (const ep of EXTRA_PRODUCTS) {
    const ownerVendor = vendorByKey.get(ep.vendorKey);
    const mainCat = mainCatBySlug.get(ep.catSlug);
    const subCat = subCatBySlug.get(ep.subSlug);
    if (ownerVendor && mainCat && subCat) {
      await upsertProduct({
        pSpec: ep,
        ownerVendor,
        vendorKey: ep.vendorKey,
        mainCat,
        subCat,
        vendorProductIdsMap,
        vendorCatNamesMap,
      });
      totalProducts++;
    }
  }

  // Sync Restaurant.product, categories & priceRange for all 5 vendors
  for (const v of VENDORS) {
    const rest = vendorByKey.get(v.key);
    const prodIds = vendorProductIdsMap.get(v.key) || [];
    const prodPrices = await Product.find({ _id: { $in: prodIds } }).select("basePrice").lean();
    const nums = prodPrices.map((p) => Number(p.basePrice || 0)).filter((n) => n > 0);
    const minP = nums.length ? Math.min(...nums) : 0;
    const maxP = nums.length ? Math.max(...nums) : 0;
    const avgP = nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : 0;

    await Restaurant.findByIdAndUpdate(rest._id, {
      $set: {
        product: prodIds,
        categories: Array.from(vendorCatNamesMap.get(v.key) || []),
        cuisine: Array.from(vendorCatNamesMap.get(v.key) || []),
        priceRange: {
          min: minP,
          max: maxP,
          average: avgP,
          lastCalculated: new Date(),
        },
      },
    });
  }

  // -------------------------------------------------------------------------
  // 7. Supporting Masters: Banners, Promocodes, Units & Brands
  // -------------------------------------------------------------------------
  console.log("7. Seeding Banners, Promocodes, Units & Brands...");
  await Banner.deleteMany({});
  await Banner.insertMany([
    {
      title: "Groceries in Minutes.",
      subtitle: "Fresh produce, daily dairy & trusted Indian brands delivered in 10-15 mins across Indore.",
      badge: "10-15 MIN EXPRESS",
      buttonText: "Shop Now",
      link: "/categories",
      type: "static",
      placement: "hero",
      bgGradient: "from-[#002b80] via-[#0055ff] to-[#38bdf8]",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1000&q=80",
      city: "Indore",
      cityName: "Indore",
      isActive: true,
      position: 1,
    },
    {
      title: "Farm Fresh Produce",
      subtitle: "Morning-picked fruits, hydroponic greens & seasonal organic veggies.",
      badge: "UP TO 40% OFF",
      buttonText: "Order Fresh",
      link: "/category/fruits-vegetables",
      type: "category",
      placement: "hero",
      bgGradient: "from-[#065f46] via-[#10b981] to-[#34d399]",
      image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1000&q=80",
      city: "Indore",
      cityName: "Indore",
      isActive: true,
      position: 2,
    },
    {
      title: "Fresh Fruits & Vegetables",
      subtitle: "Farm-to-table produce picked daily",
      badge: "UP TO 40% OFF",
      buttonText: "Shop Now",
      link: "/category/fruits-vegetables",
      type: "category",
      placement: "offer_card",
      bgGradient: "from-[#0066ff] via-[#0052cc] to-[#003d99]",
      image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&q=80",
      city: "Indore",
      isActive: true,
      position: 1,
    },
    {
      title: "Daily Pantry Essentials",
      subtitle: "Chakki atta, basmati rice, pure ghee & pulses",
      badge: "SAVE EVERYDAY",
      buttonText: "Shop Now",
      link: "/category/atta-rice-dal",
      type: "category",
      placement: "offer_card",
      bgGradient: "from-[#0a2558] via-[#0d3477] to-[#124296]",
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80",
      city: "Indore",
      isActive: true,
      position: 2,
    },
    {
      title: "Top FMCG Brands",
      subtitle: "Amul, Tata Sampann, Nestle & Haldiram's",
      badge: "LOWER PRICES",
      buttonText: "Shop Now",
      link: "/category/snacks-munchies",
      type: "category",
      placement: "offer_card",
      bgGradient: "from-[#0070f3] via-[#005ce6] to-[#0047b3]",
      image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&q=80",
      city: "Indore",
      isActive: true,
      position: 3,
    },
  ]);

  const now = new Date();
  const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  const promos = [
    {
      title: "Flat ₹50 Off Welcome Order",
      description: "Get flat ₹50 off on your first Tricelyn grocery basket above ₹299",
      code: "WELCOME50",
      offerType: "amount",
      discountValue: 50,
      maxDiscountAmount: 50,
      minOrderValue: 299,
      usageLimitPerUser: 1,
    },
    {
      title: "20% Off Daily Essentials",
      description: "Save 20% up to ₹150 across all grocery hubs",
      code: "TRICELYN20",
      offerType: "percent",
      discountValue: 20,
      maxDiscountAmount: 150,
      minOrderValue: 499,
      usageLimitPerUser: 5,
    },
    {
      title: "Zero Delivery Fee",
      description: "Free express delivery on orders above ₹199",
      code: "FREEDEL",
      offerType: "free_delivery",
      discountValue: 30,
      maxDiscountAmount: 40,
      minOrderValue: 199,
      usageLimitPerUser: 10,
    },
    {
      title: "Fresh Produce ₹100 Saver",
      description: "Save ₹100 on monthly family ration & organic orders above ₹999",
      code: "FRESH100",
      offerType: "amount",
      discountValue: 100,
      maxDiscountAmount: 100,
      minOrderValue: 999,
      usageLimitPerUser: 3,
    },
  ];
  for (const p of promos) {
    await Promocode.findOneAndUpdate(
      { code: p.code },
      {
        $set: {
          ...p,
          availableFrom: now,
          expiryDate: nextYear,
          status: "active",
          fundingSource: "ECDKART",
        },
      },
      { upsert: true, new: true }
    );
  }

  for (const sym of ["kg", "g", "ltr", "ml", "pcs", "pack", "box", "bottle", "tray"]) {
    await Unit.findOneAndUpdate({ symbol: sym }, { $set: { symbol: sym, status: "active" } }, { upsert: true });
  }

  for (const bName of [
    "Amul",
    "Tata Sampann",
    "Aashirvaad",
    "Fortune",
    "Haldiram's",
    "Britannia",
    "Lay's",
    "Nestle",
    "Dabur",
    "Dettol",
    "Pampers",
    "Pedigree",
  ]) {
    await Brand.findOneAndUpdate({ name: bName }, { $set: { name: bName, status: "active" } }, { upsert: true });
  }

  // Keep ID counters synchronized cleanly
  await Counter.findByIdAndUpdate("customer", { $set: { seq: CUSTOMERS.length } }, { upsert: true });
  await Counter.findByIdAndUpdate("restaurant", { $set: { seq: VENDORS.length } }, { upsert: true });
  await Counter.findByIdAndUpdate("rider", { $set: { seq: RIDERS.length } }, { upsert: true });

  // -------------------------------------------------------------------------
  // Verification Summary
  // -------------------------------------------------------------------------
  const counts = {
    customers: await User.countDocuments({ role: "customer", isDeleted: { $ne: true } }),
    vendorOwners: await User.countDocuments({ role: "restaurant_owner", isDeleted: { $ne: true } }),
    vendors: await Restaurant.countDocuments({ vertical: "grocery" }),
    riders: await Rider.countDocuments({}),
    mainCategories: await Category.countDocuments({ type: "main" }),
    subcategories: await Category.countDocuments({ type: "subcategory" }),
    products: await Product.countDocuments({ vertical: "grocery" }),
    banners: await Banner.countDocuments({}),
    promocodes: await Promocode.countDocuments({}),
    serviceAreas: await ServiceArea.countDocuments({}),
  };

  console.log("\n=== TRICELYN ATLAS SEED COMPLETE ===");
  console.table(counts);
  console.log(`Processed Main Categories: ${totalMainCats}, Subcategories: ${totalSubCats}, Products: ${totalProducts}`);

  for (const v of VENDORS) {
    const rest = await Restaurant.findById(vendorByKey.get(v.key)._id).select("restaurantId name product").lean();
    console.log(`Vendor ${rest.restaurantId} | ${rest.name?.en || rest.name} -> Products: ${rest.product?.length || 0}`);
  }

  await mongoose.disconnect();
  console.log("Disconnected cleanly.");
}

async function upsertProduct({
  pSpec,
  ownerVendor,
  vendorKey,
  mainCat,
  subCat,
  vendorProductIdsMap,
  vendorCatNamesMap,
}) {
  const discountPercent = pSpec.mrp > pSpec.price ? Math.round(((pSpec.mrp - pSpec.price) / pSpec.mrp) * 100) : 0;
  const b2bPrice = Math.max(10, Math.round(pSpec.price * 0.88));
  const barcode = `890${pSpec.sku.replace(/[^0-9]/g, "").padStart(9, "0")}`;

  const updateFields = {
    restaurant: ownerVendor._id,
    vertical: "grocery",
    sku: pSpec.sku,
    barcode,
    weight: pSpec.weight,
    unit: pSpec.unit || "pcs",
    stockQuantity: pSpec.stock !== undefined ? pSpec.stock : 60,
    lowStockThreshold: 10,
    inStock: true,
    outOfStock: false,
    available: true,
    variants:
      Array.isArray(pSpec.variants) && pSpec.variants.length > 0
        ? pSpec.variants
        : [
            {
              name: pSpec.weight,
              sku: pSpec.sku,
              price: pSpec.price,
              mrp: pSpec.mrp,
              stockQuantity: pSpec.stock !== undefined ? pSpec.stock : 60,
              unit: pSpec.unit || "pcs",
              inStock: true,
            },
          ],
    category: mainCat._id,
    categoryId: mainCat._id,
    categorySlug: mainCat.slug,
    subcategoryId: subCat._id,
    subcategory: subCat.name,
    name: { en: pSpec.name },
    description: { en: pSpec.desc },
    image: pSpec.image,
    basePrice: pSpec.price,
    mrp: pSpec.mrp,
    sellingPrice: pSpec.price,
    offerPrice: pSpec.price,
    b2bPrice,
    discountPercent,
    discountAmount: Math.max(0, pSpec.mrp - pSpec.price),
    pricing: {
      b2c: {
        mrp: pSpec.mrp,
        sellingPrice: pSpec.price,
        discountPercent,
      },
      b2b: {
        sellingPrice: b2bPrice,
        discountPercent: 12,
      },
    },
    foodType: pSpec.foodType || "veg",
    isVeg: pSpec.isVeg !== undefined ? pSpec.isVeg : true,
    isFeatured: Boolean(pSpec.featured),
    isApproved: true,
    isPublished: true,
    isRejected: false,
    approvalStatus: "approved",
    approvedAt: new Date(),
  };

  const doc = await Product.findOneAndUpdate(
    { sku: pSpec.sku },
    { $set: updateFields },
    { upsert: true, new: true }
  );

  vendorProductIdsMap.get(vendorKey).push(doc._id);
  vendorCatNamesMap.get(vendorKey).add(mainCat.name);
  return doc;
}

seedDatabase().catch(async (err) => {
  console.error("SEED FAILED:", err);
  try {
    await mongoose.disconnect();
  } catch (_) {}
  process.exit(1);
});

