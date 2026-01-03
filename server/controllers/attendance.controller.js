import pool from '../config/db.js';

/**
 * ATTENDANCE CONTROLLER STUBS
 * Implement these functions according to your business logic
 */

export const markAttendance = async (req, res) => {
  try {
    const { mode_id, location, remarks } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // Check if already checked in today
    const [existing] = await pool.query(
      'SELECT id FROM attendance_records WHERE employee_id = (SELECT employee_table_id FROM users WHERE id = ?) AND attendance_date = ?',
      [req.user.id, today]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in for today',
      });
    }

    const [result] = await pool.query(
      `INSERT INTO attendance_records 
        (employee_id, user_id, attendance_date, check_in, check_in_location, mode_id, status, remarks)
      VALUES ((SELECT employee_table_id FROM users WHERE id = ?), ?, ?, NOW(), ?, ?, 'PRESENT', ?)`,
      [req.user.id, req.user.id, today, JSON.stringify(location), mode_id, remarks]
    );

    const [attendance] = await pool.query('SELECT * FROM attendance_records WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Checked in successfully',
      data: attendance[0],
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check in',
      error: error.message,
    });
  }
};

export const checkOut = async (req, res) => {
  try {
    const { location, remarks } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const [attendance] = await pool.query(
      `SELECT id FROM attendance_records 
       WHERE user_id = ? AND attendance_date = ? AND check_out IS NULL`,
      [req.user.id, today]
    );

    if (attendance.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active check-in found for today',
      });
    }

    await pool.query(
      `UPDATE attendance_records 
       SET check_out = NOW(), check_out_location = ?, remarks = CONCAT(COALESCE(remarks, ''), ' ', ?)
       WHERE id = ?`,
      [JSON.stringify(location), remarks || '', attendance[0].id]
    );

    // Calculate working hours
    await pool.query(
      `UPDATE attendance_records 
       SET working_hours = TIMESTAMPDIFF(MINUTE, check_in, check_out) / 60.0
       WHERE id = ?`,
      [attendance[0].id]
    );

    const [updated] = await pool.query('SELECT * FROM attendance_records WHERE id = ?', [attendance[0].id]);

    res.json({
      success: true,
      message: 'Checked out successfully',
      data: updated[0],
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check out',
      error: error.message,
    });
  }
};

export const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [attendance] = await pool.query(
      'SELECT * FROM attendance_records WHERE user_id = ? AND attendance_date = ?',
      [req.user.id, today]
    );

    res.json({
      success: true,
      data: attendance.length > 0 ? attendance[0] : null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch attendance', error: error.message });
  }
};

export const getMyAttendance = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 31 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM attendance_records WHERE user_id = ?';
    const params = [req.user.id];

    if (startDate) {
      query += ' AND attendance_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND attendance_date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY attendance_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [attendance] = await pool.query(query, params);

    res.json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch attendance', error: error.message });
  }
};

export const getAttendanceByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;

    let query = 'SELECT * FROM attendance_records WHERE employee_id = ?';
    const params = [employeeId];

    if (startDate && endDate) {
      query += ' AND attendance_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY attendance_date DESC';

    const [attendance] = await pool.query(query, params);

    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch attendance', error: error.message });
  }
};

export const getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, department, status } = req.query;

    let query = `
      SELECT a.*, e.full_name as employee_name, d.name as department_name
      FROM attendance_records a
      JOIN employees e ON a.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE a.is_deleted = FALSE
    `;
    const params = [];

    if (startDate && endDate) {
      query += ' AND a.attendance_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    if (department) {
      query += ' AND e.department_id = ?';
      params.push(department);
    }

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    query += ' ORDER BY a.attendance_date DESC, e.full_name';

    const [report] = await pool.query(query, params);

    res.json({ success: true, data: report, count: report.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate report', error: error.message });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const fields = Object.keys(updateData).filter(key => updateData[key] !== undefined).map(key => `${key} = ?`);
    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const values = Object.values(updateData).filter(val => val !== undefined);
    values.push(id);

    await pool.query(`UPDATE attendance_records SET ${fields.join(', ')} WHERE id = ?`, values);

    const [updated] = await pool.query('SELECT * FROM attendance_records WHERE id = ?', [id]);
    res.json({ success: true, message: 'Attendance updated successfully', data: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update attendance', error: error.message });
  }
};

export const getAttendanceSummary = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    const [summary] = await pool.query(
      `SELECT * FROM attendance_monthly_summary 
       WHERE user_id = ? AND year = ? AND month = ?`,
      [req.user.id, year || new Date().getFullYear(), month || (new Date().getMonth() + 1)]
    );

    res.json({
      success: true,
      data: summary.length > 0 ? summary[0] : null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch summary', error: error.message });
  }
};

export const approveAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      'UPDATE attendance_records SET approved_by = ?, approved_at = NOW() WHERE id = ?',
      [req.user.id, id]
    );

    res.json({ success: true, message: 'Attendance approved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to approve attendance', error: error.message });
  }
};

export const getMonthlyAttendance = async (req, res) => {
  try {
    const { year, month } = req.params;

    const [attendance] = await pool.query(
      `SELECT * FROM attendance_records 
       WHERE user_id = ? AND YEAR(attendance_date) = ? AND MONTH(attendance_date) = ?
       ORDER BY attendance_date ASC`,
      [req.user.id, year, month]
    );

    // Get summary
    const [summary] = await pool.query(
      `SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'ABSENT' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'LEAVE' THEN 1 ELSE 0 END) as leave_days,
        SUM(working_hours) as total_work_hours,
        SUM(overtime_hours) as total_overtime_hours
       FROM attendance_records 
       WHERE user_id = ? AND YEAR(attendance_date) = ? AND MONTH(attendance_date) = ?`,
      [req.user.id, year, month]
    );

    res.json({
      success: true,
      data: {
        year: parseInt(year),
        month: parseInt(month),
        summary: summary[0],
        records: attendance,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch monthly attendance', error: error.message });
  }
};
