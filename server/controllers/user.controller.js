import pool from '../config/db.js';
import bcrypt from 'bcrypt';

/**
 * Get all users (with pagination and filters)
 */
export const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      status,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = req.query;

    const offset = (page - 1) * limit;
    let query = `
      SELECT 
        u.id, u.employee_id, u.name, u.full_name, u.email, u.phone,
        u.profile_url, u.role, u.status, u.joining_year,
        u.is_first_login, u.email_verified, u.created_at, u.updated_at,
        creator.name as created_by_name
      FROM users u
      LEFT JOIN users creator ON u.created_by = creator.id
      WHERE u.is_deleted = FALSE
    `;

    const params = [];

    if (role) {
      query += ' AND u.role = ?';
      params.push(role);
    }

    if (status) {
      query += ' AND u.status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (u.name LIKE ? OR u.email LIKE ? OR u.employee_id LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Count total
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    // Add sorting and pagination
    query += ` ORDER BY u.${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [users] = await pool.query(query, params);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await pool.query(
      `SELECT 
        u.id, u.employee_id, u.name, u.full_name, u.email, u.phone,
        u.profile_url, u.role, u.status, u.joining_year,
        u.is_first_login, u.email_verified, u.created_at, u.updated_at,
        u.employee_table_id,
        creator.name as created_by_name
      FROM users u
      LEFT JOIN users creator ON u.created_by = creator.id
      WHERE u.id = ? AND u.is_deleted = FALSE`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: users[0],
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message,
    });
  }
};

/**
 * Create new user
 */
export const createUser = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      employee_id,
      name,
      full_name,
      email,
      phone,
      password,
      role = 'EMPLOYEE',
      joining_year,
      profile_url,
    } = req.body;

    // Validation
    if (!employee_id || !name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID, name, email, and password are required',
      });
    }

    // Check if employee_id or email already exists
    const [existing] = await connection.query(
      'SELECT id FROM users WHERE (employee_id = ? OR email = ?) AND is_deleted = FALSE',
      [employee_id, email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this employee ID or email already exists',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await connection.query(
      `INSERT INTO users 
        (employee_id, name, full_name, email, phone, password_hash, role, 
         joining_year, profile_url, status, is_first_login, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'FIRST_LOGIN_PENDING', TRUE, ?)`,
      [
        employee_id,
        name,
        full_name || name,
        email,
        phone,
        password_hash,
        role,
        joining_year || new Date().getFullYear(),
        profile_url,
        req.user.id,
      ]
    );

    await connection.commit();

    // Get created user
    const [newUser] = await connection.query(
      'SELECT id, employee_id, name, email, role, status FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser[0],
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

/**
 * Update user
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, full_name, email, phone, profile_url } = req.body;

    // Check if user exists
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE id = ? AND is_deleted = FALSE',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update user
    await pool.query(
      `UPDATE users 
      SET name = COALESCE(?, name),
          full_name = COALESCE(?, full_name),
          email = COALESCE(?, email),
          phone = COALESCE(?, phone),
          profile_url = COALESCE(?, profile_url),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [name, full_name, email, phone, profile_url, id]
    );

    // Get updated user
    const [updated] = await pool.query(
      'SELECT id, employee_id, name, email, phone, role, status FROM users WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updated[0],
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message,
    });
  }
};

/**
 * Soft delete user
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE id = ? AND is_deleted = FALSE',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Soft delete
    await pool.query(
      `UPDATE users 
      SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP, status = 'INACTIVE'
      WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    });
  }
};

/**
 * Restore deleted user
 */
export const restoreUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists and is deleted
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE id = ? AND is_deleted = TRUE',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Deleted user not found',
      });
    }

    // Restore user
    await pool.query(
      `UPDATE users 
      SET is_deleted = FALSE, deleted_at = NULL, status = 'ACTIVE'
      WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'User restored successfully',
    });
  } catch (error) {
    console.error('Restore user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore user',
      error: error.message,
    });
  }
};

/**
 * Change user role (Admin only)
 */
export const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['HR', 'EMPLOYEE', 'ADMIN'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be HR, EMPLOYEE, or ADMIN',
      });
    }

    await pool.query(
      'UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND is_deleted = FALSE',
      [role, id]
    );

    res.json({
      success: true,
      message: 'User role updated successfully',
    });
  } catch (error) {
    console.error('Change role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change user role',
      error: error.message,
    });
  }
};

/**
 * Change user status
 */
export const changeUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'INACTIVE', 'FIRST_LOGIN_PENDING'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    await pool.query(
      'UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND is_deleted = FALSE',
      [status, id]
    );

    res.json({
      success: true,
      message: 'User status updated successfully',
    });
  } catch (error) {
    console.error('Change status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change user status',
      error: error.message,
    });
  }
};

/**
 * Get current user profile
 */
export const getUserProfile = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT 
        u.id, u.employee_id, u.name, u.full_name, u.email, u.phone,
        u.profile_url, u.role, u.status, u.joining_year,
        u.is_first_login, u.email_verified, u.created_at
      FROM users u
      WHERE u.id = ? AND u.is_deleted = FALSE`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: users[0],
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message,
    });
  }
};

/**
 * Update current user profile
 */
export const updateUserProfile = async (req, res) => {
  try {
    const { name, full_name, phone, profile_url } = req.body;

    await pool.query(
      `UPDATE users 
      SET name = COALESCE(?, name),
          full_name = COALESCE(?, full_name),
          phone = COALESCE(?, phone),
          profile_url = COALESCE(?, profile_url),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [name, full_name, phone, profile_url, req.user.id]
    );

    // Get updated profile
    const [updated] = await pool.query(
      'SELECT id, employee_id, name, full_name, email, phone, profile_url, role FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updated[0],
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
};

/**
 * Change password
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    // Get current password hash
    const [users] = await pool.query(
      'SELECT password_hash FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, users[0].password_hash);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    await pool.query(
      `UPDATE users 
      SET password_hash = ?, 
          is_first_login = FALSE,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [newPasswordHash, req.user.id]
    );

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message,
    });
  }
};

/**
 * Get users by role
 */
export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;

    const [users] = await pool.query(
      `SELECT id, employee_id, name, email, phone, status, created_at
      FROM users
      WHERE role = ? AND is_deleted = FALSE
      ORDER BY name ASC`,
      [role.toUpperCase()]
    );

    res.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
};

/**
 * Get user statistics
 */
export const getUserStats = async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'HR' THEN 1 ELSE 0 END) as hr_count,
        SUM(CASE WHEN role = 'EMPLOYEE' THEN 1 ELSE 0 END) as employee_count,
        SUM(CASE WHEN role = 'ADMIN' THEN 1 ELSE 0 END) as admin_count,
        SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN status = 'INACTIVE' THEN 1 ELSE 0 END) as inactive_users,
        SUM(CASE WHEN status = 'FIRST_LOGIN_PENDING' THEN 1 ELSE 0 END) as pending_users
      FROM users
      WHERE is_deleted = FALSE
    `);

    res.json({
      success: true,
      data: stats[0],
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: error.message,
    });
  }
};
