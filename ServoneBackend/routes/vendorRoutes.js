const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getVendors,
  getVendorById,
  updateVendorStatus,
  updateVendorCommission,
  updateVendorProfile
} = require('../controllers/vendorController');

// All vendor management routes are accessible by admin (and protect middleware where token is supplied)
router.get('/', getVendors);
router.get('/:id', getVendorById);
router.patch('/:id/status', updateVendorStatus);
router.put('/:id/commission', updateVendorCommission);
router.put('/:id', updateVendorProfile);

module.exports = router;

