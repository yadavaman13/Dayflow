# Dayflow HRMS - Complete API Documentation & Postman Testing Guide

**Version:** 1.0.0  
**Base URL:** `http://localhost:5000/api`  
**Last Updated:** January 2026

---

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [User Management](#user-management)
3. [Organizational Structure](#organizational-structure)
4. [Employee Management](#employee-management)
5. [Employee Profile Extensions](#employee-profile-extensions)
6. [Attendance Management](#attendance-management)
7. [Leave Management](#leave-management)
8. [Payroll & Salary Management](#payroll--salary-management)
9. [Reports & Analytics](#reports--analytics)
10. [Postman Collection Setup](#postman-collection-setup)
11. [Testing Workflows](#testing-workflows)

---

## Authentication & Authorization

### Role-Based Access Control

**Roles:**
- `ADMIN` - Full system access
- `HR` - HR operations and employee management
- `EMPLOYEE` - Self-service access

### Auth Header Format
```
Authorization: Bearer <jwt_token>
```

---

## 1. AUTHENTICATION ENDPOINTS

### 1.1 Register User
```
POST /api/auth/register
```

**Body:**
```json
{
  "employee_id": "OIJODO20220001",
  "name": "John Doe",
  "email": "john.doe@dayflow.com",
  "password": "SecurePass123!",
  "phone": "+91-9876543210"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "employee_id": "OIJODO20220001",
    "name": "John Doe",
    "email": "john.doe@dayflow.com",
    "role": "EMPLOYEE"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 1.2 Login
```
POST /api/auth/login
```

**Body:**
```json
{
  "email": "john.doe@dayflow.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "employee_id": "OIJODO20220001",
    "name": "John Doe",
    "email": "john.doe@dayflow.com",
    "role": "EMPLOYEE",
    "status": "ACTIVE"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 1.3 Forgot Password
```
POST /api/auth/forgot-password
```

**Body:**
```json
{
  "email": "john.doe@dayflow.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent successfully"
}
```

---

### 1.4 Reset Password
```
POST /api/auth/reset-password/:token
```

**Body:**
```json
{
  "newPassword": "NewSecurePass456!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### 1.5 Verify Email
```
POST /api/auth/verify-email/:token
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

## 2. USER MANAGEMENT

### 2.1 Get All Users
```
GET /api/users?page=1&limit=10&role=EMPLOYEE&status=ACTIVE&search=john
```

**Auth Required:** Yes (HR/ADMIN)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "employee_id": "OIJODO20220001",
      "name": "John Doe",
      "email": "john.doe@dayflow.com",
      "role": "EMPLOYEE",
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

### 2.2 Get User by ID
```
GET /api/users/:id
```

**Auth Required:** Yes (Self or HR/ADMIN)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "employee_id": "OIJODO20220001",
    "name": "John Doe",
    "full_name": "John Michael Doe",
    "email": "john.doe@dayflow.com",
    "phone": "+91-9876543210",
    "role": "EMPLOYEE",
    "status": "ACTIVE",
    "joining_year": 2022,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 2.3 Get My Profile
```
GET /api/users/profile
```

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "employee_id": "OIJODO20220001",
    "name": "John Doe",
    "email": "john.doe@dayflow.com",
    "role": "EMPLOYEE",
    "status": "ACTIVE"
  }
}
```

---

### 2.4 Create User
```
POST /api/users
```

**Auth Required:** Yes (HR/ADMIN)

**Body:**
```json
{
  "employee_id": "OIJODO20220002",
  "name": "Jane Smith",
  "full_name": "Jane Elizabeth Smith",
  "email": "jane.smith@dayflow.com",
  "phone": "+91-9876543211",
  "password": "TempPass123!",
  "role": "EMPLOYEE",
  "joining_year": 2024
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 2,
    "employee_id": "OIJODO20220002",
    "name": "Jane Smith",
    "email": "jane.smith@dayflow.com",
    "role": "EMPLOYEE",
    "status": "FIRST_LOGIN_PENDING"
  }
}
```

---

### 2.5 Update User
```
PUT /api/users/:id
```

**Auth Required:** Yes (HR/ADMIN)

**Body:**
```json
{
  "name": "John Updated Doe",
  "phone": "+91-9876543299",
  "profile_url": "https://example.com/profiles/john.jpg"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "name": "John Updated Doe",
    "email": "john.doe@dayflow.com"
  }
}
```

---

### 2.6 Update My Profile
```
PUT /api/users/profile
```

**Auth Required:** Yes

**Body:**
```json
{
  "name": "John Doe",
  "phone": "+91-9876543210",
  "profile_url": "https://example.com/profiles/john.jpg"
}
```

---

### 2.7 Change Password
```
PUT /api/users/change-password
```

**Auth Required:** Yes

**Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### 2.8 Delete User (Soft Delete)
```
DELETE /api/users/:id
```

**Auth Required:** Yes (HR/ADMIN)

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### 2.9 Restore User
```
POST /api/users/:id/restore
```

**Auth Required:** Yes (HR/ADMIN)

---

### 2.10 Change User Role
```
PUT /api/users/:id/role
```

**Auth Required:** Yes (ADMIN only)

**Body:**
```json
{
  "role": "HR"
}
```

---

### 2.11 Change User Status
```
PUT /api/users/:id/status
```

**Auth Required:** Yes (HR/ADMIN)

**Body:**
```json
{
  "status": "ACTIVE"
}
```

---

### 2.12 Get Users by Role
```
GET /api/users/role/:role
```

**Auth Required:** Yes (HR/ADMIN)

**Example:** `GET /api/users/role/EMPLOYEE`

---

### 2.13 Get User Statistics
```
GET /api/users/stats
```

**Auth Required:** Yes (HR/ADMIN)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_users": 150,
    "hr_count": 5,
    "employee_count": 140,
    "admin_count": 5,
    "active_users": 145,
    "inactive_users": 5,
    "pending_users": 10
  }
}
```

---

## 3. ORGANIZATIONAL STRUCTURE

### 3.1 COMPANIES

#### Get All Companies
```
GET /api/companies?page=1&limit=10&status=ACTIVE&search=dayflow
```

**Auth Required:** Yes

#### Get Company by ID
```
GET /api/companies/:id
```

#### Create Company
```
POST /api/companies
```

**Auth Required:** Yes (HR/ADMIN)

**Body:**
```json
{
  "name": "Dayflow Technologies",
  "registration_number": "DAYFLOW001",
  "tax_id": "TAX123456",
  "address": "123 Business Park",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "postal_code": "400001",
  "phone": "+91-22-12345678",
  "email": "info@dayflow.com",
  "website": "https://dayflow.com",
  "established_date": "2020-01-01",
  "status": "ACTIVE"
}
```

#### Update Company
```
PUT /api/companies/:id
```

**Auth Required:** Yes (HR/ADMIN)

#### Delete Company
```
DELETE /api/companies/:id
```

**Auth Required:** Yes (HR/ADMIN)

#### Restore Company
```
POST /api/companies/:id/restore
```

---

### 3.2 OFFICES

#### Get All Offices
```
GET /api/offices?page=1&limit=10&companyId=1&status=ACTIVE
```

#### Get Office by ID
```
GET /api/offices/:id
```

#### Get Offices by Company
```
GET /api/offices/company/:companyId
```

#### Create Office
```
POST /api/offices
```

**Auth Required:** Yes (HR/ADMIN)

**Body:**
```json
{
  "company_id": 1,
  "name": "Mumbai Head Office",
  "code": "MUM-HO",
  "office_type": "HEAD_OFFICE",
  "address": "123 Business District, Andheri",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "postal_code": "400053",
  "phone": "+91-22-12345678",
  "email": "mumbai@dayflow.com",
  "latitude": 19.0760,
  "longitude": 72.8777,
  "geofence_radius": 100,
  "wifi_ssid": "Dayflow-Office-WiFi",
  "timezone": "Asia/Kolkata",
  "status": "ACTIVE"
}
```

#### Update Office
```
PUT /api/offices/:id
```

#### Delete Office
```
DELETE /api/offices/:id
```

#### Restore Office
```
POST /api/offices/:id/restore
```

---

### 3.3 DEPARTMENTS

#### Get All Departments
```
GET /api/departments?page=1&limit=10&companyId=1&officeId=1&status=ACTIVE
```

#### Get Department by ID
```
GET /api/departments/:id
```

#### Get Departments by Company
```
GET /api/departments/company/:companyId
```

#### Get Departments by Office
```
GET /api/departments/office/:officeId
```

#### Create Department
```
POST /api/departments
```

**Auth Required:** Yes (HR/ADMIN)

**Body:**
```json
{
  "company_id": 1,
  "office_id": 1,
  "name": "Information Technology",
  "code": "IT",
  "description": "IT Department handling all technical operations",
  "head_employee_id": 5,
  "parent_department_id": null,
  "status": "ACTIVE"
}
```

#### Update Department
```
PUT /api/departments/:id
```

#### Delete Department
```
DELETE /api/departments/:id
```

#### Restore Department
```
POST /api/departments/:id/restore
```

---

## 4. EMPLOYEE MANAGEMENT

### 4.1 Get All Employees
```
GET /api/employees?page=1&limit=10&search=john&department=1&status=ACTIVE
```

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "employee_code": "EMP001",
      "full_name": "John Doe",
      "designation": "Software Engineer",
      "department_name": "IT",
      "employee_status": "ACTIVE",
      "work_email": "john.doe@dayflow.com",
      "phone_primary": "+91-9876543210"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

### 4.2 Get Employee by ID
```
GET /api/employees/:id
```

**Auth Required:** Yes (Self or HR/ADMIN)

---

### 4.3 Create Employee
```
POST /api/employees
```

**Auth Required:** Yes (HR/ADMIN)

**Body:**
```json
{
  "employee_code": "EMP001",
  "company_id": 1,
  "office_id": 1,
  "department_id": 2,
  "first_name": "John",
  "middle_name": "Michael",
  "last_name": "Doe",
  "date_of_birth": "1990-05-15",
  "gender": "MALE",
  "marital_status": "MARRIED",
  "blood_group": "O+",
  "nationality": "Indian",
  "personal_email": "john.personal@gmail.com",
  "work_email": "john.doe@dayflow.com",
  "phone_primary": "+91-9876543210",
  "phone_secondary": "+91-9876543211",
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "+91-9876543299",
  "emergency_contact_relation": "Spouse",
  "current_address": "123 Main Street, Apartment 4B",
  "current_city": "Mumbai",
  "current_state": "Maharashtra",
  "current_country": "India",
  "current_postal_code": "400001",
  "permanent_address": "456 Home Town Road",
  "permanent_city": "Pune",
  "permanent_state": "Maharashtra",
  "permanent_country": "India",
  "permanent_postal_code": "411001",
  "same_as_current": false,
  "designation": "Software Engineer",
  "employment_type": "FULL_TIME",
  "employee_status": "ACTIVE",
  "date_of_joining": "2022-01-15",
  "date_of_confirmation": "2022-07-15",
  "probation_period_months": 6,
  "notice_period_days": 30,
  "reporting_manager_id": 5,
  "work_location": "OFFICE",
  "shift_timing": "9:00 AM - 6:00 PM",
  "pan_number": "ABCDE1234F",
  "aadhaar_number": "1234-5678-9012",
  "bank_name": "HDFC Bank",
  "bank_account_number": "12345678901234",
  "bank_ifsc_code": "HDFC0001234",
  "bank_branch": "Mumbai Main Branch"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "id": 1,
    "employee_code": "EMP001",
    "full_name": "John Michael Doe",
    "employee_status": "ACTIVE"
  }
}
```

---

### 4.4 Update Employee
```
PUT /api/employees/:id
```

**Auth Required:** Yes (HR/ADMIN)

**Body:** (Any fields from create employee)

---

### 4.5 Delete Employee
```
DELETE /api/employees/:id
```

**Auth Required:** Yes (HR/ADMIN)

---

### 4.6 Restore Employee
```
POST /api/employees/:id/restore
```

**Auth Required:** Yes (HR/ADMIN)

---

### 4.7 Get Employee Statistics
```
GET /api/employees/stats
```

**Auth Required:** Yes (HR/ADMIN)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_employees": 150,
    "active_employees": 145,
    "inactive_employees": 5,
    "on_leave": 3,
    "full_time": 140,
    "part_time": 5,
    "contract": 5,
    "male_count": 90,
    "female_count": 60
  }
}
```

---

### 4.8 Get Employees by Department
```
GET /api/employees/department/:departmentId
```

---

### 4.9 Get Employees by Manager
```
GET /api/employees/manager/:managerId
```

---

## 5. EMPLOYEE PROFILE EXTENSIONS

### 5.1 ABOUT SECTION

#### Get About
```
GET /api/employee-profile/:userId/about
```

**Auth Required:** Yes (Self or HR/ADMIN)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "about": "Passionate software engineer with 5+ years of experience...",
    "about_job": "I love building scalable applications...",
    "interests_hobbies": "Reading, Hiking, Photography"
  }
}
```

#### Update About
```
PUT /api/employee-profile/:userId/about
```

**Auth Required:** Yes (Self or HR/ADMIN)

**Body:**
```json
{
  "about": "Passionate software engineer...",
  "about_job": "I love building scalable applications...",
  "interests_hobbies": "Reading, Hiking"
}
```

---

### 5.2 SKILLS SECTION

#### Get Skills
```
GET /api/employee-profile/:userId/skills
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "skill_name": "JavaScript",
      "proficiency_level": "EXPERT",
      "years_of_experience": 5.5
    },
    {
      "id": 2,
      "skill_name": "React",
      "proficiency_level": "ADVANCED",
      "years_of_experience": 4.0
    }
  ]
}
```

#### Add Skill
```
POST /api/employee-profile/:userId/skills
```

**Body:**
```json
{
  "skill_name": "Node.js",
  "proficiency_level": "ADVANCED",
  "years_of_experience": 3.5
}
```

#### Update Skill
```
PUT /api/employee-profile/:userId/skills/:skillId
```

#### Delete Skill
```
DELETE /api/employee-profile/:userId/skills/:skillId
```

---

### 5.3 CERTIFICATIONS SECTION

#### Get Certifications
```
GET /api/employee-profile/:userId/certifications
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "certification_name": "AWS Certified Solutions Architect",
      "issued_by": "Amazon Web Services",
      "issue_date": "2023-06-15",
      "expiry_date": "2026-06-15",
      "credential_id": "AWS-SA-12345",
      "credential_url": "https://aws.amazon.com/verify/12345"
    }
  ]
}
```

#### Add Certification
```
POST /api/employee-profile/:userId/certifications
```

**Body:**
```json
{
  "certification_name": "AWS Certified Solutions Architect",
  "issued_by": "Amazon Web Services",
  "issue_date": "2023-06-15",
  "expiry_date": "2026-06-15",
  "credential_id": "AWS-SA-12345",
  "credential_url": "https://aws.amazon.com/verify/12345"
}
```

#### Update Certification
```
PUT /api/employee-profile/:userId/certifications/:certId
```

#### Delete Certification
```
DELETE /api/employee-profile/:userId/certifications/:certId
```

---

### 5.4 BASIC PROFILE

#### Get Basic Profile
```
GET /api/employee-profile/:userId/basic-profile
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "profile_photo_url": "https://example.com/photos/john.jpg",
    "job_position": "Senior Software Engineer",
    "company": "Dayflow Technologies",
    "department": "IT",
    "manager_name": "Jane Smith",
    "location": "Mumbai",
    "mobile": "+91-9876543210"
  }
}
```

#### Update Basic Profile
```
PUT /api/employee-profile/:userId/basic-profile
```

---

### 5.5 PRIVATE INFO

#### Get Private Info
```
GET /api/employee-profile/:userId/private-info
```

**Auth Required:** Yes (Self or HR/ADMIN - Restricted)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "date_of_birth": "1990-05-15",
    "residing_address": "123 Main Street, Apartment 4B",
    "nationality": "Indian",
    "personal_email": "john.personal@gmail.com",
    "gender": "MALE",
    "marital_status": "MARRIED",
    "date_of_joining": "2022-01-15"
  }
}
```

#### Update Private Info
```
PUT /api/employee-profile/:userId/private-info
```

---

### 5.6 BANK DETAILS

#### Get Bank Details
```
GET /api/employee-profile/:userId/bank-details
```

**Auth Required:** Yes (Self or HR/ADMIN - Highly Restricted)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "account_number": "12345678901234",
    "bank_name": "HDFC Bank",
    "ifsc_code": "HDFC0001234",
    "bank_branch": "Mumbai Main Branch",
    "pan_number": "ABCDE1234F",
    "uan_number": "100123456789",
    "epf_code": "MH/MUM/12345"
  }
}
```

#### Update Bank Details
```
PUT /api/employee-profile/:userId/bank-details
```

---

### 5.7 DOCUMENTS

#### Get Documents
```
GET /api/employee-profile/:userId/documents
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "doc_type": "RESUME",
      "file_name": "john_doe_resume.pdf",
      "file_url": "https://storage.example.com/docs/resume_123.pdf",
      "file_size": 245760,
      "is_verified": true,
      "uploaded_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### Upload Document
```
POST /api/employee-profile/:userId/documents
```

**Body:**
```json
{
  "doc_type": "RESUME",
  "file_name": "resume.pdf",
  "file_url": "https://storage.example.com/docs/resume.pdf",
  "file_size": 245760,
  "mime_type": "application/pdf"
}
```

#### Delete Document
```
DELETE /api/employee-profile/:userId/documents/:docId
```

#### Verify Document
```
POST /api/employee-profile/:userId/documents/:docId/verify
```

**Auth Required:** Yes (HR/ADMIN)

---

## 6. ATTENDANCE MANAGEMENT

### 6.1 Check-In (Mark Attendance)
```
POST /api/attendance/check-in
```

**Auth Required:** Yes

**Body:**
```json
{
  "mode_id": 1,
  "location": {
    "latitude": 19.0760,
    "longitude": 72.8777,
    "address": "Mumbai Office"
  },
  "remarks": "Regular check-in"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Checked in successfully",
  "data": {
    "id": 1,
    "employee_id": 1,
    "attendance_date": "2024-01-15",
    "check_in": "2024-01-15T09:05:00.000Z",
    "status": "PRESENT"
  }
}
```

---

### 6.2 Check-Out
```
POST /api/attendance/check-out
```

**Auth Required:** Yes

**Body:**
```json
{
  "location": {
    "latitude": 19.0760,
    "longitude": 72.8777,
    "address": "Mumbai Office"
  },
  "remarks": "Regular check-out"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Checked out successfully",
  "data": {
    "id": 1,
    "check_out": "2024-01-15T18:10:00.000Z",
    "working_hours": 9.08
  }
}
```

---

### 6.3 Get My Attendance
```
GET /api/attendance/my-attendance?startDate=2024-01-01&endDate=2024-01-31
```

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "attendance_date": "2024-01-15",
      "check_in": "2024-01-15T09:05:00.000Z",
      "check_out": "2024-01-15T18:10:00.000Z",
      "working_hours": 9.08,
      "status": "PRESENT",
      "mode": "OFFICE"
    }
  ]
}
```

---

### 6.4 Get Today's Attendance
```
GET /api/attendance/today
```

**Auth Required:** Yes

---

### 6.5 Get Monthly Attendance
```
GET /api/attendance/monthly/:year/:month
```

**Auth Required:** Yes

**Example:** `GET /api/attendance/monthly/2024/1`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "year": 2024,
    "month": 1,
    "present_days": 20,
    "leave_days": 2,
    "absent_days": 1,
    "total_working_days": 23,
    "total_work_hours": 180.5,
    "total_overtime_hours": 5.5,
    "attendance_records": [...]
  }
}
```

---

### 6.6 Get Attendance Summary
```
GET /api/attendance/summary?year=2024&month=1
```

**Auth Required:** Yes

---

### 6.7 Get Attendance Report (HR/Admin)
```
GET /api/attendance/report?startDate=2024-01-01&endDate=2024-01-31&department=1&status=PRESENT
```

**Auth Required:** Yes (HR/ADMIN)

---

### 6.8 Get Attendance by Employee
```
GET /api/attendance/employee/:employeeId?startDate=2024-01-01&endDate=2024-01-31
```

**Auth Required:** Yes (Self or HR/ADMIN)

---

### 6.9 Update Attendance (HR/Admin)
```
PUT /api/attendance/:id
```

**Auth Required:** Yes (HR/ADMIN)

**Body:**
```json
{
  "status": "PRESENT",
  "working_hours": 8.5,
  "remarks": "Adjusted by HR"
}
```

---

### 6.10 Approve Attendance
```
POST /api/attendance/:id/approve
```

**Auth Required:** Yes (HR/ADMIN)

---

## 7. LEAVE MANAGEMENT

### 7.1 Apply Leave
```
POST /api/leave/apply
```

**Auth Required:** Yes

**Body:**
```json
{
  "leave_type_id": 1,
  "start_date": "2024-02-15",
  "end_date": "2024-02-17",
  "total_days": 3,
  "reason": "Family function",
  "supporting_document_url": "https://storage.example.com/docs/leave_doc.pdf"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Leave request submitted successfully",
  "data": {
    "id": 1,
    "leave_type": "Casual Leave",
    "start_date": "2024-02-15",
    "end_date": "2024-02-17",
    "total_days": 3,
    "status": "PENDING"
  }
}
```

---

### 7.2 Get My Leaves
```
GET /api/leave/my-leaves?status=PENDING&startDate=2024-01-01
```

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "leave_type": "Casual Leave",
      "start_date": "2024-02-15",
      "end_date": "2024-02-17",
      "total_days": 3,
      "status": "APPROVED",
      "applied_at": "2024-02-01T10:00:00.000Z",
      "reason": "Family function"
    }
  ]
}
```

---

### 7.3 Get Leave Balance
```
GET /api/leave/balance?year=2024
```

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "leave_type": "Casual Leave",
      "allocated_days": 12,
      "used_days": 3,
      "pending_days": 0,
      "remaining_days": 9
    },
    {
      "leave_type": "Sick Leave",
      "allocated_days": 12,
      "used_days": 2,
      "pending_days": 0,
      "remaining_days": 10
    }
  ]
}
```

---

### 7.4 Cancel Leave
```
POST /api/leave/:id/cancel
```

**Auth Required:** Yes

**Body:**
```json
{
  "cancellation_reason": "Plans changed"
}
```

---

### 7.5 Get All Leaves (HR/Admin)
```
GET /api/leave/all?page=1&limit=10&status=PENDING&employee=1&startDate=2024-01-01
```

**Auth Required:** Yes (HR/ADMIN)

---

### 7.6 Get Pending Leaves (HR/Admin)
```
GET /api/leave/pending
```

**Auth Required:** Yes (HR/ADMIN)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "employee_name": "John Doe",
      "leave_type": "Casual Leave",
      "start_date": "2024-02-15",
      "end_date": "2024-02-17",
      "total_days": 3,
      "reason": "Family function",
      "applied_at": "2024-02-01T10:00:00.000Z"
    }
  ]
}
```

