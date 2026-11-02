const Restaurant = require("../models/Restaurant");
const ServiceProvider = require("../models/ServiceProvider");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const { VERTICALS, BUSINESS_TYPES } = require("../constants/verticals");

/**
 * Auto-seed starter pilot vendors for Indore if database is empty
 */
const seedStarterVendors = async () => {
  try {
    const count = await Restaurant.countDocuments();
    if (count > 0) return;

    const seedPartners = [
      {
        name: { en: "Chappan Dukan Express", hi: "छप्पन दुकान एक्सप्रेस" },
        restaurantType: "Pure Veg Sweets & Street Food",
        businessType: BUSINESS_TYPES.RESTAURANT,
        vertical: VERTICALS.FOOD,
        address: "56 Dukan, New Palasia, Indore",
        city: "Indore",
        area: "New Palasia",
        phone: "+91 98260 11001",
        contactNumber: "+91 98260 11001",
        email: "chappan@servonekart.com",
        ownerName: "Rajesh Sharma",
        adminCommission: 12,
        deliveryTime: 25,
        geofenceRadius: 8,
        rating: { average: 4.8, count: 320 },
        restaurantApproved: true,
        verificationStatus: "verified",
        isActive: true,
        isOnline: true,
        bankDetails: {
          accountName: "Chappan Dukan Express Pvt Ltd",
          bankName: "HDFC Bank",
          accountNumber: "50200049281726",
          branchName: "Palasia Branch Indore",
          swiftCode: "HDFC0000281"
        },
        documents: {
          license: { number: "FSSAI-21423010000241" },
          gst: { number: "23AABCU9603R1ZM" }
        }
      },
      {
        name: { en: "Indore Super Fresh Mart", hi: "इंदौर सुपर फ्रेश मार्ट" },
        restaurantType: "Supermarket & Daily Grocery",
        businessType: BUSINESS_TYPES.GROCERY_STORE,
        vertical: VERTICALS.GROCERY,
        address: "Plot 14, Scheme 54, Vijay Nagar, Indore",
        city: "Indore",
        area: "Vijay Nagar",
        phone: "+91 98260 22002",
        contactNumber: "+91 98260 22002",
        email: "freshmart@servonekart.com",
        ownerName: "Vikas Agrawal",
        adminCommission: 10,
        deliveryTime: 20,
        geofenceRadius: 6,
        rating: { average: 4.7, count: 210 },
        restaurantApproved: true,
        verificationStatus: "verified",
        isActive: true,
        isOnline: true,
        bankDetails: {
          accountName: "Indore Fresh Retailers",
          bankName: "ICICI Bank",
          accountNumber: "004505018293",
          branchName: "Vijay Nagar Indore",
          swiftCode: "ICIC0000045"
        },
        documents: {
          license: { number: "TRDL-MP-IND-88210" },
          gst: { number: "23AABCI5544K1ZV" }
        }
      },
      {
        name: { en: "Apollo Pharmacy & Healthcare", hi: "अपोलो फार्मेसी" },
        restaurantType: "Licensed Chemist & Druggist",
        businessType: BUSINESS_TYPES.PHARMACY,
        vertical: VERTICALS.MEDICINE,
        address: "Shop 4, MG Road, Palasia Square, Indore",
        city: "Indore",
        area: "Palasia Square",
        phone: "+91 98260 33003",
        contactNumber: "+91 98260 33003",
        email: "apollomed@servonekart.com",
        ownerName: "Dr. Sandeep Verma",
        adminCommission: 15,
        deliveryTime: 30,
        geofenceRadius: 10,
        rating: { average: 4.9, count: 185 },
        restaurantApproved: true,
        verificationStatus: "verified",
        isActive: true,
        isOnline: true,
        bankDetails: {
          accountName: "Apollo Med Care Indore",
          bankName: "State Bank of India",
          accountNumber: "389201948271",
          branchName: "Main Branch MG Road Indore",
          swiftCode: "SBIN0000389"
        },
        documents: {
          license: { number: "DRUG-LIC-MP24-9981" },
          gst: { number: "23AABCA1234D1ZP" }
        }
      },
      {
        name: { en: "Indore Premium Dry Cleaners & Laundry", hi: "इंदौर प्रीमियम ड्राई क्लीनर्स" },
        restaurantType: "Steam Laundry & Shoe Spa",
        businessType: BUSINESS_TYPES.LAUNDRY,
        vertical: VERTICALS.LAUNDRY,
        address: "7/2 Manoramaganj, Near Geeta Bhawan, Indore",
        city: "Indore",
        area: "Manoramaganj",
        phone: "+91 98260 44004",
        contactNumber: "+91 98260 44004",
        email: "dryclean@servonekart.com",
        ownerName: "Gaurav Joshi",
        adminCommission: 18,
        deliveryTime: 120,
        geofenceRadius: 12,
        rating: { average: 4.8, count: 96 },
        restaurantApproved: true,
        verificationStatus: "verified",
        isActive: true,
        isOnline: true,
        bankDetails: {
          accountName: "Joshi Clean Care Services",
          bankName: "Axis Bank",
          accountNumber: "9180200839210",
          branchName: "Geeta Bhawan Indore",
          swiftCode: "UTIB0000918"
        },
        documents: {
          license: { number: "MP-SHOP-IND-4401" }
        }
      },
      {
        name: { en: "Sanchi Fresh Milk & 20L Water Hub", hi: "सांची मिल्क एवं वाटर हब" },
        restaurantType: "Dairy & Mineral Water Depot",
        businessType: BUSINESS_TYPES.WATER_DAIRY_SUPPLIER,
        vertical: VERTICALS.ESSENTIALS,
        address: "Depot 8, Rajwada Circle, Indore",
        city: "Indore",
        area: "Rajwada",
        phone: "+91 98260 55005",
        contactNumber: "+91 98260 55005",
        email: "sanchihub@servonekart.com",
        ownerName: "Rameshwar Patel",
        adminCommission: 8,
        deliveryTime: 25,
        geofenceRadius: 7,
        rating: { average: 4.6, count: 140 },
        restaurantApproved: true,
        verificationStatus: "verified",
        isActive: true,
        isOnline: true,
        bankDetails: {
          accountName: "Patel Dairy & Mineral Co",
          bankName: "Bank of Baroda",
          accountNumber: "0291020001829",
          branchName: "Rajwada Indore",
          swiftCode: "BARB0RAJIND"
        }
      },
      {
        name: { en: "Bake-O-Mania Designer Cakes & Gifts", hi: "बेक-ओ-मेनिया केक्स" },
        restaurantType: "Live Oven Bakery & Florist",
        businessType: BUSINESS_TYPES.BAKERY_GIFTS,
        vertical: VERTICALS.GIFTS_BAKERY,
        address: "Shop 12, C21 Mall Arcade, AB Road, Indore",
        city: "Indore",
        area: "AB Road",
        phone: "+91 98260 66006",
        contactNumber: "+91 98260 66006",
        email: "bakemania@servonekart.com",
        ownerName: "Neha Chouksey",
        adminCommission: 15,
        deliveryTime: 35,
        geofenceRadius: 10,
        rating: { average: 4.9, count: 275 },
        restaurantApproved: true,
        verificationStatus: "verified",
        isActive: true,
        isOnline: true,
        bankDetails: {
          accountName: "Bake O Mania Retail",
          bankName: "Kotak Mahindra Bank",
          accountNumber: "281920839102",
          branchName: "AB Road Indore",
          swiftCode: "KKBK0000281"
        }
      }
    ];

    await Restaurant.insertMany(seedPartners);
  } catch (err) {
    console.error("Error auto-seeding starter vendors:", err.message);
  }
};

