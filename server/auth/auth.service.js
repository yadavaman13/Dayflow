import db from '../config/db.js';
import bcrypt from 'bcrypt';

/**
 * Auth Service
 * Handles all database operations related to authentication
 */

/**
 * Find a user by email
 * @param {string} email - User's email address
 * @returns {Object|null} User object or null if not found
 */
export const findUserByEmail = async (email) => {
  const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return users.length > 0 ? users[0] : null;
};

/**
 * Find a user by ID
 * @param {number} userId - User's ID
 * @returns {Object|null} User object (without password) or null
 */
export const findUserById = async (userId) => {
  const [users] = await db.query(
    'SELECT id, email, name, phone, created_at FROM users WHERE id = ?',
    [userId]
  );
  return users.length > 0 ? users[0] : null;
};

/**
 * Create a new user
 * @param {Object} userData - User data {email, name, phone, password}
 * @returns {Object} Created user data with ID
 */
export const createUser = async (userData) => {
  const { email, name, phone, password } = userData;

  // Hash the password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Insert into database
  const [result] = await db.query(
    'INSERT INTO users (email, name, phone, password) VALUES (?, ?, ?, ?)',
    [email, name, phone || null, hashedPassword]
  );

  return {
    id: result.insertId,
    email,
    name,
    phone: phone || null,
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
  const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
  return users.length > 0;
};

/**
 * Update user's last login timestamp
 * @param {number} userId - User's ID
 */
export const updateLastLogin = async (userId) => {
  await db.query('UPDATE users SET updated_at = NOW() WHERE id = ?', [userId]);
};
