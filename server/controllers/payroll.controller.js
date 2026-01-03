/**
 * ============================================
 * PAYROLL CONTROLLER
 * ============================================
 * Handles payroll runs, payslips, and periods
 */

import db from '../config/db.js';
import SalaryEngine from '../services/salary.engine.js';

/**
 * Get payroll dashboard data
 * GET /api/payroll/dashboard
 */
export const getPayrollDashboard = async (req, res) => {
    try {
        const connection = await db.getConnection();

        // Get current month stats
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        // Total employees
        const [[{ totalEmployees }]] = await connection.query(
            `SELECT COUNT(*) as totalEmployees FROM employees WHERE is_deleted = 0`
        );

        // Processed payslips this month
        const [[{ processedPayslips }]] = await connection.query(
            `SELECT COUNT(*) as processedPayslips 
             FROM salary_slips 
             WHERE month = ? AND year = ? AND status IN ('approved', 'paid')`,
            [currentMonth, currentYear]
        );

        // Pending payslips
        const [[{ pendingPayslips }]] = await connection.query(
            `SELECT COUNT(*) as pendingPayslips 
             FROM salary_slips 
             WHERE month = ? AND year = ? AND status = 'draft'`,
            [currentMonth, currentYear]
        );

        // Total payroll cost this month
        const [[{ totalCost }]] = await connection.query(
            `SELECT COALESCE(SUM(net_salary), 0) as totalCost 
             FROM salary_slips 
             WHERE month = ? AND year = ? AND status IN ('approved', 'paid')`,
            [currentMonth, currentYear]
        );

        // Recent payruns (last 5)
        const [recentPayruns] = await connection.query(
            `SELECT 
                MAX(ss.id) as id,
                ss.month,
                ss.year,
                DATE_FORMAT(MAX(ss.generated_at), '%d %b %Y') as date,
                COUNT(*) as employeeCount,
                SUM(ss.gross_salary) as totalGross,
                SUM(ss.net_salary) as totalNet,
                MAX(ss.status) as status
             FROM salary_slips ss
             WHERE ss.month IS NOT NULL AND ss.year IS NOT NULL
             GROUP BY ss.month, ss.year
             ORDER BY ss.year DESC, ss.month DESC
             LIMIT 5`
        );

        connection.release();

        res.json({
            success: true,
            data: {
                stats: {
                    totalEmployees,
                    processedPayslips,
                    pendingPayslips,
                    totalCost: parseFloat(totalCost || 0)
                },
                recentPayruns: recentPayruns.map(pr => ({
                    id: pr.id,
                    name: `Payrun ${getMonthName(pr.month)} ${pr.year}`,
                    month: pr.month,
                    year: pr.year,
                    date: pr.date,
                    employeeCount: pr.employeeCount,
                    totalGross: parseFloat(pr.totalGross || 0),
                    totalNet: parseFloat(pr.totalNet || 0),
                    status: pr.status
                }))
            }
        });

    } catch (error) {
        console.error('Error fetching payroll dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payroll dashboard',
            error: error.message
        });
    }
};

/**
 * Get payroll periods
 * GET /api/payroll/periods
 */
export const getPayrollPeriods = async (req, res) => {
    try {
        const connection = await db.getConnection();

        // Generate periods for last 3 months, current month, and next 3 months
        const periods = [];
        const today = new Date();
        
        for (let i = -3; i <= 3; i++) {
            const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            const lastDay = new Date(year, month, 0).getDate();

            // Check if payrun exists for this period
            const [[existing]] = await connection.query(
                `SELECT COUNT(*) as count FROM salary_slips WHERE month = ? AND year = ?`,
                [month, year]
            );

            periods.push({
                id: `${year}-${String(month).padStart(2, '0')}`,
                period_name: `${getMonthName(month)} ${year}`,
                start_date: `${year}-${String(month).padStart(2, '0')}-01`,
                end_date: `${year}-${String(month).padStart(2, '0')}-${lastDay}`,
                month,
                year,
                status: existing.count > 0 ? 'closed' : (i === 0 ? 'open' : 'draft')
            });
        }

        connection.release();

        res.json({
            success: true,
            data: periods
        });

    } catch (error) {
        console.error('Error fetching payroll periods:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payroll periods',
            error: error.message
        });
    }
};