---

### 7.7 Approve Leave (HR/Admin)
```
POST /api/leave/:id/approve
```

**Auth Required:** Yes (HR/ADMIN)

**Body:**
```json
{
  "comments": "Approved"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Leave approved successfully"
}
```

---

### 7.8 Reject Leave (HR/Admin)
```
POST /api/leave/:id/reject
```

**Auth Required:** Yes (HR/ADMIN)

**Body:**
```json
{
  "comments": "Insufficient leave balance"
}
```

---

### 7.9 Get Leave Types
```
GET /api/leave/types
```

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Casual Leave",
      "code": "CL",
      "is_paid": true,
      "max_days_per_year": 12,
      "description": "For personal reasons"
    }
  ]
}
```

---

### 7.10 Create Leave Type (HR/Admin)
```
POST /api/leave/types
```

**Auth Required:** Yes (HR/ADMIN)

**Body:**
```json
{
  "name": "Paternity Leave",
  "code": "PL",
  "description": "For new fathers",
  "is_paid": true,
  "max_days_per_year": 15,
  "requires_approval": true,
  "applicable_gender": "MALE"
}
```

---

### 7.11 Update Leave Type
```
PUT /api/leave/types/:id
```

**Auth Required:** Yes (HR/ADMIN)

---

### 7.12 Delete Leave Type
```
DELETE /api/leave/types/:id
```

**Auth Required:** Yes (HR/ADMIN)

---

## 8. PAYROLL & SALARY MANAGEMENT

### 8.1 Get My Salary Slips
```
GET /api/salary/my-slips?year=2024&month=1
```

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "salary_month": "2024-01-01",
      "gross_salary": 50000.00,
      "total_deductions": 5000.00,
      "net_salary": 45000.00,
      "status": "PAID",
      "payment_date": "2024-02-01"
    }
  ]
}
```

