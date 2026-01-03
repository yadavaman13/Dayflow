-- ============================================
-- Dayflow HRMS - Comprehensive Seed Data (Part 1)
-- ============================================

USE dayflow_hrms;

-- ============================================
-- 1. COMPANIES (Already exists from schema)
-- ============================================
-- Company 1 already inserted in schema.sql

-- ============================================
-- 2. OFFICES (Already exists from schema + Add more)
-- ============================================
-- Office 1 (Head Office) already inserted

INSERT INTO offices (company_id, name, code, office_type, address, city, state, country, postal_code, phone, email, latitude, longitude, geofence_radius, wifi_ssid, timezone, status) VALUES
(1, 'Bangalore Branch', 'BLR', 'BRANCH', 'Tech Park, Whitefield', 'Bangalore', 'Karnataka', 'India', '560066', '+91-80-12345678', 'bangalore@dayflow.com', 12.97160000, 77.59460000, 200, 'Dayflow-BLR-Office', 'Asia/Kolkata', 'ACTIVE'),
(1, 'Delhi Branch', 'DEL', 'REGIONAL', 'Connaught Place', 'New Delhi', 'Delhi', 'India', '110001', '+91-11-98765432', 'delhi@dayflow.com', 28.63580000, 77.22450000, 200, 'Dayflow-DEL-Office', 'Asia/Kolkata', 'ACTIVE'),
(1, 'Pune Branch', 'PUN', 'BRANCH', 'Hinjewadi IT Park', 'Pune', 'Maharashtra', 'India', '411057', '+91-20-55556666', 'pune@dayflow.com', 18.59180000, 73.73730000, 200, 'Dayflow-PUN-Office', 'Asia/Kolkata', 'ACTIVE');

-- ============================================
-- 3. DEPARTMENTS (Already exists from schema)
-- ============================================
-- HR, IT, Finance, Operations, Sales already inserted

-- ============================================
-- 4. USERS (Create HR Admin first, then employees)
-- ============================================

-- HR Admin User (id=1, employee_id=HRHR202400001)
INSERT INTO users (employee_id, name, full_name, email, phone, password_hash, role, status, is_first_login, email_verified, joining_year, created_at) VALUES
('HRHR202400001', 'Priya Sharma', 'Priya Sharma', 'priya.sharma@dayflow.com', '+91-9876543210', '$2b$10$dummyhashedpassword1234567890', 'HR', 'ACTIVE', FALSE, TRUE, 2024, NOW());

-- Manager Users
INSERT INTO users (employee_id, name, full_name, email, phone, password_hash, role, status, is_first_login, email_verified, joining_year, created_by, created_at) VALUES
('ITIT202400002', 'Rajesh Kumar', 'Rajesh Kumar', 'rajesh.kumar@dayflow.com', '+91-9876543211', '$2b$10$dummyhashedpassword1234567890', 'EMPLOYEE', 'ACTIVE', FALSE, TRUE, 2024, 1, NOW()),
('FIFN202400003', 'Anjali Patel', 'Anjali Patel', 'anjali.patel@dayflow.com', '+91-9876543212', '$2b$10$dummyhashedpassword1234567890', 'EMPLOYEE', 'ACTIVE', FALSE, TRUE, 2024, 1, NOW()),
('SLSL202400004', 'Vikram Singh', 'Vikram Singh', 'vikram.singh@dayflow.com', '+91-9876543213', '$2b$10$dummyhashedpassword1234567890', 'EMPLOYEE', 'ACTIVE', FALSE, TRUE, 2024, 1, NOW());

