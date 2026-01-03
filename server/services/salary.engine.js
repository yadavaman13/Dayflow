/**
 * ============================================
 * DAYFLOW HRMS - PRODUCTION SALARY ENGINE
 * ============================================
 * 
 * Core Principles:
 * 1. Single Source of Truth: Wage
 * 2. Deterministic Calculations
 * 3. Auto-recalculation on wage change
 * 4. Versioned structures
 * 5. Immutable payslips
 * 6. Audit-safe
 */

import db from '../config/db.js';

class SalaryEngine {
    /**
     * Calculate all salary components based on wage
     * @param {number} wage - Base wage amount
     * @param {Array} componentRules - Component configuration rules
     * @returns {Object} - Calculated components and validation results
     */
    static async calculateComponents(wage, componentRules) {
        if (!wage || wage <= 0) {
            throw new Error('Wage must be greater than zero');
        }

        let remainingWage = parseFloat(wage);
        const calculatedComponents = [];
        const calculationOrder = this._determineCalculationOrder(componentRules);
        
        // Store intermediate values for dependency resolution
        const componentValues = {
            WAGE: wage,
            BASIC: 0
        };

        // Step 1: Calculate non-residual components in dependency order
        for (const rule of calculationOrder.nonResidual) {
            let amount = 0;

            const computationMode = rule.computation_mode || rule.default_mode;
            const valuePercent = rule.value_percent || rule.default_value;
            const valueFixed = rule.value_fixed || rule.default_value;

            // Map PERCENT to PERCENTAGE for database constraint
            const calculationType = computationMode === 'PERCENT' ? 'PERCENTAGE' : computationMode;

            switch (computationMode) {
                case 'FIXED':
                    amount = parseFloat(valueFixed || 0);
                    break;

                case 'PERCENT':
                    const baseValue = this._resolveBaseValue(rule.base_component, componentValues);
                    amount = (baseValue * parseFloat(valuePercent || 0)) / 100;
                    break;

                case 'FORMULA':
                    // Reserved for future complex calculations
                    amount = this._evaluateFormula(rule.formula, componentValues);
                    break;

                default:
                    throw new Error(`Unknown computation mode: ${computationMode}`);
            }

            // Round to 2 decimal places
            amount = Math.round(amount * 100) / 100;

            // Validate: component cannot exceed remaining wage
            if (amount > remainingWage) {
                throw new Error(
                    `Component "${rule.component_name}" (${amount}) exceeds remaining wage (${remainingWage})`
                );
            }

            remainingWage -= amount;

            // Store calculated component
            calculatedComponents.push({
                component_type_id: rule.id,
                component_type: rule.component_category,
                component_name: rule.name,
                component_code: rule.component_code,
                calculation_type: calculationType,
                computation_mode: computationMode,
                amount: amount,
                value_fixed: computationMode === 'FIXED' ? valueFixed : null,
                percentage: computationMode === 'PERCENT' ? valuePercent : null,
                value_percent: computationMode === 'PERCENT' ? valuePercent : null,
                computed_amount: amount,
                is_taxable: rule.is_taxable,
                is_statutory: rule.is_statutory,
                display_order: rule.display_order
            });

            // Store for dependency resolution
            if (rule.component_code === 'BASIC') {
                componentValues.BASIC = amount;
            }
            componentValues[rule.component_code] = amount;
        }

        // Step 2: Calculate residual component (if exists)
        if (calculationOrder.residual) {
            const residualAmount = Math.round(remainingWage * 100) / 100;

            if (residualAmount < 0) {
                throw new Error('Total components exceed wage. Cannot calculate residual component.');
            }

            calculatedComponents.push({
                component_type_id: calculationOrder.residual.id,
                component_type: calculationOrder.residual.component_category,
                component_name: calculationOrder.residual.name,
                component_code: calculationOrder.residual.component_code,
                calculation_type: 'FIXED',
                computation_mode: 'FIXED',
                amount: residualAmount,
                value_fixed: residualAmount,
                computed_amount: residualAmount,
                is_taxable: calculationOrder.residual.is_taxable,
                is_statutory: calculationOrder.residual.is_statutory,
                display_order: calculationOrder.residual.display_order
            });

            remainingWage = 0;
        }

        // Step 3: Validation
        const totalEarnings = calculatedComponents
            .filter(c => c.component_type === 'EARNING')
            .reduce((sum, c) => sum + c.computed_amount, 0);

        if (Math.abs(totalEarnings - wage) > 0.01) {
            throw new Error(
                `Component sum (${totalEarnings}) does not match wage (${wage}). ` +
                `Remaining: ${remainingWage}`
            );
        }

        return {
            success: true,
            wage: wage,
            components: calculatedComponents,
            totalEarnings: Math.round(totalEarnings * 100) / 100,
            totalDeductions: 0,
            grossSalary: Math.round(totalEarnings * 100) / 100,
            remainingWage: Math.round(remainingWage * 100) / 100
        };
    }

