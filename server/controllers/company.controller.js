import pool from '../config/db.js';

export const getAllCompanies = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM companies WHERE is_deleted = FALSE';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (name LIKE ? OR registration_number LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [companies] = await pool.query(query, params);

    res.json({
      success: true,
      data: companies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch companies',
      error: error.message,
    });
  }
};

export const getCompanyById = async (req, res) => {
  try {
    const [companies] = await pool.query(
      'SELECT * FROM companies WHERE id = ? AND is_deleted = FALSE',
      [req.params.id]
    );

    if (companies.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    res.json({
      success: true,
      data: companies[0],
    });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company',
      error: error.message,
    });
  }
};

export const createCompany = async (req, res) => {
  try {
    const {
      name, registration_number, tax_id, address, city, state, country,
      postal_code, phone, email, website, logo_url, established_date, status
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required',
      });
    }

    const [result] = await pool.query(
      `INSERT INTO companies 
        (name, registration_number, tax_id, address, city, state, country, 
         postal_code, phone, email, website, logo_url, established_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, registration_number, tax_id, address, city, state, country || 'India',
       postal_code, phone, email, website, logo_url, established_date, status || 'ACTIVE']
    );

    const [newCompany] = await pool.query(
      'SELECT * FROM companies WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: newCompany[0],
    });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create company',
      error: error.message,
    });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    const [existing] = await pool.query(
      'SELECT id FROM companies WHERE id = ? AND is_deleted = FALSE',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    const fields = Object.keys(updateFields)
      .filter(key => updateFields[key] !== undefined)
      .map(key => `${key} = ?`);
    
    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    const values = Object.values(updateFields).filter(val => val !== undefined);
    values.push(id);

    await pool.query(
      `UPDATE companies SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    const [updated] = await pool.query('SELECT * FROM companies WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Company updated successfully',
      data: updated[0],
    });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update company',
      error: error.message,
    });
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      'SELECT id FROM companies WHERE id = ? AND is_deleted = FALSE',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    await pool.query(
      'UPDATE companies SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Company deleted successfully',
    });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete company',
      error: error.message,
    });
  }
};

export const restoreCompany = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      'UPDATE companies SET is_deleted = FALSE, deleted_at = NULL WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Company restored successfully',
    });
  } catch (error) {
    console.error('Restore company error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore company',
      error: error.message,
    });
  }
};
