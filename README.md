# 🏢 Dayflow HRMS - Complete Human Resource Management System

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **A modern, full-stack HRMS solution built with React, Node.js, and MySQL. Streamline your HR operations with comprehensive employee management, payroll processing, attendance tracking, and more.**

## 📋 Table of Contents

- [✨ Features](#-features)
- [🚀 Tech Stack](#-tech-stack)
- [📋 Prerequisites](#-prerequisites)
- [⚙️ Installation](#️-installation)
- [🔧 Configuration](#-configuration)
- [🗄️ Database Setup](#️-database-setup)
- [▶️ Running the Application](#️-running-the-application)
- [📚 API Documentation](#-api-documentation)
- [📁 Project Structure](#-project-structure)
- [🔒 Authentication](#-authentication)
- [💼 Core Modules](#-core-modules)
- [🧪 Testing](#-testing)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [📞 Support](#-support)

## ✨ Features

### 👥 Employee Management
- **Comprehensive Employee Profiles** - Personal info, contact details, emergency contacts
- **Document Management** - Store and manage employee documents securely
- **Employee Hierarchy** - Reporting structure and organizational charts
- **Skills & Certifications** - Track employee qualifications and competencies
- **Employee Self-Service Portal** - Allow employees to update their information

### 💰 Payroll System
- **Advanced Salary Engine** - Flexible component-based salary calculations
- **Payroll Processing** - Automated payroll runs with validation
- **Salary Components** - Configurable earnings and deductions
- **Tax Calculations** - Automated tax deductions and compliance
- **Payslip Generation** - Digital payslips with detailed breakdowns
- **Bulk Operations** - Process multiple employees simultaneously

### ⏰ Attendance Management
- **Time Tracking** - Multiple attendance modes and locations
- **Leave Management** - Leave requests, approvals, and balance tracking
- **Attendance Reports** - Comprehensive reporting and analytics
- **Shift Management** - Flexible shift patterns and scheduling
- **Overtime Tracking** - Automatic overtime calculation

### 📊 Reporting & Analytics
- **Dashboard Analytics** - Real-time insights and KPIs
- **Custom Reports** - Generate reports based on specific criteria
- **Data Export** - Export data in various formats (PDF, Excel, CSV)
- **Audit Trails** - Complete activity logging and tracking

### 🔐 Security & Compliance
- **Role-Based Access Control** - Granular permissions and security
- **JWT Authentication** - Secure API authentication
- **Data Encryption** - Password hashing and sensitive data protection
- **Audit Logs** - Complete user activity tracking

### 🏢 Organization Management
- **Multi-Company Support** - Manage multiple companies and offices
- **Department Management** - Organizational structure management
- **Location Management** - Multiple office locations and remote work

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API communication
- **React Router** - Client-side routing
- **Lucide React** - Modern icon library

### Backend
- **Node.js 18+** - JavaScript runtime
- **Express.js** - Web application framework
- **ES6 Modules** - Modern JavaScript module system
- **JWT** - JSON Web Token authentication
- **bcrypt** - Password hashing
- **Nodemailer** - Email sending capabilities

### Database
- **MySQL 8.0+** - Relational database management
- **mysql2** - MySQL driver with Promise support
- **Connection Pooling** - Optimized database connections

### Development Tools
- **Nodemon** - Automatic server restart
- **ESLint** - Code linting and quality
- **Postman** - API testing (optional)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download](https://mysql.com/downloads/)
- **npm** or **yarn** - Package manager (comes with Node.js)
- **Git** - Version control system

### System Requirements
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: At least 2GB free space
- **OS**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-organization/dayflow-hrms.git
cd dayflow-hrms
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

## 🔧 Configuration

### Backend Configuration

Create a `.env` file in the `server` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=dayflow_hrms
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@yourcompany.com

# Application Configuration
APP_NAME=Dayflow HRMS
APP_URL=http://localhost:5173
API_URL=http://localhost:5000
```

### Frontend Configuration

The frontend automatically uses the API URL. For production, update the `baseURL` in `client/src/api/axios.js`:

```javascript
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-api.com/api'
  : 'http://localhost:5000/api';
```

## 🗄️ Database Setup

### 1. Create Database

```sql
CREATE DATABASE dayflow_hrms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Import Database Schema

```bash
cd server
mysql -u root -p dayflow_hrms < database/schema.sql
```

### 3. Setup Salary Engine Components

```bash
node setup-salary-engine.js
```

### 4. Create Admin User (Optional)

```bash
node database/create-admin-user.js
```

### Default Admin Credentials
```
Email: admin@dayflow.com
Password: admin123
```

> **⚠️ Security Notice**: Change the default admin password immediately after first login.

## ▶️ Running the Application

### Development Mode

1. **Start the Backend Server**
   ```bash
   cd server
   npm run dev
   ```
   Backend will run on: `http://localhost:5000`

2. **Start the Frontend Development Server**
   ```bash
   cd client
   npm run dev
   ```
   Frontend will run on: `http://localhost:5173`

### Production Mode

1. **Build the Frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Start the Backend**
   ```bash
   cd server
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/forgot-password` | Forgot password |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/verify-token` | Verify JWT token |

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | Get all employees |
| POST | `/api/employees` | Create employee |
| GET | `/api/employees/:id` | Get employee by ID |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Delete employee |

### Payroll Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payroll/dashboard` | Payroll dashboard |
| GET | `/api/payroll/periods` | Get payroll periods |
| POST | `/api/payroll/payruns` | Create payroll run |
| GET | `/api/payroll/payslips/:id` | Get payslip details |
| PUT | `/api/payroll/payslips/:id/validate` | Validate payslip |

### Authentication

All API endpoints (except auth) require a Bearer token:

```bash
curl -H "Authorization: Bearer your-jwt-token" http://localhost:5000/api/employees
```

## 📁 Project Structure

```
dayflow-hrms/
│
├── client/                          # Frontend React application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── api/                     # API configuration
│   │   ├── components/              # Reusable UI components
│   │   ├── pages/                   # Page components
│   │   ├── services/                # Business logic services
│   │   ├── styles/                  # CSS and styling
│   │   └── utils/                   # Utility functions
│   ├── package.json
│   └── vite.config.js
│
├── server/                          # Backend Node.js application
│   ├── auth/                        # Authentication middleware & routes
│   ├── config/                      # Configuration files
│   ├── controllers/                 # Route controllers
│   ├── database/                    # Database schemas and migrations
│   ├── middleware/                  # Custom middleware
│   ├── routes/                      # API route definitions
│   ├── services/                    # Business logic services
│   ├── utils/                       # Utility functions
│   ├── app.js                       # Express app configuration
│   ├── server.js                    # Server entry point
│   └── package.json
│
├── docs/                            # Documentation
├── README.md                        # This file
└── .gitignore
```

## 🔒 Authentication

Dayflow HRMS uses JWT (JSON Web Token) for authentication:

1. **Login**: Users authenticate with email/password
2. **Token**: Server returns JWT token upon successful login
3. **Authorization**: Client includes token in Authorization header
4. **Expiration**: Tokens expire after 7 days (configurable)

### Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Signing**: HMAC SHA256 algorithm
- **Token Refresh**: Automatic token refresh mechanism
- **Role-Based Access**: Different permission levels
- **Session Management**: Secure session handling

## 💼 Core Modules

### 1. Employee Management
- **Location**: `server/controllers/employee.controller.js`
- **Features**: CRUD operations, profile management, document upload
- **Database**: `employees`, `employee_profiles`, `employee_documents`

### 2. Payroll System
- **Location**: `server/controllers/payroll.controller.js`
- **Features**: Salary calculation, payroll processing, payslip generation
- **Database**: `salary_structures`, `salary_slips`, `salary_components`

### 3. Attendance Management
- **Location**: `server/controllers/attendance.controller.js`
- **Features**: Time tracking, leave management, attendance reports
- **Database**: `attendance_records`, `leave_requests`, `leave_balances`

### 4. User Management
- **Location**: `server/controllers/user.controller.js`
- **Features**: User accounts, roles, permissions
- **Database**: `users`, `roles`, `user_roles`

## 🧪 Testing

### Backend Testing

```bash
cd server

# Test database connection
node test-endpoints.js

# Test payroll system
node test-payroll-system.js

# Test salary engine
node test-salary-engine.js
```

### Frontend Testing

```bash
cd client

# Run ESLint
npm run lint

# Build for production (test)
npm run build
```

### API Testing

Use the provided Postman collection or test individual endpoints:

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dayflow.com","password":"admin123"}'
```

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
   - Set `NODE_ENV=production`
   - Update database credentials
   - Configure proper JWT secret
   - Set up SSL certificates

2. **Build Frontend**
   ```bash
   cd client
   npm run build
   ```

3. **Deploy Backend**
   ```bash
   cd server
   npm install --production
   npm start
   ```

### Docker Deployment (Optional)

```dockerfile
# Example Dockerfile for backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Variables for Production

```env
NODE_ENV=production
DB_HOST=your-production-db-host
JWT_SECRET=your-super-secure-production-jwt-secret
API_URL=https://your-domain.com/api
APP_URL=https://your-domain.com
```

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting PRs.

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards

- **ESLint**: Follow the configured linting rules
- **Commit Messages**: Use conventional commit format
- **Testing**: Add tests for new features
- **Documentation**: Update docs for API changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

### Getting Help

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs on [GitHub Issues](https://github.com/yadavaman13/dayflow-hrms/issues)
- **Discussions**: Join [GitHub Discussions](https://github.com/yadavaman13/dayflow-hrms/discussions)

### Common Issues

1. **Database Connection Errors**
   - Check MySQL service is running
   - Verify credentials in `.env`
   - Ensure database exists

2. **Authentication Issues**
   - Check JWT_SECRET is set
   - Verify token expiration
   - Clear browser local storage

3. **Port Conflicts**
   - Backend default: 5000
   - Frontend default: 5173
   - Change in respective config files

 ## Contributors
   - Aman Yadav (Leader)
   - Patel Aryan
   - Ankur Singh
   - Iteshkumar Prajapati


---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-03 | Initial release with core HRMS features |
| 0.9.0 | 2025-12-15 | Beta release with payroll system |
| 0.8.0 | 2025-11-20 | Alpha release with employee management |

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by Byte Builders


</div>