    /**
     * Determine calculation order based on dependencies
     * @private
     */
    static _determineCalculationOrder(componentRules) {
        const nonResidual = [];
        let residual = null;
        const processed = new Set();

        // Separate residual component
        for (const rule of componentRules) {
            if (rule.is_residual || rule.computation_mode === 'RESIDUAL') {
                if (residual) {
                    throw new Error('Multiple residual components detected. Only one allowed.');
                }
                residual = rule;
            } else {
                nonResidual.push(rule);
            }
        }

        // Sort non-residual by dependency order
        // 1. Components based on WAGE
        // 2. Components based on BASIC
        // 3. Components based on OTHER components
        const sorted = [];
        const pending = [...nonResidual];

        // First pass: WAGE-based and FIXED components
        for (const rule of pending) {
            if (rule.computation_mode === 'FIXED' || rule.base_component === 'WAGE') {
                sorted.push(rule);
                processed.add(rule.component_code);
            }
        }

        // Second pass: BASIC-dependent components
        for (const rule of pending) {
            if (rule.base_component === 'BASIC' && !processed.has(rule.component_code)) {
                sorted.push(rule);
                processed.add(rule.component_code);
            }
        }

        // Third pass: Other dependencies
        for (const rule of pending) {
            if (!processed.has(rule.component_code)) {
                sorted.push(rule);
                processed.add(rule.component_code);
            }
        }

        // Sort by display_order within each group
        sorted.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

        return {
            nonResidual: sorted,
            residual: residual
        };
    }

    /**
     * Resolve base value for percentage calculations
     * @private
     */
    static _resolveBaseValue(baseComponent, componentValues) {
        if (!baseComponent) {
            throw new Error('Base component not specified for percentage calculation');
        }

        const value = componentValues[baseComponent];
        if (value === undefined || value === null) {
            throw new Error(`Base component "${baseComponent}" not found or not yet calculated`);
        }

        return parseFloat(value);
    }

    /**
     * Evaluate formula (placeholder for future complex calculations)
     * @private
     */
    static _evaluateFormula(formula, componentValues) {
        // TODO: Implement safe formula evaluation
        // For now, return 0
        console.warn('Formula evaluation not yet implemented');
        return 0;
    }

    /**
     * Create or update salary structure with components
     */
    static async createSalaryStructure(employeeId, userId, structureData, componentTypeIds) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Step 1: Mark existing active structures as SUPERSEDED
            await connection.query(
                `UPDATE salary_structures 
                SET effective_to = DATE_SUB(?, INTERVAL 1 DAY),
                    status = 'SUPERSEDED'
                WHERE employee_id = ?
                AND effective_to IS NULL
                AND status = 'ACTIVE'`,
                [structureData.effective_from, employeeId]
            );

            // Step 2: Fetch component type rules
            const [componentTypes] = await connection.query(
                `SELECT * FROM salary_component_types
                WHERE id IN (?)
                AND is_active = TRUE
                ORDER BY display_order ASC`,
                [componentTypeIds]
            );

            if (componentTypes.length === 0) {
                throw new Error('No valid component types found');
            }

            // Step 3: Calculate components
            const calculation = await this.calculateComponents(
                structureData.wage_amount || structureData.basic_salary,
                componentTypes
            );