/**
 * Create new payrun
 * POST /api/payroll/payruns
 */
export const createPayrun = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        const { period_id, force_create } = req.body;
        const user_id = req.user?.id || 1;

        if (!period_id) {
            return res.status(400).json({
                success: false,
                message: 'Period ID is required'
            });
        }

        // Parse period (format: YYYY-MM)
        const [year, month] = period_id.split('-').map(Number);

        // Check if payrun already exists
        const [[existing]] = await connection.query(
            `SELECT id FROM salary_slips WHERE month = ? AND year = ? LIMIT 1`,
            [month, year]
        );

        if (existing && !force_create) {
            connection.release();
            return res.status(400).json({
                success: false,
                message: 'Payrun already exists for this period. Use force_create to override.',
                warnings: [{
                    type: 'existing_payrun',
                    message: `A payrun already exists for ${getMonthName(month)} ${year}`
                }]
            });
        }

        await connection.beginTransaction();

        // Get all active employees with salary structures
        const [employees] = await connection.query(
            `SELECT 
                e.id as employee_id,
                e.first_name,
                e.last_name,
                ss.id as structure_id,
                ss.wage_amount,
                ss.wage_type,
                ss.pay_frequency,
                MAX(ss.effective_from) as effective_from
             FROM employees e
             INNER JOIN salary_structures ss ON e.id = ss.employee_id 
             WHERE e.is_deleted = 0 
             AND ss.status = 'ACTIVE'
             AND ss.effective_from <= LAST_DAY(?)
             GROUP BY e.id, e.first_name, e.last_name, ss.id, ss.wage_amount, ss.wage_type, ss.pay_frequency
             ORDER BY effective_from DESC`,
            [`${year}-${String(month).padStart(2, '0')}-01`]
        );

        if (employees.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({
                success: false,
                message: 'No active employees with salary structures found'
            });
        }

        const warnings = [];
        const createdPayslips = [];

        // Generate payslips for each employee
        for (const employee of employees) {
            try {
                // Calculate days in month
                const daysInMonth = new Date(year, month, 0).getDate();
                const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
                const endDate = `${year}-${String(month).padStart(2, '0')}-${daysInMonth}`;

                // Get attendance data (you can integrate with your attendance system)
                const [[attendanceData]] = await connection.query(
                    `SELECT 
                        COUNT(*) as presentDays,
                        0 as paidLeaveDays
                     FROM attendance_records 
                     WHERE employee_id = ? 
                     AND attendance_date BETWEEN ? AND ?
                     AND status IN ('present', 'half-day')`,
                    [employee.employee_id, startDate, endDate]
                );

                const presentDays = attendanceData?.presentDays || daysInMonth;
                const workedDays = presentDays + (attendanceData?.paidLeaveDays || 0);

                // Generate salary slip using salary engine
                const slipResult = await SalaryEngine.generateSalarySlip(
                    employee.structure_id,
                    month,
                    year,
                    workedDays,
                    daysInMonth,
                    user_id
                );

                if (slipResult.success) {
                    createdPayslips.push({
                        employee_id: employee.employee_id,
                        employee_name: `${employee.first_name} ${employee.last_name}`,
                        slip_id: slipResult.data.slip_id
                    });
                } else {
                    warnings.push({
                        type: 'generation_failed',
                        employee: `${employee.first_name} ${employee.last_name}`,
                        message: slipResult.message
                    });
                }

            } catch (error) {
                console.error(`Error generating payslip for employee ${employee.employee_id}:`, error);
                warnings.push({
                    type: 'generation_error',
                    employee: `${employee.first_name} ${employee.last_name}`,
                    message: error.message
                });
            }
        }

        await connection.commit();
        connection.release();

        res.status(201).json({
            success: true,
            message: `Payrun created successfully for ${getMonthName(month)} ${year}`,
            data: {
                period_id,
                month,
                year,
                total_employees: employees.length,
                payslips_created: createdPayslips.length,
                warnings: warnings.length,
                payslips: createdPayslips
            },
            warnings
        });

    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error('Error creating payrun:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payrun',
            error: error.message
        });
    }
};

