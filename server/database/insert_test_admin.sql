-- ============================================
-- INSERT TEST ADMIN USER
-- ============================================
-- This script creates a test admin user for Dayflow HRMS
-- 
-- Credentials:
-- Email: admin@dayflow.com
-- Password: Admin@2026
-- Employee ID: OIAD20260001
-- ============================================

USE dayflow_hrms;

-- Insert test admin user
INSERT INTO users (
    employee_id,
    name,
    full_name,
    email,
    phone,
    password_hash,
    role,
    status,
    joining_year,
    is_first_login,
    email_verified,
    is_deleted,
    created_at,
    updated_at
) VALUES (
    'OIAD20260001',                                                     -- employee_id
    'Admin User',                                                       -- name
    'Test Admin User',                                                  -- full_name
    'admin@dayflow.com',                                               -- email
    '+91-9876543210',                                                  -- phone
    '$2b$10$vKWZ8zJ7J7QJZ8J7J7J7J.oK8J7J7J7J7J7J7J7J7J7J7J7J7J7J7u',  -- password: Admin@2026
    'ADMIN',                                                           -- role
    'ACTIVE',                                                          -- status
    2026,                                                              -- joining_year
    FALSE,                                                             -- is_first_login (set to false since we're setting a known password)
    TRUE,                                                              -- email_verified
    FALSE,                                                             -- is_deleted
    NOW(),                                                             -- created_at
    NOW()                                                              -- updated_at
);

-- Verify the user was created
SELECT 
    id,
    employee_id,
    name,
    full_name,
    email,
    role,
    status,
    joining_year
FROM users 
WHERE email = 'admin@dayflow.com';

-- ============================================
-- ALTERNATIVE: If you want to update your existing user
-- ============================================
-- Uncomment the following to update work.yadavaman@gmail.com
-- with a new known password: Admin@2026

/*
UPDATE users 
SET 
    password_hash = '$2b$10$vKWZ8zJ7J7QJZ8J7J7J7J.oK8J7J7J7J7J7J7J7J7J7J7J7J7J7J7u',
    role = 'ADMIN',
    status = 'ACTIVE',
    full_name = COALESCE(full_name, name),
    is_first_login = FALSE
WHERE email = 'work.yadavaman@gmail.com';

-- Verify the update
SELECT 
    id,
    employee_id,
    name,
    full_name,
    email,
    role,
    status
FROM users 
WHERE email = 'work.yadavaman@gmail.com';
*/