-- Regular Employees
INSERT INTO users (employee_id, name, full_name, email, phone, password_hash, role, status, is_first_login, email_verified, joining_year, created_by, created_at) VALUES
('ITIT202400005', 'Amit Verma', 'Amit Verma', 'amit.verma@dayflow.com', '+91-9876543214', '$2b$10$dummyhashedpassword1234567890', 'EMPLOYEE', 'ACTIVE', FALSE, TRUE, 2024, 1, NOW()),
('ITIT202400006', 'Sneha Reddy', 'Sneha Reddy', 'sneha.reddy@dayflow.com', '+91-9876543215', '$2b$10$dummyhashedpassword1234567890', 'EMPLOYEE', 'ACTIVE', FALSE, TRUE, 2024, 1, NOW()),
('HRHR202400007', 'Pooja Gupta', 'Pooja Gupta', 'pooja.gupta@dayflow.com', '+91-9876543216', '$2b$10$dummyhashedpassword1234567890', 'EMPLOYEE', 'ACTIVE', FALSE, TRUE, 2024, 1, NOW()),
('FIFN202400008', 'Rahul Mehta', 'Rahul Mehta', 'rahul.mehta@dayflow.com', '+91-9876543217', '$2b$10$dummyhashedpassword1234567890', 'EMPLOYEE', 'ACTIVE', FALSE, TRUE, 2024, 1, NOW()),
('SLSL202400009', 'Neha Joshi', 'Neha Joshi', 'neha.joshi@dayflow.com', '+91-9876543218', '$2b$10$dummyhashedpassword1234567890', 'EMPLOYEE', 'ACTIVE', FALSE, TRUE, 2024, 1, NOW()),
('ITIT202400010', 'Arjun Nair', 'Arjun Nair', 'arjun.nair@dayflow.com', '+91-9876543219', '$2b$10$dummyhashedpassword1234567890', 'EMPLOYEE', 'ACTIVE', FALSE, TRUE, 2024, 1, NOW());

-- ============================================
-- 5. EMPLOYEES (Detailed HR Master Data)
-- ============================================

-- Employee 1: HR Admin - Priya Sharma
INSERT INTO employees (employee_code, company_id, office_id, department_id, first_name, last_name, date_of_birth, gender, marital_status, blood_group, nationality,
personal_email, work_email, phone_primary, phone_secondary, emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
current_address, current_city, current_state, current_country, current_postal_code,
permanent_address, permanent_city, permanent_state, permanent_country, permanent_postal_code, same_as_current,
designation, employment_type, employee_status, date_of_joining, date_of_confirmation, probation_period_months, notice_period_days,
work_location, shift_timing,
pan_number, aadhaar_number, passport_number, passport_expiry,
bank_name, bank_account_number, bank_ifsc_code, bank_branch,
created_by, created_at) VALUES
('EMP001', 1, 1, 1, 'Priya', 'Sharma', '1990-05-15', 'FEMALE', 'MARRIED', 'O+', 'Indian',
'priya.personal@gmail.com', 'priya.sharma@dayflow.com', '+91-9876543210', '+91-9876543220', 'Rohit Sharma', '+91-9988776655', 'Husband',
'Flat 301, Green Valley Apartments, Andheri West', 'Mumbai', 'Maharashtra', 'India', '400053',
'Flat 301, Green Valley Apartments, Andheri West', 'Mumbai', 'Maharashtra', 'India', '400053', TRUE,
'HR Manager', 'FULL_TIME', 'ACTIVE', '2024-01-15', '2024-07-15', 6, 60,
'HYBRID', '09:00-18:00',
'ABCPS1234D', '123456789012', 'P12345678', '2028-12-31',
'HDFC Bank', '12345678901234', 'HDFC0001234', 'Andheri Branch',
1, NOW());

