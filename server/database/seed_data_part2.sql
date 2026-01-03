-- ============================================
-- Dayflow HRMS - Comprehensive Seed Data (Part 2)
-- ============================================

USE dayflow_hrms;

-- ============================================
-- 6. EMPLOYEE PROFILE EXTENSIONS
-- ============================================

-- Employee About
INSERT INTO employee_about (user_id, about, about_job, interests_hobbies) VALUES
(1, 'Experienced HR professional with 8+ years in talent management and employee relations.', 'I love building strong teams and creating positive workplace cultures.', 'Reading, Yoga, Traveling'),
(2, 'Tech enthusiast and team leader with expertise in cloud technologies and agile methodologies.', 'I enjoy solving complex technical challenges and mentoring junior developers.', 'Coding, Gaming, Photography'),
(3, 'Detail-oriented finance professional specializing in corporate finance and compliance.', 'I find satisfaction in maintaining accurate financial records and strategic planning.', 'Classical Music, Cooking, Painting'),
(4, 'Results-driven sales leader with proven track record in B2B sales.', 'I love connecting with clients and helping them find the right solutions.', 'Cricket, Traveling, Reading Business Books'),
(5, 'Passionate full-stack developer focused on building scalable web applications.', 'I enjoy writing clean code and learning new technologies.', 'Open Source, Chess, Music'),
(6, 'Creative UI/UX designer with an eye for detail and user-centric design approach.', 'I love creating beautiful and intuitive user experiences.', 'Sketching, Design Blogs, Traveling'),
(7, 'Dedicated HR professional focused on recruitment and employee engagement.', 'I enjoy helping people find their dream jobs and grow in their careers.', 'Dancing, Social Work, Gardening'),
(8, 'Meticulous accountant with strong analytical and problem-solving skills.', 'I find satisfaction in maintaining accurate books and optimizing financial processes.', 'Sudoku, Movies, Cooking'),
(9, 'Enthusiastic sales professional with excellent communication skills.', 'I love building relationships and helping customers achieve their goals.', 'Badminton, Blogging, Food Exploring'),
(10, 'DevOps expert passionate about automation and infrastructure as code.', 'I enjoy optimizing deployment pipelines and ensuring system reliability.', 'Cycling, Tech Podcasts, Hiking');

-- Employee Skills
INSERT INTO employee_skills (user_id, skill_name, proficiency_level, years_of_experience) VALUES
(1, 'Talent Acquisition', 'EXPERT', 8.0),
(1, 'Employee Relations', 'ADVANCED', 7.5),
(1, 'Performance Management', 'ADVANCED', 6.0),
(2, 'Java', 'EXPERT', 10.0),
(2, 'Spring Boot', 'EXPERT', 8.0),
(2, 'AWS', 'ADVANCED', 6.0),
(2, 'Docker', 'ADVANCED', 5.0),
(3, 'Financial Analysis', 'EXPERT', 8.0),
(3, 'Tally ERP', 'ADVANCED', 7.0),
(3, 'GST Compliance', 'ADVANCED', 5.0),
(4, 'B2B Sales', 'EXPERT', 9.0),
(4, 'CRM', 'ADVANCED', 8.0),
(4, 'Client Relationship Management', 'EXPERT', 9.0),
(5, 'JavaScript', 'ADVANCED', 3.5),
(5, 'React', 'ADVANCED', 3.0),
(5, 'Node.js', 'INTERMEDIATE', 2.5),
(6, 'Figma', 'EXPERT', 4.0),
(6, 'Adobe XD', 'ADVANCED', 3.5),
(6, 'User Research', 'INTERMEDIATE', 2.0),
(7, 'Recruitment', 'ADVANCED', 3.0),
(7, 'HRIS', 'INTERMEDIATE', 2.5),
(8, 'Accounting', 'ADVANCED', 4.0),
(8, 'Excel', 'EXPERT', 5.0),
(9, 'Sales', 'INTERMEDIATE', 2.0),
(9, 'Communication', 'ADVANCED', 3.0),
(10, 'Kubernetes', 'ADVANCED', 4.0),
(10, 'Jenkins', 'ADVANCED', 4.5),
(10, 'Linux', 'EXPERT', 6.0);

