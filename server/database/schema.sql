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
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20),
    profile_url TEXT,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL,
    is_first_login TINYINT(1) DEFAULT 1,
    email_verified TINYINT(1) DEFAULT 0,
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME,
    created_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT(1) DEFAULT 0,
    deleted_at DATETIME,
    joining_year INT NOT NULL,
    
    INDEX idx_employee_id (employee_id),
    INDEX idx_email (email),
    INDEX idx_created_at (created_at),
    INDEX idx_reset_token (reset_token),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
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