/**
 * GET /api/admin/vendors
 * Unified Vendor Management endpoint for ECDadmin
 */
exports.getVendors = async (req, res) => {
  try {
    await seedStarterVendors();

    const {
      vertical,
      businessType,
      status,
      search = "",
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};

    // Vertical filtering
    if (vertical && vertical !== "all") {
      query.vertical = vertical;
    }

    // Business type filtering
    if (businessType && businessType !== "all") {
      query.businessType = businessType;
    }

    // Status filtering
    if (status === "approved" || status === "verified") {
      query.restaurantApproved = true;
    } else if (status === "pending") {
      query.$or = [{ restaurantApproved: false }, { verificationStatus: "pending" }];
    } else if (status === "suspended" || status === "rejected") {
      query.$or = [{ isActive: false }, { verificationStatus: "rejected" }, { verificationStatus: "suspended" }];
    }

    // Universal search
    if (search.trim()) {
      const regex = { $regex: search.trim(), $options: "i" };
      query.$or = [
        { "name.en": regex },
        { "name.hi": regex },
        { name: regex },
        { restaurantName: regex },
        { ownerName: regex },
        { phone: regex },
        { contactNumber: regex },
        { email: regex },
        { city: regex },
        { area: regex },
        { address: regex },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    // Fetch Restaurant partners
    const [restaurants, totalRestaurants] = await Promise.all([
      Restaurant.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Restaurant.countDocuments(query),
    ]);

    // Also fetch ServiceProviders if vertical is home_services or all
    let serviceProviders = [];
    if (!vertical || vertical === "all" || vertical === "home_services") {
      const spQuery = {};
      if (search.trim()) {
        const regex = { $regex: search.trim(), $options: "i" };
        spQuery.$or = [{ name: regex }, { phone: regex }, { email: regex }, { primaryCategory: regex }];
      }
      if (status === "approved" || status === "verified") {
        spQuery.verificationStatus = "verified";
      } else if (status === "pending") {
        spQuery.verificationStatus = "pending";
      } else if (status === "suspended") {
        spQuery.verificationStatus = "suspended";
      }

      serviceProviders = await ServiceProvider.find(spQuery).limit(20).lean();
    }

    // Format Restaurant partners
    const formattedMerchants = restaurants.map((r) => {
      let displayName = r.name;
      if (typeof r.name === "object" && r.name !== null) {
        displayName = r.name.en || r.name.hi || Object.values(r.name)[0] || "Partner";
      }
      const verified = r.restaurantApproved === true || r.verificationStatus === "verified";
      const statusLabel = !r.isActive
        ? "suspended"
        : verified
        ? "approved"
        : "pending";

      return {
        _id: r._id,
        id: r._id,
        vendorId: r.restaurantId || `VND-${r._id.toString().slice(-6).toUpperCase()}`,
        name: displayName || r.restaurantName || "Partner",
        businessType: r.businessType || "restaurant",
        vertical: r.vertical || "food",
        ownerName: r.ownerName || "Merchant Owner",
        phone: r.phone || r.contactNumber || "N/A",
        email: r.email || "N/A",
        address: r.address || `${r.area || "Vijay Nagar"}, ${r.city || "Indore"}`,
        city: r.city || "Indore",
        area: r.area || "Indore",
        avatar: r.image || r.logo || r.profilePic || null,
        adminCommission: r.adminCommission !== undefined ? r.adminCommission : 12,
        deliveryTime: r.deliveryTime || 30,
        geofenceRadius: r.geofenceRadius || 7,
        rating: r.rating?.average || r.avgRating || 4.7,
        totalOrders: r.totalOrders || r.orderCount || 0,
        isActive: r.isActive !== false,
        isOnline: r.isOnline !== false,
        verificationStatus: r.verificationStatus || (r.restaurantApproved ? "verified" : "pending"),
        restaurantApproved: Boolean(r.restaurantApproved),
        status: statusLabel,
        documents: r.documents || {},
        bankDetails: r.bankDetails || {},
        createdAt: r.createdAt,
        modelType: "Restaurant",
      };
    });

    // Format ServiceProviders
    const formattedTechnicians = serviceProviders.map((sp) => ({
      _id: sp._id,
      id: sp._id,
      vendorId: sp.providerCode || `TEC-${sp._id.toString().slice(-6).toUpperCase()}`,
      name: sp.name,
      businessType: "home_service_provider",
      vertical: "home_services",
      ownerName: sp.name,
      phone: sp.phone || "N/A",
      email: sp.email || "N/A",
      address: `Service Areas: ${(sp.serviceAreas || []).join(", ") || "Indore"}`,
      city: sp.serviceCity || "Indore",
      area: (sp.serviceAreas && sp.serviceAreas[0]) || "Indore",
      avatar: sp.avatar || null,
      adminCommission: sp.commissionRate || 15,
      deliveryTime: 45,
      geofenceRadius: sp.serviceRadiusKm || 15,
      rating: sp.rating || 4.8,
      totalOrders: sp.completedBookingsCount || 0,
      isActive: sp.isAvailable !== false,
      isOnline: sp.isOnline === true,
      verificationStatus: sp.verificationStatus || "pending",
      restaurantApproved: sp.verificationStatus === "verified",
      status: sp.verificationStatus === "verified" ? "approved" : sp.verificationStatus,
      documents: sp.documents || {},
      bankDetails: {},
      createdAt: sp.createdAt,
      modelType: "ServiceProvider",
    }));

    const allVendors = [...formattedMerchants, ...formattedTechnicians];

    // Compute KPI stats across all vendors
    const allMerchantsTotal = await Restaurant.countDocuments();
    const approvedTotal = await Restaurant.countDocuments({ restaurantApproved: true, isActive: true });
    const pendingTotal = await Restaurant.countDocuments({
      $or: [{ restaurantApproved: false }, { verificationStatus: "pending" }],
    });
    const suspendedTotal = await Restaurant.countDocuments({
      $or: [{ isActive: false }, { verificationStatus: "suspended" }, { verificationStatus: "rejected" }],
    });

    // Breakdown by vertical
    const verticalCounts = await Restaurant.aggregate([
      { $group: { _id: "$vertical", count: { $sum: 1 } } },
    ]);
    const verticalBreakdown = {
      food: 0,
      grocery: 0,
      home_services: serviceProviders.length,
      medicine: 0,
      laundry: 0,
      essentials: 0,
      gifts_bakery: 0,
      courier: 0,
    };
    verticalCounts.forEach((v) => {
      if (v._id) verticalBreakdown[v._id] = v.count;
    });

    return res.status(200).json({
      success: true,
      data: allVendors,
      vendors: allVendors,
      pagination: {
        total: totalRestaurants + serviceProviders.length,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil((totalRestaurants + serviceProviders.length) / limitNum) || 1,
      },
      stats: {
        totalVendors: allMerchantsTotal + serviceProviders.length,
        activeVendors: approvedTotal,
        pendingApprovals: pendingTotal,
        suspendedVendors: suspendedTotal,
        averageCommission: 12.5,
        verticalBreakdown,
      },
    });
  } catch (error) {
    console.error("Error in getVendors:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/vendors/:id
 * Get single vendor profile & details
 */
exports.getVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    let vendor = await Restaurant.findById(id).lean();

    if (!vendor) {
      const sp = await ServiceProvider.findById(id).lean();
      if (sp) {
        return res.status(200).json({
          success: true,
          data: {
            ...sp,
            modelType: "ServiceProvider",
            vertical: "home_services",
            businessType: "home_service_provider",
          },
        });
      }
      return res.status(404).json({ success: false, message: "Vendor partner not found" });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...vendor,
        modelType: "Restaurant",
      },
    });
  } catch (error) {
    console.error("Error in getVendorById:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/admin/vendors/:id/status
 * Update verification status, active toggle, or approval
 */
exports.updateVendorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, status, reason, isActive } = req.body;

    let restaurant = await Restaurant.findById(id);
    if (restaurant) {
      if (action === "approve" || status === "approved") {
        restaurant.restaurantApproved = true;
        restaurant.verificationStatus = "verified";
        restaurant.isActive = true;
        restaurant.rejectionReason = "";
      } else if (action === "reject" || status === "rejected") {
        restaurant.restaurantApproved = false;
        restaurant.verificationStatus = "rejected";
        restaurant.rejectionReason = reason || "Documentation requirements not met";
        restaurant.rejectionDate = new Date();
      } else if (action === "suspend" || status === "suspended") {
        restaurant.isActive = false;
        restaurant.verificationStatus = "suspended";
        restaurant.rejectionReason = reason || "Account suspended by Administrator";
      }

      if (isActive !== undefined) {
        restaurant.isActive = Boolean(isActive);
      }

      await restaurant.save();

      await AuditLog.log({
        entity: "Restaurant",
        entityId: restaurant._id,
        action: `VENDOR_STATUS_${action || status || "UPDATED"}`,
        userId: req.user?._id,
        userRole: "admin",
        reason: reason || `Admin updated vendor status to ${restaurant.verificationStatus}`,
      });

      return res.status(200).json({
        success: true,
        message: `Vendor status successfully updated to ${restaurant.verificationStatus}`,
        data: restaurant,
      });
    }

    // Check ServiceProvider
    let sp = await ServiceProvider.findById(id);
    if (sp) {
      if (action === "approve" || status === "approved") {
        sp.verificationStatus = "verified";
        sp.isVerified = true;
        sp.isAvailable = true;
      } else if (action === "reject" || status === "rejected") {
        sp.verificationStatus = "rejected";
        sp.isVerified = false;
      } else if (action === "suspend" || status === "suspended") {
        sp.verificationStatus = "suspended";
        sp.isAvailable = false;
      }

      if (isActive !== undefined) {
        sp.isAvailable = Boolean(isActive);
      }

      await sp.save();

      return res.status(200).json({
        success: true,
        message: `Technician status updated to ${sp.verificationStatus}`,
        data: sp,
      });
    }

    return res.status(404).json({ success: false, message: "Vendor partner not found" });
  } catch (error) {
    console.error("Error in updateVendorStatus:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/admin/vendors/:id/commission
 * Configure platform commission % for a specific vendor
 */
exports.updateVendorCommission = async (req, res) => {
  try {
    const { id } = req.params;
    const { commissionRate, adminCommission } = req.body;

    const rate = Number(adminCommission !== undefined ? adminCommission : commissionRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      return res.status(400).json({ success: false, message: "Commission rate must be between 0% and 100%" });
    }

    let restaurant = await Restaurant.findById(id);
    if (restaurant) {
      const oldRate = restaurant.adminCommission;
      restaurant.adminCommission = rate;
      await restaurant.save();

      await AuditLog.log({
        entity: "Restaurant",
        entityId: restaurant._id,
        action: "VENDOR_COMMISSION_UPDATED",
        userId: req.user?._id,
        userRole: "admin",
        changes: { field: "adminCommission", oldValue: oldRate, newValue: rate },
        reason: `Admin updated vendor commission to ${rate}%`,
      });

      return res.status(200).json({
        success: true,
        message: `Admin commission set to ${rate}%`,
        data: restaurant,
      });
    }

    let sp = await ServiceProvider.findById(id);
    if (sp) {
      sp.commissionRate = rate;
      await sp.save();
      return res.status(200).json({
        success: true,
        message: `Technician commission set to ${rate}%`,
        data: sp,
      });
    }

    return res.status(404).json({ success: false, message: "Vendor partner not found" });
  } catch (error) {
    console.error("Error in updateVendorCommission:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/admin/vendors/:id
 * Edit vendor profile, service radius, address
 */
exports.updateVendorProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      ownerName,
      phone,
      contactNumber,
      email,
      address,
      area,
      city,
      geofenceRadius,
      deliveryTime,
      vertical,
      businessType,
      isActive,
    } = req.body;

    let restaurant = await Restaurant.findById(id);
    if (restaurant) {
      if (name) {
        if (typeof restaurant.name === "object") {
          restaurant.name.en = name;
        } else {
          restaurant.name = name;
        }
      }
      if (ownerName) restaurant.ownerName = ownerName;
      if (phone || contactNumber) {
        restaurant.phone = phone || contactNumber;
        restaurant.contactNumber = phone || contactNumber;
      }
      if (email) restaurant.email = email;
      if (address) restaurant.address = address;
      if (area) restaurant.area = area;
      if (city) restaurant.city = city;
      if (geofenceRadius !== undefined) restaurant.geofenceRadius = Number(geofenceRadius);
      if (deliveryTime !== undefined) restaurant.deliveryTime = Number(deliveryTime);
      if (vertical) restaurant.vertical = vertical;
      if (businessType) restaurant.businessType = businessType;
      if (isActive !== undefined) restaurant.isActive = Boolean(isActive);

      await restaurant.save();

      return res.status(200).json({
        success: true,
        message: "Vendor profile updated successfully",
        data: restaurant,
      });
    }

    let sp = await ServiceProvider.findById(id);
    if (sp) {
      if (name) sp.name = name;
      if (phone) sp.phone = phone;
      if (email) sp.email = email;
      if (geofenceRadius !== undefined) sp.serviceRadiusKm = Number(geofenceRadius);
      if (area) sp.serviceAreas = [area];

      await sp.save();

      return res.status(200).json({
        success: true,
        message: "Technician profile updated successfully",
        data: sp,
      });
    }

    return res.status(404).json({ success: false, message: "Vendor partner not found" });
  } catch (error) {
    console.error("Error in updateVendorProfile:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

