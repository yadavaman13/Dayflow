import pool from '../config/db.js';

/**
 * SALARY MANAGEMENT CONTROLLER
 */

export const getMySalarySlips = async (req, res) => {
  try {
    const { year, month, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    // Get employee_id from user
    const [users] = await pool.query(
      'SELECT employee_table_id FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!users[0] || !users[0].employee_table_id) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    let query = 'SELECT * FROM salary_slips WHERE employee_id = ?';
    const params = [users[0].employee_table_id];

    if (year) {
      query += ' AND YEAR(salary_month) = ?';
      params.push(year);
    }

    if (month) {
      query += ' AND MONTH(salary_month) = ?';
      params.push(month);
    }

    query += ' ORDER BY salary_month DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [slips] = await pool.query(query, params);

    res.json({ success: true, data: slips });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch salary slips', error: error.message });
  }
};

export const getMyCurrentSalary = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT employee_table_id FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!users[0] || !users[0].employee_table_id) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    const [structure] = await pool.query(
      `SELECT ss.*, 
        (SELECT JSON_ARRAYAGG(JSON_OBJECT(
          'component_name', component_name,
          'component_type', component_type,
          'amount', computed_amount,
          'is_taxable', is_taxable
        )) FROM salary_components WHERE salary_structure_id = ss.id) as components
       FROM salary_structures ss
       WHERE ss.employee_id = ? AND ss.effective_to IS NULL AND ss.status = 'ACTIVE'`,
      [users[0].employee_table_id]
    );

    if (structure.length === 0) {
      return res.status(404).json({ success: false, message: 'No active salary structure found' });
    }

    res.json({ success: true, data: structure[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch salary structure', error: error.message });
  }
};

export const createSalaryStructure = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      employee_id,
      effective_from,
      basic_salary,
      designation,
      pay_frequency,
      components = [],
    } = req.body;

    if (!employee_id || !effective_from || !basic_salary) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID, effective date, and basic salary are required',
      });
    }

    // Close existing active structures
    await connection.query(
      `UPDATE salary_structures 
       SET effective_to = DATE_SUB(?, INTERVAL 1 DAY), status = 'SUPERSEDED'
       WHERE employee_id = ? AND effective_to IS NULL AND status = 'ACTIVE'`,
      [effective_from, employee_id]
    );

    // Create new structure
    const [result] = await connection.query(
      `INSERT INTO salary_structures 
        (employee_id, effective_from, basic_salary, designation, pay_frequency, status, created_by)
      VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?)`,
      [employee_id, effective_from, basic_salary, designation, pay_frequency || 'MONTHLY', req.user.id]
    );

    const structureId = result.insertId;

    // Add components
    for (const comp of components) {
      let computedAmount = comp.amount || 0;

      if (comp.calculation_type === 'PERCENTAGE' && comp.percentage) {
        computedAmount = (basic_salary * comp.percentage) / 100;
      }

      await connection.query(
        `INSERT INTO salary_components 
          (salary_structure_id, component_type, component_name, calculation_type, amount, percentage, computed_amount, is_taxable, is_statutory)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          structureId,
          comp.component_type,
          comp.component_name,
          comp.calculation_type,
          comp.amount || 0,
          comp.percentage || null,
          computedAmount,
          comp.is_taxable !== false,
          comp.is_statutory || false,
        ]
      );
    }

    await connection.commit();

    const [newStructure] = await connection.query(
      'SELECT * FROM salary_structures WHERE id = ?',
      [structureId]
    );

    res.status(201).json({
      success: true,
      message: 'Salary structure created successfully',
      data: newStructure[0],
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create salary structure error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create salary structure',
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

export const getSalaryStructureByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const [structures] = await pool.query(
      `SELECT ss.*,
        (SELECT JSON_ARRAYAGG(JSON_OBJECT(
          'id', id,
          'component_name', component_name,
          'component_type', component_type,
          'calculation_type', calculation_type,
          'amount', amount,
          'percentage', percentage,
          'computed_amount', computed_amount,
          'is_taxable', is_taxable
        )) FROM salary_components WHERE salary_structure_id = ss.id) as components
       FROM salary_structures ss
       WHERE ss.employee_id = ? AND ss.effective_to IS NULL
       ORDER BY ss.effective_from DESC`,
      [employeeId]
    );

    res.json({ success: true, data: structures });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch salary structure', error: error.message });
  }
};

export const updateSalaryStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const fields = Object.keys(updateData).filter(key => updateData[key] !== undefined).map(key => `${key} = ?`);
    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const values = Object.values(updateData).filter(val => val !== undefined);
    values.push(id);

    await pool.query(`UPDATE salary_structures SET ${fields.join(', ')} WHERE id = ?`, values);

    const [updated] = await pool.query('SELECT * FROM salary_structures WHERE id = ?', [id]);

    res.json({ success: true, message: 'Salary structure updated successfully', data: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update salary structure', error: error.message });
  }
};

export const generateSalarySlip = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      employee_id,
      salary_month,
      working_days,
      present_days,
      leave_days = 0,
      absent_days = 0,
    } = req.body;

    if (!employee_id || !salary_month || !working_days || present_days === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided',
      });
    }

    // Get active salary structure
    const [structures] = await connection.query(
      'SELECT * FROM salary_structures WHERE employee_id = ? AND effective_to IS NULL AND status = \'ACTIVE\'',
      [employee_id]
    );

    if (structures.length === 0) {
      return res.status(404).json({ success: false, message: 'No active salary structure found' });
    }

    const structure = structures[0];

    // Get components
    const [components] = await connection.query(
      'SELECT * FROM salary_components WHERE salary_structure_id = ?',
      [structure.id]
    );

    // Calculate totals
    let total_earnings = 0;
    let total_deductions = 0;

    const componentsSnapshot = components.map(comp => {
      const amount = comp.computed_amount || comp.amount;
      
      if (comp.component_type === 'EARNING') {
        total_earnings += parseFloat(amount);
      } else if (comp.component_type === 'DEDUCTION') {
        total_deductions += parseFloat(amount);
      }

      return {
        component_name: comp.component_name,
        component_type: comp.component_type,
        amount: amount,
        is_taxable: comp.is_taxable,
      };
    });

    const gross_salary = total_earnings;
    const net_salary = gross_salary - total_deductions;

    // Insert salary slip
    const [result] = await connection.query(
      `INSERT INTO salary_slips 
        (employee_id, salary_structure_id, salary_month, payment_date, 
         working_days, present_days, leave_days, absent_days,
         gross_salary, total_earnings, total_deductions, net_salary,
         components, status, generated_by)
      VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'GENERATED', ?)`,
      [
        employee_id,
        structure.id,
        salary_month,
        working_days,
        present_days,
        leave_days,
        absent_days,
        gross_salary,
        total_earnings,
        total_deductions,
        net_salary,
        JSON.stringify(componentsSnapshot),
        req.user.id,
      ]
    );

    await connection.commit();

    const [newSlip] = await connection.query('SELECT * FROM salary_slips WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Salary slip generated successfully',
      data: newSlip[0],
    });
  } catch (error) {
    await connection.rollback();
    console.error('Generate salary slip error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate salary slip',
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

export const getSalarySlip = async (req, res) => {
  try {
    const [slips] = await pool.query(
      `SELECT ss.*, e.full_name as employee_name
       FROM salary_slips ss
       JOIN employees e ON ss.employee_id = e.id
       WHERE ss.id = ?`,
      [req.params.id]
    );

    if (slips.length === 0) {
      return res.status(404).json({ success: false, message: 'Salary slip not found' });
    }

    res.json({ success: true, data: slips[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch salary slip', error: error.message });
  }
};

export const getSalarySlipsByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { year } = req.query;

    let query = 'SELECT * FROM salary_slips WHERE employee_id = ?';
    const params = [employeeId];

    if (year) {
      query += ' AND YEAR(salary_month) = ?';
      params.push(year);
    }

    query += ' ORDER BY salary_month DESC';

    const [slips] = await pool.query(query, params);

    res.json({ success: true, data: slips });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch salary slips', error: error.message });
  }
};

export const approveSalarySlip = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      'UPDATE salary_slips SET status = \'APPROVED\', approved_by = ?, approved_at = NOW() WHERE id = ?',
      [req.user.id, id]
    );

    res.json({ success: true, message: 'Salary slip approved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to approve salary slip', error: error.message });
  }
};

export const markSalaryPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_date, payment_mode, payment_reference } = req.body;

    await pool.query(
      `UPDATE salary_slips 
       SET status = 'PAID', payment_date = ?, payment_mode = ?, payment_reference = ?, paid_by = ?, paid_at = NOW()
       WHERE id = ?`,
      [payment_date, payment_mode, payment_reference, req.user.id, id]
    );

    res.json({ success: true, message: 'Salary marked as paid successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark salary as paid', error: error.message });
  }
};
