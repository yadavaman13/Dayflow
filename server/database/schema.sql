-- ============================================
-- Dayflow HRMS – Production Grade Database Schema
-- "Every workday, perfectly aligned."
-- ============================================
-- Design Philosophy:
-- - Correctness over convenience
-- - Auditability over speed
-- - Long-term evolution without schema rewrites
-- - Relational, normalized (≥ 3NF)
-- - Surrogate primary keys (BIGINT)
-- - Temporal versioning for mutable business data
-- - Soft delete by default, hard delete by governance
-- ============================================

-- Create the database
CREATE DATABASE IF NOT EXISTS dayflow_hrms;
USE dayflow_hrms;

-- Set default storage engine and charset
SET default_storage_engine=InnoDB;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- DROP TABLES (Development Only - Reverse FK Order)
-- ============================================
-- Uncomment below for clean setup in development
/*
DROP TABLE IF EXISTS hard_delete_logs;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS user_activity_logs;
DROP TABLE IF EXISTS salary_slips;
DROP TABLE IF EXISTS salary_components;
DROP TABLE IF EXISTS salary_structures;
DROP TABLE IF EXISTS leave_approvals;
DROP TABLE IF EXISTS leave_requests;
DROP TABLE IF EXISTS leave_types;
DROP TABLE IF EXISTS attendance_approvals;
DROP TABLE IF EXISTS attendance_locations;
DROP TABLE IF EXISTS attendance_records;
DROP TABLE IF EXISTS attendance_modes;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS offices;
DROP TABLE IF EXISTS companies;
*/

-- ============================================
-- 1. ORGANIZATIONAL STRUCTURE
-- ============================================