-- Employee Certifications
INSERT INTO employee_certifications (user_id, certification_name, issued_by, issue_date, expiry_date, credential_id, credential_url) VALUES
(1, 'SHRM Certified Professional', 'SHRM', '2022-06-15', '2025-06-15', 'SHRM-CP-2022-12345', 'https://shrm.org/verify/12345'),
(2, 'AWS Solutions Architect', 'Amazon Web Services', '2023-03-20', '2026-03-20', 'AWS-SA-2023-67890', 'https://aws.amazon.com/verify/67890'),
(2, 'Certified Scrum Master', 'Scrum Alliance', '2021-11-10', NULL, 'CSM-2021-34567', 'https://scrumalliance.org/verify/34567'),
(3, 'Chartered Accountant', 'ICAI', '2019-05-25', NULL, 'CA-2019-98765', 'https://icai.org/verify/98765'),
(4, 'Certified Sales Professional', 'Sales Association', '2020-09-15', '2025-09-15', 'CSP-2020-11223', 'https://salesassoc.com/verify/11223'),
(5, 'Oracle Certified Java Programmer', 'Oracle', '2023-07-10', '2026-07-10', 'OCP-2023-44556', 'https://oracle.com/verify/44556'),
(6, 'Google UX Design Certificate', 'Google', '2023-01-20', NULL, 'GUX-2023-77889', 'https://google.com/verify/77889'),
(8, 'Certified Management Accountant', 'IMA', '2022-12-05', '2025-12-05', 'CMA-2022-99887', 'https://ima.org/verify/99887'),
(10, 'Certified Kubernetes Administrator', 'CNCF', '2023-08-15', '2026-08-15', 'CKA-2023-66554', 'https://cncf.io/verify/66554');

-- Employee Basic Profile
INSERT INTO employee_basic_profile (user_id, profile_photo_url, job_position, company, department, manager_name, location, mobile) VALUES
(1, 'https://storage.dayflow.com/profiles/priya_sharma.jpg', 'HR Manager', 'Dayflow Technologies', 'Human Resources', NULL, 'Mumbai', '+91-9876543210'),
(2, 'https://storage.dayflow.com/profiles/rajesh_kumar.jpg', 'IT Manager', 'Dayflow Technologies', 'Information Technology', 'Priya Sharma', 'Bangalore', '+91-9876543211'),
(3, 'https://storage.dayflow.com/profiles/anjali_patel.jpg', 'Finance Manager', 'Dayflow Technologies', 'Finance & Accounts', 'Priya Sharma', 'Mumbai', '+91-9876543212'),
(4, 'https://storage.dayflow.com/profiles/vikram_singh.jpg', 'Sales Manager', 'Dayflow Technologies', 'Sales & Marketing', 'Priya Sharma', 'Pune', '+91-9876543213'),
(5, 'https://storage.dayflow.com/profiles/amit_verma.jpg', 'Software Developer', 'Dayflow Technologies', 'Information Technology', 'Rajesh Kumar', 'Bangalore', '+91-9876543214'),
(6, 'https://storage.dayflow.com/profiles/sneha_reddy.jpg', 'UI/UX Designer', 'Dayflow Technologies', 'Information Technology', 'Rajesh Kumar', 'Bangalore', '+91-9876543215'),
(7, 'https://storage.dayflow.com/profiles/pooja_gupta.jpg', 'HR Executive', 'Dayflow Technologies', 'Human Resources', 'Priya Sharma', 'Mumbai', '+91-9876543216'),
(8, 'https://storage.dayflow.com/profiles/rahul_mehta.jpg', 'Accountant', 'Dayflow Technologies', 'Finance & Accounts', 'Anjali Patel', 'Mumbai', '+91-9876543217'),
(9, 'https://storage.dayflow.com/profiles/neha_joshi.jpg', 'Sales Executive', 'Dayflow Technologies', 'Sales & Marketing', 'Vikram Singh', 'Mumbai', '+91-9876543218'),
(10, 'https://storage.dayflow.com/profiles/arjun_nair.jpg', 'DevOps Engineer', 'Dayflow Technologies', 'Information Technology', 'Rajesh Kumar', 'Bangalore', '+91-9876543219');

