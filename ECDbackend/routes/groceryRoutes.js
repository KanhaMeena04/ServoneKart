const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const { protect } = require('../middleware/authMiddleware');
const { VERTICALS, BUSINESS_TYPES } = require('../constants/verticals');

/**
 * GET /api/grocery/stores
 * Get list of active grocery stores in Indore
 */

/**
 * GET /api/grocery/categories
 * Dynamic categories from Category model
 */
router.get('/categories', async (req, res) => {
  try {
    let categories = await Category.find({
      $or: [
        { vertical: VERTICALS.GROCERY },
        { type: 'grocery' },
        { name: { $regex: /grocery|vegetable|fruit|dairy|staple|snack|beverage|cleaning/i } }
      ],
      isActive: { $ne: false }
    }).select('name image slug position').sort({ position: 1 }).lean();

    if (!categories || categories.length === 0) {
      // Seed default dynamic categories into Category collection for Indore
      const defaultCategories = [
        { name: 'All', slug: 'all', vertical: VERTICALS.GROCERY, position: 1, isActive: true },
        { name: 'Vegetables & Fruits', slug: 'vegetables-fruits', vertical: VERTICALS.GROCERY, position: 2, isActive: true },
        { name: 'Dairy & Breakfast', slug: 'dairy-breakfast', vertical: VERTICALS.GROCERY, position: 3, isActive: true },
        { name: 'Munchies & Snacks', slug: 'munchies-snacks', vertical: VERTICALS.GROCERY, position: 4, isActive: true },
        { name: 'Cold Drinks & Juices', slug: 'drinks-juices', vertical: VERTICALS.GROCERY, position: 5, isActive: true },
        { name: 'Atta, Rice & Dal', slug: 'atta-rice-dal', vertical: VERTICALS.GROCERY, position: 6, isActive: true },
        { name: 'Cleaning & Household', slug: 'cleaning-household', vertical: VERTICALS.GROCERY, position: 7, isActive: true }
      ];
      categories = await Category.insertMany(defaultCategories);
    }

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/grocery/products
 * Dynamic grocery products from Product model
 */
router.get('/products', async (req, res) => {
  try {
    const { category, search, storeId } = req.query;
    const query = {
      $or: [
        { vertical: VERTICALS.GROCERY },
        { vertical: VERTICALS.ESSENTIALS }
      ],
      isDeleted: { $ne: true },
      isApproved: { $ne: false },
      approvalStatus: { $in: ['approved', undefined] }
    };

    if (storeId) query.restaurant = storeId;
    if (search) query.name = { $regex: search, $options: 'i' };

    let products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('restaurant', 'name rating address')
      .limit(50)
      .lean();

    if (!products || products.length === 0) {
      // Seed dynamic initial catalog into Product collection
      const seedProducts = [
        {
          name: 'Amul Taaza Fresh Toned Milk',
          price: 27,
          mrp: 28,
          weight: '500 ml',
          unit: 'pouch',
          vertical: VERTICALS.GROCERY,
          stockQuantity: 100,
          inStock: true,
          description: 'Pasteurized toned milk'
        },
        {
          name: 'Aashirvaad Shudh Chakki Atta',
          price: 245,
          mrp: 280,
          weight: '5 kg',
          unit: 'bag',
          vertical: VERTICALS.GROCERY,
          stockQuantity: 50,
          inStock: true,
          description: '100% whole wheat flour'
        },
        {
          name: 'Fresh Malwa Farm Potatoes',
          price: 28,
          mrp: 35,
          weight: '1 kg',
          unit: 'kg',
          vertical: VERTICALS.GROCERY,
          stockQuantity: 200,
          inStock: true,
          description: 'Farm fresh potato crop'
        },
        {
          name: 'Fresh Red Onion (Pyaaz)',
          price: 38,
          mrp: 48,
          weight: '1 kg',
          unit: 'kg',
          vertical: VERTICALS.GROCERY,
          stockQuantity: 150,
          inStock: true,
          description: 'Crisp Indian red onions'
        },
        {
          name: 'English Oven Whole Wheat Bread',
          price: 50,
          mrp: 55,
          weight: '400 g',
          unit: 'loaf',
          vertical: VERTICALS.GROCERY,
          stockQuantity: 40,
          inStock: true,
          description: 'Fresh sliced brown bread'
        },
        {
          name: 'Thums Up Charged Carbonated Drink',
          price: 40,
          mrp: 40,
          weight: '750 ml',
          unit: 'bottle',
          vertical: VERTICALS.GROCERY,
          stockQuantity: 80,
          inStock: true,
          description: 'Refreshing cold soft drink'
        }
      ];
      products = await Product.insertMany(seedProducts);
    }

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/stores', async (req, res) => {
  try {
    const { city = 'Indore', lat, lng, search } = req.query;

    const query = {
      $or: [
        { businessType: BUSINESS_TYPES.GROCERY_STORE },
        { vertical: VERTICALS.GROCERY },
        { restaurantType: { $regex: /grocery|supermarket|mart/i } }
      ],
      isActive: true
    };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const stores = await Restaurant.find(query)
      .select('name image bannerImage address location rating ratingsCount deliveryTime freeDeliveryThreshold minOrderAmount isOpen timing isPureVeg')
      .lean();

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
 * Get store catalog (categories + in-stock grocery items with variants)
 */
router.get('/stores/:id/catalog', async (req, res) => {
  try {
    const { id } = req.params;
    const store = await Restaurant.findById(id);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Grocery store not found' });
    }

    // Fetch products belonging to this store
    const products = await Product.find({
      restaurant: id,
      isDeleted: { $ne: true }
    }).populate('category', 'name slug image').lean();

    // Group products by category
    const categoryMap = {};
    products.forEach(p => {
      const catName = p.category?.name || 'Daily Essentials';
      const catId = p.category?._id?.toString() || 'default';
      if (!categoryMap[catId]) {
        categoryMap[catId] = {
          id: catId,
          name: catName,
          image: p.category?.image || null,
          products: []
        };
      }
      categoryMap[catId].products.push({
        id: p._id,
        name: p.name,
        description: p.description,
        image: p.image,
        price: p.price,
        mrp: p.mrp || (p.price * 1.15),
        unit: p.unit || 'piece',
        weight: p.weight,
        stockQuantity: p.stockQuantity ?? 100,
        inStock: (p.stockQuantity ?? 100) > 0,
        variants: p.variants || []
      });
    });

    return res.status(200).json({
      success: true,
      data: {
        store: {
          id: store._id,
          name: store.name,
          address: store.address,
          image: store.image,
          rating: store.rating
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
 * Place a grocery order with inventory reservation
 */
router.post('/order', protect, async (req, res) => {
  try {
    const {
      storeId,
      items,
      deliveryAddress,
      paymentMethod = 'cod',
      substitutionPreference = 'call_customer' // 'call_customer', 'auto_substitute', 'refund'
    } = req.body;

    if (!storeId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Store and items are required' });
    }

    const store = await Restaurant.findById(storeId);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Grocery store not found' });
    }

    // Calculate prices and verify stock
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ success: false, message: `Product not found: ${item.productId}` });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`
        });
      }

      const itemPrice = item.variantPrice || product.price;
      const totalItemPrice = itemPrice * item.quantity;
      subtotal += totalItemPrice;

      // Reserve stock safely
      product.stockQuantity -= item.quantity;
      if (product.stockQuantity <= 0) {
        product.inStock = false;
      }
      await product.save();

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: itemPrice,
        unit: item.unit || product.unit || 'piece',
        variantName: item.variantName || null
      });
    }

    const deliveryFee = subtotal >= (store.freeDeliveryThreshold || 500) ? 0 : 35;
    const platformFee = 5;
    const totalAmount = subtotal + deliveryFee + platformFee;

    const orderNumber = `GRO-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await Order.create({
      orderNumber,
      customer: req.user._id,
      customerName: req.user.name || 'Customer',
      customerPhone: req.user.mobile || req.user.phone || '9999999999',
      restaurant: store._id,
      restaurantName: store.name,
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
    });

    return res.status(201).json({
      success: true,
      message: 'Grocery order placed successfully',
      data: order
    });
  } catch (error) {
    console.error('Grocery order error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/grocery/inventory/update
 * Partner updates product stock
 */
router.put('/inventory/update', protect, async (req, res) => {
  try {
    const { productId, stockQuantity, inStock } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (stockQuantity !== undefined) {
      product.stockQuantity = Number(stockQuantity);
      product.inStock = product.stockQuantity > 0;
    }
    if (inStock !== undefined) {
      product.inStock = Boolean(inStock);
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Inventory updated successfully',
      data: {
        id: product._id,
        name: product.name,
        stockQuantity: product.stockQuantity,
        inStock: product.inStock
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