---

### 8.2 Get My Current Salary Structure
```
GET /api/salary/my-structure
```

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "basic_salary": 30000.00,
    "effective_from": "2024-01-01",
    "components": [
      {
        "component_name": "Basic",
        "amount": 30000.00,
        "component_type": "EARNING"
      },
      {
        "component_name": "HRA",
        "amount": 12000.00,
        "component_type": "EARNING"
      },
      {
        "component_name": "PF",
        "amount": 3600.00,
        "component_type": "DEDUCTION"
      }
    ]
  }
}
```

---

### 8.3 Create Salary Structure (HR/Admin)
```
POST /api/salary/structure
```

**Auth Required:** Yes (HR/ADMIN)

**Body:**
```json
{
  "employee_id": 1,
  "effective_from": "2024-01-01",
  "basic_salary": 30000.00,
  "designation": "Software Engineer",
  "pay_frequency": "MONTHLY",
  "components": [
    {
      "component_name": "HRA",
      "component_type": "EARNING",
      "calculation_type": "PERCENTAGE",
      "percentage": 40,
      "is_taxable": true
    },
    {
      "component_name": "PF",
      "component_type": "DEDUCTION",
      "calculation_type": "PERCENTAGE",
      "percentage": 12,
      "is_statutory": true
    }
  ]
}
```

---

### 8.4 Get Salary Structure by Employee
```
GET /api/salary/structure/employee/:employeeId
```

**Auth Required:** Yes (HR/ADMIN)

---

### 8.5 Update Salary Structure
```
PUT /api/salary/structure/:id
```

**Auth Required:** Yes (HR/ADMIN)

---

### 8.6 Generate Salary Slip (HR/Admin)
```
POST /api/salary/slip/generate
```

**Auth Required:** Yes (HR/ADMIN)

**Body:**
```json
{
  "employee_id": 1,
  "salary_month": "2024-01-01",
  "working_days": 23,
  "present_days": 22,
  "leave_days": 1,
  "absent_days": 0
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Salary slip generated successfully",
  "data": {
    "id": 1,
    "employee_id": 1,
    "salary_month": "2024-01-01",
    "gross_salary": 50000.00,
    "total_deductions": 5000.00,
    "net_salary": 45000.00,
    "status": "GENERATED"
  }
}
```

---

### 8.7 Get Salary Slip by ID
```
GET /api/salary/slip/:id
```

**Auth Required:** Yes (Self or HR/ADMIN)

---

### 8.8 Get Salary Slips by Employee
```
GET /api/salary/slip/employee/:employeeId?year=2024
```

**Auth Required:** Yes (Self or HR/ADMIN)

---

### 8.9 Approve Salary Slip (HR/Admin)
```
POST /api/salary/slip/:id/approve
```

**Auth Required:** Yes (HR/ADMIN)

---

### 8.10 Mark Salary as Paid (HR/Admin)
```
POST /api/salary/slip/:id/mark-paid
```

**Auth Required:** Yes (HR/ADMIN)

**Body:**
```json
{
  "payment_date": "2024-02-01",
  "payment_mode": "BANK_TRANSFER",
  "payment_reference": "TXN123456789"
}
```

---

## 9. POSTMAN COLLECTION SETUP

### Step 1: Create Environment

Create a new environment in Postman with the following variables:

```json
{
  "base_url": "http://localhost:5000/api",
  "token": "",
  "user_id": "",
  "employee_id": ""
}
```

### Step 2: Setup Collection

1. **Create a new collection** named "Dayflow HRMS API"

2. **Add Pre-request Script** at collection level:
```javascript
// Auto-refresh token if expired (optional)
const token = pm.environment.get("token");
if (token) {
    pm.request.headers.add({
        key: "Authorization",
        value: `Bearer ${token}`
    });
}
```

3. **Add Test Script** at collection level:
```javascript
// Save token from login/register responses
if (pm.response.code === 200 || pm.response.code === 201) {
    const jsonData = pm.response.json();
    
    if (jsonData.token) {
        pm.environment.set("token", jsonData.token);
    }
    
    if (jsonData.data && jsonData.data.id) {
        pm.environment.set("user_id", jsonData.data.id);
    }
}

