const Category = require("../models/Category");
const Product = require("../models/Product");
const AuditLog = require("../models/AuditLog");
const { uploadToImageKit } = require("../utils/imagekit");
const { VERTICALS } = require("../constants/verticals");

// Helper slugify
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
};

// Socket notification helper
const emitCategoryChange = (req) => {
  try {
    const io = req.app.get("io");
    if (io) {
      io.emit("home_cms:updated", { type: "categories" });
      io.emit("category:updated", { type: "category" });
    }
  } catch (e) {
    console.error("Socket emit error in categoryController:", e);
  }
};

// ------------------------------------------------------------------
// PUBLIC / CLIENT APIs
// ------------------------------------------------------------------

/**
 * GET /api/categories/tree
 * Returns full active category tree (Main categories + nested active subcategories)
 */
exports.getCategoriesTree = async (req, res) => {
  try {
    const { vertical } = req.query;
    const filter = {
      type: "main",
      isActive: true,
      isVisible: { $ne: false },
      userAppVisible: { $ne: false },
    };
    if (vertical && vertical !== "all") {
      filter.vertical = vertical;
    }

    const mainCategories = await Category.find(filter)
      .sort({ position: 1, createdAt: 1 })
      .lean();

    const mainCategoryIds = mainCategories.map((c) => c._id);

    const subFilter = {
      type: "subcategory",
      parentCategoryId: { $in: mainCategoryIds },
      isActive: true,
      isVisible: { $ne: false },
      userAppVisible: { $ne: false },
    };
    if (vertical && vertical !== "all") {
      subFilter.vertical = vertical;
    }

    const subcategories = await Category.find(subFilter)
      .sort({ position: 1, createdAt: 1 })
      .lean();

    const subcategoryMap = {};
    subcategories.forEach((sub) => {
      const parentId = sub.parentCategoryId.toString();
      if (!subcategoryMap[parentId]) {
        subcategoryMap[parentId] = [];
      }
      subcategoryMap[parentId].push({
        _id: sub._id,
        id: sub._id,
        name: sub.name,
        slug: sub.slug,
        vertical: sub.vertical || "food",
        description: sub.description,
        image: sub.image,
        icon: sub.icon,
        position: sub.position,
        isActive: sub.isActive,
        isFeatured: sub.isFeatured,
      });
    });

    const tree = mainCategories.map((cat) => ({
      _id: cat._id,
      id: cat._id,
      name: cat.name,
      slug: cat.slug,
      vertical: cat.vertical || "food",
      description: cat.description,
      image: cat.image,
      startingPrice: cat.startingPrice !== undefined && cat.startingPrice !== null ? cat.startingPrice : 49,
      icon: cat.icon,
      position: cat.position,
      isActive: cat.isActive,
      isFeatured: cat.isFeatured,
      subcategories: subcategoryMap[cat._id.toString()] || [],
    }));

    return res.status(200).json({
      success: true,
      count: tree.length,
      data: tree,
    });
  } catch (error) {
    console.error("Error in getCategoriesTree:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/categories
 * Returns categories list based on filters
 */
exports.getCategories = async (req, res) => {
  try {
    const { type, parentCategoryId, search, isActive, isFeatured, userAppVisible, restaurantAppVisible, vertical } = req.query;
    const filter = {};

    if (vertical && vertical !== "all") filter.vertical = vertical;
    if (type) filter.type = type;
    if (parentCategoryId) filter.parentCategoryId = parentCategoryId;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === "true";
    if (userAppVisible !== undefined) filter.userAppVisible = userAppVisible === "true";
    if (restaurantAppVisible !== undefined) filter.restaurantAppVisible = restaurantAppVisible === "true";

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const existingTotal = await Category.countDocuments();
    if (existingTotal === 0) {
      const defaultSeeds = [
        // Food
        { name: "North Indian & Thali", slug: "north-indian-thali", vertical: "food", startingPrice: 99, position: 1, type: "main", isActive: true },
        { name: "South Indian & Dosa", slug: "south-indian-dosa", vertical: "food", startingPrice: 69, position: 2, type: "main", isActive: true },
        { name: "Indore Street Food & Poha", slug: "indore-street-food", vertical: "food", startingPrice: 39, position: 3, type: "main", isActive: true },
        { name: "Pizza & Burgers", slug: "pizza-burgers", vertical: "food", startingPrice: 89, position: 4, type: "main", isActive: true },
        { name: "Biryani & Kebabs", slug: "biryani-kebabs", vertical: "food", startingPrice: 149, position: 5, type: "main", isActive: true },
        { name: "Chinese & Momos", slug: "chinese-momos", vertical: "food", startingPrice: 59, position: 6, type: "main", isActive: true },
        { name: "Desserts & Shakes", slug: "desserts-shakes", vertical: "food", startingPrice: 49, position: 7, type: "main", isActive: true },

        // Grocery
        { name: "Fresh Vegetables & Fruits", slug: "fresh-vegetables-fruits", vertical: "grocery", startingPrice: 20, position: 1, type: "main", isActive: true },
        { name: "Dairy, Bread & Eggs", slug: "dairy-bread-eggs", vertical: "grocery", startingPrice: 30, position: 2, type: "main", isActive: true },
        { name: "Atta, Rice & Dals", slug: "atta-rice-dals", vertical: "grocery", startingPrice: 65, position: 3, type: "main", isActive: true },
        { name: "Oil, Ghee & Masalas", slug: "oil-ghee-masalas", vertical: "grocery", startingPrice: 85, position: 4, type: "main", isActive: true },
        { name: "Munchies & Snacks", slug: "munchies-snacks", vertical: "grocery", startingPrice: 10, position: 5, type: "main", isActive: true },
        { name: "Cold Drinks & Juices", slug: "drinks-juices", vertical: "grocery", startingPrice: 20, position: 6, type: "main", isActive: true },
        { name: "Cleaning & Household", slug: "cleaning-household", vertical: "grocery", startingPrice: 45, position: 7, type: "main", isActive: true },

        // Home Services
        { name: "Electrician & Wiring", slug: "electrician-wiring", vertical: "home_services", startingPrice: 149, position: 1, type: "main", isActive: true },
        { name: "Plumber & Sanitary", slug: "plumber-sanitary", vertical: "home_services", startingPrice: 149, position: 2, type: "main", isActive: true },
        { name: "AC Service & Repair", slug: "ac-service-repair", vertical: "home_services", startingPrice: 399, position: 3, type: "main", isActive: true },
        { name: "Home Deep Cleaning", slug: "home-deep-cleaning", vertical: "home_services", startingPrice: 499, position: 4, type: "main", isActive: true },
        { name: "Carpenter & Woodwork", slug: "carpenter-woodwork", vertical: "home_services", startingPrice: 199, position: 5, type: "main", isActive: true },
        { name: "Appliance & RO Repair", slug: "appliance-ro-repair", vertical: "home_services", startingPrice: 249, position: 6, type: "main", isActive: true },
        { name: "Pest Control", slug: "pest-control", vertical: "home_services", startingPrice: 599, position: 7, type: "main", isActive: true },
        { name: "Painting & Waterproofing", slug: "painting-waterproofing", vertical: "home_services", startingPrice: 899, position: 8, type: "main", isActive: true },

        // Medicine
        { name: "Prescription Medicines", slug: "prescription-medicines", vertical: "medicine", startingPrice: 10, position: 1, type: "main", isActive: true },
        { name: "Fever, Cold & Cough", slug: "fever-cold-cough", vertical: "medicine", startingPrice: 25, position: 2, type: "main", isActive: true },
        { name: "First Aid & Antiseptics", slug: "first-aid-antiseptics", vertical: "medicine", startingPrice: 30, position: 3, type: "main", isActive: true },
        { name: "Vitamins & Supplements", slug: "vitamins-supplements", vertical: "medicine", startingPrice: 120, position: 4, type: "main", isActive: true },
        { name: "Ayurvedic & Herbal", slug: "ayurvedic-herbal", vertical: "medicine", startingPrice: 60, position: 5, type: "main", isActive: true },
        { name: "Baby & Mom Care", slug: "baby-mom-care", vertical: "medicine", startingPrice: 90, position: 6, type: "main", isActive: true },

        // Courier
        { name: "Documents & Files", slug: "documents-files", vertical: "courier", startingPrice: 40, position: 1, type: "main", isActive: true },
        { name: "Parcels & Boxes", slug: "parcels-boxes", vertical: "courier", startingPrice: 60, position: 2, type: "main", isActive: true },
        { name: "Clothes & Laundry", slug: "clothes-laundry", vertical: "courier", startingPrice: 50, position: 3, type: "main", isActive: true },
        { name: "Homemade Tiffin", slug: "homemade-tiffin", vertical: "courier", startingPrice: 40, position: 4, type: "main", isActive: true },

        // Laundry
        { name: "Wash & Fold", slug: "wash-and-fold", vertical: "laundry", startingPrice: 59, position: 1, type: "main", isActive: true },
        { name: "Wash & Steam Iron", slug: "wash-and-iron", vertical: "laundry", startingPrice: 89, position: 2, type: "main", isActive: true },
        { name: "Steam Ironing Only", slug: "steam-iron-only", vertical: "laundry", startingPrice: 15, position: 3, type: "main", isActive: true },
        { name: "Dry Clean - Suits", slug: "dry-clean-suits", vertical: "laundry", startingPrice: 299, position: 4, type: "main", isActive: true },
        { name: "Dry Clean - Sarees", slug: "dry-clean-sarees", vertical: "laundry", startingPrice: 249, position: 5, type: "main", isActive: true },
        { name: "Shoe & Sneaker Care", slug: "shoe-care", vertical: "laundry", startingPrice: 299, position: 6, type: "main", isActive: true },

        // Essentials
        { name: "20L Mineral Water Cans", slug: "20l-water-cans", vertical: "essentials", startingPrice: 35, position: 1, type: "main", isActive: true },
        { name: "Daily Fresh Milk & Dairy", slug: "daily-fresh-milk", vertical: "essentials", startingPrice: 32, position: 2, type: "main", isActive: true },
        { name: "Fresh Artisanal Breads", slug: "fresh-breads", vertical: "essentials", startingPrice: 35, position: 3, type: "main", isActive: true },
        { name: "Pet Food & Care", slug: "pet-food-care", vertical: "essentials", startingPrice: 80, position: 4, type: "main", isActive: true },
        { name: "Pooja & Morning Flowers", slug: "pooja-flowers", vertical: "essentials", startingPrice: 30, position: 5, type: "main", isActive: true },

        // Bakery & Gifts
        { name: "Designer Birthday Cakes", slug: "designer-cakes", vertical: "gifts_bakery", startingPrice: 299, position: 1, type: "main", isActive: true },
        { name: "Fresh Flower Bouquets", slug: "flower-bouquets", vertical: "gifts_bakery", startingPrice: 199, position: 2, type: "main", isActive: true },
        { name: "Chocolates & Gift Hampers", slug: "chocolates-hampers", vertical: "gifts_bakery", startingPrice: 149, position: 3, type: "main", isActive: true },
        { name: "Pastries & Cupcakes", slug: "pastries-cupcakes", vertical: "gifts_bakery", startingPrice: 49, position: 4, type: "main", isActive: true }
      ];
      await Category.insertMany(defaultSeeds).catch(() => {});
    }

    const categories = await Category.find(filter)
      .populate("parentCategoryId", "name slug")
      .sort({ position: 1, createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
      categories: categories, // alias for frontend compatibility
    });
  } catch (error) {
    console.error("Error in getCategories:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/categories/:id
 */
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id).populate("parentCategoryId", "name slug").lean();

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    let subcategories = [];
    if (category.type === "main") {
      subcategories = await Category.find({ parentCategoryId: category._id }).sort({ position: 1 }).lean();
    }

    return res.status(200).json({
      success: true,
      data: {
        ...category,
        subcategories,
      },
    });
  } catch (error) {
    console.error("Error in getCategoryById:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/categories/:id/subcategories
 */
exports.getSubcategoriesByParent = async (req, res) => {
  try {
    const { id } = req.params;
    const subcategories = await Category.find({
      parentCategoryId: id,
      isActive: true,
      isVisible: { $ne: false },
    })
      .sort({ position: 1, createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: subcategories.length,
      data: subcategories,
    });
  } catch (error) {
    console.error("Error in getSubcategoriesByParent:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------------------------------------------------------
// ADMIN APIs
// ------------------------------------------------------------------

/**
 * GET /api/admin/categories
 * Detailed Admin view of categories with counts
 */
exports.getAdminCategories = async (req, res) => {
  try {
    const { type, parentCategoryId, search, vertical } = req.query;
    const filter = {};
    if (vertical && vertical !== "all") filter.vertical = vertical;
    if (type) filter.type = type;
    if (parentCategoryId) filter.parentCategoryId = parentCategoryId;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    const existingTotal = await Category.countDocuments();
    if (existingTotal === 0) {
      const defaultSeeds = [
        // Food
        { name: "North Indian & Thali", slug: "north-indian-thali", vertical: "food", startingPrice: 99, position: 1, type: "main", isActive: true },
        { name: "South Indian & Dosa", slug: "south-indian-dosa", vertical: "food", startingPrice: 69, position: 2, type: "main", isActive: true },
        { name: "Indore Street Food & Poha", slug: "indore-street-food", vertical: "food", startingPrice: 39, position: 3, type: "main", isActive: true },
        { name: "Pizza & Burgers", slug: "pizza-burgers", vertical: "food", startingPrice: 89, position: 4, type: "main", isActive: true },
        { name: "Biryani & Kebabs", slug: "biryani-kebabs", vertical: "food", startingPrice: 149, position: 5, type: "main", isActive: true },
        { name: "Chinese & Momos", slug: "chinese-momos", vertical: "food", startingPrice: 59, position: 6, type: "main", isActive: true },
        { name: "Desserts & Shakes", slug: "desserts-shakes", vertical: "food", startingPrice: 49, position: 7, type: "main", isActive: true },

        // Grocery
        { name: "Fresh Vegetables & Fruits", slug: "fresh-vegetables-fruits", vertical: "grocery", startingPrice: 20, position: 1, type: "main", isActive: true },
        { name: "Dairy, Bread & Eggs", slug: "dairy-bread-eggs", vertical: "grocery", startingPrice: 30, position: 2, type: "main", isActive: true },
        { name: "Atta, Rice & Dals", slug: "atta-rice-dals", vertical: "grocery", startingPrice: 65, position: 3, type: "main", isActive: true },
        { name: "Oil, Ghee & Masalas", slug: "oil-ghee-masalas", vertical: "grocery", startingPrice: 85, position: 4, type: "main", isActive: true },
        { name: "Munchies & Snacks", slug: "munchies-snacks", vertical: "grocery", startingPrice: 10, position: 5, type: "main", isActive: true },
        { name: "Cold Drinks & Juices", slug: "drinks-juices", vertical: "grocery", startingPrice: 20, position: 6, type: "main", isActive: true },
        { name: "Cleaning & Household", slug: "cleaning-household", vertical: "grocery", startingPrice: 45, position: 7, type: "main", isActive: true },

        // Home Services
        { name: "Electrician & Wiring", slug: "electrician-wiring", vertical: "home_services", startingPrice: 149, position: 1, type: "main", isActive: true },
        { name: "Plumber & Sanitary", slug: "plumber-sanitary", vertical: "home_services", startingPrice: 149, position: 2, type: "main", isActive: true },
        { name: "AC Service & Repair", slug: "ac-service-repair", vertical: "home_services", startingPrice: 399, position: 3, type: "main", isActive: true },
        { name: "Home Deep Cleaning", slug: "home-deep-cleaning", vertical: "home_services", startingPrice: 499, position: 4, type: "main", isActive: true },
        { name: "Carpenter & Woodwork", slug: "carpenter-woodwork", vertical: "home_services", startingPrice: 199, position: 5, type: "main", isActive: true },
        { name: "Appliance & RO Repair", slug: "appliance-ro-repair", vertical: "home_services", startingPrice: 249, position: 6, type: "main", isActive: true },
        { name: "Pest Control", slug: "pest-control", vertical: "home_services", startingPrice: 599, position: 7, type: "main", isActive: true },
        { name: "Painting & Waterproofing", slug: "painting-waterproofing", vertical: "home_services", startingPrice: 899, position: 8, type: "main", isActive: true },

        // Medicine
        { name: "Prescription Medicines", slug: "prescription-medicines", vertical: "medicine", startingPrice: 10, position: 1, type: "main", isActive: true },
        { name: "Fever, Cold & Cough", slug: "fever-cold-cough", vertical: "medicine", startingPrice: 25, position: 2, type: "main", isActive: true },
        { name: "First Aid & Antiseptics", slug: "first-aid-antiseptics", vertical: "medicine", startingPrice: 30, position: 3, type: "main", isActive: true },
        { name: "Vitamins & Supplements", slug: "vitamins-supplements", vertical: "medicine", startingPrice: 120, position: 4, type: "main", isActive: true },
        { name: "Ayurvedic & Herbal", slug: "ayurvedic-herbal", vertical: "medicine", startingPrice: 60, position: 5, type: "main", isActive: true },
        { name: "Baby & Mom Care", slug: "baby-mom-care", vertical: "medicine", startingPrice: 90, position: 6, type: "main", isActive: true },

        // Courier
        { name: "Documents & Files", slug: "documents-files", vertical: "courier", startingPrice: 40, position: 1, type: "main", isActive: true },
        { name: "Parcels & Boxes", slug: "parcels-boxes", vertical: "courier", startingPrice: 60, position: 2, type: "main", isActive: true },
        { name: "Clothes & Laundry", slug: "clothes-laundry", vertical: "courier", startingPrice: 50, position: 3, type: "main", isActive: true },
        { name: "Homemade Tiffin", slug: "homemade-tiffin", vertical: "courier", startingPrice: 40, position: 4, type: "main", isActive: true },

        // Laundry
        { name: "Wash & Fold", slug: "wash-and-fold", vertical: "laundry", startingPrice: 59, position: 1, type: "main", isActive: true },
        { name: "Wash & Steam Iron", slug: "wash-and-iron", vertical: "laundry", startingPrice: 89, position: 2, type: "main", isActive: true },
        { name: "Steam Ironing Only", slug: "steam-iron-only", vertical: "laundry", startingPrice: 15, position: 3, type: "main", isActive: true },
        { name: "Dry Clean - Suits", slug: "dry-clean-suits", vertical: "laundry", startingPrice: 299, position: 4, type: "main", isActive: true },
        { name: "Dry Clean - Sarees", slug: "dry-clean-sarees", vertical: "laundry", startingPrice: 249, position: 5, type: "main", isActive: true },
        { name: "Shoe & Sneaker Care", slug: "shoe-care", vertical: "laundry", startingPrice: 299, position: 6, type: "main", isActive: true },

        // Essentials
        { name: "20L Mineral Water Cans", slug: "20l-water-cans", vertical: "essentials", startingPrice: 35, position: 1, type: "main", isActive: true },
        { name: "Daily Fresh Milk & Dairy", slug: "daily-fresh-milk", vertical: "essentials", startingPrice: 32, position: 2, type: "main", isActive: true },
        { name: "Fresh Artisanal Breads", slug: "fresh-breads", vertical: "essentials", startingPrice: 35, position: 3, type: "main", isActive: true },
        { name: "Pet Food & Care", slug: "pet-food-care", vertical: "essentials", startingPrice: 80, position: 4, type: "main", isActive: true },
        { name: "Pooja & Morning Flowers", slug: "pooja-flowers", vertical: "essentials", startingPrice: 30, position: 5, type: "main", isActive: true },

        // Bakery & Gifts
        { name: "Designer Birthday Cakes", slug: "designer-cakes", vertical: "gifts_bakery", startingPrice: 299, position: 1, type: "main", isActive: true },
        { name: "Fresh Flower Bouquets", slug: "flower-bouquets", vertical: "gifts_bakery", startingPrice: 199, position: 2, type: "main", isActive: true },
        { name: "Chocolates & Gift Hampers", slug: "chocolates-hampers", vertical: "gifts_bakery", startingPrice: 149, position: 3, type: "main", isActive: true },
        { name: "Pastries & Cupcakes", slug: "pastries-cupcakes", vertical: "gifts_bakery", startingPrice: 49, position: 4, type: "main", isActive: true }
      ];
      await Category.insertMany(defaultSeeds).catch(() => {});
    }

    const categories = await Category.find(filter)
      .populate("parentCategoryId", "name slug")
      .sort({ position: 1, createdAt: -1 })
      .lean();

    // Get subcategory counts for main categories
    const mainCategoryIds = categories.filter((c) => c.type === "main").map((c) => c._id);
    const subCountAggregate = await Category.aggregate([
      { $match: { parentCategoryId: { $in: mainCategoryIds } } },
      { $group: { _id: "$parentCategoryId", count: { $sum: 1 } } },
    ]);

    const subCountMap = {};
    subCountAggregate.forEach((item) => {
      subCountMap[item._id.toString()] = item.count;
    });

    const enriched = categories.map((c) => ({
      ...c,
      subcategoryCount: c.type === "main" ? subCountMap[c._id.toString()] || 0 : 0,
    }));

    return res.status(200).json({
      success: true,
      count: enriched.length,
      categories: enriched,
      data: enriched,
    });
  } catch (error) {
    console.error("Error in getAdminCategories:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/admin/categories
 * Create category or subcategory
 */
exports.createCategory = async (req, res) => {
  try {
    const {
      name,
      slug: customSlug,
      vertical = "food",
      type = "main",
      parentCategoryId,
      description,
      image,
      startingPrice,
      fromPrice,
      price,
      icon,
      position,
      isActive,
      isVisible,
      isFeatured,
      userAppVisible,
      restaurantAppVisible,
      seoTitle,
      seoDescription,
    } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const generatedSlug = customSlug ? slugify(customSlug) : slugify(name);

    if (type === "subcategory") {
      if (!parentCategoryId) {
        return res.status(400).json({ success: false, message: "Parent Category is required for subcategories" });
      }
      const parent = await Category.findById(parentCategoryId);
      if (!parent || parent.type !== "main") {
        return res.status(400).json({ success: false, message: "Invalid Parent Category" });
      }

      // Check unique combination: parentCategoryId + slug
      const existingSub = await Category.findOne({
        type: "subcategory",
        parentCategoryId,
        slug: generatedSlug,
      });

      if (existingSub) {
        return res.status(400).json({
          success: false,
          message: `A subcategory with slug '${generatedSlug}' already exists under '${parent.name}'`,
        });
      }
    } else {
      // Main category slug check
      const existingMain = await Category.findOne({
        type: "main",
        slug: generatedSlug,
      });

      if (existingMain) {
        return res.status(400).json({
          success: false,
          message: `A main category with slug '${generatedSlug}' already exists`,
        });
      }
    }

    let catImage = image || null;
    if (catImage && typeof catImage === 'string' && (catImage.startsWith('data:') || catImage.length > 200)) {
      catImage = await uploadToImageKit(catImage, `cat_${generatedSlug}_${Date.now()}.jpg`, '/categories');
    }

    const rawPriceVal = startingPrice !== undefined ? startingPrice : (price !== undefined ? price : (fromPrice !== undefined ? fromPrice : 28));
    const numStartingPrice = Number(rawPriceVal) || 28;

    const category = await Category.create({
      name: name.trim(),
      slug: generatedSlug,
      vertical: vertical || "food",
      type,
      parentCategoryId: type === "subcategory" ? parentCategoryId : null,
      description: description || "",
      image: catImage,
      startingPrice: numStartingPrice,
      icon: icon || null,
      position: Number(position || 0),
      isActive: isActive !== false,
      isVisible: isVisible !== false,
      isFeatured: isFeatured === true,
      userAppVisible: userAppVisible !== false,
      restaurantAppVisible: restaurantAppVisible !== false,
      seoTitle: seoTitle || "",
      seoDescription: seoDescription || "",
    });

    // Write AuditLog
    await AuditLog.log({
      entity: "Category",
      entityId: category._id,
      action: type === "subcategory" ? "SUBCATEGORY_CREATED" : "CATEGORY_CREATED",
      userId: req.user?._id,
      userRole: "admin",
      changes: { field: "category", oldValue: null, newValue: category },
      reason: `Admin created ${type} category '${category.name}'`,
    });

    emitCategoryChange(req);

    return res.status(201).json({
      success: true,
      message: `${type === "subcategory" ? "Subcategory" : "Category"} created successfully`,
      data: category,
      category,
    });
  } catch (error) {
    console.error("Error in createCategory:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/admin/categories/:id
 * Update category or subcategory
 */
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug: customSlug,
      vertical,
      type,
      parentCategoryId,
      description,
      image,
      icon,
      position,
      isActive,
      isVisible,
      isFeatured,
      userAppVisible,
      restaurantAppVisible,
      seoTitle,
      seoDescription,
    } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const oldState = category.toObject();

    if (vertical) category.vertical = vertical;
    if (name) category.name = name.trim();
    if (customSlug || name) {
      category.slug = customSlug ? slugify(customSlug) : slugify(category.name);
    }

    if (type) category.type = type;

    if (category.type === "subcategory") {
      const targetParentId = parentCategoryId || category.parentCategoryId;
      if (!targetParentId) {
        return res.status(400).json({ success: false, message: "Parent Category is required for subcategories" });
      }

      const parent = await Category.findById(targetParentId);
      if (!parent || parent.type !== "main") {
        return res.status(400).json({ success: false, message: "Invalid Parent Category" });
      }
      category.parentCategoryId = targetParentId;

      // Unique check
      const duplicate = await Category.findOne({
        _id: { $ne: category._id },
        type: "subcategory",
        parentCategoryId: targetParentId,
        slug: category.slug,
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `A subcategory with slug '${category.slug}' already exists under '${parent.name}'`,
        });
      }
    } else {
      category.parentCategoryId = null;

      const duplicate = await Category.findOne({
        _id: { $ne: category._id },
        type: "main",
        slug: category.slug,
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `A main category with slug '${category.slug}' already exists`,
        });
      }
    }

    const rawPriceVal = req.body.startingPrice !== undefined ? req.body.startingPrice : (req.body.price !== undefined ? req.body.price : req.body.fromPrice);
    if (rawPriceVal !== undefined && rawPriceVal !== null && rawPriceVal !== "") {
      category.startingPrice = Number(rawPriceVal) || 0;
    }

    if (description !== undefined) category.description = description;
    if (image !== undefined && image !== null) {
      if (typeof image === 'string' && (image.startsWith('data:') || image.length > 500)) {
        category.image = await uploadToImageKit(image, `cat_${category.slug}_${Date.now()}.jpg`, '/categories');
      } else if (typeof image === 'string' && image.trim().length > 0) {
        category.image = image.trim();
      }
    }
    if (icon !== undefined) category.icon = icon;
    if (position !== undefined) category.position = Number(position);
    if (isActive !== undefined) category.isActive = isActive;
    if (isVisible !== undefined) category.isVisible = isVisible;
    if (isFeatured !== undefined) category.isFeatured = isFeatured;
    if (userAppVisible !== undefined) category.userAppVisible = userAppVisible;
    if (restaurantAppVisible !== undefined) category.restaurantAppVisible = restaurantAppVisible;
    if (seoTitle !== undefined) category.seoTitle = seoTitle;
    if (seoDescription !== undefined) category.seoDescription = seoDescription;

    await category.save();

    await AuditLog.log({
      entity: "Category",
      entityId: category._id,
      action: category.type === "subcategory" ? "SUBCATEGORY_UPDATED" : "CATEGORY_UPDATED",
      userId: req.user?._id,
      userRole: "admin",
      changes: { field: "category", oldValue: oldState, newValue: category },
      reason: `Admin updated ${category.type} category '${category.name}'`,
    });

    emitCategoryChange(req);

    return res.status(200).json({
      success: true,
      message: `${category.type === "subcategory" ? "Subcategory" : "Category"} updated successfully`,
      data: category,
      category,
    });
  } catch (error) {
    console.error("Error in updateCategory:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/admin/categories/:id/status
 */
exports.patchCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, isVisible, isFeatured, userAppVisible, restaurantAppVisible } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const oldState = {
      isActive: category.isActive,
      isVisible: category.isVisible,
      isFeatured: category.isFeatured,
      userAppVisible: category.userAppVisible,
      restaurantAppVisible: category.restaurantAppVisible,
    };

    if (isActive !== undefined) category.isActive = isActive;
    if (isVisible !== undefined) category.isVisible = isVisible;
    if (isFeatured !== undefined) category.isFeatured = isFeatured;
    if (userAppVisible !== undefined) category.userAppVisible = userAppVisible;
    if (restaurantAppVisible !== undefined) category.restaurantAppVisible = restaurantAppVisible;

    await category.save();

    await AuditLog.log({
      entity: "Category",
      entityId: category._id,
      action: category.type === "subcategory" ? "SUBCATEGORY_STATUS_CHANGED" : "CATEGORY_STATUS_CHANGED",
      userId: req.user?._id,
      userRole: "admin",
      changes: { field: "status", oldValue: oldState, newValue: { isActive: category.isActive, isVisible: category.isVisible, isFeatured: category.isFeatured, userAppVisible: category.userAppVisible, restaurantAppVisible: category.restaurantAppVisible } },
      reason: `Admin changed status of category '${category.name}'`,
    });

    emitCategoryChange(req);

    return res.status(200).json({
      success: true,
      message: "Category status updated",
      data: category,
      category,
    });
  } catch (error) {
    console.error("Error in patchCategoryStatus:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/admin/categories/reorder
 */
exports.reorderCategories = async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, position }
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: "items array is required" });
    }

    for (const item of items) {
      if (item.id && item.position !== undefined) {
        await Category.findByIdAndUpdate(item.id, { position: Number(item.position) });
      }
    }

    await AuditLog.log({
      entity: "Category",
      entityId: null,
      action: "CATEGORY_REORDERED",
      userId: req.user?._id,
      userRole: "admin",
      changes: { field: "reorder", oldValue: null, newValue: items },
      reason: "Admin reordered categories",
    });

    emitCategoryChange(req);

    return res.status(200).json({
      success: true,
      message: "Categories reordered successfully",
    });
  } catch (error) {
    console.error("Error in reorderCategories:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/admin/categories/:id
 * Delete safety check (STEP 15): If force=true or standard admin delete, clean up child subcategories & product references before deleting
 */
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const isForce = req.query.force === "true" || req.query.force === true || true; // Standard delete for Admin action

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Cascade clean up products referencing this category or subcategory
    await Product.updateMany(
      { $or: [{ category: id }, { categoryId: id }, { subcategoryId: id }] },
      { $set: { category: null, categoryId: null, subcategoryId: null } }
    );

    // If main category, delete or detach child subcategories
    if (category.type === "main") {
      await Category.deleteMany({ parentCategoryId: id });
    }

    await Category.findByIdAndDelete(id);

    await AuditLog.log({
      entity: "Category",
      entityId: id,
      action: category.type === "subcategory" ? "SUBCATEGORY_DELETED" : "CATEGORY_DELETED",
      userId: req.user?._id,
      userRole: "admin",
      changes: { field: "category", oldValue: category, newValue: null },
      reason: `Admin deleted ${category.type} category '${category.name}'`,
    });

    emitCategoryChange(req);

    return res.status(200).json({
      success: true,
      message: `${category.type === "subcategory" ? "Subcategory" : "Category"} deleted successfully`,
    });
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

