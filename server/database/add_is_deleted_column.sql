-- Migration: Add is_deleted and deleted_at columns to users table
-- This ensures compatibility with the backend authentication service

USE login_app;

-- Add is_deleted column
ALTER TABLE users 
ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE AFTER updated_at;

-- Add deleted_at column  
ALTER TABLE users 
ADD COLUMN deleted_at DATETIME AFTER is_deleted;

-- Add index for better query performance
ALTER TABLE users 
ADD INDEX idx_user_deleted (is_deleted);

-- Verify the changes
DESCRIBE users;
