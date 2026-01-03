/**
 * CREATE TEST ADMIN USER
 * Run this script to create a test admin user in the database
 * 
 * Usage: node create_test_admin.js
 */

import bcrypt from 'bcrypt';
import pool from '../config/db.js';

const createTestAdmin = async () => {
  try {
    console.log('Creating test admin user...\n');

    // Admin credentials
    const adminData = {
      employee_id: 'OIAD20260001',
      name: 'Admin User',
      full_name: 'Test Admin User',
      email: 'admin@dayflow.com',
      phone: '+91-9876543210',
      password: 'Admin@2026',
      role: 'ADMIN',
      status: 'ACTIVE',
      joining_year: 2026
    };

    // Check if user already exists
    const [existing] = await pool.query(
      'SELECT id, email FROM users WHERE email = ?',
      [adminData.email]
    );

    if (existing.length > 0) {
      console.log('❌ User already exists with email:', adminData.email);
      console.log('   User ID:', existing[0].id);
      console.log('\nTo update this user, use the update script instead.\n');
      process.exit(1);
    }

    // Hash the password
    console.log('Hashing password...');
    const password_hash = await bcrypt.hash(adminData.password, 10);

    // Insert the user
    console.log('Inserting user into database...');
    const [result] = await pool.query(
      `INSERT INTO users (
        employee_id, name, full_name, email, phone, password_hash,
        role, status, joining_year, is_first_login, email_verified,
        is_deleted, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        adminData.employee_id,
        adminData.name,
        adminData.full_name,
        adminData.email,
        adminData.phone,
        password_hash,
        adminData.role,
        adminData.status,
        adminData.joining_year,
        false,  // is_first_login
        true,   // email_verified
        false   // is_deleted
      ]
    );

    // Verify the user was created
    const [newUser] = await pool.query(
      `SELECT id, employee_id, name, full_name, email, role, status, joining_year
       FROM users WHERE id = ?`,
      [result.insertId]
    );

    console.log('\n✅ Test admin user created successfully!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('Login Credentials:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('Email:       ', adminData.email);
    console.log('Password:    ', adminData.password);
    console.log('Employee ID: ', adminData.employee_id);
    console.log('═══════════════════════════════════════════════════════');
    console.log('\nUser Details:');
    console.log(newUser[0]);
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test admin user:', error.message);
    process.exit(1);
  }
};

createTestAdmin();
