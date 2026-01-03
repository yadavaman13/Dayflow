import express from 'express';
import { authenticate } from '../auth/auth.middleware.js';
import { isHROrAdmin, selfOrHR, authorize } from '../middleware/authorization.middleware.js';
import {
  createSalaryStructure,
  getSalaryStructureByEmployee,
  updateSalaryStructure,
  generateSalarySlip,
  getSalarySlip,
  getSalarySlipsByEmployee,
  approveSalarySlip,
  markSalaryPaid,
  getMySalarySlips,
  getMyCurrentSalary,
} from '../controllers/salary.controller.js';

const router = express.Router();

// Employee routes
router.get('/my-slips', authenticate, getMySalarySlips);
router.get('/my-structure', authenticate, getMyCurrentSalary);

// HR/Admin routes - Salary Structure
router.post('/structure', authenticate, authorize('HR', 'ADMIN'), createSalaryStructure);
router.get('/structure/employee/:employeeId', authenticate, isHROrAdmin, getSalaryStructureByEmployee);
router.put('/structure/:id', authenticate, authorize('HR', 'ADMIN'), updateSalaryStructure);

// HR/Admin routes - Salary Slips
router.post('/slip/generate', authenticate, authorize('HR', 'ADMIN'), generateSalarySlip);
router.get('/slip/:id', authenticate, selfOrHR, getSalarySlip);
router.get('/slip/employee/:employeeId', authenticate, selfOrHR, getSalarySlipsByEmployee);
router.post('/slip/:id/approve', authenticate, authorize('HR', 'ADMIN'), approveSalarySlip);
router.post('/slip/:id/mark-paid', authenticate, authorize('HR', 'ADMIN'), markSalaryPaid);

export default router;