/**
 * Get payrun details
 * GET /api/payroll/payruns/:id
 */
export const getPayrunDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await db.getConnection();

        // Get payrun info (first payslip's month/year)
        const [[payrunInfo]] = await connection.query(
            `SELECT month, year, status, generated_at 
             FROM salary_slips 
             WHERE id = ?`,
            [id]
        );

        if (!payrunInfo) {
            connection.release();
            return res.status(404).json({
                success: false,
                message: 'Payrun not found'
            });
        }

        // Get all payslips for this period
        const [payslips] = await connection.query(
            `SELECT 
                ss.id,
                e.id as employee_id,
                CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                ss.month,
                ss.year,
                ss.gross_salary as gross,
                ss.net_salary as net,
                ss.status,
                ss.generated_at,
                ss.approved_at,
                ss.paid_at,
                DATE_FORMAT(ss.period_start, '%Y-%m-%d') as period_start,
                DATE_FORMAT(ss.period_end, '%Y-%m-%d') as period_end
             FROM salary_slips ss
             INNER JOIN employees e ON ss.employee_id = e.id
             WHERE ss.month = ? AND ss.year = ?
             ORDER BY e.first_name, e.last_name`,
            [payrunInfo.month, payrunInfo.year]
        );

        connection.release();

        res.json({
            success: true,
            data: {
                payrun_name: `Payrun ${getMonthName(payrunInfo.month)} ${payrunInfo.year}`,
                month: payrunInfo.month,
                year: payrunInfo.year,
                status: payrunInfo.status,
                generated_date: payrunInfo.generated_at,
                total_payslips: payslips.length,
                total_gross: payslips.reduce((sum, p) => sum + parseFloat(p.gross), 0),
                total_net: payslips.reduce((sum, p) => sum + parseFloat(p.net), 0),
                payslips: payslips.map(p => ({
                    id: p.id,
                    employee_id: p.employee_id,
                    employee_name: p.employee_name,
                    gross: parseFloat(p.gross),
                    net: parseFloat(p.net),
                    status: p.status,
                    period_start: p.period_start,
                    period_end: p.period_end
                }))
            }
        });

    } catch (error) {
        console.error('Error fetching payrun details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payrun details',
            error: error.message
        });
    }
};

/**
 * Get payslip details
 * GET /api/payroll/payslips/:id
 */
export const getPayslipDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await db.getConnection();

        // Get payslip with employee info
        const [[payslip]] = await connection.query(
            `SELECT 
                ss.*,
                CONCAT(e.first_name, ' ', e.last_name) as employee_name
             FROM salary_slips ss
             INNER JOIN employees e ON ss.employee_id = e.id
             WHERE ss.id = ?`,
            [id]
        );

        if (!payslip) {
            connection.release();
            return res.status(404).json({
                success: false,
                message: 'Payslip not found'
            });
        }

        // Get salary components
        const [components] = await connection.query(
            `SELECT 
                sct.name as component,
                ssc.amount,
                ssc.is_deduction
             FROM salary_slip_components ssc
             INNER JOIN salary_component_types sct ON ssc.component_type_id = sct.id
             WHERE ssc.slip_id = ?
             ORDER BY ssc.is_deduction, sct.display_order`,
            [id]
        );

        // Get attendance data
        const [[attendanceData]] = await connection.query(
            `SELECT 
                COUNT(CASE WHEN status = 'present' THEN 1 END) as presentDays,
                COUNT(CASE WHEN status = 'half-day' THEN 1 END) as halfDays,
                COUNT(CASE WHEN status = 'paid-leave' THEN 1 END) as paidLeaveDays
             FROM attendance_records 
             WHERE employee_id = ? 
             AND attendance_date BETWEEN ? AND ?`,
            [payslip.employee_id, payslip.period_start, payslip.period_end]
        );

        connection.release();

        res.json({
            success: true,
            data: {
                id: payslip.id,
                employee_id: payslip.employee_id,
                employee_name: payslip.employee_name,
                month: payslip.month,
                year: payslip.year,
                period_start: payslip.period_start,
                period_end: payslip.period_end,
                gross: parseFloat(payslip.gross_salary),
                net: parseFloat(payslip.net_salary),
                status: payslip.status,
                generated_date: payslip.generated_at,
                approved_date: payslip.approved_at,
                paid_date: payslip.paid_at,
                components: components.filter(c => !c.is_deduction).map(c => ({
                    component: c.component,
                    amount: parseFloat(c.amount)
                })),
                deductions: components.filter(c => c.is_deduction).map(c => ({
                    component: c.component,
                    amount: parseFloat(c.amount)
                })),
                attendance_data: {
                    presentDays: attendanceData?.presentDays || 0,
                    halfDays: attendanceData?.halfDays || 0,
                    paidLeaveDays: attendanceData?.paidLeaveDays || 0,
                    totalDays: new Date(payslip.year, payslip.month, 0).getDate(),
                    workedDays: payslip.worked_days
                }
            }
        });

    } catch (error) {
        console.error('Error fetching payslip details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payslip details',
            error: error.message
        });
    }
};