// Log response for debugging
console.log("Response:", pm.response.json());
```

---

## 10. TESTING WORKFLOWS

### Workflow 1: Employee Onboarding

**Test Sequence:**

1. **HR Login**
   ```
   POST {{base_url}}/auth/login
   Body: { "email": "hr@dayflow.com", "password": "HRPass123!" }
   ```

2. **Create Employee**
   ```
   POST {{base_url}}/employees
   Body: { employee details }
   ```

3. **Create User Account**
   ```
   POST {{base_url}}/users
   Body: { user details linked to employee }
   ```

4. **Create Salary Structure**
   ```
   POST {{base_url}}/salary/structure
   Body: { salary details }
   ```

5. **Allocate Leave Balance**
   (Automated via database triggers/scheduled jobs)

---

### Workflow 2: Daily Attendance

**Test Sequence:**

1. **Employee Login**
   ```
   POST {{base_url}}/auth/login
   ```

2. **Check-In**
   ```
   POST {{base_url}}/attendance/check-in
   Body: { mode_id, location }
   ```

3. **Get Today's Attendance**
   ```
   GET {{base_url}}/attendance/today
   ```

4. **Check-Out**
   ```
   POST {{base_url}}/attendance/check-out
   Body: { location }
   ```

5. **View Monthly Summary**
   ```
   GET {{base_url}}/attendance/monthly/2024/1
   ```

---

### Workflow 3: Leave Application & Approval

**Test Sequence:**

1. **Employee: Check Leave Balance**
   ```
   GET {{base_url}}/leave/balance
   ```

2. **Employee: Apply Leave**
   ```
   POST {{base_url}}/leave/apply
   Body: { leave details }
   ```

3. **HR: View Pending Leaves**
   ```
   GET {{base_url}}/leave/pending
   ```

4. **HR: Approve Leave**
   ```
   POST {{base_url}}/leave/{{leave_id}}/approve
   Body: { comments }
   ```

5. **Employee: View Leave Status**
   ```
   GET {{base_url}}/leave/my-leaves
   ```

---

### Workflow 4: Monthly Payroll Processing

**Test Sequence:**

1. **HR: Get Attendance Report**
   ```
   GET {{base_url}}/attendance/report?startDate=2024-01-01&endDate=2024-01-31
   ```

2. **HR: Generate Salary Slips (for all employees)**
   ```
   POST {{base_url}}/salary/slip/generate
   Body: { employee_id, month, attendance data }
   ```

3. **HR: Review & Approve Salary Slips**
   ```
   POST {{base_url}}/salary/slip/{{slip_id}}/approve
   ```

4. **HR: Mark as Paid**
   ```
   POST {{base_url}}/salary/slip/{{slip_id}}/mark-paid
   Body: { payment details }
   ```

5. **Employee: View Salary Slip**
   ```
   GET {{base_url}}/salary/my-slips?year=2024&month=1
   ```

---

## 11. COMMON ERROR RESPONSES

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You do not have permission to access this resource",
  "requiredRoles": ["HR", "ADMIN"],
  "userRole": "EMPLOYEE"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Detailed error message"
}
```

