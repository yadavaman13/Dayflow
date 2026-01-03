/**
 * UPDATE EXISTING USER TO ADMIN
 * Run this script to update work.yadavaman@gmail.com to ADMIN with new password
 * 
 * Usage: node update_user_to_admin.js
 */

import bcrypt from 'bcrypt';
import pool from '../config/db.js';

const updateUserToAdmin = async () => {
  try {
    console.log('Updating existing user to admin...\n');

    // User email to update
    const email = 'work.yadavaman@gmail.com';
    const newPassword = 'Admin@2026';

    // Check if user exists
    const [existing] = await pool.query(
      'SELECT id, email, name, employee_id, role FROM users WHERE email = ?',
      [email]
    );

    if (existing.length === 0) {
      console.log('❌ User not found with email:', email);
      process.exit(1);
    }

    console.log('Found user:', existing[0]);
    console.log('\nUpdating password and role...');

    // Hash the new password
    const password_hash = await bcrypt.hash(newPassword, 10);

    // Update the user
    await pool.query(
      `UPDATE users 
       SET 
         password_hash = ?,
         role = 'ADMIN',
         status = 'ACTIVE',
         full_name = COALESCE(full_name, name),
         is_first_login = FALSE,
         updated_at = NOW()
       WHERE email = ?`,
      [password_hash, email]
    );

    // Verify the update
    const [updatedUser] = await pool.query(
      `SELECT id, employee_id, name, full_name, email, role, status
       FROM users WHERE email = ?`,
      [email]
    );

    console.log('\n✅ User updated successfully!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('Login Credentials:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('Email:    ', email);
    console.log('Password: ', newPassword);
    console.log('═══════════════════════════════════════════════════════');
    console.log('\nUpdated User Details:');
    console.log(updatedUser[0]);
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating user:', error.message);
    process.exit(1);
  }
};

updateUserToAdmin();