-- Employee Private Info
INSERT INTO employee_private_info (user_id, date_of_birth, residing_address, nationality, personal_email, gender, marital_status, date_of_joining) VALUES
(1, '1990-05-15', 'Flat 301, Green Valley Apartments, Andheri West, Mumbai', 'Indian', 'priya.personal@gmail.com', 'FEMALE', 'MARRIED', '2024-01-15'),
(2, '1988-08-20', 'House No 45, Whitefield Main Road, Bangalore', 'Indian', 'rajesh.personal@gmail.com', 'MALE', 'MARRIED', '2024-02-01'),
(3, '1992-03-10', 'Apartment 12B, Nariman Point, Mumbai', 'Indian', 'anjali.personal@gmail.com', 'FEMALE', 'SINGLE', '2024-01-20'),
(4, '1987-11-25', 'Bungalow 7, Koregaon Park, Pune', 'Indian', 'vikram.personal@gmail.com', 'MALE', 'MARRIED', '2024-03-01'),
(5, '1995-07-18', 'PG Room 12, BTM Layout, Bangalore', 'Indian', 'amit.personal@gmail.com', 'MALE', 'SINGLE', '2024-04-15'),
(6, '1994-09-22', 'Flat 203, Electronic City, Bangalore', 'Indian', 'sneha.personal@gmail.com', 'FEMALE', 'SINGLE', '2024-05-01'),
(7, '1991-12-05', 'Tower 2, Flat 501, Powai, Mumbai', 'Indian', 'pooja.personal@gmail.com', 'FEMALE', 'MARRIED', '2024-03-15'),
(8, '1993-06-30', 'Room 8, Malad West, Mumbai', 'Indian', 'rahul.personal@gmail.com', 'MALE', 'SINGLE', '2024-06-01'),
(9, '1996-02-14', 'Apartment 4C, Bandra East, Mumbai', 'Indian', 'neha.personal@gmail.com', 'FEMALE', 'SINGLE', '2024-07-01'),
(10, '1992-10-08', 'Villa 15, Indiranagar, Bangalore', 'Indian', 'arjun.personal@gmail.com', 'MALE', 'MARRIED', '2024-08-01');

-- Employee Bank Details
INSERT INTO employee_bank_details (user_id, account_number, bank_name, ifsc_code, bank_branch, pan_number, uan_number, epf_code) VALUES
(1, '12345678901234', 'HDFC Bank', 'HDFC0001234', 'Andheri Branch', 'ABCPS1234D', '100123456789', 'MHBNG12345/001'),
(2, '23456789012345', 'ICICI Bank', 'ICIC0002345', 'Whitefield Branch', 'DEFPK5678E', '100234567890', 'KABLR23456/002'),
(3, '34567890123456', 'SBI Bank', 'SBIN0003456', 'Nariman Point Branch', 'GHIPN9012F', '100345678901', 'MHMUM34567/003'),
(4, '45678901234567', 'Axis Bank', 'UTIB0004567', 'Koregaon Park Branch', 'JKLVS3456G', '100456789012', 'MHPUN45678/004'),
(5, '56789012345678', 'HDFC Bank', 'HDFC0005678', 'BTM Layout Branch', 'MNOAV6789H', '100567890123', 'KABLR56789/005'),
(6, '67890123456789', 'ICICI Bank', 'ICIC0006789', 'Electronic City Branch', 'PQRSR8901I', '100678901234', 'KABLR67890/006'),
(7, '78901234567890', 'SBI Bank', 'SBIN0007890', 'Powai Branch', 'STUVG0123J', '100789012345', 'MHMUM78901/007'),
(8, '89012345678901', 'Axis Bank', 'UTIB0008901', 'Malad Branch', 'WXYRM2345K', '100890123456', 'MHMUM89012/008'),
(9, '90123456789012', 'HDFC Bank', 'HDFC0009012', 'Bandra Branch', 'ZABNJ4567L', '100901234567', 'MHMUM90123/009'),
(10, '01234567890123', 'SBI Bank', 'SBIN0000123', 'Indiranagar Branch', 'BCDAN5678M', '101012345678', 'KABLR01234/010');

