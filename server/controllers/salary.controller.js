/**
 * ============================================
 * SALARY ENGINE CONTROLLER
 * ============================================
 * Handles all salary-related HTTP requests
 */

import SalaryEngine from '../services/salary.engine.js';
import db from '../config/db.js';

/**
 * Create new salary structure
 * POST /api/salary/structure
 */
export const createSalaryStructure = async (req, res) => {
    try {
        const {
            employee_id,
            user_id,
            effective_from,
            designation,
            pay_grade,
            wage_amount,
            wage_type,
            pay_frequency,
            working_days_per_week,
            break_time_hours,
            component_type_ids, // Array of component type IDs to include
            approved_by
        } = req.body;

        // Validation
        if (!employee_id || !wage_amount || !component_type_ids || component_type_ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: employee_id, wage_amount, component_type_ids'
            });
        }

        if (wage_amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Wage amount must be greater than zero'
            });
        }

        const structureData = {
            effective_from: effective_from || new Date().toISOString().split('T')[0],
            designation,
            pay_grade,
            wage_amount,
            basic_salary: wage_amount,
            wage_type: wage_type || 'FIXED',
            pay_frequency: pay_frequency || 'MONTHLY',
            working_days_per_week: working_days_per_week || 5,
            break_time_hours: break_time_hours || 1,
            approved_by: approved_by || req.user?.id,
            created_by: req.user?.id
        };

        const result = await SalaryEngine.createSalaryStructure(
            employee_id,
            user_id,
            structureData,
            component_type_ids
        );

        res.status(201).json({
            success: true,
            message: 'Salary structure created successfully',
            data: result
        });

    } catch (error) {
        console.error('Create salary structure error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create salary structure'
        });
    }
};

/**
 * Calculate salary components (preview without saving)
 * POST /api/salary/calculate
 */
export const calculateSalaryComponents = async (req, res) => {
    try {
        const { wage_amount, component_type_ids } = req.body;

        if (!wage_amount || !component_type_ids) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: wage_amount, component_type_ids'
            });
        }

        // Fetch component types
        const [componentTypes] = await db.query(
            `SELECT * FROM salary_component_types
            WHERE id IN (?)
            AND is_active = TRUE
            ORDER BY display_order ASC`,
            [component_type_ids]
        );

        const calculation = await SalaryEngine.calculateComponents(
            wage_amount,
            componentTypes
        );

        res.status(200).json({
            success: true,
            data: calculation
        });

    } catch (error) {
        console.error('Calculate components error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to calculate components'
        });
    }
};

/**
 * Get salary structure by ID with components
 * GET /api/salary/structure/:id
 */
export const getSalaryStructure = async (req, res) => {
    try {
        const { id } = req.params;

        const [structure] = await db.query(
            `SELECT ss.*, 
                e.employee_code, e.first_name, e.last_name, e.designation as emp_designation
            FROM salary_structures ss
            JOIN employees e ON e.id = ss.employee_id
            WHERE ss.id = ?`,
            [id]
        );

        if (structure.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Salary structure not found'
            });
        }

        // Fetch components
        const [components] = await db.query(
            `SELECT * FROM salary_components
            WHERE salary_structure_id = ?
            ORDER BY display_order ASC`,
            [id]
        );

        // Fetch contributions
        const [contributions] = await db.query(
            `SELECT * FROM salary_contributions
            WHERE salary_structure_id = ?`,
            [id]
        );

        // Fetch deductions
        const [deductions] = await db.query(
            `SELECT * FROM salary_deductions
            WHERE salary_structure_id = ?`,
            [id]
        );

        const earnings = components.filter(c => c.component_type === 'EARNING');
        const componentDeductions = components.filter(c => c.component_type === 'DEDUCTION');

        res.status(200).json({
            success: true,
            data: {
                structure: structure[0],
                components: {
                    earnings: earnings,
                    deductions: componentDeductions,
                    all: components
                },
                contributions: contributions,
                deductions: deductions,
                summary: {
                    totalEarnings: earnings.reduce((sum, c) => sum + parseFloat(c.computed_amount), 0),
                    totalDeductions: [
                        ...componentDeductions,
                        ...contributions.filter(c => c.contribution_type === 'EMPLOYEE'),
                        ...deductions
                    ].reduce((sum, d) => sum + parseFloat(d.amount), 0)
                }
            }
        });

    } catch (error) {
        console.error('Get salary structure error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch salary structure'
        });
    }
};

/**
 * Get active salary structure for employee
 * GET /api/salary/structure/employee/:employeeId
 */
export const getEmployeeSalaryStructure = async (req, res) => {
    try {
        const { employeeId } = req.params;

        const [structure] = await db.query(
            `SELECT ss.*, 
                e.employee_code, e.first_name, e.last_name
            FROM salary_structures ss
            JOIN employees e ON e.id = ss.employee_id
            WHERE ss.employee_id = ?
            AND ss.effective_to IS NULL
            AND ss.status = 'ACTIVE'
            ORDER BY ss.effective_from DESC
            LIMIT 1`,
            [employeeId]
        );

        if (structure.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No active salary structure found for employee'
            });
        }

        // Fetch components
        const [components] = await db.query(
            `SELECT * FROM salary_components
            WHERE salary_structure_id = ?
            ORDER BY display_order ASC`,
            [structure[0].id]
        );

        res.status(200).json({
            success: true,
            data: {
                structure: structure[0],
                components: components
            }
        });

    } catch (error) {
        console.error('Get employee salary structure error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch employee salary structure'
        });
    }
};

/**
 * Update wage (creates new versioned structure)
 * PUT /api/salary/structure/:id/wage
 */
