import pool from '../config/db.js';

// ============================================
// EMPLOYEE CRUD OPERATIONS
// ============================================

export const getAllEmployees = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      department,
      status,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = req.query;

    const offset = (page - 1) * limit;
    let query = `
      SELECT 
        e.*, 
        c.name as company_name,
        o.name as office_name,
        d.name as department_name,
        CONCAT(m.first_name, ' ', m.last_name) as manager_name
      FROM employees e
      LEFT JOIN companies c ON e.company_id = c.id
      LEFT JOIN offices o ON e.office_id = o.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN employees m ON e.reporting_manager_id = m.id
      WHERE e.is_deleted = FALSE
    `;
    const params = [];

    if (search) {
      query += ' AND (e.full_name LIKE ? OR e.employee_code LIKE ? OR e.work_email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (department) {
      query += ' AND e.department_id = ?';
      params.push(department);
    }

    if (status) {
      query += ' AND e.employee_status = ?';
      params.push(status);
    }

    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    query += ` ORDER BY e.${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [employees] = await pool.query(query, params);

    res.json({
      success: true,
      data: employees,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees',
      error: error.message,
    });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const [employees] = await pool.query(
      `SELECT 
        e.*, 
        c.name as company_name,
        o.name as office_name,
        d.name as department_name,
        CONCAT(m.first_name, ' ', m.last_name) as manager_name
      FROM employees e
      LEFT JOIN companies c ON e.company_id = c.id
      LEFT JOIN offices o ON e.office_id = o.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN employees m ON e.reporting_manager_id = m.id
      WHERE e.id = ? AND e.is_deleted = FALSE`,
      [id]
    );

    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    res.json({
      success: true,
      data: employees[0],
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee',
      error: error.message,
    });
  }
};

export const createEmployee = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      employee_code,
      company_id,
      office_id,
      department_id,
      first_name,
      middle_name,
      last_name,
      date_of_birth,
      gender,
      marital_status,
      blood_group,
      nationality,
      personal_email,
      work_email,
      phone_primary,
      phone_secondary,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relation,
      current_address,
      current_city,
      current_state,
      current_country,
      current_postal_code,
      permanent_address,
      permanent_city,
      permanent_state,
      permanent_country,
      permanent_postal_code,
      same_as_current,
      designation,
      employment_type,
      employee_status,
      date_of_joining,
      date_of_confirmation,
      probation_period_months,
      notice_period_days,
      reporting_manager_id,
      work_location,
      shift_timing,
      pan_number,
      aadhaar_number,
      passport_number,
      passport_expiry,
      driving_license,
      bank_name,
      bank_account_number,
      bank_ifsc_code,
      bank_branch,
      profile_photo_url,
      resume_url,
    } = req.body;

    // Validation
    if (!employee_code || !company_id || !first_name || !last_name || !date_of_joining) {
      return res.status(400).json({
        success: false,
        message: 'Employee code, company, name, and joining date are required',
      });
    }

    // Check if employee code already exists
    const [existing] = await connection.query(
      'SELECT id FROM employees WHERE employee_code = ? AND is_deleted = FALSE',
      [employee_code]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Employee code already exists',
      });
    }

    // Insert employee
    const [result] = await connection.query(
      `INSERT INTO employees 
        (employee_code, company_id, office_id, department_id, first_name, middle_name, last_name,
         date_of_birth, gender, marital_status, blood_group, nationality,
         personal_email, work_email, phone_primary, phone_secondary,
         emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
         current_address, current_city, current_state, current_country, current_postal_code,
         permanent_address, permanent_city, permanent_state, permanent_country, permanent_postal_code,
         same_as_current, designation, employment_type, employee_status, date_of_joining,
         date_of_confirmation, probation_period_months, notice_period_days,
         reporting_manager_id, work_location, shift_timing,
         pan_number, aadhaar_number, passport_number, passport_expiry, driving_license,
         bank_name, bank_account_number, bank_ifsc_code, bank_branch,
         profile_photo_url, resume_url, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employee_code, company_id, office_id, department_id, first_name, middle_name, last_name,
        date_of_birth, gender, marital_status, blood_group, nationality || 'Indian',
        personal_email, work_email, phone_primary, phone_secondary,
        emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
        current_address, current_city, current_state, current_country || 'India', current_postal_code,
        permanent_address, permanent_city, permanent_state, permanent_country || 'India', permanent_postal_code,
        same_as_current || false, designation, employment_type || 'FULL_TIME', employee_status || 'ACTIVE',
        date_of_joining, date_of_confirmation, probation_period_months || 6, notice_period_days || 30,
        reporting_manager_id, work_location || 'OFFICE', shift_timing,
        pan_number, aadhaar_number, passport_number, passport_expiry, driving_license,
        bank_name, bank_account_number, bank_ifsc_code, bank_branch,
        profile_photo_url, resume_url, req.user.id
      ]
    );

    await connection.commit();

    const [newEmployee] = await connection.query(
      'SELECT * FROM employees WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: newEmployee[0],
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create employee',
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const [existing] = await pool.query(
      'SELECT id FROM employees WHERE id = ? AND is_deleted = FALSE',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const fields = Object.keys(updateData)
      .filter(key => updateData[key] !== undefined)
      .map(key => `${key} = ?`);

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    const values = Object.values(updateData).filter(val => val !== undefined);
    values.push(id);

    await pool.query(
      `UPDATE employees SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    const [updated] = await pool.query('SELECT * FROM employees WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: updated[0],
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update employee',
      error: error.message,
    });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `UPDATE employees 
       SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP, deleted_by = ?, employee_status = 'INACTIVE'
       WHERE id = ?`,
      [req.user.id, id]
    );

    res.json({
      success: true,
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete employee',
      error: error.message,
    });
  }
};

export const restoreEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `UPDATE employees 
       SET is_deleted = FALSE, deleted_at = NULL, deleted_by = NULL, employee_status = 'ACTIVE'
       WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Employee restored successfully',
    });
  } catch (error) {
    console.error('Restore employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore employee',
      error: error.message,
    });
  }
};

