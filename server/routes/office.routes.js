import express from 'express';
import {
  getAllOffices,
  getOfficeById,
  getOfficesByCompany,
  createOffice,
  updateOffice,
  deleteOffice,
  restoreOffice,
} from '../controllers/office.controller.js';
import { authenticate } from '../auth/auth.middleware.js';
import { isHROrAdmin } from '../middleware/authorization.middleware.js';

const router = express.Router();

router.get('/', authenticate, getAllOffices);
router.get('/:id', authenticate, getOfficeById);
router.get('/company/:companyId', authenticate, getOfficesByCompany);
router.post('/', authenticate, isHROrAdmin, createOffice);
router.put('/:id', authenticate, isHROrAdmin, updateOffice);
router.delete('/:id', authenticate, isHROrAdmin, deleteOffice);
router.post('/:id/restore', authenticate, isHROrAdmin, restoreOffice);

export default router;
