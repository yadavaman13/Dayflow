import pool from '../config/db.js';

export const getAllDepartments = async (req, res) => {
  try {
    const { page = 1, limit = 10, companyId, officeId, status } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT d.*, c.name as company_name, o.name as office_name,
             CONCAT(e.first_name, ' ', e.last_name) as head_name
      FROM departments d
      LEFT JOIN companies c ON d.company_id = c.id
      LEFT JOIN offices o ON d.office_id = o.id
      LEFT JOIN employees e ON d.head_employee_id = e.id
      WHERE d.is_deleted = FALSE
    `;
    const params = [];

    if (companyId) {
      query += ' AND d.company_id = ?';
      params.push(companyId);
    }

    if (officeId) {
      query += ' AND d.office_id = ?';
      params.push(officeId);
    }

    if (status) {
      query += ' AND d.status = ?';
      params.push(status);
    }

    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [departments] = await pool.query(query, params);

    res.json({
      success: true,
      data: departments,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch departments', error: error.message });
  }
};

export const getDepartmentById = async (req, res) => {
  try {
    const [departments] = await pool.query(
      `SELECT d.*, c.name as company_name, o.name as office_name,
              CONCAT(e.first_name, ' ', e.last_name) as head_name
       FROM departments d
       LEFT JOIN companies c ON d.company_id = c.id
       LEFT JOIN offices o ON d.office_id = o.id
       LEFT JOIN employees e ON d.head_employee_id = e.id
       WHERE d.id = ? AND d.is_deleted = FALSE`,
      [req.params.id]
    );

    if (departments.length === 0) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    res.json({ success: true, data: departments[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch department', error: error.message });
  }
};

export const getDepartmentsByCompany = async (req, res) => {
  try {
    const [departments] = await pool.query(
      'SELECT * FROM departments WHERE company_id = ? AND is_deleted = FALSE ORDER BY name',
      [req.params.companyId]
    );

    res.json({ success: true, data: departments, count: departments.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch departments', error: error.message });
  }
};

export const getDepartmentsByOffice = async (req, res) => {
  try {
    const [departments] = await pool.query(
      'SELECT * FROM departments WHERE office_id = ? AND is_deleted = FALSE ORDER BY name',
      [req.params.officeId]
    );

    res.json({ success: true, data: departments, count: departments.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch departments', error: error.message });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { company_id, office_id, name, code, description, head_employee_id, parent_department_id, status } = req.body;

    if (!company_id || !name) {
      return res.status(400).json({ success: false, message: 'Company ID and name are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO departments (company_id, office_id, name, code, description, head_employee_id, parent_department_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [company_id, office_id, name, code, description, head_employee_id, parent_department_id, status || 'ACTIVE']
    );

    const [newDepartment] = await pool.query('SELECT * FROM departments WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Department created successfully', data: newDepartment[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create department', error: error.message });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    const [existing] = await pool.query('SELECT id FROM departments WHERE id = ? AND is_deleted = FALSE', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const fields = Object.keys(updateFields).filter(key => updateFields[key] !== undefined).map(key => `${key} = ?`);
    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const values = Object.values(updateFields).filter(val => val !== undefined);
    values.push(id);

    await pool.query(`UPDATE departments SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
    const [updated] = await pool.query('SELECT * FROM departments WHERE id = ?', [id]);

    res.json({ success: true, message: 'Department updated successfully', data: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update department', error: error.message });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    await pool.query('UPDATE departments SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete department', error: error.message });
  }
};

export const restoreDepartment = async (req, res) => {
  try {
    await pool.query('UPDATE departments SET is_deleted = FALSE, deleted_at = NULL WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Department restored successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to restore department', error: error.message });
  }
};
