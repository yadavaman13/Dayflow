import express from 'express';
import {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  restoreCompany,
} from '../controllers/company.controller.js';
import { authenticate } from '../auth/auth.middleware.js';
import { isHROrAdmin } from '../middleware/authorization.middleware.js';

const router = express.Router();

router.get('/', authenticate, getAllCompanies);
router.get('/:id', authenticate, getCompanyById);
router.post('/', authenticate, isHROrAdmin, createCompany);
router.put('/:id', authenticate, isHROrAdmin, updateCompany);
router.delete('/:id', authenticate, isHROrAdmin, deleteCompany);
router.post('/:id/restore', authenticate, isHROrAdmin, restoreCompany);

export default router;