export const updateWage = async (req, res) => {
    try {
        const { id } = req.params;
        const { new_wage } = req.body;

        if (!new_wage || new_wage <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid wage amount'
            });
        }

        const result = await SalaryEngine.recalculateSalaryStructure(
            id,
            new_wage,
            req.user?.id
        );

        res.status(200).json({
            success: true,
            message: 'Wage updated successfully. New structure version created.',
            data: result
        });

    } catch (error) {
        console.error('Update wage error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update wage'
        });
    }
};

/**
 * Generate monthly salary slip
 * POST /api/salary/slip/generate
 */
export const generateSalarySlip = async (req, res) => {
    try {
        const {
            employee_id,
            salary_month, // Format: YYYY-MM-DD (first day of month)
            attendance_data // { total_working_days, present_days, leave_days }
        } = req.body;

        if (!employee_id || !salary_month || !attendance_data) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const result = await SalaryEngine.generateSalarySlip(
            employee_id,
            salary_month,
            attendance_data
        );

        res.status(200).json({
            success: true,
            message: 'Salary slip generated successfully',
            data: result
        });

    } catch (error) {
        console.error('Generate salary slip error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate salary slip'
        });
    }
};

/**
 * Get salary slip by ID
 * GET /api/salary/slip/:id
 */
export const getSalarySlip = async (req, res) => {
    try {
        const { id } = req.params;

        const [slip] = await db.query(
            `SELECT ss.*, 
                e.employee_code, e.first_name, e.last_name, e.designation,
                str.basic_salary, str.pay_frequency
            FROM salary_slips ss
            JOIN employees e ON e.id = ss.employee_id
            JOIN salary_structures str ON str.id = ss.salary_structure_id
            WHERE ss.id = ?`,
            [id]
        );

        if (slip.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Salary slip not found'
            });
        }

        // Parse components JSON
        const slipData = slip[0];
        if (slipData.components) {
            try {
                slipData.components = JSON.parse(slipData.components);
            } catch (e) {
                console.error('Failed to parse components JSON');
            }
        }

        res.status(200).json({
            success: true,
            data: slipData
        });

    } catch (error) {
        console.error('Get salary slip error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch salary slip'
        });
    }
};

/**
 * Get all salary slips for employee
 * GET /api/salary/slip/employee/:employeeId
 */
export const getEmployeeSalarySlips = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { year, status } = req.query;

        let query = `
            SELECT ss.*, 
                e.employee_code, e.first_name, e.last_name
            FROM salary_slips ss
            JOIN employees e ON e.id = ss.employee_id
            WHERE ss.employee_id = ?
        `;
        const params = [employeeId];

        if (year) {
            query += ` AND YEAR(ss.salary_month) = ?`;
            params.push(year);
        }

        if (status) {
            query += ` AND ss.status = ?`;
            params.push(status);
        }

        query += ` ORDER BY ss.salary_month DESC`;

        const [slips] = await db.query(query, params);

        res.status(200).json({
            success: true,
            data: slips
        });

    } catch (error) {
        console.error('Get employee salary slips error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch salary slips'
        });
    }
};

/**
 * Approve salary slip
 * PUT /api/salary/slip/:id/approve
 */
export const approveSalarySlip = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query(
            `UPDATE salary_slips
            SET status = 'APPROVED',
                approved_by = ?,
                approved_at = NOW()
            WHERE id = ?
            AND status = 'GENERATED'`,
            [req.user?.id, id]
        );

        res.status(200).json({
            success: true,
            message: 'Salary slip approved successfully'
        });

    } catch (error) {
        console.error('Approve salary slip error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve salary slip'
        });
    }
};

/**
 * Mark salary slip as paid
 * PUT /api/salary/slip/:id/pay
 */
export const markSlipAsPaid = async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_date, payment_mode, payment_reference } = req.body;

        await db.query(
            `UPDATE salary_slips
            SET status = 'PAID',
                payment_date = ?,
                payment_mode = ?,
                payment_reference = ?,
                paid_by = ?,
                paid_at = NOW()
            WHERE id = ?
            AND status = 'APPROVED'`,
            [payment_date, payment_mode, payment_reference, req.user?.id, id]
        );

        res.status(200).json({
            success: true,
            message: 'Salary slip marked as paid'
        });

    } catch (error) {
        console.error('Mark slip as paid error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark slip as paid'
        });
    }
};

/**
 * Validate salary structure
 * GET /api/salary/structure/:id/validate
 */
export const validateSalaryStructure = async (req, res) => {
    try {
        const { id } = req.params;

        const validation = await SalaryEngine.validateSalaryStructure(id);

        res.status(200).json({
            success: true,
            data: validation
        });

    } catch (error) {
        console.error('Validate salary structure error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate salary structure'
        });
    }
};

/**
 * Get all component types (for configuration)
 * GET /api/salary/component-types
 */
export const getComponentTypes = async (req, res) => {
    try {
        const [componentTypes] = await db.query(
            `SELECT * FROM salary_component_types
            WHERE is_active = TRUE
            ORDER BY component_category, display_order ASC`
        );

        const grouped = {
            EARNING: componentTypes.filter(c => c.component_category === 'EARNING'),
            DEDUCTION: componentTypes.filter(c => c.component_category === 'DEDUCTION'),
            CONTRIBUTION: componentTypes.filter(c => c.component_category === 'CONTRIBUTION')
        };

        res.status(200).json({
            success: true,
            data: {
                all: componentTypes,
                grouped: grouped
            }
        });

    } catch (error) {
        console.error('Get component types error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch component types'
        });
    }
};