-- Companies Table
CREATE TABLE companies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100) UNIQUE,
    tax_id VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    postal_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    logo_url TEXT,
    established_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at DATETIME,
    
    CONSTRAINT chk_company_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    
    INDEX idx_company_name (name),
    INDEX idx_company_status (status),
    INDEX idx_company_deleted (is_deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 19

-- Offices Table
CREATE TABLE offices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    office_type VARCHAR(20) NOT NULL DEFAULT 'BRANCH',
    address TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    postal_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    geofence_radius INT COMMENT 'In meters for attendance tracking',
    wifi_ssid VARCHAR(255) COMMENT 'For Wi-Fi based attendance',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at DATETIME,
    
    CONSTRAINT chk_office_type CHECK (office_type IN ('HEAD_OFFICE', 'BRANCH', 'REGIONAL', 'REMOTE')),
    CONSTRAINT chk_office_status CHECK (status IN ('ACTIVE', 'INACTIVE')),
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT,
    INDEX idx_office_company (company_id),
    INDEX idx_office_code (code),
    INDEX idx_office_status (status),
    INDEX idx_office_deleted (is_deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 22

-- Departments Table
CREATE TABLE departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    office_id BIGINT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    head_employee_id BIGINT COMMENT 'Department head/manager',
    parent_department_id BIGINT COMMENT 'For hierarchical departments',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at DATETIME,
    
    CONSTRAINT chk_dept_status CHECK (status IN ('ACTIVE', 'INACTIVE')),
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT,
    FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_department_id) REFERENCES departments(id) ON DELETE SET NULL,
    INDEX idx_dept_company (company_id),
    INDEX idx_dept_office (office_id),
    INDEX idx_dept_code (code),
    INDEX idx_dept_status (status),
    INDEX idx_dept_deleted (is_deleted),
    UNIQUE KEY uk_dept_code_company (code, company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 12

-- ============================================
-- 2. IDENTITY & ACCESS MANAGEMENT
-- ============================================

-- Users Table (Authentication & System Identity)
-- Business Employee ID Format: OIJODO20220001 (2 chars office + 2 chars dept + 2 chars role + year + sequence)
CREATE TABLE users (
    -- Internal DB Primary Key
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    -- Business Employee ID (Formatted)
    -- Example: OIJODO20220001
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    
    -- FK to employees table (for proper relational integrity)
    employee_table_id BIGINT UNIQUE COMMENT 'FK to employees.id for profile data',

    -- Basic details
    name VARCHAR(100) NOT NULL,
    full_name VARCHAR(120) COMMENT 'Display name for UI',
    email VARCHAR(160) NOT NULL UNIQUE,
    phone VARCHAR(20),

    profile_url TEXT,
    
    joining_year INT COMMENT 'Year when employee joined the company',

    -- Authentication
    password_hash VARCHAR(255) NOT NULL,

    -- Role & status
    role VARCHAR(20) NOT NULL DEFAULT 'EMPLOYEE',
    status VARCHAR(30) NOT NULL DEFAULT 'FIRST_LOGIN_PENDING',

    is_first_login BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,

    -- Password reset
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME,

    -- Audit fields
    created_by BIGINT COMMENT 'HR who created this user account',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Soft delete
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at DATETIME,

    -- Constraints
    CONSTRAINT chk_user_role
        CHECK (role IN ('HR', 'EMPLOYEE', 'ADMIN')),

    CONSTRAINT chk_user_status
        CHECK (status IN ('ACTIVE', 'INACTIVE', 'FIRST_LOGIN_PENDING')),

    -- Self reference (HR who created user)
    CONSTRAINT fk_users_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL,
        
    -- Indexes for performance
    INDEX idx_user_email (email),
    INDEX idx_user_employee_id (employee_id),
    INDEX idx_user_role (role),
    INDEX idx_user_status (status),
    INDEX idx_user_deleted (is_deleted),
    INDEX idx_user_reset_token (reset_token),
    INDEX idx_user_created_at (created_at),
    INDEX idx_user_joining_year (joining_year),
    INDEX idx_user_employee_table (employee_table_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 20

-- Roles Table (For RBAC Extension)
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    permissions JSON COMMENT 'Array of permission strings',
    is_system_role BOOLEAN DEFAULT FALSE COMMENT 'Cannot be deleted',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at DATETIME,
    
    INDEX idx_role_name (name),
    INDEX idx_role_deleted (is_deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 9

-- User Roles (Many-to-Many)
CREATE TABLE user_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    assigned_by BIGINT,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY uk_user_role (user_id, role_id),
    INDEX idx_user_roles_user (user_id),
    INDEX idx_user_roles_role (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 5

-- Employees Table (HR Master Data)
CREATE TABLE employees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    company_id BIGINT NOT NULL,
    office_id BIGINT,
    department_id BIGINT,
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(255) GENERATED ALWAYS AS (CONCAT_WS(' ', first_name, middle_name, last_name)) STORED,
    date_of_birth DATE,
    gender VARCHAR(20),
    marital_status VARCHAR(20),
    blood_group VARCHAR(10),
    nationality VARCHAR(100) DEFAULT 'Indian',
    
    -- Contact Information
    personal_email VARCHAR(255),
    work_email VARCHAR(255),
    phone_primary VARCHAR(20),
    phone_secondary VARCHAR(20),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relation VARCHAR(100),
    
    -- Address
    current_address TEXT,
    current_city VARCHAR(100),
    current_state VARCHAR(100),
    current_country VARCHAR(100) DEFAULT 'India',
    current_postal_code VARCHAR(20),
    
    permanent_address TEXT,
    permanent_city VARCHAR(100),
    permanent_state VARCHAR(100),
    permanent_country VARCHAR(100) DEFAULT 'India',
    permanent_postal_code VARCHAR(20),
    same_as_current BOOLEAN DEFAULT FALSE,
    
    -- Employment Information
    designation VARCHAR(255),
    employment_type VARCHAR(20) NOT NULL DEFAULT 'FULL_TIME',
    employee_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    date_of_joining DATE NOT NULL,
    date_of_confirmation DATE,
    date_of_leaving DATE,
    probation_period_months INT DEFAULT 6,
    notice_period_days INT DEFAULT 30,
    
    reporting_manager_id BIGINT COMMENT 'Reports to employee',
    work_location VARCHAR(20) DEFAULT 'OFFICE',
    shift_timing VARCHAR(50),
    
    -- Government IDs
    pan_number VARCHAR(20) UNIQUE,
    aadhaar_number VARCHAR(20) UNIQUE,
    passport_number VARCHAR(50),
    passport_expiry DATE,
    driving_license VARCHAR(50),
    
    -- Banking
    bank_name VARCHAR(255),
    bank_account_number VARCHAR(50),
    bank_ifsc_code VARCHAR(20),
    bank_branch VARCHAR(255),
    
    -- Documents
    profile_photo_url TEXT,
    resume_url TEXT,
    documents JSON COMMENT 'Array of document URLs and metadata',
    
    -- System Fields
    created_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at DATETIME,
    deleted_by BIGINT,
    
    CONSTRAINT chk_emp_gender CHECK (gender IN ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY')),
    CONSTRAINT chk_emp_marital_status CHECK (marital_status IN ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED')),
    CONSTRAINT chk_emp_employment_type CHECK (employment_type IN ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'CONSULTANT')),
    CONSTRAINT chk_emp_status CHECK (employee_status IN ('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED')),
    CONSTRAINT chk_emp_work_location CHECK (work_location IN ('OFFICE', 'REMOTE', 'HYBRID')),
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT,
    FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (reporting_manager_id) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_emp_code (employee_code),
    INDEX idx_emp_company (company_id),
    INDEX idx_emp_office (office_id),
    INDEX idx_emp_department (department_id),
    INDEX idx_emp_manager (reporting_manager_id),
    INDEX idx_emp_status (employee_status),
    INDEX idx_emp_full_name (full_name),
    INDEX idx_emp_email (work_email),
    INDEX idx_emp_phone (phone_primary),
    INDEX idx_emp_joining_date (date_of_joining),
    INDEX idx_emp_deleted (is_deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 57

-- Add FK from departments to employees for head
ALTER TABLE departments
    ADD CONSTRAINT fk_dept_head
    FOREIGN KEY (head_employee_id) REFERENCES employees(id) ON DELETE SET NULL;

-- Add FK from users to employees (resolves circular dependency)
ALTER TABLE users
    ADD CONSTRAINT fk_user_employee_table
    FOREIGN KEY (employee_table_id) REFERENCES employees(id) ON DELETE SET NULL;

-- ============================================
-- 2.1 EMPLOYEE PROFILE EXTENSIONS
-- ============================================

-- Employee About (Profile page: About section)
CREATE TABLE employee_about (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    
    about TEXT COMMENT 'About me / Bio',
    about_job TEXT COMMENT 'What I love about my job',
    interests_hobbies TEXT COMMENT 'Personal interests and hobbies',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_emp_about_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 6

-- Employee Skills (Profile page: Skills section)
CREATE TABLE employee_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    
    skill_name VARCHAR(120) NOT NULL,
    proficiency_level VARCHAR(20) COMMENT 'Beginner, Intermediate, Advanced, Expert',
    years_of_experience DECIMAL(4,1) COMMENT 'Years of experience with this skill',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_skill_proficiency 
        CHECK (proficiency_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_emp_skill_user (user_id),
    INDEX idx_emp_skill_name (skill_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 6

-- Employee Certifications (Profile page: Certifications section)
CREATE TABLE employee_certifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    
    certification_name VARCHAR(160) NOT NULL,
    issued_by VARCHAR(160) COMMENT 'Issuing organization',
    issue_date DATE,
    expiry_date DATE,
    credential_id VARCHAR(100) COMMENT 'Certificate ID or credential number',
    credential_url TEXT COMMENT 'Verification URL',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_emp_cert_user (user_id),
    INDEX idx_emp_cert_name (certification_name),
    INDEX idx_emp_cert_expiry (expiry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 10

-- Employee Basic Profile (Company/Job Info - Public Section)
CREATE TABLE employee_basic_profile (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    
    profile_photo_url TEXT,
    job_position VARCHAR(120) COMMENT 'Designation/Title',
    
    company VARCHAR(120),
    department VARCHAR(120),
    manager_name VARCHAR(120),
    location VARCHAR(120),
    
    mobile VARCHAR(30),
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_profile_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 11

-- Employee Private Info (Personal Details - Restricted Access)
CREATE TABLE employee_private_info (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    
    date_of_birth DATE,
    residing_address TEXT,
    nationality VARCHAR(80) DEFAULT 'Indian',
    personal_email VARCHAR(160),
    
    gender VARCHAR(30),
    marital_status VARCHAR(40),
    date_of_joining DATE,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_private_gender CHECK (gender IN ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY')),
    CONSTRAINT chk_private_marital CHECK (marital_status IN ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED')),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_private_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 11

-- Employee Bank Details (Financial Info - Highly Restricted)
CREATE TABLE employee_bank_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    
    account_number VARCHAR(60),
    bank_name VARCHAR(160),
    ifsc_code VARCHAR(40),
    bank_branch VARCHAR(255) COMMENT 'Branch name/location',
    
    pan_number VARCHAR(40) UNIQUE,
    uan_number VARCHAR(40) COMMENT 'Universal Account Number (EPFO)',
    epf_code VARCHAR(40) COMMENT 'Employee Provident Fund Code',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_bank_user (user_id),
    INDEX idx_bank_pan (pan_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 11

-- Employee Documents (Resume/ID Proofs/Certificates)
CREATE TABLE employee_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    
    doc_type VARCHAR(40) NOT NULL COMMENT 'Type of document',
    file_name VARCHAR(255) COMMENT 'Original filename',
    file_url TEXT NOT NULL COMMENT 'Storage URL/path',
    file_size BIGINT COMMENT 'File size in bytes',
    mime_type VARCHAR(100) COMMENT 'File MIME type',
    
    uploaded_by BIGINT COMMENT 'Who uploaded this document',
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    is_verified BOOLEAN DEFAULT FALSE COMMENT 'Document verification status',
    verified_by BIGINT,
    verified_at DATETIME,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_doc_type CHECK (doc_type IN ('RESUME', 'ID_PROOF', 'ADDRESS_PROOF', 'EDUCATION_CERT', 'EXPERIENCE_LETTER', 'OTHER')),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_docs_user (user_id),
    INDEX idx_docs_type (doc_type),
    INDEX idx_docs_verified (is_verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 13

-- Security Activity Log (Login/Password Changes/Device Activity)
CREATE TABLE security_activity_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    
    event_type VARCHAR(40) NOT NULL COMMENT 'login, logout, password_change, device_login, etc.',
    event_details TEXT COMMENT 'Additional event information',
    
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_info VARCHAR(255),
    location_info VARCHAR(255) COMMENT 'Geo-location if available',
    
    event_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_security_event CHECK (event_type IN ('LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'PASSWORD_RESET', 'DEVICE_LOGIN', 'FAILED_LOGIN', 'SESSION_EXPIRED', 'TWO_FA_ENABLED', 'TWO_FA_DISABLED')),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_security_user (user_id),
    INDEX idx_security_event (event_type),
    INDEX idx_security_time (event_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 9

-- ============================================
-- 3. ATTENDANCE MANAGEMENT
-- ============================================

-- Attendance Modes
CREATE TABLE attendance_modes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_remote BOOLEAN DEFAULT FALSE,
    requires_location BOOLEAN DEFAULT FALSE,
    requires_approval BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_att_mode_status CHECK (status IN ('ACTIVE', 'INACTIVE')),
    INDEX idx_mode_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 8

-- Attendance Records (Fact Table)
CREATE TABLE attendance_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    user_id BIGINT COMMENT 'FK to users for quick profile lookup',
    attendance_date DATE NOT NULL,
    
    check_in DATETIME,
    check_in_location JSON COMMENT 'GPS coordinates, address',
    check_in_ip VARCHAR(45),
    check_in_device VARCHAR(255),
    
    check_out DATETIME,
    check_out_location JSON COMMENT 'GPS coordinates, address',
    check_out_ip VARCHAR(45),
    check_out_device VARCHAR(255),
    
    mode_id BIGINT COMMENT 'Office/Remote/Field/Onsite',
    
    status VARCHAR(20) NOT NULL DEFAULT 'ABSENT',
    payable_status VARCHAR(20) COMMENT 'Payability status for salary calculation',
    payable_day_value DECIMAL(4,2) DEFAULT 1.00 COMMENT '1.0=full day, 0.5=half day, 0=unpaid',
    
    working_hours DECIMAL(5,2) COMMENT 'Calculated hours',
    overtime_hours DECIMAL(5,2) DEFAULT 0,
    break_hours DECIMAL(5,2) DEFAULT 0,
    
    suspicious BOOLEAN DEFAULT FALSE COMMENT 'Flagged by system',
    suspicious_reason TEXT,
    
    remarks TEXT,
    approved_by BIGINT,
    approved_at DATETIME,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at DATETIME,
    
    CONSTRAINT chk_att_status CHECK (status IN ('PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE', 'HOLIDAY', 'WEEK_OFF')),
    CONSTRAINT chk_att_payable_status CHECK (payable_status IN ('PAYABLE', 'UNPAID', 'LEAVE_PAID', 'LEAVE_UNPAID') OR payable_status IS NULL),
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (mode_id) REFERENCES attendance_modes(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE KEY uk_emp_attendance_date (employee_id, attendance_date),
    INDEX idx_att_employee (employee_id),
    INDEX idx_att_user (user_id),
    INDEX idx_att_user_date (user_id, attendance_date),
    INDEX idx_att_date (attendance_date),
    INDEX idx_att_status (status),
    INDEX idx_att_payable_status (payable_status),
    INDEX idx_att_suspicious (suspicious),
    INDEX idx_att_check_in (check_in),
    INDEX idx_att_deleted (is_deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 25

-- Attendance Locations (For multi-location check-ins)
CREATE TABLE attendance_locations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    attendance_record_id BIGINT NOT NULL,
    location_type VARCHAR(20) NOT NULL,
    timestamp DATETIME NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT,
    accuracy_meters INT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_att_loc_type CHECK (location_type IN ('CHECK_IN', 'CHECK_OUT', 'BREAK_START', 'BREAK_END')),
    
    FOREIGN KEY (attendance_record_id) REFERENCES attendance_records(id) ON DELETE CASCADE,
    INDEX idx_att_loc_record (attendance_record_id),
    INDEX idx_att_loc_type (location_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 8

-- Attendance Calculations (Work & Extra Hours - Derived)
CREATE TABLE attendance_calculations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    attendance_id BIGINT UNIQUE NOT NULL COMMENT 'FK to attendance_records',
    
    work_minutes INT COMMENT 'Actual work time in minutes (e.g., 540 = 9h)',
    extra_minutes INT COMMENT 'Overtime in minutes (e.g., 60 = 1h)',
    shift_minutes INT COMMENT 'Expected shift duration in minutes',
    break_minutes INT DEFAULT 0 COMMENT 'Break time in minutes',
    
    calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (attendance_id) REFERENCES attendance_records(id) ON DELETE CASCADE,
    INDEX idx_att_calc_attendance (attendance_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 6

-- Attendance Monthly Summary (Dashboard KPI Cards)
CREATE TABLE attendance_monthly_summary (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    employee_id BIGINT COMMENT 'Denormalized for reporting',
    
    year INT NOT NULL,
    month INT NOT NULL,
    
    present_days DECIMAL(6,2) DEFAULT 0 COMMENT 'Total present days including half days',
    leave_days DECIMAL(6,2) DEFAULT 0 COMMENT 'Approved leave days',
    absent_days DECIMAL(6,2) DEFAULT 0 COMMENT 'Absent without leave',
    total_working_days INT NOT NULL COMMENT 'Expected working days in month',
    payable_days DECIMAL(6,2) DEFAULT 0 COMMENT 'Days to be paid for salary',
    
    total_work_hours DECIMAL(8,2) DEFAULT 0 COMMENT 'Sum of working hours',
    total_overtime_hours DECIMAL(8,2) DEFAULT 0 COMMENT 'Sum of overtime',
    
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    
    UNIQUE KEY uk_user_year_month (user_id, year, month),
    INDEX idx_summary_user_month (user_id, year, month),
    INDEX idx_summary_employee (employee_id),
    INDEX idx_summary_period (year, month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 13

-- Attendance Approvals (Workflow)
CREATE TABLE attendance_approvals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    attendance_record_id BIGINT NOT NULL,
    requested_by BIGINT NOT NULL,
    requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    requested_reason TEXT,
    
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    
    reviewed_by BIGINT,
    reviewed_at DATETIME,
    review_comments TEXT,
    
    CONSTRAINT chk_att_approval_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    
    FOREIGN KEY (attendance_record_id) REFERENCES attendance_records(id) ON DELETE CASCADE,
    FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_att_approval_record (attendance_record_id),
    INDEX idx_att_approval_status (status),
    INDEX idx_att_approval_requester (requested_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 8

-- ============================================
-- 4. LEAVE MANAGEMENT
-- ============================================

-- Leave Types (Master Data)
CREATE TABLE leave_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    
    is_paid BOOLEAN DEFAULT TRUE,
    is_encashable BOOLEAN DEFAULT FALSE,
    is_carryforward BOOLEAN DEFAULT FALSE,
    max_carryforward_days INT DEFAULT 0,
    
    max_days_per_year INT,
    max_consecutive_days INT,
    min_days_notice INT DEFAULT 1,
    
    requires_approval BOOLEAN DEFAULT TRUE,
    requires_document BOOLEAN DEFAULT FALSE,
    
    accrual_frequency VARCHAR(20) DEFAULT 'NONE',
    accrual_rate DECIMAL(5,2) COMMENT 'Days per accrual period',
    
    applicable_gender VARCHAR(20) DEFAULT 'ALL',
    applicable_after_months INT DEFAULT 0 COMMENT 'Probation period',
    
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    display_order INT DEFAULT 0,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at DATETIME,
    
    CONSTRAINT chk_leave_type_accrual CHECK (accrual_frequency IN ('MONTHLY', 'QUARTERLY', 'YEARLY', 'NONE')),
    CONSTRAINT chk_leave_type_gender CHECK (applicable_gender IN ('ALL', 'MALE', 'FEMALE', 'OTHER')),
    CONSTRAINT chk_leave_type_status CHECK (status IN ('ACTIVE', 'INACTIVE')),
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT,
    UNIQUE KEY uk_leave_type_code (company_id, code),
    INDEX idx_leave_type_company (company_id),
    INDEX idx_leave_type_status (status),
    INDEX idx_leave_type_deleted (is_deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 21

-- Leave Balances (Available leave per employee, per year)
CREATE TABLE leave_balances (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    employee_id BIGINT COMMENT 'Denormalized for reporting',
    leave_type_id BIGINT NOT NULL,
    
    year INT NOT NULL,
    
    opening_balance DECIMAL(5,2) NOT NULL DEFAULT 0 COMMENT 'Balance at start of year',
    allocated_days DECIMAL(5,2) NOT NULL DEFAULT 0 COMMENT 'Annual allocation for this type',
    used_days DECIMAL(5,2) DEFAULT 0 COMMENT 'Days already taken',
    pending_days DECIMAL(5,2) DEFAULT 0 COMMENT 'Days in pending requests',
    remaining_days DECIMAL(5,2) GENERATED ALWAYS AS (opening_balance + allocated_days - used_days - pending_days) STORED,
    
    carryforward_days DECIMAL(5,2) DEFAULT 0 COMMENT 'Days carried from previous year',
    encashed_days DECIMAL(5,2) DEFAULT 0 COMMENT 'Days encashed',
    
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE RESTRICT,
    
    UNIQUE KEY uk_user_leave_year (user_id, leave_type_id, year),
    INDEX idx_balances_user_year (user_id, year),
    INDEX idx_balances_employee (employee_id),
    INDEX idx_balances_leave_type (leave_type_id),
    INDEX idx_balances_year (year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 13

-- Leave Requests (Immutable Records)
CREATE TABLE leave_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    user_id BIGINT COMMENT 'FK to users for quick profile lookup',
    leave_type_id BIGINT NOT NULL,
    
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(5,2) NOT NULL COMMENT 'Can be half-day',
    
    reason TEXT,
    supporting_document_url TEXT,
    attachment_required BOOLEAN DEFAULT FALSE COMMENT 'Whether attachment is required for this request',
    
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    pay_type VARCHAR(20) COMMENT 'Whether leave is paid or unpaid',
    
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    cancelled_at DATETIME,
    cancellation_reason TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at DATETIME,
    
    CONSTRAINT chk_leave_req_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'WITHDRAWN')),
    CONSTRAINT chk_leave_pay_type CHECK (pay_type IN ('PAID', 'UNPAID') OR pay_type IS NULL),
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE RESTRICT,
    
    INDEX idx_leave_req_employee (employee_id),
    INDEX idx_leave_req_user (user_id),
    INDEX idx_leave_req_user_dates (user_id, start_date, end_date),
    INDEX idx_leave_req_type (leave_type_id),
    INDEX idx_leave_req_status (status),
    INDEX idx_leave_req_status_date (status, start_date),
    INDEX idx_leave_req_dates (start_date, end_date),
    INDEX idx_leave_req_applied (applied_at),
    INDEX idx_leave_req_deleted (is_deleted),
    
    CHECK (end_date >= start_date),
    CHECK (total_days > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 16

-- Leave Approvals (Workflow Entity)
CREATE TABLE leave_approvals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    leave_request_id BIGINT NOT NULL,
    
    approver_id BIGINT NOT NULL,
    approval_level INT DEFAULT 1 COMMENT 'Multi-level approval support',
    
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    comments TEXT,
    
    approved_at DATETIME,
    rejected_at DATETIME,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_leave_approval_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    
    FOREIGN KEY (leave_request_id) REFERENCES leave_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE RESTRICT,
    
    INDEX idx_leave_approval_request (leave_request_id),
    INDEX idx_leave_approval_approver (approver_id),
    INDEX idx_leave_approval_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 9

-- Time-Off Attachments (File uploads for leave requests)
CREATE TABLE time_off_attachments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id BIGINT NOT NULL COMMENT 'FK to leave_requests',
    
    file_url TEXT NOT NULL COMMENT 'Storage URL/path for uploaded file',
    file_name VARCHAR(200) COMMENT 'Original filename',
    file_size BIGINT COMMENT 'File size in bytes',
    mime_type VARCHAR(100) COMMENT 'File MIME type',
    
    uploaded_by BIGINT COMMENT 'User who uploaded the file',
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (request_id) REFERENCES leave_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_attachment_request (request_id),
    INDEX idx_attachment_uploaded_by (uploaded_by),
    INDEX idx_attachment_uploaded_at (uploaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 8

-- ============================================
-- 5. PAYROLL & SALARY MANAGEMENT
-- ============================================

-- Salary Structures (Time-Versioned, Never Overwritten)
CREATE TABLE salary_structures (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    user_id BIGINT COMMENT 'FK to users for quick profile lookup',
    
    effective_from DATE NOT NULL,
    effective_to DATE NULL COMMENT 'NULL means currently active',
    
    designation VARCHAR(255),
    pay_grade VARCHAR(50),
    
    basic_salary DECIMAL(12,2) NOT NULL,
    wage_amount DECIMAL(12,2) COMMENT 'Alias for basic_salary for compatibility',
    wage_type VARCHAR(20) COMMENT 'fixed or monthly',
    currency VARCHAR(10) DEFAULT 'INR',
    
    pay_frequency VARCHAR(20) DEFAULT 'MONTHLY',
    working_days_per_week INT DEFAULT 5 COMMENT 'Usually 5 or 6 days',
    break_time_hours DECIMAL(4,2) COMMENT 'Daily break time in hours',
    
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    
    remarks TEXT,
    approved_by BIGINT,
    approved_at DATETIME,
    
    created_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_salary_struct_frequency CHECK (pay_frequency IN ('MONTHLY', 'WEEKLY', 'DAILY', 'HOURLY')),
    CONSTRAINT chk_salary_struct_status CHECK (status IN ('DRAFT', 'ACTIVE', 'SUPERSEDED', 'TERMINATED')),
    CONSTRAINT chk_salary_wage_type CHECK (wage_type IN ('FIXED', 'MONTHLY') OR wage_type IS NULL),
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_salary_struct_employee (employee_id),
    INDEX idx_salary_struct_user (user_id, effective_from),
    INDEX idx_salary_struct_effective (effective_from, effective_to),
    INDEX idx_salary_struct_status (status),
    
    CHECK (effective_to IS NULL OR effective_to > effective_from)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 17

-- Salary Component Types (Master definitions for reusable components)
CREATE TABLE salary_component_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    name VARCHAR(120) UNIQUE NOT NULL COMMENT 'Basic, HRA, DA, Conveyance, etc.',
    description TEXT,
    component_code VARCHAR(50) UNIQUE COMMENT 'Short code like BASIC, HRA, DA',
    
    default_mode VARCHAR(20) NOT NULL COMMENT 'How this component is typically calculated',
    default_value DECIMAL(12,2) COMMENT 'Default percentage or fixed amount',
    
    component_category VARCHAR(20) NOT NULL COMMENT 'EARNING, DEDUCTION, CONTRIBUTION',
    is_taxable BOOLEAN DEFAULT TRUE,
    is_statutory BOOLEAN DEFAULT FALSE COMMENT 'PF, ESI, etc.',
    
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_comp_type_mode CHECK (default_mode IN ('FIXED', 'PERCENT', 'FORMULA')),
    CONSTRAINT chk_comp_type_category CHECK (component_category IN ('EARNING', 'DEDUCTION', 'CONTRIBUTION', 'BENEFIT')),
    
    INDEX idx_comp_type_active (is_active),
    INDEX idx_comp_type_category (component_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 12

-- Salary Components (Earnings & Deductions)
CREATE TABLE salary_components (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    salary_structure_id BIGINT NOT NULL,
    component_type_id BIGINT COMMENT 'FK to salary_component_types for reusable definitions',
    
    component_type VARCHAR(20) NOT NULL,
    component_name VARCHAR(255) NOT NULL,
    component_code VARCHAR(50),
    
    calculation_type VARCHAR(20) NOT NULL,
    computation_mode VARCHAR(20) COMMENT 'Alias for calculation_type: PERCENT, FIXED',
    
    amount DECIMAL(12,2) DEFAULT 0,
    value_fixed DECIMAL(12,2) COMMENT 'Alias for amount',
    percentage DECIMAL(5,2) COMMENT 'If percentage-based',
    value_percent DECIMAL(6,3) COMMENT 'Higher precision percentage (e.g., 50.000)',
    formula TEXT COMMENT 'If formula-based',
    
    computed_amount DECIMAL(12,2) COMMENT 'Auto-calculated final amount',
    
    is_taxable BOOLEAN DEFAULT TRUE,
    is_statutory BOOLEAN DEFAULT FALSE,
    
    display_order INT DEFAULT 0,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_salary_comp_type CHECK (component_type IN ('EARNING', 'DEDUCTION', 'BENEFIT')),
    CONSTRAINT chk_salary_comp_calc CHECK (calculation_type IN ('FIXED', 'PERCENTAGE', 'FORMULA')),
    
    FOREIGN KEY (salary_structure_id) REFERENCES salary_structures(id) ON DELETE CASCADE,
    FOREIGN KEY (component_type_id) REFERENCES salary_component_types(id) ON DELETE SET NULL,
    INDEX idx_salary_comp_structure (salary_structure_id),
    INDEX idx_salary_comp_type (component_type),
    INDEX idx_salary_comp_type_id (component_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 17

-- Salary Contributions (PF Employee & Employer contributions)
CREATE TABLE salary_contributions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    salary_structure_id BIGINT NOT NULL,
    
    name VARCHAR(120) NOT NULL COMMENT 'Employee PF, Employer PF, ESI, etc.',
    contribution_type VARCHAR(20) NOT NULL COMMENT 'EMPLOYEE, EMPLOYER',
    
    rate_percent DECIMAL(6,3) COMMENT 'Percentage rate (e.g., 12.000 for 12%)',
    base_component VARCHAR(40) COMMENT 'Component to calculate from (usually BASIC)',
    amount DECIMAL(12,2) COMMENT 'Calculated contribution amount',
    
    is_statutory BOOLEAN DEFAULT TRUE COMMENT 'Mandatory by law',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_contribution_type CHECK (contribution_type IN ('EMPLOYEE', 'EMPLOYER')),
    
    FOREIGN KEY (salary_structure_id) REFERENCES salary_structures(id) ON DELETE CASCADE,
    INDEX idx_salary_contrib_structure (salary_structure_id),
    INDEX idx_salary_contrib_type (contribution_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 9

-- Salary Deductions (Professional Tax, TDS, etc.)
CREATE TABLE salary_deductions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    salary_structure_id BIGINT NOT NULL,
    
    name VARCHAR(120) NOT NULL COMMENT 'Professional Tax, TDS, Loan EMI, etc.',
    deduction_type VARCHAR(20) NOT NULL COMMENT 'STATUTORY, LOAN, ADVANCE, OTHER',
    
    amount DECIMAL(12,2) NOT NULL,
    frequency VARCHAR(20) DEFAULT 'MONTHLY' COMMENT 'How often this deduction applies',
    
    is_taxable BOOLEAN DEFAULT FALSE COMMENT 'Whether this reduces taxable income',
    remarks TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_deduction_type CHECK (deduction_type IN ('STATUTORY', 'LOAN', 'ADVANCE', 'OTHER')),
    CONSTRAINT chk_deduction_frequency CHECK (frequency IN ('MONTHLY', 'QUARTERLY', 'YEARLY', 'ONE_TIME')),
    
    FOREIGN KEY (salary_structure_id) REFERENCES salary_structures(id) ON DELETE CASCADE,
    INDEX idx_salary_deduct_structure (salary_structure_id),
    INDEX idx_salary_deduct_type (deduction_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 9

-- Salary Slips (Immutable Monthly Snapshots)
CREATE TABLE salary_slips (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    salary_structure_id BIGINT NOT NULL,
    
    salary_month DATE NOT NULL COMMENT 'First day of salary month',
    payment_date DATE,
    
    working_days INT NOT NULL,
    present_days DECIMAL(5,2) NOT NULL,
    leave_days DECIMAL(5,2) DEFAULT 0,
    absent_days DECIMAL(5,2) DEFAULT 0,
    
    gross_salary DECIMAL(12,2) NOT NULL,
    total_earnings DECIMAL(12,2) NOT NULL,
    total_deductions DECIMAL(12,2) NOT NULL,
    net_salary DECIMAL(12,2) NOT NULL,
    
    tax_deducted DECIMAL(12,2) DEFAULT 0,
    provident_fund DECIMAL(12,2) DEFAULT 0,
    professional_tax DECIMAL(12,2) DEFAULT 0,
    
    components JSON NOT NULL COMMENT 'Snapshot of all salary components',
    
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    
    payment_mode VARCHAR(20) DEFAULT 'BANK_TRANSFER',
    payment_reference VARCHAR(255),
    
    remarks TEXT,
    
    generated_by BIGINT,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    approved_by BIGINT,
    approved_at DATETIME,
    
    paid_by BIGINT,
    paid_at DATETIME,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_salary_slip_status CHECK (status IN ('DRAFT', 'GENERATED', 'APPROVED', 'PAID', 'CANCELLED')),
    CONSTRAINT chk_salary_slip_payment CHECK (payment_mode IN ('BANK_TRANSFER', 'CHEQUE', 'CASH', 'UPI')),
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE RESTRICT,
    FOREIGN KEY (salary_structure_id) REFERENCES salary_structures(id) ON DELETE RESTRICT,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (paid_by) REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE KEY uk_emp_salary_month (employee_id, salary_month),
    INDEX idx_salary_slip_employee (employee_id),
    INDEX idx_salary_slip_month (salary_month),
    INDEX idx_salary_slip_status (status),
    INDEX idx_salary_slip_payment_date (payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 25

-- ============================================
-- 6. AUDIT & GOVERNANCE
-- ============================================

-- User Activity Logs (What users do)
CREATE TABLE user_activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    
    action VARCHAR(255) NOT NULL COMMENT 'LOGIN, LOGOUT, VIEW, EDIT, etc.',
    entity_name VARCHAR(100) COMMENT 'Table/module name',
    entity_id BIGINT COMMENT 'Record ID',
    
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_method VARCHAR(10),
    request_url TEXT,
    
    metadata JSON COMMENT 'Additional context',
    
    occurred_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_activity_user (user_id),
    INDEX idx_activity_action (action),
    INDEX idx_activity_entity (entity_name, entity_id),
    INDEX idx_activity_occurred (occurred_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 10

-- Audit Logs (System-level state changes)
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    actor_user_id BIGINT,
    
    action VARCHAR(255) NOT NULL COMMENT 'CREATE, UPDATE, DELETE, APPROVE, etc.',
    target_table VARCHAR(100) NOT NULL,
    target_id BIGINT,
    
    before_state JSON COMMENT 'Record state before change',
    after_state JSON COMMENT 'Record state after change',
    changes JSON COMMENT 'Diff of what changed',
    
    ip_address VARCHAR(45),
    
    occurred_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_actor (actor_user_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_target (target_table, target_id),
    INDEX idx_audit_occurred (occurred_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 10

-- Hard Delete Logs (Governed destructive actions)
CREATE TABLE hard_delete_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    actor_user_id BIGINT NOT NULL,
    
    target_table VARCHAR(100) NOT NULL,
    target_id BIGINT NOT NULL,
    
    record_snapshot JSON NOT NULL COMMENT 'Full record before deletion',
    
    reason TEXT NOT NULL COMMENT 'Mandatory justification',
    approval_reference VARCHAR(255) COMMENT 'Ticket/approval ID',
    
    deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_hard_delete_actor (actor_user_id),
    INDEX idx_hard_delete_target (target_table, target_id),
    INDEX idx_hard_delete_date (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; -- Total columns: 7

-- ============================================
-- 7. SEED DATA - ESSENTIAL SYSTEM DATA
-- ============================================

-- Insert default company
INSERT INTO companies (name, registration_number, email, status) 
VALUES ('Dayflow Technologies', 'DAYFLOW001', 'info@dayflow.com', 'ACTIVE');

-- Insert default office
INSERT INTO offices (company_id, name, code, office_type, address, city, status)
VALUES (1, 'Head Office', 'HO', 'HEAD_OFFICE', 'Corporate Plaza', 'Mumbai', 'ACTIVE');

-- Insert default departments
INSERT INTO departments (company_id, office_id, name, code, status) VALUES
(1, 1, 'Human Resources', 'HR', 'ACTIVE'),
(1, 1, 'Information Technology', 'IT', 'ACTIVE'),
(1, 1, 'Finance & Accounts', 'FIN', 'ACTIVE'),
(1, 1, 'Operations', 'OPS', 'ACTIVE'),
(1, 1, 'Sales & Marketing', 'SALES', 'ACTIVE');

-- Insert default attendance modes
INSERT INTO attendance_modes (name, description, is_remote, requires_location, status) VALUES
('OFFICE', 'Regular office attendance', FALSE, TRUE, 'ACTIVE'),
('REMOTE', 'Work from home', TRUE, FALSE, 'ACTIVE'),
('FIELD', 'Field work/client site', FALSE, TRUE, 'ACTIVE'),
('ONSITE', 'Onsite at client location', FALSE, TRUE, 'ACTIVE'),
('HYBRID', 'Partial office + remote', FALSE, FALSE, 'ACTIVE');

-- Insert default leave types
INSERT INTO leave_types (company_id, name, code, is_paid, max_days_per_year, requires_approval, status) VALUES
(1, 'Casual Leave', 'CL', TRUE, 12, TRUE, 'ACTIVE'),
(1, 'Sick Leave', 'SL', TRUE, 12, TRUE, 'ACTIVE'),
(1, 'Earned Leave', 'EL', TRUE, 21, TRUE, 'ACTIVE'),
(1, 'Unpaid Leave', 'UL', FALSE, 365, TRUE, 'ACTIVE'),
(1, 'Maternity Leave', 'ML', TRUE, 180, TRUE, 'ACTIVE'),
(1, 'Paternity Leave', 'PL', TRUE, 15, TRUE, 'ACTIVE');

-- Insert system roles
INSERT INTO roles (name, display_name, description, is_system_role) VALUES
('SUPER_ADMIN', 'Super Administrator', 'Full system access', TRUE),
('HR_ADMIN', 'HR Administrator', 'HR department full access', TRUE),
('HR_OFFICER', 'HR Officer', 'HR operations access', TRUE),
('EMPLOYEE', 'Employee', 'Standard employee access', TRUE),
('MANAGER', 'Manager', 'Team management access', TRUE),
('FINANCE', 'Finance Officer', 'Finance and payroll access', TRUE);

-- ============================================
-- 8. VIEWS FOR COMMON QUERIES
-- ============================================

-- Active employees with full details
CREATE VIEW v_active_employees AS
SELECT 
    e.*,
    u.email as login_email,
    u.status as user_status,
    c.name as company_name,
    o.name as office_name,
    d.name as department_name,
    CONCAT(m.first_name, ' ', m.last_name) as manager_name
FROM employees e
LEFT JOIN users u ON u.employee_id = e.id
LEFT JOIN companies c ON c.id = e.company_id
LEFT JOIN offices o ON o.id = e.office_id
LEFT JOIN departments d ON d.id = e.department_id
LEFT JOIN employees m ON m.id = e.reporting_manager_id
WHERE e.is_deleted = FALSE 
AND e.employee_status = 'ACTIVE';

-- Current attendance summary
CREATE VIEW v_today_attendance AS
SELECT 
    e.id as employee_id,
    e.employee_code,
    e.full_name,
    e.department_id,
    d.name as department_name,
    a.attendance_date,
    a.check_in,
    a.check_out,
    a.status,
    a.working_hours,
    a.suspicious
FROM employees e
LEFT JOIN attendance_records a ON a.employee_id = e.id 
    AND a.attendance_date = CURDATE()
LEFT JOIN departments d ON d.id = e.department_id
WHERE e.is_deleted = FALSE 
AND e.employee_status = 'ACTIVE';

-- Pending leave requests
CREATE VIEW v_pending_leaves AS
SELECT 
    lr.id,
    lr.employee_id,
    e.employee_code,
    e.full_name,
    lt.name as leave_type,
    lr.start_date,
    lr.end_date,
    lr.total_days,
    lr.reason,
    lr.applied_at,
    lr.status
FROM leave_requests lr
JOIN employees e ON e.id = lr.employee_id
JOIN leave_types lt ON lt.id = lr.leave_type_id
WHERE lr.status = 'PENDING'
AND lr.is_deleted = FALSE
ORDER BY lr.applied_at ASC;

-- Active salary structures
CREATE VIEW v_current_salaries AS
SELECT 
    ss.id,
    ss.employee_id,
    e.employee_code,
    e.full_name,
    ss.basic_salary,
    ss.effective_from,
    ss.pay_frequency,
    ss.status
FROM salary_structures ss
JOIN employees e ON e.id = ss.employee_id
WHERE ss.effective_to IS NULL
AND ss.status = 'ACTIVE'
AND e.is_deleted = FALSE;

-- ============================================
-- 9. STORED PROCEDURES (Optional - Examples)
-- ============================================

DELIMITER //

-- Mark employee attendance
CREATE PROCEDURE sp_mark_attendance(
    IN p_employee_id BIGINT,
    IN p_date DATE,
    IN p_check_in DATETIME,
    IN p_mode_id BIGINT,
    IN p_location JSON
)
BEGIN
    INSERT INTO attendance_records (
        employee_id, 
        attendance_date, 
        check_in, 
        check_in_location, 
        mode_id, 
        status
    ) VALUES (
        p_employee_id,
        p_date,
        p_check_in,
        p_location,
        p_mode_id,
        'PRESENT'
    )
    ON DUPLICATE KEY UPDATE
        check_in = p_check_in,
        check_in_location = p_location,
        mode_id = p_mode_id,
        status = 'PRESENT';
END //

-- Calculate working hours
CREATE PROCEDURE sp_calculate_working_hours(
    IN p_attendance_id BIGINT
)
BEGIN
    UPDATE attendance_records
    SET working_hours = TIMESTAMPDIFF(MINUTE, check_in, check_out) / 60.0
    WHERE id = p_attendance_id
    AND check_in IS NOT NULL
    AND check_out IS NOT NULL;
END //

DELIMITER ;

-- ============================================
-- 10. TRIGGERS FOR AUDIT TRAIL
-- ============================================

DELIMITER //

-- Trigger: User updates audit
CREATE TRIGGER trg_users_after_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (
        actor_user_id,
        action,
        target_table,
        target_id,
        before_state,
        after_state
    ) VALUES (
        NEW.id,
        'UPDATE',
        'users',
        NEW.id,
        JSON_OBJECT(
            'email', OLD.email,
            'name', OLD.name,
            'role', OLD.role,
            'status', OLD.status
        ),
        JSON_OBJECT(
            'email', NEW.email,
            'name', NEW.name,
            'role', NEW.role,
            'status', NEW.status
        )
    );
END //

-- Trigger: Auto-close older salary structures
CREATE TRIGGER trg_salary_structure_before_insert
BEFORE INSERT ON salary_structures
FOR EACH ROW
BEGIN
    IF NEW.status = 'ACTIVE' THEN
        UPDATE salary_structures
        SET effective_to = DATE_SUB(NEW.effective_from, INTERVAL 1 DAY),
            status = 'SUPERSEDED'
        WHERE employee_id = NEW.employee_id
        AND effective_to IS NULL
        AND status = 'ACTIVE';
    END IF;
END //

DELIMITER ;

-- ============================================
-- 11. SCHEMA ALTERATIONS / MIGRATIONS
-- ============================================
-- Note: The joining_year column is already included in the CREATE TABLE users statement above.
-- This ALTER statement is provided for reference if migrating an existing database.

-- ALTER TABLE users
-- ADD COLUMN joining_year INT NOT NULL;

-- ============================================
-- END OF SCHEMA
-- ============================================

-- Grant privileges (adjust based on your setup)
-- GRANT ALL PRIVILEGES ON dayflow_hrms.* TO 'dayflow_user'@'localhost';
-- FLUSH PRIVILEGES;