-- Employee Documents
INSERT INTO employee_documents (user_id, doc_type, file_name, file_url, file_size, mime_type, uploaded_by, is_verified, verified_by, verified_at) VALUES
(1, 'RESUME', 'Priya_Sharma_Resume.pdf', 'https://storage.dayflow.com/docs/priya_resume.pdf', 245678, 'application/pdf', 1, TRUE, 1, '2024-01-10 10:00:00'),
(1, 'ID_PROOF', 'Priya_PAN.pdf', 'https://storage.dayflow.com/docs/priya_pan.pdf', 125456, 'application/pdf', 1, TRUE, 1, '2024-01-10 10:05:00'),
(2, 'RESUME', 'Rajesh_Kumar_Resume.pdf', 'https://storage.dayflow.com/docs/rajesh_resume.pdf', 312890, 'application/pdf', 1, TRUE, 1, '2024-01-25 11:00:00'),
(3, 'RESUME', 'Anjali_Patel_Resume.pdf', 'https://storage.dayflow.com/docs/anjali_resume.pdf', 298765, 'application/pdf', 1, TRUE, 1, '2024-01-15 14:30:00'),
(4, 'RESUME', 'Vikram_Singh_Resume.pdf', 'https://storage.dayflow.com/docs/vikram_resume.pdf', 278934, 'application/pdf', 1, TRUE, 1, '2024-02-25 09:00:00'),
(5, 'RESUME', 'Amit_Verma_Resume.pdf', 'https://storage.dayflow.com/docs/amit_resume.pdf', 234567, 'application/pdf', 1, TRUE, 1, '2024-04-10 10:30:00');

