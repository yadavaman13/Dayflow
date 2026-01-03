/**
 * ============================================
 * SALARY ENGINE ROUTES
 * ============================================
 */

import express from 'express';
import * as salaryController from '../controllers/salary.controller.js';
import { authenticate as authenticateToken } from '../auth/auth.middleware.js';

const router = express.Router();

// ============================================
// SALARY STRUCTURE ROUTES
// ============================================

/**
 * @route   POST /api/salary/structure
 * @desc    Create new salary structure with auto-calculated components
 * @access  Private (HR/Admin)
 */
router.post('/structure', authenticateToken, salaryController.createSalaryStructure);

/**
 * @route   POST /api/salary/calculate
 * @desc    Calculate salary components preview (without saving)
 * @access  Private (HR/Admin)
 */
router.post('/calculate', authenticateToken, salaryController.calculateSalaryComponents);

/**
 * @route   GET /api/salary/structure/:id
 * @desc    Get salary structure by ID with components
 * @access  Private
 */
router.get('/structure/:id', authenticateToken, salaryController.getSalaryStructure);

/**
 * @route   GET /api/salary/structure/employee/:employeeId
 * @desc    Get active salary structure for employee
 * @access  Private
 */
router.get('/structure/employee/:employeeId', authenticateToken, salaryController.getEmployeeSalaryStructure);

/**
 * @route   PUT /api/salary/structure/:id/wage
 * @desc    Update wage (creates new versioned structure)
 * @access  Private (HR/Admin)
 */
router.put('/structure/:id/wage', authenticateToken, salaryController.updateWage);

/**
 * @route   GET /api/salary/structure/:id/validate
 * @desc    Validate salary structure integrity
 * @access  Private (HR/Admin)
 */
router.get('/structure/:id/validate', authenticateToken, salaryController.validateSalaryStructure);

// ============================================
// SALARY SLIP ROUTES
// ============================================

/**
 * @route   POST /api/salary/slip/generate
 * @desc    Generate monthly salary slip with attendance impact
 * @access  Private (HR/Admin)
 */
router.post('/slip/generate', authenticateToken, salaryController.generateSalarySlip);

/**
 * @route   GET /api/salary/slip/:id
 * @desc    Get salary slip by ID
 * @access  Private
 */
router.get('/slip/:id', authenticateToken, salaryController.getSalarySlip);

/**
 * @route   GET /api/salary/slip/employee/:employeeId
 * @desc    Get all salary slips for employee
 * @access  Private
 */
router.get('/slip/employee/:employeeId', authenticateToken, salaryController.getEmployeeSalarySlips);

/**
 * @route   PUT /api/salary/slip/:id/approve
 * @desc    Approve salary slip
 * @access  Private (HR/Admin)
 */
router.put('/slip/:id/approve', authenticateToken, salaryController.approveSalarySlip);

/**
 * @route   PUT /api/salary/slip/:id/pay
 * @desc    Mark salary slip as paid
 * @access  Private (HR/Finance)
 */
router.put('/slip/:id/pay', authenticateToken, salaryController.markSlipAsPaid);

// ============================================
// COMPONENT TYPES ROUTES
// ============================================

/**
 * @route   GET /api/salary/component-types
 * @desc    Get all salary component types (for configuration)
 * @access  Private (HR/Admin)
 */
router.get('/component-types', authenticateToken, salaryController.getComponentTypes);

export default router;

