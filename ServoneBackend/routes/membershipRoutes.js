const express = require('express');
const router = express.Router();
const {
  getPlans,
  subscribePlan,
  getMySubscription,
  checkBadge,
  submitEnquiry,
  adminGetPlans,
  adminCreatePlan,
  adminUpdatePlan,
  adminDeletePlan,
  adminGetSubscriptions,
  adminGetEnquiries,
  adminUpdateEnquiryStatus,
} = require('../controllers/membershipController');
const { protect } = require('../middleware/authMiddleware');

// Public and App/Web membership routes
router.get('/plans', getPlans);
router.post('/subscribe', (req, res, next) => {
  // If authorization header exists, run protect middleware, else proceed to allow direct subscription
  if (req.headers.authorization || req.cookies?.token) {
    return protect(req, res, next);
  }
  next();
}, subscribePlan);

router.get('/my-subscription', (req, res, next) => {
  if (req.headers.authorization || req.cookies?.token) {
    return protect(req, res, next);
  }
  next();
}, getMySubscription);

router.get('/badge/:type/:id', checkBadge);
router.post('/enquiry', submitEnquiry);

// Admin membership routes
router.get('/admin/plans', adminGetPlans);
router.post('/admin/plans', adminCreatePlan);
router.put('/admin/plans/:id', adminUpdatePlan);
router.delete('/admin/plans/:id', adminDeletePlan);
router.get('/admin/subscriptions', adminGetSubscriptions);
router.get('/admin/enquiries', adminGetEnquiries);
router.put('/admin/enquiries/:id/status', adminUpdateEnquiryStatus);

module.exports = router;
