import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  restoreUser,
  changeUserRole,
  changeUserStatus,
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUsersByRole,
  getUserStats,
} from '../controllers/user.controller.js';
import { authenticate } from '../auth/auth.middleware.js';
import { authorize, isHROrAdmin, selfOrHR } from '../middleware/authorization.middleware.js';

const router = express.Router();

// Public/Auth routes
router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, updateUserProfile);
router.put('/change-password', authenticate, changePassword);

// HR/Admin routes
router.get('/', authenticate, isHROrAdmin, getAllUsers);
router.get('/stats', authenticate, isHROrAdmin, getUserStats);
router.get('/role/:role', authenticate, isHROrAdmin, getUsersByRole);
router.get('/:id', authenticate, selfOrHR, getUserById);
router.post('/', authenticate, isHROrAdmin, createUser);
router.put('/:id', authenticate, isHROrAdmin, updateUser);
router.delete('/:id', authenticate, isHROrAdmin, deleteUser);
router.post('/:id/restore', authenticate, isHROrAdmin, restoreUser);
router.put('/:id/role', authenticate, authorize('ADMIN'), changeUserRole);
router.put('/:id/status', authenticate, isHROrAdmin, changeUserStatus);

export default router;