/**
 * Validate payslip
 * PUT /api/payroll/payslips/:id/validate
 */
export const validatePayslip = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user?.id || 1;

        const result = await SalaryEngine.approveSalarySlip(id, user_id);

        if (result.success) {
            res.json({
                success: true,
                message: 'Payslip validated successfully',
                data: result.data
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }

    } catch (error) {
        console.error('Error validating payslip:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate payslip',
            error: error.message
        });
    }
};

/**
 * Mark payslip as paid
 * PUT /api/payroll/payslips/:id/mark-paid
 */
export const markPayslipPaid = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user?.id || 1;

        const result = await SalaryEngine.markSlipAsPaid(id, user_id);

        if (result.success) {
            res.json({
                success: true,
                message: 'Payslip marked as paid successfully',
                data: result.data
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }

    } catch (error) {
        console.error('Error marking payslip as paid:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark payslip as paid',
            error: error.message
        });
    }
};

/**
 * Compute individual payslip
 * POST /api/payroll/payslips/:id/compute
 */
export const computePayslip = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user?.id || 1;

        const connection = await db.getConnection();
        
        // Get payslip details
        const [[payslip]] = await connection.query(
            `SELECT employee_id, month, year, salary_structure_id, working_days, present_days 
             FROM salary_slips WHERE id = ?`,
            [id]
        );

        if (!payslip) {
            connection.release();
            return res.status(404).json({
                success: false,
                message: 'Payslip not found'
            });
        }

        // Regenerate salary slip
        const result = await SalaryEngine.generateSalarySlip(
            payslip.salary_structure_id,
            payslip.month,
            payslip.year,
            payslip.present_days,
            payslip.working_days,
            user_id
        );

        connection.release();

        if (result.success) {
            res.json({
                success: true,
                message: 'Payslip computed successfully',
                data: result.data
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }

    } catch (error) {
        console.error('Error computing payslip:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to compute payslip',
            error: error.message
        });
    }
};

/**
 * Cancel/delete payslip
 * POST /api/payroll/payslips/:id/cancel
 */
export const cancelPayslip = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const connection = await db.getConnection();
        
        // Check if payslip exists and is not paid
        const [[payslip]] = await connection.query(
            `SELECT status FROM salary_slips WHERE id = ?`,
            [id]
        );

        if (!payslip) {
            connection.release();
            return res.status(404).json({
                success: false,
                message: 'Payslip not found'
            });
        }

        if (payslip.status === 'paid') {
            connection.release();
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel a paid payslip'
            });
        }

        // Update status to cancelled
        await connection.query(
            `UPDATE salary_slips 
             SET status = 'cancelled', remarks = ? 
             WHERE id = ?`,
            [reason || 'Cancelled by user', id]
        );

        connection.release();

        res.json({
            success: true,
            message: 'Payslip cancelled successfully'
        });

    } catch (error) {
        console.error('Error cancelling payslip:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel payslip',
            error: error.message
        });
    }
};

// Helper function
function getMonthName(monthNum) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthNum - 1] || '';
}
