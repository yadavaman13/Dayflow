import db from '../config/db.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

/**
 * Auth Service
 * Handles all database operations related to authentication
 */

/**
 * Generate Employee ID
 * Format: OI (First two letters of first and last name) (Year) (Serial number)
 * Example: OIJODO20220001
 * @param {string} firstName - Employee's first name
 * @param {string} lastName - Employee's last name
 * @param {number} joiningYear - Year of joining
 * @returns {string} Generated employee ID
 */
export const generateEmployeeId = async (firstName, lastName, joiningYear) => {
  // Company prefix
  const companyPrefix = 'OI';
  
  // Get first two letters of first name and last name (uppercase)
  const firstNamePrefix = firstName.substring(0, 2).toUpperCase();
  const lastNamePrefix = lastName.substring(0, 2).toUpperCase();
  
  // Get the count of employees joined in the same year
  const [result] = await db.query(
    'SELECT COUNT(*) as count FROM users WHERE joining_year = ?',
    [joiningYear]
  );
  
  // Generate serial number (padded with zeros)
  const serialNumber = String(result[0].count + 1).padStart(4, '0');
  
  // Construct employee ID
  const employeeId = `${companyPrefix}${firstNamePrefix}${lastNamePrefix}${joiningYear}${serialNumber}`;
  
  return employeeId;
};

/**
 * Find a user by email
 * @param {string} email - User's email address
 * @returns {Object|null} User object or null if not found
 */
export const findUserByEmail = async (email) => {
  const [users] = await db.query('SELECT * FROM users WHERE email = ? AND is_deleted = 0', [email]);
  return users.length > 0 ? users[0] : null;
};

/**
 * Find a user by employee ID
 * @param {string} employeeId - Employee ID
 * @returns {Object|null} User object or null if not found
 */
export const findUserByEmployeeId = async (employeeId) => {
  const [users] = await db.query('SELECT * FROM users WHERE employee_id = ? AND is_deleted = 0', [employeeId]);
  return users.length > 0 ? users[0] : null;
};

/**
 * Find a user by ID
 * @param {number} userId - User's ID
 * @returns {Object|null} User object (without password) or null
 */
export const findUserById = async (userId) => {
  const [users] = await db.query(
    'SELECT id, employee_id, email, name, phone, role, status, is_first_login, created_at FROM users WHERE id = ? AND is_deleted = 0',
    [userId]
  );
  return users.length > 0 ? users[0] : null;
};

/**
 * Create a new employee (HR only)
 * @param {Object} userData - User data {email, name, phone, joiningYear, role, createdBy}
 * @returns {Object} Created user data with employee ID and reset token
 */
export const createEmployee = async (userData) => {
  const { email, name, phone, joiningYear, role, createdBy } = userData;

  // Split name into first and last name
  const nameParts = name.trim().split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];

  // Generate employee ID
  const employeeId = await generateEmployeeId(firstName, lastName, joiningYear);

  // Generate a temporary password (will be reset by employee)
  const tempPassword = crypto.randomBytes(16).toString('hex');
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(tempPassword, saltRounds);

  // Generate reset token for first-time password setup
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 7 * 24 * 3600000); // 7 days

  // Insert into database
  const [result] = await db.query(
    `INSERT INTO users (employee_id, email, name, phone, password_hash, role, status, 
     is_first_login, reset_token, reset_token_expiry, joining_year, created_by) 
     VALUES (?, ?, ?, ?, ?, ?, 'active', 1, ?, ?, ?, ?)`,
    [employeeId, email, name, phone || null, hashedPassword, role, resetToken, resetTokenExpiry, joiningYear, createdBy]
  );

  return {
    id: result.insertId,
    employeeId,
    email,
    name,
    phone: phone || null,
    role,
    resetToken,
  };
};

/**
 * Verify user password
 * @param {string} plainPassword - Plain text password from login
 * @param {string} hashedPassword - Hashed password from database
 * @returns {boolean} True if password matches
 */
export const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Check if email already exists
 * @param {string} email - Email to check
 * @returns {boolean} True if email exists
 */
export const emailExists = async (email) => {
  const [users] = await db.query('SELECT id FROM users WHERE email = ? AND is_deleted = 0', [email]);
  return users.length > 0;
};

/**
 * Check if employee ID already exists
 * @param {string} employeeId - Employee ID to check
 * @returns {boolean} True if employee ID exists
 */
export const employeeIdExists = async (employeeId) => {
  const [users] = await db.query('SELECT id FROM users WHERE employee_id = ? AND is_deleted = 0', [employeeId]);
  return users.length > 0;
};

/**
 * Update user's first login status
 * @param {number} userId - User's ID
 */
export const updateFirstLoginStatus = async (userId) => {
  await db.query('UPDATE users SET is_first_login = 0, updated_at = NOW() WHERE id = ?', [userId]);
};
