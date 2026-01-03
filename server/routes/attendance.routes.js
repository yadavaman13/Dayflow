import express from 'express';
import { authenticate } from '../auth/auth.middleware.js';
import { isHROrAdmin, selfOrHR, isEmployee } from '../middleware/authorization.middleware.js';
import {
  markAttendance,
  checkOut,
  getTodayAttendance,
  getMyAttendance,
  getAttendanceByEmployee,
  getAttendanceReport,
  updateAttendance,
  getAttendanceSummary,
  approveAttendance,
  getMonthlyAttendance,
} from '../controllers/attendance.controller.js';

const router = express.Router();

// Employee routes
router.post('/check-in', authenticate, isEmployee, markAttendance);
router.post('/check-out', authenticate, isEmployee, checkOut);
router.get('/my-attendance', authenticate, isEmployee, getMyAttendance);
router.get('/today', authenticate, isEmployee, getTodayAttendance);
router.get('/monthly/:year/:month', authenticate, isEmployee, getMonthlyAttendance);
router.get('/summary', authenticate, isEmployee, getAttendanceSummary);

// HR/Admin routes
router.get('/report', authenticate, isHROrAdmin, getAttendanceReport);
router.get('/employee/:employeeId', authenticate, selfOrHR, getAttendanceByEmployee);
router.put('/:id', authenticate, isHROrAdmin, updateAttendance);
router.post('/:id/approve', authenticate, isHROrAdmin, approveAttendance);

export default router;