export const getEmployeeStats = async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_employees,
        SUM(CASE WHEN employee_status = 'ACTIVE' THEN 1 ELSE 0 END) as active_employees,
        SUM(CASE WHEN employee_status = 'INACTIVE' THEN 1 ELSE 0 END) as inactive_employees,
        SUM(CASE WHEN employee_status = 'ON_LEAVE' THEN 1 ELSE 0 END) as on_leave,
        SUM(CASE WHEN employment_type = 'FULL_TIME' THEN 1 ELSE 0 END) as full_time,
        SUM(CASE WHEN employment_type = 'PART_TIME' THEN 1 ELSE 0 END) as part_time,
        SUM(CASE WHEN employment_type = 'CONTRACT' THEN 1 ELSE 0 END) as contract,
        SUM(CASE WHEN gender = 'MALE' THEN 1 ELSE 0 END) as male_count,
        SUM(CASE WHEN gender = 'FEMALE' THEN 1 ELSE 0 END) as female_count
      FROM employees
      WHERE is_deleted = FALSE
    `);

    res.json({
      success: true,
      data: stats[0],
    });
  } catch (error) {
    console.error('Get employee stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee statistics',
      error: error.message,
    });
  }
};

export const getEmployeesByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const [employees] = await pool.query(
      `SELECT id, employee_code, full_name, designation, work_email, phone_primary, employee_status
       FROM employees
       WHERE department_id = ? AND is_deleted = FALSE
       ORDER BY full_name`,
      [departmentId]
    );

    res.json({
      success: true,
      data: employees,
      count: employees.length,
    });
  } catch (error) {
    console.error('Get employees by department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees',
      error: error.message,
    });
  }
};

export const getEmployeesByManager = async (req, res) => {
  try {
    const { managerId } = req.params;

    const [employees] = await pool.query(
      `SELECT id, employee_code, full_name, designation, work_email, phone_primary, employee_status
       FROM employees
       WHERE reporting_manager_id = ? AND is_deleted = FALSE
       ORDER BY full_name`,
      [managerId]
    );

    res.json({
      success: true,
      data: employees,
      count: employees.length,
    });
  } catch (error) {
    console.error('Get employees by manager error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees',
      error: error.message,
    });
  }
};