-- Security Activity Log
INSERT INTO security_activity_log (user_id, event_type, event_details, ip_address, user_agent, device_info, location_info, event_time) VALUES
(1, 'LOGIN', 'Successful login', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Windows Desktop', 'Mumbai, India', '2025-01-03 09:00:00'),
(2, 'LOGIN', 'Successful login', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', 'MacBook Pro', 'Bangalore, India', '2025-01-03 09:15:00'),
(3, 'LOGIN', 'Successful login', '192.168.1.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Windows Laptop', 'Mumbai, India', '2025-01-03 09:30:00'),
(1, 'PASSWORD_CHANGE', 'Password changed successfully', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Windows Desktop', 'Mumbai, India', '2025-01-02 15:30:00'),
(5, 'LOGIN', 'Successful login', '192.168.1.103', 'Mozilla/5.0 (X11; Linux x86_64)', 'Linux Workstation', 'Bangalore, India', '2025-01-03 10:00:00');

-- ============================================
-- 7. ATTENDANCE MANAGEMENT (Sample data for last month)
-- ============================================

-- Attendance for December 2024 (Sample for employee 1)
INSERT INTO attendance_records (employee_id, user_id, attendance_date, check_in, check_out, mode_id, status, payable_status, payable_day_value, working_hours, overtime_hours) VALUES
(1, 1, '2024-12-02', '2024-12-02 09:05:00', '2024-12-02 18:10:00', 1, 'PRESENT', 'PAYABLE', 1.00, 9.08, 0.08),
(1, 1, '2024-12-03', '2024-12-03 09:00:00', '2024-12-03 18:00:00', 2, 'PRESENT', 'PAYABLE', 1.00, 9.00, 0.00),
(1, 1, '2024-12-04', '2024-12-04 09:15:00', '2024-12-04 18:20:00', 1, 'PRESENT', 'PAYABLE', 1.00, 9.08, 0.08),
(1, 1, '2024-12-05', '2024-12-05 09:10:00', '2024-12-05 18:05:00', 1, 'PRESENT', 'PAYABLE', 1.00, 8.92, 0.00),
(1, 1, '2024-12-06', '2024-12-06 09:00:00', '2024-12-06 13:00:00', 1, 'HALF_DAY', 'PAYABLE', 0.50, 4.00, 0.00);

-- Attendance for employee 2
INSERT INTO attendance_records (employee_id, user_id, attendance_date, check_in, check_out, mode_id, status, payable_status, payable_day_value, working_hours) VALUES
(2, 2, '2024-12-02', '2024-12-02 09:30:00', '2024-12-02 18:35:00', 1, 'PRESENT', 'PAYABLE', 1.00, 9.08),
(2, 2, '2024-12-03', '2024-12-03 09:25:00', '2024-12-03 18:30:00', 1, 'PRESENT', 'PAYABLE', 1.00, 9.08),
(2, 2, '2024-12-04', '2024-12-04 09:30:00', '2024-12-04 18:30:00', 1, 'PRESENT', 'PAYABLE', 1.00, 9.00);

-- Attendance Monthly Summary
INSERT INTO attendance_monthly_summary (user_id, employee_id, year, month, present_days, leave_days, absent_days, total_working_days, payable_days, total_work_hours, total_overtime_hours) VALUES
(1, 1, 2024, 12, 21.5, 2.0, 0.0, 24, 23.5, 193.5, 2.5),
(2, 2, 2024, 12, 22.0, 1.0, 0.0, 24, 23.0, 198.0, 0.0),
(3, 3, 2024, 12, 23.0, 0.0, 1.0, 24, 23.0, 207.0, 1.0);

-- ============================================
-- 8. LEAVE MANAGEMENT
-- ============================================

-- Leave Balances (Year 2025)
INSERT INTO leave_balances (user_id, employee_id, leave_type_id, year, opening_balance, allocated_days, used_days, pending_days) VALUES
(1, 1, 1, 2025, 0, 12, 0, 0), -- Casual Leave
(1, 1, 2, 2025, 0, 12, 0, 0), -- Sick Leave
(1, 1, 3, 2025, 0, 21, 0, 0), -- Earned Leave
(2, 2, 1, 2025, 0, 12, 1, 0),
(2, 2, 2, 2025, 0, 12, 0, 0),
(2, 2, 3, 2025, 0, 21, 0, 0),
(3, 3, 1, 2025, 0, 12, 0, 0),
(3, 3, 2, 2025, 0, 12, 0, 0),
(3, 3, 3, 2025, 0, 21, 0, 1), -- 1 pending
(4, 4, 1, 2025, 0, 12, 2, 0),
(4, 4, 2, 2025, 0, 12, 0, 0),
(4, 4, 3, 2025, 0, 21, 0, 0);

-- Leave Requests
INSERT INTO leave_requests (employee_id, user_id, leave_type_id, start_date, end_date, total_days, reason, status, pay_type, applied_at) VALUES
(2, 2, 1, '2024-12-15', '2024-12-15', 1.0, 'Personal work', 'APPROVED', 'PAID', '2024-12-10 10:00:00'),
(3, 3, 3, '2025-01-10', '2025-01-12', 3.0, 'Family vacation', 'PENDING', 'PAID', '2025-01-02 14:30:00'),
(4, 4, 1, '2024-11-20', '2024-11-21', 2.0, 'Wedding ceremony', 'APPROVED', 'PAID', '2024-11-15 09:00:00'),
(5, 5, 2, '2024-12-20', '2024-12-20', 1.0, 'Medical checkup', 'APPROVED', 'PAID', '2024-12-19 08:30:00'),
(1, 1, 2, '2024-12-28', '2024-12-29', 2.0, 'Fever', 'APPROVED', 'PAID', '2024-12-27 18:00:00');

-- Leave Approvals
INSERT INTO leave_approvals (leave_request_id, approver_id, approval_level, status, comments, approved_at) VALUES
(1, 2, 1, 'APPROVED', 'Approved', '2024-12-10 15:00:00'),
(3, 1, 1, 'APPROVED', 'Approved for 2 days', '2024-11-16 10:00:00'),
(4, 2, 1, 'APPROVED', 'Approved', '2024-12-19 10:00:00'),
(5, 1, 1, 'APPROVED', 'Get well soon', '2024-12-27 20:00:00');

-- ============================================
-- 9. SALARY MANAGEMENT
-- ============================================

-- Salary Structures
INSERT INTO salary_structures (employee_id, user_id, effective_from, designation, pay_grade, basic_salary, wage_amount, wage_type, pay_frequency, working_days_per_week, break_time_hours, status, approved_by, approved_at, created_by) VALUES
(1, 1, '2024-01-15', 'HR Manager', 'M2', 80000.00, 80000.00, 'MONTHLY', 'MONTHLY', 5, 1.00, 'ACTIVE', 1, '2024-01-10 10:00:00', 1),
(2, 2, '2024-02-01', 'IT Manager', 'M2', 95000.00, 95000.00, 'MONTHLY', 'MONTHLY', 5, 1.00, 'ACTIVE', 1, '2024-01-25 11:00:00', 1),
(3, 3, '2024-01-20', 'Finance Manager', 'M2', 85000.00, 85000.00, 'MONTHLY', 'MONTHLY', 5, 1.00, 'ACTIVE', 1, '2024-01-15 14:00:00', 1),
(4, 4, '2024-03-01', 'Sales Manager', 'M2', 75000.00, 75000.00, 'MONTHLY', 'MONTHLY', 5, 1.00, 'ACTIVE', 1, '2024-02-25 09:00:00', 1),
(5, 5, '2024-04-15', 'Software Developer', 'E2', 55000.00, 55000.00, 'MONTHLY', 'MONTHLY', 5, 1.00, 'ACTIVE', 1, '2024-04-10 10:30:00', 1),
(6, 6, '2024-05-01', 'UI/UX Designer', 'E2', 50000.00, 50000.00, 'MONTHLY', 'MONTHLY', 5, 1.00, 'ACTIVE', 1, '2024-04-25 11:00:00', 1),
(7, 7, '2024-03-15', 'HR Executive', 'E1', 40000.00, 40000.00, 'MONTHLY', 'MONTHLY', 5, 1.00, 'ACTIVE', 1, '2024-03-10 09:00:00', 1),
(8, 8, '2024-06-01', 'Accountant', 'E2', 45000.00, 45000.00, 'MONTHLY', 'MONTHLY', 5, 1.00, 'ACTIVE', 1, '2024-05-25 14:00:00', 1),
(9, 9, '2024-07-01', 'Sales Executive', 'E1', 35000.00, 35000.00, 'MONTHLY', 'MONTHLY', 5, 1.00, 'ACTIVE', 1, '2024-06-25 10:00:00', 1),
(10, 10, '2024-08-01', 'DevOps Engineer', 'E2', 60000.00, 60000.00, 'MONTHLY', 'MONTHLY', 5, 1.00, 'ACTIVE', 1, '2024-07-25 11:00:00', 1);

-- Salary Component Types (Master data)
INSERT INTO salary_component_types (name, description, component_code, default_mode, default_value, component_category, is_taxable, is_statutory) VALUES
('Basic Salary', 'Basic component of salary', 'BASIC', 'FIXED', 0, 'EARNING', TRUE, FALSE),
('House Rent Allowance', 'HRA for housing expenses', 'HRA', 'PERCENT', 40.00, 'EARNING', TRUE, FALSE),
('Dearness Allowance', 'DA to offset inflation', 'DA', 'PERCENT', 10.00, 'EARNING', TRUE, FALSE),
('Conveyance Allowance', 'Travel and commute allowance', 'CONVEYANCE', 'FIXED', 1600.00, 'EARNING', FALSE, FALSE),
('Medical Allowance', 'Medical expenses reimbursement', 'MEDICAL', 'FIXED', 1250.00, 'EARNING', FALSE, FALSE),
('Special Allowance', 'Special allowance', 'SPECIAL', 'PERCENT', 20.00, 'EARNING', TRUE, FALSE),
('Provident Fund Employee', 'Employee PF contribution', 'PF_EMP', 'PERCENT', 12.00, 'DEDUCTION', FALSE, TRUE),
('Professional Tax', 'State professional tax', 'PT', 'FIXED', 200.00, 'DEDUCTION', FALSE, TRUE),
('Income Tax (TDS)', 'Tax deducted at source', 'TDS', 'PERCENT', 5.00, 'DEDUCTION', FALSE, TRUE);

-- Salary Components for Employee 1 (Salary Structure 1)
INSERT INTO salary_components (salary_structure_id, component_type_id, component_type, component_name, component_code, calculation_type, computation_mode, amount, value_fixed, percentage, value_percent, computed_amount, is_taxable, is_statutory) VALUES
(1, 1, 'EARNING', 'Basic Salary', 'BASIC', 'FIXED', 'FIXED', 80000.00, 80000.00, NULL, NULL, 80000.00, TRUE, FALSE),
(1, 2, 'EARNING', 'House Rent Allowance', 'HRA', 'PERCENTAGE', 'PERCENT', NULL, NULL, 40.00, 40.000, 32000.00, TRUE, FALSE),
(1, 3, 'EARNING', 'Dearness Allowance', 'DA', 'PERCENTAGE', 'PERCENT', NULL, NULL, 10.00, 10.000, 8000.00, TRUE, FALSE),
(1, 4, 'EARNING', 'Conveyance Allowance', 'CONVEYANCE', 'FIXED', 'FIXED', 1600.00, 1600.00, NULL, NULL, 1600.00, FALSE, FALSE),
(1, 5, 'EARNING', 'Medical Allowance', 'MEDICAL', 'FIXED', 'FIXED', 1250.00, 1250.00, NULL, NULL, 1250.00, FALSE, FALSE),
(1, 6, 'EARNING', 'Special Allowance', 'SPECIAL', 'PERCENTAGE', 'PERCENT', NULL, NULL, 20.00, 20.000, 16000.00, TRUE, FALSE),
(1, 7, 'DEDUCTION', 'Provident Fund', 'PF_EMP', 'PERCENTAGE', 'PERCENT', NULL, NULL, 12.00, 12.000, 9600.00, FALSE, TRUE),
(1, 8, 'DEDUCTION', 'Professional Tax', 'PT', 'FIXED', 'FIXED', 200.00, 200.00, NULL, NULL, 200.00, FALSE, TRUE);

-- Salary Components for Employee 2 (Salary Structure 2)
INSERT INTO salary_components (salary_structure_id, component_type_id, component_type, component_name, component_code, calculation_type, amount, percentage, computed_amount, is_taxable) VALUES
(2, 1, 'EARNING', 'Basic Salary', 'BASIC', 'FIXED', 95000.00, NULL, 95000.00, TRUE),
(2, 2, 'EARNING', 'House Rent Allowance', 'HRA', 'PERCENTAGE', NULL, 40.00, 38000.00, TRUE),
(2, 3, 'EARNING', 'Dearness Allowance', 'DA', 'PERCENTAGE', NULL, 10.00, 9500.00, TRUE),
(2, 4, 'EARNING', 'Conveyance Allowance', 'CONVEYANCE', 'FIXED', 1600.00, NULL, 1600.00, FALSE),
(2, 5, 'EARNING', 'Medical Allowance', 'MEDICAL', 'FIXED', 1250.00, NULL, 1250.00, FALSE),
(2, 6, 'EARNING', 'Special Allowance', 'SPECIAL', 'PERCENTAGE', NULL, 20.00, 19000.00, TRUE),
(2, 7, 'DEDUCTION', 'Provident Fund', 'PF_EMP', 'PERCENTAGE', NULL, 12.00, 11400.00, FALSE),
(2, 8, 'DEDUCTION', 'Professional Tax', 'PT', 'FIXED', 200.00, NULL, 200.00, FALSE);

-- Salary Contributions (PF)
INSERT INTO salary_contributions (salary_structure_id, name, contribution_type, rate_percent, base_component, amount, is_statutory) VALUES
(1, 'Employee PF', 'EMPLOYEE', 12.000, 'BASIC', 9600.00, TRUE),
(1, 'Employer PF', 'EMPLOYER', 12.000, 'BASIC', 9600.00, TRUE),
(2, 'Employee PF', 'EMPLOYEE', 12.000, 'BASIC', 11400.00, TRUE),
(2, 'Employer PF', 'EMPLOYER', 12.000, 'BASIC', 11400.00, TRUE);

-- Salary Deductions
INSERT INTO salary_deductions (salary_structure_id, name, deduction_type, amount, frequency, is_taxable) VALUES
(1, 'Professional Tax', 'STATUTORY', 200.00, 'MONTHLY', FALSE),
(2, 'Professional Tax', 'STATUTORY', 200.00, 'MONTHLY', FALSE);

-- ============================================
-- 10. USER ROLES (RBAC)
-- ============================================

INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at) VALUES
(1, 2, 1, '2024-01-15 10:00:00'), -- HR Admin role
(2, 5, 1, '2024-02-01 10:00:00'), -- Manager role
(3, 5, 1, '2024-01-20 10:00:00'), -- Manager role
(4, 5, 1, '2024-03-01 10:00:00'), -- Manager role
(5, 4, 1, '2024-04-15 10:00:00'), -- Employee role
(6, 4, 1, '2024-05-01 10:00:00'), -- Employee role
(7, 4, 1, '2024-03-15 10:00:00'), -- Employee role
(8, 4, 1, '2024-06-01 10:00:00'), -- Employee role
(9, 4, 1, '2024-07-01 10:00:00'), -- Employee role
(10, 4, 1, '2024-08-01 10:00:00'); -- Employee role

-- ============================================
-- END OF PART 2
-- ============================================

-- Summary:
-- ✅ 4 Offices
-- ✅ 5 Departments  
-- ✅ 10 Users with complete authentication
-- ✅ 10 Employees with full HR data
-- ✅ 10 Employee About sections
-- ✅ 27 Employee Skills
-- ✅ 9 Employee Certifications
-- ✅ 10 Employee Basic Profiles
-- ✅ 10 Employee Private Info records
-- ✅ 10 Employee Bank Details
-- ✅ 6 Employee Documents
-- ✅ 5 Security Activity Logs
-- ✅ 8 Attendance Records (sample)
-- ✅ 3 Attendance Monthly Summaries
-- ✅ 12 Leave Balances
-- ✅ 5 Leave Requests
-- ✅ 4 Leave Approvals
-- ✅ 10 Salary Structures
-- ✅ 9 Salary Component Types
-- ✅ 16 Salary Components
-- ✅ 4 Salary Contributions
-- ✅ 2 Salary Deductions
-- ✅ 10 User Roles assignments
