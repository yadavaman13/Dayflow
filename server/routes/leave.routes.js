import express from 'express';
import { authenticate } from '../auth/auth.middleware.js';
import { isHROrAdmin, selfOrHR, isEmployee } from '../middleware/authorization.middleware.js';
import {
  applyLeave,
  getMyLeaves,
  getLeaveById,
  getAllLeaves,
  getPendingLeaves,
  approveLeave,
  rejectLeave,
  cancelLeave,
  getLeaveBalance,
  getLeaveTypes,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
} from '../controllers/leave.controller.js';

const router = express.Router();

// Employee routes
router.post('/apply', authenticate, isEmployee, applyLeave);
router.get('/my-leaves', authenticate, isEmployee, getMyLeaves);
router.get('/balance', authenticate, isEmployee, getLeaveBalance);
router.post('/:id/cancel', authenticate, isEmployee, cancelLeave);

// Leave Types
router.get('/types', authenticate, getLeaveTypes);
router.post('/types', authenticate, isHROrAdmin, createLeaveType);
router.put('/types/:id', authenticate, isHROrAdmin, updateLeaveType);
router.delete('/types/:id', authenticate, isHROrAdmin, deleteLeaveType);

// HR/Admin routes
router.get('/all', authenticate, isHROrAdmin, getAllLeaves);
router.get('/pending', authenticate, isHROrAdmin, getPendingLeaves);
router.get('/:id', authenticate, selfOrHR, getLeaveById);
router.post('/:id/approve', authenticate, isHROrAdmin, approveLeave);
router.post('/:id/reject', authenticate, isHROrAdmin, rejectLeave);

export default router;
