/**
 * ============================================
 * PAYROLL ROUTES
 * ============================================
 */

import express from 'express';
import * as payrollController from '../controllers/payroll.controller.js';
import { authenticate as authenticateToken } from '../auth/auth.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/payroll/dashboard
 * @desc    Get payroll dashboard statistics
 * @access  Private
 */
router.get('/dashboard', authenticateToken, payrollController.getPayrollDashboard);

/**
 * @route   GET /api/payroll/periods
 * @desc    Get available payroll periods
 * @access  Private
 */
router.get('/periods', authenticateToken, payrollController.getPayrollPeriods);

/**
 * @route   POST /api/payroll/payruns
 * @desc    Create new payroll run
 * @access  Private (HR/Admin)
 */
router.post('/payruns', authenticateToken, payrollController.createPayrun);

/**
 * @route   GET /api/payroll/payruns/:id
 * @desc    Get payrun details with all payslips
 * @access  Private
 */
router.get('/payruns/:id', authenticateToken, payrollController.getPayrunDetails);

/**
 * @route   GET /api/payroll/payslips/:id
 * @desc    Get detailed payslip information
 * @access  Private
 */
router.get('/payslips/:id', authenticateToken, payrollController.getPayslipDetails);

/**
 * @route   PUT /api/payroll/payslips/:id/validate
 * @desc    Validate/approve a payslip
 * @access  Private (HR/Admin)
 */
router.put('/payslips/:id/validate', authenticateToken, payrollController.validatePayslip);

/**
 * @route   PUT /api/payroll/payslips/:id/mark-paid
 * @desc    Mark payslip as paid
 * @access  Private (HR/Admin)
 */
router.put('/payslips/:id/mark-paid', authenticateToken, payrollController.markPayslipPaid);

/**
 * @route   POST /api/payroll/payslips/:id/compute
 * @desc    Recompute individual payslip
 * @access  Private (HR/Admin)
 */
router.post('/payslips/:id/compute', authenticateToken, payrollController.computePayslip);

/**
 * @route   POST /api/payroll/payslips/:id/cancel
 * @desc    Cancel/delete a payslip
 * @access  Private (HR/Admin)
 */
router.post('/payslips/:id/cancel', authenticateToken, payrollController.cancelPayslip);

export default router;
