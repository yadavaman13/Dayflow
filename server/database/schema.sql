-- ============================================
-- Login Application Database Schema
-- ============================================

-- Create the database
CREATE DATABASE IF NOT EXISTS login_app;
USE login_app;

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS users;

-- ============================================
-- Users Table
-- ============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_created_at (created_at),
    INDEX idx_reset_token (reset_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================
-- Password: Test123! (will be hashed in actual implementation)
-- INSERT INTO users (email, name, phone, password) VALUES 
-- ('test@example.com', 'Test User', '1234567890', '$2b$10$...');

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================
-- Password: Test123! (will be hashed in actual implementation)
-- INSERT INTO users (email, name, phone, password) VALUES 
-- ('test@example.com', 'Test User', '1234567890', '$2b$10$...');
