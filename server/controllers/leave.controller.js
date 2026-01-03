import pool from '../config/db.js';

/**
 * LEAVE MANAGEMENT CONTROLLER
 */

export const applyLeave = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { leave_type_id, start_date, end_date, total_days, reason, supporting_document_url } = req.body;

    // Validation
    if (!leave_type_id || !start_date || !end_date || !total_days) {
      return res.status(400).json({
        success: false,
        message: 'Leave type, dates, and total days are required',
      });
    }

    // Get employee_id from user
    const [users] = await connection.query(
      'SELECT employee_table_id FROM users WHERE id = ?',
      [req.user.id]
    );

    const employee_table_id = users[0]?.employee_table_id;

    // Get leave type info
    const [leaveTypeInfo] = await connection.query(
      'SELECT max_days_per_year FROM leave_types WHERE id = ?',
      [leave_type_id]
    );

    // Check if balance exists, if not create it
    const [existingBalance] = await connection.query(
      `SELECT id, remaining_days FROM leave_balances 
       WHERE user_id = ? AND leave_type_id = ? AND year = YEAR(CURDATE())`,
      [req.user.id, leave_type_id]
    );

    let balance;
    if (existingBalance.length === 0) {
      // Create balance record
      const maxDays = leaveTypeInfo[0]?.max_days_per_year || 12;
      await connection.query(
        `INSERT INTO leave_balances (user_id, leave_type_id, year, opening_balance, allocated_days, used_days, pending_days)
         VALUES (?, ?, YEAR(CURDATE()), 0, ?, 0, 0)`,
        [req.user.id, leave_type_id, maxDays]
      );
      
      // Re-fetch the balance
      const [newBalance] = await connection.query(
        `SELECT remaining_days FROM leave_balances 
         WHERE user_id = ? AND leave_type_id = ? AND year = YEAR(CURDATE())`,
        [req.user.id, leave_type_id]
      );
      balance = newBalance;
    } else {
      balance = existingBalance;
    }

    if (balance[0].remaining_days < total_days) {
      return res.status(400).json({
        success: false,
        message: `Insufficient leave balance. Available: ${balance[0].remaining_days} days, Requested: ${total_days} days`,
      });
    }

    // Insert leave request - employee_id can be the employee_table_id or we need to create one
    // For now, if there's no employee_table_id, we'll create a basic employee record or use user_id approach
    let employee_id = employee_table_id;
    
    if (!employee_id) {
      // Get user details to create a basic employee
      const [userDetails] = await connection.query(
        'SELECT name, full_name, email, employee_id as emp_code FROM users WHERE id = ?',
        [req.user.id]
      );
      
      const userData = userDetails[0];
      
      // Check if employee with this code already exists
      const [existingEmp] = await connection.query(
        'SELECT id FROM employees WHERE employee_code = ?',
        [userData.emp_code || `EMP${req.user.id}`]
      );
      
      if (existingEmp.length > 0) {
        employee_id = existingEmp[0].id;
      } else {
        // Create a basic employee record
        const [empResult] = await connection.query(
          `INSERT INTO employees (employee_code, company_id, first_name, last_name, work_email, date_of_joining, employee_status)
           VALUES (?, 1, ?, '', ?, CURDATE(), 'ACTIVE')`,
          [userData.emp_code || `EMP${req.user.id}`, userData.name || userData.full_name || 'User', userData.email]
        );
        employee_id = empResult.insertId;
        
        // Link employee to user
        await connection.query(
          'UPDATE users SET employee_table_id = ? WHERE id = ?',
          [employee_id, req.user.id]
        );
      }
    }

    const [result] = await connection.query(
      `INSERT INTO leave_requests 
        (employee_id, user_id, leave_type_id, start_date, end_date, total_days, reason, supporting_document_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [employee_id, req.user.id, leave_type_id, start_date, end_date, total_days, reason, supporting_document_url]
    );

    // Update pending days in balance
    await connection.query(
      `UPDATE leave_balances 
       SET pending_days = pending_days + ?
       WHERE user_id = ? AND leave_type_id = ? AND year = YEAR(CURDATE())`,
      [total_days, req.user.id, leave_type_id]
    );

    await connection.commit();

    const [newLeave] = await connection.query(
      `SELECT lr.*, lt.name as leave_type 
       FROM leave_requests lr
       JOIN leave_types lt ON lr.leave_type_id = lt.id
       WHERE lr.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: newLeave[0],
    });
  } catch (error) {
    await connection.rollback();
    console.error('Apply leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply leave',
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

export const getMyLeaves = async (req, res) => {
  try {
    const { status, startDate, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT lr.*, lt.name as leave_type, u.name as employee_name, u.full_name
      FROM leave_requests lr
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      LEFT JOIN users u ON lr.user_id = u.id
      WHERE lr.user_id = ? AND lr.is_deleted = FALSE
    `;
    const params = [req.user.id];

    if (status) {
      query += ' AND lr.status = ?';
      params.push(status);
    }

    if (startDate) {
      query += ' AND lr.start_date >= ?';
      params.push(startDate);
    }

    query += ' ORDER BY lr.applied_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [leaves] = await pool.query(query, params);

    res.json({ success: true, data: leaves });
  } catch (error) {
    console.error('Get my leaves error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leaves', error: error.message });
  }
};

export const getLeaveById = async (req, res) => {
  try {
    const [leaves] = await pool.query(
      `SELECT lr.*, lt.name as leave_type, e.full_name as employee_name
       FROM leave_requests lr
       JOIN leave_types lt ON lr.leave_type_id = lt.id
       JOIN employees e ON lr.employee_id = e.id
       WHERE lr.id = ? AND lr.is_deleted = FALSE`,
      [req.params.id]
    );

    if (leaves.length === 0) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    res.json({ success: true, data: leaves[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch leave', error: error.message });
  }
};

export const getAllLeaves = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, employee, startDate } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT lr.*, lt.name as leave_type, 
             COALESCE(u.name, u.full_name, 'Unknown') as employee_name,
             d.name as department_name
      FROM leave_requests lr
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      LEFT JOIN users u ON lr.user_id = u.id
      LEFT JOIN employees e ON lr.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE lr.is_deleted = FALSE
    `;
    const params = [];

    if (status) {
      query += ' AND lr.status = ?';
      params.push(status);
    }

    if (employee) {
      query += ' AND lr.employee_id = ?';
      params.push(employee);
    }

    if (startDate) {
      query += ' AND lr.start_date >= ?';
      params.push(startDate);
    }

    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0]?.total || 0;

    query += ' ORDER BY lr.applied_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [leaves] = await pool.query(query, params);

    res.json({
      success: true,
      data: leaves,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get all leaves error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leaves', error: error.message });
  }
};

export const getPendingLeaves = async (req, res) => {
  try {
    const [leaves] = await pool.query(
      `SELECT lr.*, lt.name as leave_type, e.full_name as employee_name, d.name as department_name
       FROM leave_requests lr
       JOIN leave_types lt ON lr.leave_type_id = lt.id
       JOIN employees e ON lr.employee_id = e.id
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE lr.status = 'PENDING' AND lr.is_deleted = FALSE
       ORDER BY lr.applied_at ASC`
    );

    res.json({ success: true, data: leaves, count: leaves.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch pending leaves', error: error.message });
  }
};

export const approveLeave = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { comments } = req.body;

    // Get leave details
    const [leaves] = await connection.query(
      'SELECT user_id, leave_type_id, total_days FROM leave_requests WHERE id = ?',
      [id]
    );

    if (leaves.length === 0) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    const leave = leaves[0];

    // Update leave request
    await connection.query(
      'UPDATE leave_requests SET status = \'APPROVED\' WHERE id = ?',
      [id]
    );

    // Update leave approval record
    await connection.query(
      `INSERT INTO leave_approvals (leave_request_id, approver_id, status, comments, approved_at)
       VALUES (?, ?, 'APPROVED', ?, NOW())`,
      [id, req.user.id, comments]
    );

    // Update leave balance
    await connection.query(
      `UPDATE leave_balances 
       SET used_days = used_days + ?, pending_days = pending_days - ?
       WHERE user_id = ? AND leave_type_id = ? AND year = YEAR(CURDATE())`,
      [leave.total_days, leave.total_days, leave.user_id, leave.leave_type_id]
    );

    await connection.commit();

    res.json({ success: true, message: 'Leave approved successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Approve leave error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve leave', error: error.message });
  } finally {
    connection.release();
  }
};

export const rejectLeave = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { comments } = req.body;

    const [leaves] = await connection.query(
      'SELECT user_id, leave_type_id, total_days FROM leave_requests WHERE id = ?',
      [id]
    );

    if (leaves.length === 0) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    const leave = leaves[0];

    await connection.query('UPDATE leave_requests SET status = \'REJECTED\' WHERE id = ?', [id]);

    await connection.query(
      `INSERT INTO leave_approvals (leave_request_id, approver_id, status, comments, rejected_at)
       VALUES (?, ?, 'REJECTED', ?, NOW())`,
      [id, req.user.id, comments]
    );

    // Restore pending days
    await connection.query(
      `UPDATE leave_balances SET pending_days = pending_days - ?
       WHERE user_id = ? AND leave_type_id = ? AND year = YEAR(CURDATE())`,
      [leave.total_days, leave.user_id, leave.leave_type_id]
    );

    await connection.commit();

    res.json({ success: true, message: 'Leave rejected successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: 'Failed to reject leave', error: error.message });
  } finally {
    connection.release();
  }
};

export const cancelLeave = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { cancellation_reason } = req.body;

    const [leaves] = await connection.query(
      'SELECT user_id, leave_type_id, total_days, status FROM leave_requests WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (leaves.length === 0) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    const leave = leaves[0];

    if (leave.status !== 'PENDING' && leave.status !== 'APPROVED') {
      return res.status(400).json({ success: false, message: 'Cannot cancel this leave request' });
    }

    await connection.query(
      'UPDATE leave_requests SET status = \'CANCELLED\', cancellation_reason = ?, cancelled_at = NOW() WHERE id = ?',
      [cancellation_reason, id]
    );

    // Restore balance
    if (leave.status === 'APPROVED') {
      await connection.query(
        `UPDATE leave_balances SET used_days = used_days - ?
         WHERE user_id = ? AND leave_type_id = ? AND year = YEAR(CURDATE())`,
        [leave.total_days, leave.user_id, leave.leave_type_id]
      );
    } else {
      await connection.query(
        `UPDATE leave_balances SET pending_days = pending_days - ?
         WHERE user_id = ? AND leave_type_id = ? AND year = YEAR(CURDATE())`,
        [leave.total_days, leave.user_id, leave.leave_type_id]
      );
    }

    await connection.commit();

    res.json({ success: true, message: 'Leave cancelled successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: 'Failed to cancel leave', error: error.message });
  } finally {
    connection.release();
  }
};

export const getLeaveBalance = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    // First check if balance exists
    const [balance] = await pool.query(
      `SELECT lb.*, lt.name as leave_type, lt.code
       FROM leave_balances lb
       JOIN leave_types lt ON lb.leave_type_id = lt.id
       WHERE lb.user_id = ? AND lb.year = ?`,
      [req.user.id, year]
    );

    // If no balance exists, initialize it with default leave types
    if (balance.length === 0) {
      const [leaveTypes] = await pool.query(
        `SELECT id, max_days_per_year FROM leave_types WHERE status = 'ACTIVE' AND is_deleted = FALSE`
      );

      // Initialize balances for each leave type
      for (const lt of leaveTypes) {
        await pool.query(
          `INSERT INTO leave_balances (user_id, leave_type_id, year, opening_balance, allocated_days, used_days, pending_days)
           VALUES (?, ?, ?, 0, ?, 0, 0)
           ON DUPLICATE KEY UPDATE allocated_days = ?`,
          [req.user.id, lt.id, year, lt.max_days_per_year || 12, lt.max_days_per_year || 12]
        );
      }

      // Re-fetch the balance
      const [newBalance] = await pool.query(
        `SELECT lb.*, lt.name as leave_type, lt.code
         FROM leave_balances lb
         JOIN leave_types lt ON lb.leave_type_id = lt.id
         WHERE lb.user_id = ? AND lb.year = ?`,
        [req.user.id, year]
      );

      return res.json({ success: true, data: newBalance });
    }

    res.json({ success: true, data: balance });
  } catch (error) {
    console.error('Get leave balance error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leave balance', error: error.message });
  }
};

export const getLeaveTypes = async (req, res) => {
  try {
    const [types] = await pool.query(
      `SELECT * FROM leave_types WHERE status = 'ACTIVE' AND is_deleted = FALSE ORDER BY display_order, name`
    );

    res.json({ success: true, data: types });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch leave types', error: error.message });
  }
};

export const createLeaveType = async (req, res) => {
  try {
    const { company_id = 1, name, code, description, is_paid, max_days_per_year, requires_approval, applicable_gender, status } = req.body;

    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Name and code are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO leave_types 
        (company_id, name, code, description, is_paid, max_days_per_year, requires_approval, applicable_gender, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [company_id, name, code, description, is_paid !== false, max_days_per_year, requires_approval !== false, applicable_gender || 'ALL', status || 'ACTIVE']
    );

    const [newType] = await pool.query('SELECT * FROM leave_types WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, message: 'Leave type created successfully', data: newType[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create leave type', error: error.message });
  }
};

export const updateLeaveType = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const fields = Object.keys(updateData).filter(key => updateData[key] !== undefined).map(key => `${key} = ?`);
    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const values = Object.values(updateData).filter(val => val !== undefined);
    values.push(id);

    await pool.query(`UPDATE leave_types SET ${fields.join(', ')} WHERE id = ?`, values);

    const [updated] = await pool.query('SELECT * FROM leave_types WHERE id = ?', [id]);

    res.json({ success: true, message: 'Leave type updated successfully', data: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update leave type', error: error.message });
  }
};

export const deleteLeaveType = async (req, res) => {
  try {
    await pool.query('UPDATE leave_types SET is_deleted = TRUE, deleted_at = NOW() WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Leave type deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete leave type', error: error.message });
  }
};