-- Employee 2: IT Manager - Rajesh Kumar
INSERT INTO employees (employee_code, company_id, office_id, department_id, first_name, middle_name, last_name, date_of_birth, gender, marital_status, blood_group, nationality,
personal_email, work_email, phone_primary, phone_secondary, emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
current_address, current_city, current_state, current_country, current_postal_code,
permanent_address, permanent_city, permanent_state, permanent_country, permanent_postal_code, same_as_current,
designation, employment_type, employee_status, date_of_joining, date_of_confirmation, probation_period_months, notice_period_days,
work_location, shift_timing,
pan_number, aadhaar_number,
bank_name, bank_account_number, bank_ifsc_code, bank_branch,
created_by, created_at) VALUES
('EMP002', 1, 2, 2, 'Rajesh', 'Kumar', 'Sharma', '1988-08-20', 'MALE', 'MARRIED', 'A+', 'Indian',
'rajesh.personal@gmail.com', 'rajesh.kumar@dayflow.com', '+91-9876543211', '+91-9876543221', 'Priya Kumar', '+91-9988776656', 'Wife',
'House No 45, Whitefield Main Road', 'Bangalore', 'Karnataka', 'India', '560066',
'House No 45, Whitefield Main Road', 'Bangalore', 'Karnataka', 'India', '560066', TRUE,
'IT Manager', 'FULL_TIME', 'ACTIVE', '2024-02-01', '2024-08-01', 6, 60,
'OFFICE', '09:30-18:30',
'DEFPK5678E', '234567890123',
'ICICI Bank', '23456789012345', 'ICIC0002345', 'Whitefield Branch',
1, NOW());

-- Employee 3: Finance Manager - Anjali Patel
INSERT INTO employees (employee_code, company_id, office_id, department_id, first_name, last_name, date_of_birth, gender, marital_status, blood_group, nationality,
personal_email, work_email, phone_primary, emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
current_address, current_city, current_state, current_country, current_postal_code,
permanent_address, permanent_city, permanent_state, permanent_country, permanent_postal_code, same_as_current,
designation, employment_type, employee_status, date_of_joining, date_of_confirmation, probation_period_months, notice_period_days,
work_location, shift_timing,
pan_number, aadhaar_number,
bank_name, bank_account_number, bank_ifsc_code, bank_branch,
created_by, created_at) VALUES
('EMP003', 1, 1, 3, 'Anjali', 'Patel', '1992-03-10', 'FEMALE', 'SINGLE', 'B+', 'Indian',
'anjali.personal@gmail.com', 'anjali.patel@dayflow.com', '+91-9876543212', 'Ramesh Patel', '+91-9988776657', 'Father',
'Apartment 12B, Nariman Point', 'Mumbai', 'Maharashtra', 'India', '400021',
'Villa 5, Satellite Area', 'Ahmedabad', 'Gujarat', 'India', '380015', FALSE,
'Finance Manager', 'FULL_TIME', 'ACTIVE', '2024-01-20', '2024-07-20', 6, 60,
'OFFICE', '10:00-19:00',
'GHIPN9012F', '345678901234',
'SBI Bank', '34567890123456', 'SBIN0003456', 'Nariman Point Branch',
1, NOW());

-- Employee 4: Sales Manager - Vikram Singh
INSERT INTO employees (employee_code, company_id, office_id, department_id, first_name, middle_name, last_name, date_of_birth, gender, marital_status, blood_group, nationality,
personal_email, work_email, phone_primary, phone_secondary, emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
current_address, current_city, current_state, current_country, current_postal_code,
permanent_address, permanent_city, permanent_state, permanent_country, permanent_postal_code, same_as_current,
designation, employment_type, employee_status, date_of_joining, date_of_confirmation, probation_period_months, notice_period_days,
reporting_manager_id, work_location, shift_timing,
pan_number, aadhaar_number, passport_number, passport_expiry, driving_license,
bank_name, bank_account_number, bank_ifsc_code, bank_branch,
created_by, created_at) VALUES
('EMP004', 1, 3, 5, 'Vikram', 'Singh', 'Rathore', '1987-11-25', 'MALE', 'MARRIED', 'AB+', 'Indian',
'vikram.personal@gmail.com', 'vikram.singh@dayflow.com', '+91-9876543213', '+91-9876543223', 'Sunita Singh', '+91-9988776658', 'Wife',
'Bungalow 7, Koregaon Park', 'Pune', 'Maharashtra', 'India', '411001',
'House 23, Civil Lines', 'Jaipur', 'Rajasthan', 'India', '302006', FALSE,
'Sales Manager', 'FULL_TIME', 'ACTIVE', '2024-03-01', '2024-09-01', 6, 60,
1, 'HYBRID', '09:00-18:00',
'JKLVS3456G', '456789012345', 'P98765432', '2029-06-30', 'DL1234567890',
'Axis Bank', '45678901234567', 'UTIB0004567', 'Koregaon Park Branch',
1, NOW());

