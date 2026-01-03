-- ============================================
-- Migration Script: Transform to Employee Management System
-- Run this script to update existing database
-- ============================================

USE login_app;

-- Step 1: Add new columns to users table if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS employee_id VARCHAR(20) UNIQUE AFTER id,
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) AFTER profile_url,
ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'employee' AFTER password_hash,
ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'active' AFTER role,
ADD COLUMN IF NOT EXISTS is_first_login TINYINT(1) DEFAULT 1 AFTER status,
ADD COLUMN IF NOT EXISTS email_verified TINYINT(1) DEFAULT 0 AFTER is_first_login,
ADD COLUMN IF NOT EXISTS created_by BIGINT AFTER reset_token_expiry,
ADD COLUMN IF NOT EXISTS is_deleted TINYINT(1) DEFAULT 0 AFTER updated_at,
ADD COLUMN IF NOT EXISTS deleted_at DATETIME AFTER is_deleted,
ADD COLUMN IF NOT EXISTS joining_year INT AFTER deleted_at;

-- Step 2: Modify existing columns if needed
ALTER TABLE users 
MODIFY COLUMN id BIGINT AUTO_INCREMENT,
MODIFY COLUMN name VARCHAR(100) NOT NULL,
MODIFY COLUMN email VARCHAR(150) NOT NULL UNIQUE;

-- Step 3: For existing users, generate employee IDs
-- This is a placeholder - you'll need to manually update employee_id for existing users
-- Example: UPDATE users SET employee_id = 'OIXXXX20260001', joining_year = 2026 WHERE id = 1;

-- Step 4: Copy password to password_hash for existing users (if not done)
UPDATE users SET password_hash = password WHERE password_hash IS NULL;

-- Step 5: Set default values for new columns for existing users
UPDATE users 
SET 
    role = 'employee', 
    status = 'active', 
    is_first_login = 0, 
    email_verified = 1,
    is_deleted = 0,
    joining_year = YEAR(created_at)
WHERE role IS NULL OR role = '';

-- Step 6: Drop old password column (only after verifying password_hash is populated)
-- IMPORTANT: Uncomment only after verifying all passwords are migrated
-- ALTER TABLE users DROP COLUMN password;

-- Step 7: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_employee_id ON users(employee_id);
CREATE INDEX IF NOT EXISTS idx_joining_year ON users(joining_year);
CREATE INDEX IF NOT EXISTS idx_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_status ON users(status);

-- Step 8: Add foreign key constraint for created_by
-- Note: This will fail if there are existing users with created_by values that don't exist
-- ALTER TABLE users ADD CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================
-- Verification Queries
-- ============================================
-- Run these to verify the migration

-- Check table structure
DESCRIBE users;

-- Check for users without employee_id
SELECT id, name, email, employee_id FROM users WHERE employee_id IS NULL OR employee_id = '';

-- Check all users
SELECT id, employee_id, name, email, role, status, joining_year FROM users;

-- ============================================
-- Rollback Instructions (if needed)
-- ============================================
-- To rollback, you can drop the new columns:
-- ALTER TABLE users 
-- DROP COLUMN employee_id,
-- DROP COLUMN password_hash,
-- DROP COLUMN role,
-- DROP COLUMN status,
-- DROP COLUMN is_first_login,
-- DROP COLUMN email_verified,
-- DROP COLUMN created_by,
-- DROP COLUMN is_deleted,
-- DROP COLUMN deleted_at,
-- DROP COLUMN joining_year;
