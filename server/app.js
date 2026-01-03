import express from 'express';
import cors from 'cors';
import authRoutes from './auth/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import companyRoutes from './routes/company.routes.js';
import officeRoutes from './routes/office.routes.js';
import departmentRoutes from './routes/department.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import employeeProfileRoutes from './routes/employee-profile.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import leaveRoutes from './routes/leave.routes.js';
import salaryRoutes from './routes/salary.routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/offices', officeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/employee-profile', employeeProfileRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/salary', salaryRoutes);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'Dayflow HRMS API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;