-- Employee 5: Software Developer - Amit Verma
INSERT INTO employees (employee_code, company_id, office_id, department_id, first_name, last_name, date_of_birth, gender, marital_status, blood_group, nationality,
personal_email, work_email, phone_primary, emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
current_address, current_city, current_state, current_country, current_postal_code,
permanent_address, permanent_city, permanent_state, permanent_country, permanent_postal_code, same_as_current,
designation, employment_type, employee_status, date_of_joining, probation_period_months, notice_period_days,
reporting_manager_id, work_location, shift_timing,
pan_number, aadhaar_number,
bank_name, bank_account_number, bank_ifsc_code, bank_branch,
created_by, created_at) VALUES
('EMP005', 1, 2, 2, 'Amit', 'Verma', '1995-07-18', 'MALE', 'SINGLE', 'O+', 'Indian',
'amit.personal@gmail.com', 'amit.verma@dayflow.com', '+91-9876543214', 'Suresh Verma', '+91-9988776659', 'Father',
'PG Room 12, BTM Layout', 'Bangalore', 'Karnataka', 'India', '560076',
'Flat 5A, Sector 12', 'Noida', 'Uttar Pradesh', 'India', '201301', FALSE,
'Software Developer', 'FULL_TIME', 'ACTIVE', '2024-04-15', 6, 30,
2, 'REMOTE', '10:00-19:00',
'MNOAV6789H', '567890123456',
'HDFC Bank', '56789012345678', 'HDFC0005678', 'BTM Layout Branch',
1, NOW());

