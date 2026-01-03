import express from 'express';
import { authenticate } from '../auth/auth.middleware.js';
import { selfOrHR, isEmployee } from '../middleware/authorization.middleware.js';
import {
  // About
  getAbout,
  updateAbout,
  // Skills
  getSkills,
  addSkill,
  updateSkill,
  deleteSkill,
  // Certifications
  getCertifications,
  addCertification,
  updateCertification,
  deleteCertification,
  // Basic Profile
  getBasicProfile,
  updateBasicProfile,
  // Private Info
  getPrivateInfo,
  updatePrivateInfo,
  // Bank Details
  getBankDetails,
  updateBankDetails,
  // Documents
  getDocuments,
  uploadDocument,
  deleteDocument,
  verifyDocument,
} from '../controllers/employee-profile.controller.js';

const router = express.Router();

// About section
router.get('/:userId/about', authenticate, selfOrHR, getAbout);
router.put('/:userId/about', authenticate, selfOrHR, updateAbout);

// Skills section
router.get('/:userId/skills', authenticate, selfOrHR, getSkills);
router.post('/:userId/skills', authenticate, selfOrHR, addSkill);
router.put('/:userId/skills/:skillId', authenticate, selfOrHR, updateSkill);
router.delete('/:userId/skills/:skillId', authenticate, selfOrHR, deleteSkill);

// Certifications section
router.get('/:userId/certifications', authenticate, selfOrHR, getCertifications);
router.post('/:userId/certifications', authenticate, selfOrHR, addCertification);
router.put('/:userId/certifications/:certId', authenticate, selfOrHR, updateCertification);
router.delete('/:userId/certifications/:certId', authenticate, selfOrHR, deleteCertification);

// Basic profile section
router.get('/:userId/basic-profile', authenticate, selfOrHR, getBasicProfile);
router.put('/:userId/basic-profile', authenticate, selfOrHR, updateBasicProfile);

// Private info section (more restricted)
router.get('/:userId/private-info', authenticate, selfOrHR, getPrivateInfo);
router.put('/:userId/private-info', authenticate, selfOrHR, updatePrivateInfo);

// Bank details section (highly restricted)
router.get('/:userId/bank-details', authenticate, selfOrHR, getBankDetails);
router.put('/:userId/bank-details', authenticate, selfOrHR, updateBankDetails);

// Documents section
router.get('/:userId/documents', authenticate, selfOrHR, getDocuments);
router.post('/:userId/documents', authenticate, selfOrHR, uploadDocument);
router.delete('/:userId/documents/:docId', authenticate, selfOrHR, deleteDocument);
router.post('/:userId/documents/:docId/verify', authenticate, selfOrHR, verifyDocument);

export default router;