---

## 12. API ENDPOINT SUMMARY

| Module | Endpoint Count | Authentication | Authorization |
|--------|---------------|----------------|---------------|
| Authentication | 5 | Mixed | Public + Protected |
| User Management | 13 | Required | Role-based |
| Companies | 6 | Required | HR/Admin |
| Offices | 7 | Required | HR/Admin |
| Departments | 8 | Required | HR/Admin |
| Employees | 9 | Required | Self/HR/Admin |
| Employee Profile | 24 | Required | Self/HR/Admin |
| Attendance | 10 | Required | Self/HR/Admin |
| Leave Management | 12 | Required | Self/HR/Admin |
| Salary Management | 10 | Required | Self/HR/Admin |
| **TOTAL** | **104+** | - | - |

---

## 13. DATABASE CONNECTIVITY NOTE

Ensure your `.env` file is configured:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=dayflow_hrms
DB_PORT=3306

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

NODE_ENV=development
PORT=5000
```

---

## 14. TESTING CHECKLIST

- [ ] All authentication endpoints working
- [ ] User CRUD operations functional
- [ ] Organizational structure management working
- [ ] Employee onboarding flow complete
- [ ] Attendance check-in/check-out working
- [ ] Leave application & approval flow tested
- [ ] Salary structure creation tested
- [ ] Salary slip generation working
- [ ] Role-based authorization enforced
- [ ] Error handling verified
- [ ] Pagination working correctly
- [ ] Search and filters functional

---

**END OF DOCUMENTATION**

For support or issues, contact the development team.
