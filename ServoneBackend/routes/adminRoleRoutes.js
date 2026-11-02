const express = require('express');
const router = express.Router();
const Role = require('../models/Role');
const Staff = require('../models/Staff');
const { protect, admin } = require('../middleware/authMiddleware');
const { VERTICALS } = require('../constants/verticals');

const PERMISSIONS_CATALOG = [
  // Super Admin
  { id: '*', label: 'All Permissions (Super Admin Access)', group: 'System' },

  // Food Vertical
  { id: 'food.dashboard.view', label: 'View Food Dashboard', group: 'Food Delivery' },
  { id: 'food.restaurants.view', label: 'View Restaurants', group: 'Food Delivery' },
  { id: 'food.restaurants.approve', label: 'Approve / Reject Restaurants', group: 'Food Delivery' },
  { id: 'food.menu.manage', label: 'Manage Food Menus & Items', group: 'Food Delivery' },
  { id: 'food.orders.view', label: 'View Food Orders', group: 'Food Delivery' },
  { id: 'food.orders.manage', label: 'Manage & Dispatch Food Orders', group: 'Food Delivery' },

  // Grocery Vertical
  { id: 'grocery.dashboard.view', label: 'View Grocery Dashboard', group: 'Grocery Delivery' },
  { id: 'grocery.stores.manage', label: 'Manage Grocery Stores', group: 'Grocery Delivery' },
  { id: 'grocery.products.create', label: 'Add Grocery Products & Variants', group: 'Grocery Delivery' },
  { id: 'grocery.inventory.update', label: 'Update Live Stock & Inventory', group: 'Grocery Delivery' },
  { id: 'grocery.orders.manage', label: 'Manage Grocery Orders & Substitutions', group: 'Grocery Delivery' },

  // Home Services Vertical
  { id: 'home_services.dashboard.view', label: 'View Home Services Dashboard', group: 'Home Services' },
  { id: 'home_services.providers.approve', label: 'Approve & Verify Technicians', group: 'Home Services' },
  { id: 'home_services.catalog.manage', label: 'Manage Services & Price Cards', group: 'Home Services' },
  { id: 'home_services.bookings.manage', label: 'Manage Bookings & Appointments', group: 'Home Services' },
  { id: 'home_services.quotations.review', label: 'Review & Approve Job Quotations', group: 'Home Services' },

  // Medicine & Pharmacy
  { id: 'medicine.dashboard.view', label: 'View Pharmacy Dashboard', group: 'Medicine & Pharmacy' },
  { id: 'medicine.pharmacies.approve', label: 'Verify & Approve Pharmacies', group: 'Medicine & Pharmacy' },
  { id: 'medicine.prescriptions.review', label: 'Review & Approve Doctor Prescriptions', group: 'Medicine & Pharmacy' },
  { id: 'medicine.orders.manage', label: 'Manage Medicine Orders & Invoices', group: 'Medicine & Pharmacy' },

  // Courier & Parcel
  { id: 'courier.dashboard.view', label: 'View Courier Dashboard', group: 'Courier & Pickup/Drop' },
  { id: 'courier.orders.manage', label: 'Manage Courier Dispatches & Zones', group: 'Courier & Pickup/Drop' },
  { id: 'courier.pricing.manage', label: 'Configure Weight & Distance Pricing', group: 'Courier & Pickup/Drop' },

  // Laundry
  { id: 'laundry.dashboard.view', label: 'View Laundry Dashboard', group: 'Laundry' },
  { id: 'laundry.partners.manage', label: 'Manage Laundry Partners', group: 'Laundry' },
  { id: 'laundry.orders.manage', label: 'Manage Laundry Pickups & Processing', group: 'Laundry' },

  // Rider Management
  { id: 'riders.view', label: 'View Delivery Riders', group: 'Riders' },
  { id: 'riders.approve', label: 'Verify Rider KYC & Onboarding', group: 'Riders' },
  { id: 'riders.payouts.manage', label: 'Process Rider Payouts & Incentives', group: 'Riders' },

  // Finance & Accounts
  { id: 'finance.transactions.view', label: 'View Payment Ledgers & Transactions', group: 'Finance' },
  { id: 'finance.settlements.manage', label: 'Process Partner Settlements', group: 'Finance' },
  { id: 'finance.refunds.approve', label: 'Approve Customer Refunds', group: 'Finance' },

  // Settings & System
  { id: 'admin.users.manage', label: 'Manage User Accounts', group: 'Administration' },
  { id: 'admin.roles.manage', label: 'Manage Roles & RBAC Matrix', group: 'Administration' },
  { id: 'admin.settings.manage', label: 'System Configuration & Operational Presets', group: 'Administration' }
];

// GET /api/admin/roles-permissions/permissions-catalog
router.get('/permissions-catalog', protect, admin, (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      catalog: PERMISSIONS_CATALOG,
      verticals: Object.values(VERTICALS)
    }
  });
});

// GET /api/admin/roles-permissions/roles
router.get('/roles', protect, admin, async (req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: roles
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/admin/roles-permissions/roles
router.post('/roles', protect, admin, async (req, res) => {
  try {
    const { name, accountType, description, permissions, allowedVerticals, allowedCities } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Role name is required' });
    }

    const existingRole = await Role.findOne({ name: name.trim() });
    if (existingRole) {
      return res.status(400).json({ success: false, message: 'A role with this name already exists' });
    }

    const role = await Role.create({
      name: name.trim(),
      accountType: accountType || 'Admin',
      description: description || '',
      permissions: permissions || [],
      allowedVerticals: allowedVerticals || ['all'],
      allowedCities: allowedCities || ['all'],
      isSystemDefault: false,
      isActive: true
    });

    return res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: role
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/roles-permissions/roles/:id
router.put('/roles/:id', protect, admin, async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    const { name, accountType, description, permissions, allowedVerticals, allowedCities, isActive } = req.body;

    if (name) role.name = name.trim();
    if (accountType) role.accountType = accountType;
    if (description !== undefined) role.description = description;
    if (permissions) role.permissions = permissions;
    if (allowedVerticals) role.allowedVerticals = allowedVerticals;
    if (allowedCities) role.allowedCities = allowedCities;
    if (isActive !== undefined) role.isActive = isActive;

    await role.save();

    return res.status(200).json({
      success: true,
      message: 'Role updated successfully',
      data: role
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/admin/roles-permissions/roles/:id
router.delete('/roles/:id', protect, admin, async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    if (role.isSystemDefault) {
      return res.status(400).json({ success: false, message: 'System default roles cannot be deleted' });
    }

    // Check if any staff is using this role
    const assignedStaffCount = await Staff.countDocuments({ role: role._id });
    if (assignedStaffCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete role. It is currently assigned to ${assignedStaffCount} staff member(s).`
      });
    }

    await Role.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

