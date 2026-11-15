const express = require('express');
const {
  getPublicSettings,
  updateAdminSettings,
  updatePlatformMode,
  getInvoiceSettings,
  updateInvoiceSettings,
} = require('../controllers/adminSettingsController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getPublicSettings);
router.get('/platform-mode', getPublicSettings);
router.get('/invoice', getInvoiceSettings);
router.put('/invoice', protect, admin, updateInvoiceSettings);
router.put('/', protect, admin, updateAdminSettings);
router.put('/platform-mode', protect, admin, updatePlatformMode);
router.patch('/platform-mode', protect, admin, updatePlatformMode);

module.exports = router;
