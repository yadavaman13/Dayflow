import express from 'express';
import {
  getAllDepartments,
  getDepartmentById,
  getDepartmentsByCompany,
  getDepartmentsByOffice,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  restoreDepartment,
} from '../controllers/department.controller.js';
import { authenticate } from '../auth/auth.middleware.js';
import { isHROrAdmin } from '../middleware/authorization.middleware.js';

const router = express.Router();

router.get('/', authenticate, getAllDepartments);
router.get('/:id', authenticate, getDepartmentById);
router.get('/company/:companyId', authenticate, getDepartmentsByCompany);
router.get('/office/:officeId', authenticate, getDepartmentsByOffice);
router.post('/', authenticate, isHROrAdmin, createDepartment);
router.put('/:id', authenticate, isHROrAdmin, updateDepartment);
router.delete('/:id', authenticate, isHROrAdmin, deleteDepartment);
router.post('/:id/restore', authenticate, isHROrAdmin, restoreDepartment);

export default router;
