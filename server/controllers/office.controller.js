import pool from '../config/db.js';

export const getAllOffices = async (req, res) => {
  try {
    const { page = 1, limit = 10, companyId, status } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT o.*, c.name as company_name 
      FROM offices o
      LEFT JOIN companies c ON o.company_id = c.id
      WHERE o.is_deleted = FALSE
    `;
    const params = [];

    if (companyId) {
      query += ' AND o.company_id = ?';
      params.push(companyId);
    }

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    const countQuery = query.replace('SELECT o.*, c.name as company_name', 'SELECT COUNT(*) as total');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [offices] = await pool.query(query, params);

    res.json({
      success: true,
      data: offices,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch offices', error: error.message });
  }
};

export const getOfficeById = async (req, res) => {
  try {
    const [offices] = await pool.query(
      `SELECT o.*, c.name as company_name 
       FROM offices o
       LEFT JOIN companies c ON o.company_id = c.id
       WHERE o.id = ? AND o.is_deleted = FALSE`,
      [req.params.id]
    );

    if (offices.length === 0) {
      return res.status(404).json({ success: false, message: 'Office not found' });
    }

    res.json({ success: true, data: offices[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch office', error: error.message });
  }
};

export const getOfficesByCompany = async (req, res) => {
  try {
    const [offices] = await pool.query(
      'SELECT * FROM offices WHERE company_id = ? AND is_deleted = FALSE ORDER BY name',
      [req.params.companyId]
    );

    res.json({ success: true, data: offices, count: offices.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch offices', error: error.message });
  }
};

export const createOffice = async (req, res) => {
  try {
    const { company_id, name, code, office_type, address, city, state, country, postal_code, phone, email, latitude, longitude, geofence_radius, wifi_ssid, timezone, status } = req.body;

    if (!company_id || !name || !address) {
      return res.status(400).json({ success: false, message: 'Company ID, name, and address are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO offices (company_id, name, code, office_type, address, city, state, country, postal_code, phone, email, latitude, longitude, geofence_radius, wifi_ssid, timezone, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [company_id, name, code, office_type || 'BRANCH', address, city, state, country || 'India', postal_code, phone, email, latitude, longitude, geofence_radius, wifi_ssid, timezone || 'Asia/Kolkata', status || 'ACTIVE']
    );

    const [newOffice] = await pool.query('SELECT * FROM offices WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Office created successfully', data: newOffice[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create office', error: error.message });
  }
};

export const updateOffice = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    const [existing] = await pool.query('SELECT id FROM offices WHERE id = ? AND is_deleted = FALSE', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Office not found' });
    }

    const fields = Object.keys(updateFields).filter(key => updateFields[key] !== undefined).map(key => `${key} = ?`);
    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const values = Object.values(updateFields).filter(val => val !== undefined);
    values.push(id);

    await pool.query(`UPDATE offices SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
    const [updated] = await pool.query('SELECT * FROM offices WHERE id = ?', [id]);

    res.json({ success: true, message: 'Office updated successfully', data: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update office', error: error.message });
  }
};

export const deleteOffice = async (req, res) => {
  try {
    await pool.query('UPDATE offices SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Office deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete office', error: error.message });
  }
};

export const restoreOffice = async (req, res) => {
  try {
    await pool.query('UPDATE offices SET is_deleted = FALSE, deleted_at = NULL WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Office restored successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to restore office', error: error.message });
  }
};
