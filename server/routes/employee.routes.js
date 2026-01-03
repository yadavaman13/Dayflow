import express from 'express';
import { authenticate } from '../auth/auth.middleware.js';
import { isHROrAdmin, selfOrHR } from '../middleware/authorization.middleware.js';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  restoreEmployee,
  getEmployeeStats,
  getEmployeesByDepartment,
  getEmployeesByManager,
} from '../controllers/employee.controller.js';

const router = express.Router();

router.get('/', authenticate, getAllEmployees);
router.get('/stats', authenticate, isHROrAdmin, getEmployeeStats);
router.get('/department/:departmentId', authenticate, getEmployeesByDepartment);
router.get('/manager/:managerId', authenticate, getEmployeesByManager);
router.get('/:id', authenticate, selfOrHR, getEmployeeById);
router.post('/', authenticate, isHROrAdmin, createEmployee);
router.put('/:id', authenticate, isHROrAdmin, updateEmployee);
router.delete('/:id', authenticate, isHROrAdmin, deleteEmployee);
router.post('/:id/restore', authenticate, isHROrAdmin, restoreEmployee);

export default router;
