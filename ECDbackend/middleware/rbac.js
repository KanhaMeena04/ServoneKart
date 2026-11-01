/**
 * ECDKART RBAC (Role-Based Access Control) Middleware
 * Enforces category isolation and granular permissions across backend endpoints
 */
const User = require('../models/User');
const Staff = require('../models/Staff');
const Role = require('../models/Role');

/**
 * Check if the authenticated user has a specific permission or vertical access
 * @param {string} requiredPermission - e.g. 'food.orders.manage' or 'grocery.dashboard.view'
 * @param {string} [vertical] - e.g. 'grocery' or 'home_services'
 */
const checkPermission = (requiredPermission, vertical = null) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized. Authentication required.' });
      }

      // 1. Super Admin has universal access
      if (req.user.role === 'admin' || req.user.role === 'superadmin') {
        return next();
      }

      // 2. Fetch staff record & assigned role permissions if user is staff/manager
      let userPermissions = req.user.permissions || [];
      let allowedVerticals = req.user.allowedVerticals || ['all'];

      if (req.user.staffId || req.user.roleId) {
        const staff = await Staff.findOne({ userId: req.user._id, status: 'active' }).populate('role');
        if (staff && staff.role) {
          userPermissions = [...new Set([...userPermissions, ...(staff.role.permissions || [])])];
          if (staff.role.allowedVerticals) {
            allowedVerticals = staff.role.allowedVerticals;
          }
        }
      }

      // Wildcard check: '*' or module wildcard like 'food.*' or 'grocery.*'
      if (userPermissions.includes('*') || userPermissions.includes('admin.*')) {
        return next();
      }

      // Check vertical access restriction
      if (vertical && !allowedVerticals.includes('all') && !allowedVerticals.includes(vertical)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Your role is not assigned to the '${vertical}' vertical.`
        });
      }

      // Check specific permission
      if (requiredPermission) {
        const [mod, action, subaction] = requiredPermission.split('.');
        const hasDirect = userPermissions.includes(requiredPermission);
        const hasModuleWildcard = userPermissions.includes(`${mod}.*`);
        const hasActionWildcard = subaction ? userPermissions.includes(`${mod}.${action}.*`) : false;

        if (hasDirect || hasModuleWildcard || hasActionWildcard) {
          return next();
        }

        return res.status(403).json({
          success: false,
          message: `Forbidden. Missing required permission: ${requiredPermission}`
        });
      }

      next();
    } catch (error) {
      console.error('RBAC check error:', error.message);
      return res.status(500).json({ success: false, message: 'Internal authorization error' });
    }
  };
};

module.exports = {
  checkPermission
};
