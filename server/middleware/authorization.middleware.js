import pool from '../config/db.js';

/**
 * Role-based authorization middleware
 * Checks if user has required role to access a route
 */
export const authorize = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Ensure user is authenticated first
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Get user role from database
      const [users] = await pool.query(
        'SELECT role, status FROM users WHERE id = ? AND is_deleted = FALSE',
        [req.user.id]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const user = users[0];

      // Check if user is active
      if (user.status !== 'ACTIVE' && user.status !== 'FIRST_LOGIN_PENDING') {
        return res.status(403).json({
          success: false,
          message: 'User account is not active',
        });
      }

      // Check if user has required role
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access this resource',
          requiredRoles: allowedRoles,
          userRole: user.role,
        });
      }

      // Attach role to request for further use
      req.user.role = user.role;
      req.user.status = user.status;

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization check failed',
      });
    }
  };
};

/**
 * Check if user is HR (HR or ADMIN)
 */
export const isHR = authorize('HR', 'ADMIN');

/**
 * Check if user is Admin
 */
export const isAdmin = authorize('ADMIN');

/**
 * Check if user is HR or Admin
 */
export const isHROrAdmin = authorize('HR', 'ADMIN');

/**
 * Allow all authenticated users
 */
export const isEmployee = authorize('EMPLOYEE', 'HR', 'ADMIN');

/**
 * Self or HR check - allows users to access their own data or HR to access any data
 */
export const selfOrHR = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Get user role
    const [users] = await pool.query(
      'SELECT role FROM users WHERE id = ? AND is_deleted = FALSE',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const userRole = users[0].role;
    req.user.role = userRole;

    // HR and ADMIN can access any user's data
    if (userRole === 'HR' || userRole === 'ADMIN') {
      return next();
    }

    // Regular employees can only access their own data
    const targetUserId = req.params.userId || req.params.id;
    
    if (targetUserId && parseInt(targetUserId) !== parseInt(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only access your own data',
      });
    }

    next();
  } catch (error) {
    console.error('Authorization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization check failed',
    });
  }
};