            // Step 4: Create salary structure
            const [structureResult] = await connection.query(
                `INSERT INTO salary_structures (
                    employee_id, user_id, effective_from, designation, pay_grade,
                    basic_salary, wage_amount, wage_type, currency, pay_frequency,
                    working_days_per_week, break_time_hours, status,
                    approved_by, approved_at, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
                [
                    employeeId,
                    userId,
                    structureData.effective_from,
                    structureData.designation,
                    structureData.pay_grade,
                    calculation.wage,
                    calculation.wage,
                    structureData.wage_type || 'FIXED',
                    structureData.currency || 'INR',
                    structureData.pay_frequency || 'MONTHLY',
                    structureData.working_days_per_week || 5,
                    structureData.break_time_hours || 1,
                    'ACTIVE',
                    structureData.approved_by,
                    structureData.created_by
                ]
            );

            const salaryStructureId = structureResult.insertId;

            // Step 5: Insert calculated components
            for (const component of calculation.components) {
                await connection.query(
                    `INSERT INTO salary_components (
                        salary_structure_id, component_type_id, component_type,
                        component_name, component_code, calculation_type, computation_mode,
                        amount, value_fixed, percentage, value_percent,
                        computed_amount, is_taxable, is_statutory, display_order
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        salaryStructureId,
                        component.component_type_id,
                        component.component_type,
                        component.component_name,
                        component.component_code,
                        component.calculation_type,
                        component.computation_mode,
                        component.amount,
                        component.value_fixed,
                        component.percentage,
                        component.value_percent,
                        component.computed_amount,
                        component.is_taxable,
                        component.is_statutory,
                        component.display_order
                    ]
                );
            }

            // Step 6: Calculate and insert statutory contributions (PF, ESI)
            const basicComponent = calculation.components.find(c => c.component_code === 'BASIC');
            if (basicComponent) {
                // Employee PF (12% of Basic)
                await connection.query(
                    `INSERT INTO salary_contributions (
                        salary_structure_id, name, contribution_type,
                        rate_percent, base_component, amount, is_statutory
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        salaryStructureId,
                        'Employee PF',
                        'EMPLOYEE',
                        12.0,
                        'BASIC',
                        Math.round(basicComponent.computed_amount * 0.12 * 100) / 100,
                        true
                    ]
                );

                // Employer PF (12% of Basic)
                await connection.query(
                    `INSERT INTO salary_contributions (
                        salary_structure_id, name, contribution_type,
                        rate_percent, base_component, amount, is_statutory
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        salaryStructureId,
                        'Employer PF',
                        'EMPLOYER',
                        12.0,
                        'BASIC',
                        Math.round(basicComponent.computed_amount * 0.12 * 100) / 100,
                        true
                    ]
                );
            }

            await connection.commit();

            return {
                success: true,
                salaryStructureId: salaryStructureId,
                calculation: calculation
            };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Generate monthly salary slip with attendance impact
     */
    static async generateSalarySlip(employeeId, salaryMonth, attendanceData) {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // Step 1: Check if slip already exists
            const [existing] = await connection.query(
                `SELECT id, status FROM salary_slips
                WHERE employee_id = ? AND salary_month = ?`,
                [employeeId, salaryMonth]
            );

            if (existing.length > 0 && existing[0].status !== 'DRAFT') {
                throw new Error('Salary slip already generated and locked for this month');
            }

            // Step 2: Fetch active salary structure
            const [structures] = await connection.query(
                `SELECT * FROM salary_structures
                WHERE employee_id = ?
                AND effective_from <= ?
                AND (effective_to IS NULL OR effective_to >= ?)
                AND status = 'ACTIVE'
                ORDER BY effective_from DESC
                LIMIT 1`,
                [employeeId, salaryMonth, salaryMonth]
            );

            if (structures.length === 0) {
                throw new Error('No active salary structure found for employee');
            }

            const structure = structures[0];

            // Step 3: Fetch salary components
            const [components] = await connection.query(
                `SELECT * FROM salary_components
                WHERE salary_structure_id = ?
                ORDER BY display_order ASC`,
                [structure.id]
            );

            // Step 4: Fetch contributions and deductions
            const [contributions] = await connection.query(
                `SELECT * FROM salary_contributions
                WHERE salary_structure_id = ?`,
                [structure.id]
            );

            const [deductions] = await connection.query(
                `SELECT * FROM salary_deductions
                WHERE salary_structure_id = ?`,
                [structure.id]
            );

            // Step 5: Calculate LOP (Loss of Pay) based on attendance
            const workingDays = attendanceData.total_working_days;
            const presentDays = attendanceData.present_days || 0;
            const leaveDays = attendanceData.leave_days || 0;
            const absentDays = workingDays - presentDays - leaveDays;
            const payableDays = presentDays + leaveDays;

            const perDayWage = structure.wage_amount / workingDays;
            const lopAmount = absentDays * perDayWage;

            // Step 6: Calculate totals
            const totalEarnings = components
                .filter(c => c.component_type === 'EARNING')
                .reduce((sum, c) => sum + parseFloat(c.computed_amount), 0);

            const totalDeductions = [
                ...contributions.filter(c => c.contribution_type === 'EMPLOYEE'),
                ...deductions
            ].reduce((sum, d) => sum + parseFloat(d.amount), 0);

            const grossSalary = totalEarnings;
            const netSalary = grossSalary - totalDeductions - lopAmount;

            // Step 7: Prepare components JSON snapshot
            const componentsSnapshot = {
                earnings: components.filter(c => c.component_type === 'EARNING'),
                deductions: [
                    ...contributions.filter(c => c.contribution_type === 'EMPLOYEE'),
                    ...deductions
                ],
                contributions: contributions,
                lopAmount: lopAmount,
                lopDays: absentDays
            };

            // Step 8: Insert/Update salary slip
            let slipId;
            if (existing.length > 0) {
                // Update draft
                await connection.query(
                    `UPDATE salary_slips SET
                        working_days = ?, present_days = ?, leave_days = ?, absent_days = ?,
                        gross_salary = ?, total_earnings = ?, total_deductions = ?,
                        net_salary = ?, components = ?, status = 'GENERATED',
                        generated_at = NOW()
                    WHERE id = ?`,
                    [
                        workingDays, presentDays, leaveDays, absentDays,
                        grossSalary, totalEarnings, totalDeductions, netSalary,
                        JSON.stringify(componentsSnapshot),
                        existing[0].id
                    ]
                );
                slipId = existing[0].id;
            } else {
                // Create new
                const [result] = await connection.query(
                    `INSERT INTO salary_slips (
                        employee_id, salary_structure_id, salary_month,
                        working_days, present_days, leave_days, absent_days,
                        gross_salary, total_earnings, total_deductions, net_salary,
                        tax_deducted, provident_fund, professional_tax,
                        components, status, generated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'GENERATED', NOW())`,
                    [
                        employeeId, structure.id, salaryMonth,
                        workingDays, presentDays, leaveDays, absentDays,
                        grossSalary, totalEarnings, totalDeductions, netSalary,
                        0, // tax_deducted (calculate separately)
                        contributions.find(c => c.contribution_type === 'EMPLOYEE' && c.name.includes('PF'))?.amount || 0,
                        deductions.find(d => d.name.includes('Professional Tax'))?.amount || 0,
                        JSON.stringify(componentsSnapshot)
                    ]
                );
                slipId = result.insertId;
            }

            await connection.commit();

            return {
                success: true,
                slipId: slipId,
                netSalary: netSalary,
                grossSalary: grossSalary,
                deductions: totalDeductions,
                lopAmount: lopAmount
            };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Recalculate salary structure when wage changes
     */
    static async recalculateSalaryStructure(structureId, newWage, updatedBy) {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // Fetch existing structure
            const [structures] = await connection.query(
                `SELECT * FROM salary_structures WHERE id = ?`,
                [structureId]
            );

            if (structures.length === 0) {
                throw new Error('Salary structure not found');
            }

            const oldStructure = structures[0];

            // Fetch component type IDs
            const [components] = await connection.query(
                `SELECT component_type_id FROM salary_components
                WHERE salary_structure_id = ?`,
                [structureId]
            );

            const componentTypeIds = components.map(c => c.component_type_id);

            // Create new structure with updated wage
            const result = await this.createSalaryStructure(
                oldStructure.employee_id,
                oldStructure.user_id,
                {
                    ...oldStructure,
                    wage_amount: newWage,
                    basic_salary: newWage,
                    effective_from: new Date().toISOString().split('T')[0],
                    created_by: updatedBy
                },
                componentTypeIds
            );

            await connection.commit();

            return result;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Validate salary structure integrity
     */
    static async validateSalaryStructure(structureId) {
        const [structure] = await db.query(
            `SELECT * FROM salary_structures WHERE id = ?`,
            [structureId]
        );

        if (structure.length === 0) {
            return { valid: false, errors: ['Structure not found'] };
        }

        const [components] = await db.query(
            `SELECT * FROM salary_components WHERE salary_structure_id = ?`,
            [structureId]
        );

        const errors = [];
        const wage = parseFloat(structure[0].wage_amount);
        const totalEarnings = components
            .filter(c => c.component_type === 'EARNING')
            .reduce((sum, c) => sum + parseFloat(c.computed_amount), 0);

        if (Math.abs(totalEarnings - wage) > 0.01) {
            errors.push(`Component sum (${totalEarnings}) does not match wage (${wage})`);
        }

        const residualCount = components.filter(c => 
            c.calculation_type === 'RESIDUAL' || c.component_name.toLowerCase().includes('residual')
        ).length;

        if (residualCount > 1) {
            errors.push('Multiple residual components found');
        }

        return {
            valid: errors.length === 0,
            errors: errors,
            wage: wage,
            totalEarnings: totalEarnings,
            componentCount: components.length
        };
    }
}

export default SalaryEngine;