-- Continue with remaining employees (6-10)...
INSERT INTO employees (employee_code, company_id, office_id, department_id, first_name, last_name, date_of_birth, gender, marital_status, blood_group, nationality,
personal_email, work_email, phone_primary, emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
current_address, current_city, current_state, current_country, current_postal_code,
permanent_address, permanent_city, permanent_state, permanent_country, permanent_postal_code, same_as_current,
designation, employment_type, employee_status, date_of_joining, probation_period_months, notice_period_days,
reporting_manager_id, work_location, shift_timing,
pan_number, aadhaar_number,
bank_name, bank_account_number, bank_ifsc_code, bank_branch,
created_by, created_at) VALUES
('EMP006', 1, 2, 2, 'Sneha', 'Reddy', '1994-09-22', 'FEMALE', 'SINGLE', 'B-', 'Indian',
'sneha.personal@gmail.com', 'sneha.reddy@dayflow.com', '+91-9876543215', 'Krishna Reddy', '+91-9988776660', 'Father',
'Flat 203, Electronic City', 'Bangalore', 'Karnataka', 'India', '560100',
'Plot 45, Banjara Hills', 'Hyderabad', 'Telangana', 'India', '500034', FALSE,
'UI/UX Designer', 'FULL_TIME', 'ACTIVE', '2024-05-01', 6, 30,
2, 'HYBRID', '09:30-18:30',
'PQRSR8901I', '678901234567',
'ICICI Bank', '67890123456789', 'ICIC0006789', 'Electronic City Branch',
1, NOW()),
('EMP007', 1, 1, 1, 'Pooja', 'Gupta', '1991-12-05', 'FEMALE', 'MARRIED', 'A-', 'Indian',
'pooja.personal@gmail.com', 'pooja.gupta@dayflow.com', '+91-9876543216', 'Sanjay Gupta', '+91-9988776661', 'Husband',
'Tower 2, Flat 501, Powai', 'Mumbai', 'Maharashtra', 'India', '400076',
'Tower 2, Flat 501, Powai', 'Mumbai', 'Maharashtra', 'India', '400076', TRUE,
'HR Executive', 'FULL_TIME', 'ACTIVE', '2024-03-15', 6, 30,
1, 'OFFICE', '09:00-18:00',
'STUVG0123J', '789012345678',
'SBI Bank', '78901234567890', 'SBIN0007890', 'Powai Branch',
1, NOW()),
('EMP008', 1, 1, 3, 'Rahul', 'Mehta', '1993-06-30', 'MALE', 'SINGLE', 'O-', 'Indian',
'rahul.personal@gmail.com', 'rahul.mehta@dayflow.com', '+91-9876543217', 'Geeta Mehta', '+91-9988776662', 'Mother',
'Room 8, Malad West', 'Mumbai', 'Maharashtra', 'India', '400064',
'House 12, Model Town', 'Delhi', 'Delhi', 'India', '110009', FALSE,
'Accountant', 'FULL_TIME', 'ACTIVE', '2024-06-01', 6, 30,
3, 'OFFICE', '10:00-19:00',
'WXYRM2345K', '890123456789',
'Axis Bank', '89012345678901', 'UTIB0008901', 'Malad Branch',
1, NOW()),
('EMP009', 1, 4, 5, 'Neha', 'Joshi', '1996-02-14', 'FEMALE', 'SINGLE', 'AB-', 'Indian',
'neha.personal@gmail.com', 'neha.joshi@dayflow.com', '+91-9876543218', 'Prakash Joshi', '+91-9988776663', 'Father',
'Apartment 4C, Bandra East', 'Mumbai', 'Maharashtra', 'India', '400051',
'Villa 8, Aundh', 'Pune', 'Maharashtra', 'India', '411007', FALSE,
'Sales Executive', 'FULL_TIME', 'ACTIVE', '2024-07-01', 6, 30,
4, 'HYBRID', '09:00-18:00',
'ZABNJ4567L', '901234567890',
'HDFC Bank', '90123456789012', 'HDFC0009012', 'Bandra Branch',
1, NOW()),
('EMP010', 1, 2, 2, 'Arjun', 'Nair', '1992-10-08', 'MALE', 'MARRIED', 'B+', 'Indian',
'arjun.personal@gmail.com', 'arjun.nair@dayflow.com', '+91-9876543219', 'Lakshmi Nair', '+91-9988776664', 'Wife',
'Villa 15, Indiranagar', 'Bangalore', 'Karnataka', 'India', '560038',
'House 22, Trivandrum Road', 'Kochi', 'Kerala', 'India', '682001', FALSE,
'DevOps Engineer', 'FULL_TIME', 'ACTIVE', '2024-08-01', 6, 30,
2, 'REMOTE', '10:00-19:00',
'BCDAN5678M', '012345678901',
'SBI Bank', '01234567890123', 'SBIN0000123', 'Indiranagar Branch',
1, NOW());

-- Update employee_table_id in users table
UPDATE users SET employee_table_id = 1 WHERE id = 1;
UPDATE users SET employee_table_id = 2 WHERE id = 2;
UPDATE users SET employee_table_id = 3 WHERE id = 3;
UPDATE users SET employee_table_id = 4 WHERE id = 4;
UPDATE users SET employee_table_id = 5 WHERE id = 5;
UPDATE users SET employee_table_id = 6 WHERE id = 6;
UPDATE users SET employee_table_id = 7 WHERE id = 7;
UPDATE users SET employee_table_id = 8 WHERE id = 8;
UPDATE users SET employee_table_id = 9 WHERE id = 9;
UPDATE users SET employee_table_id = 10 WHERE id = 10;

-- Update reporting managers
UPDATE employees SET reporting_manager_id = 1 WHERE id IN (2, 3, 4);
UPDATE employees SET reporting_manager_id = 2 WHERE id IN (5, 6, 10);
UPDATE employees SET reporting_manager_id = 3 WHERE id = 8;
UPDATE employees SET reporting_manager_id = 4 WHERE id = 9;

-- ============================================
-- END OF PART 1
-- ============================================
