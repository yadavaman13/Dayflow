import pool from '../config/db.js';

/**
 * EMPLOYEE PROFILE EXTENSIONS CONTROLLER
 */

// ============================================
// ABOUT SECTION
// ============================================

export const getAbout = async (req, res) => {
  try {
    const { userId } = req.params;

    const [about] = await pool.query(
      'SELECT * FROM employee_about WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      data: about.length > 0 ? about[0] : null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch about', error: error.message });
  }
};

export const updateAbout = async (req, res) => {
  try {
    const { userId } = req.params;
    const { about, about_job, interests_hobbies } = req.body;

    // Check if exists
    const [existing] = await pool.query(
      'SELECT id FROM employee_about WHERE user_id = ?',
      [userId]
    );

    if (existing.length === 0) {
      // Insert
      await pool.query(
        'INSERT INTO employee_about (user_id, about, about_job, interests_hobbies) VALUES (?, ?, ?, ?)',
        [userId, about, about_job, interests_hobbies]
      );
    } else {
      // Update
      await pool.query(
        `UPDATE employee_about 
         SET about = COALESCE(?, about), 
             about_job = COALESCE(?, about_job), 
             interests_hobbies = COALESCE(?, interests_hobbies)
         WHERE user_id = ?`,
        [about, about_job, interests_hobbies, userId]
      );
    }

    const [updated] = await pool.query('SELECT * FROM employee_about WHERE user_id = ?', [userId]);

    res.json({
      success: true,
      message: 'About section updated successfully',
      data: updated[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update about', error: error.message });
  }
};

// ============================================
// SKILLS SECTION
// ============================================

export const getSkills = async (req, res) => {
  try {
    const { userId } = req.params;

    const [skills] = await pool.query(
      'SELECT * FROM employee_skills WHERE user_id = ? ORDER BY proficiency_level DESC, skill_name',
      [userId]
    );

    res.json({ success: true, data: skills });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch skills', error: error.message });
  }
};

export const addSkill = async (req, res) => {
  try {
    const { userId } = req.params;
    const { skill_name, proficiency_level, years_of_experience } = req.body;

    if (!skill_name) {
      return res.status(400).json({ success: false, message: 'Skill name is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO employee_skills (user_id, skill_name, proficiency_level, years_of_experience) VALUES (?, ?, ?, ?)',
      [userId, skill_name, proficiency_level, years_of_experience]
    );

    const [newSkill] = await pool.query('SELECT * FROM employee_skills WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Skill added successfully',
      data: newSkill[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add skill', error: error.message });
  }
};

export const updateSkill = async (req, res) => {
  try {
    const { userId, skillId } = req.params;
    const { skill_name, proficiency_level, years_of_experience } = req.body;

    await pool.query(
      `UPDATE employee_skills 
       SET skill_name = COALESCE(?, skill_name),
           proficiency_level = COALESCE(?, proficiency_level),
           years_of_experience = COALESCE(?, years_of_experience)
       WHERE id = ? AND user_id = ?`,
      [skill_name, proficiency_level, years_of_experience, skillId, userId]
    );

    const [updated] = await pool.query('SELECT * FROM employee_skills WHERE id = ?', [skillId]);

    res.json({
      success: true,
      message: 'Skill updated successfully',
      data: updated[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update skill', error: error.message });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const { userId, skillId } = req.params;

    await pool.query('DELETE FROM employee_skills WHERE id = ? AND user_id = ?', [skillId, userId]);

    res.json({ success: true, message: 'Skill deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete skill', error: error.message });
  }
};

// ============================================
// CERTIFICATIONS SECTION
// ============================================

export const getCertifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const [certs] = await pool.query(
      'SELECT * FROM employee_certifications WHERE user_id = ? ORDER BY issue_date DESC',
      [userId]
    );

    res.json({ success: true, data: certs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch certifications', error: error.message });
  }
};

export const addCertification = async (req, res) => {
  try {
    const { userId } = req.params;
    const { certification_name, issued_by, issue_date, expiry_date, credential_id, credential_url } = req.body;

    if (!certification_name) {
      return res.status(400).json({ success: false, message: 'Certification name is required' });
    }

    const [result] = await pool.query(
      `INSERT INTO employee_certifications 
        (user_id, certification_name, issued_by, issue_date, expiry_date, credential_id, credential_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, certification_name, issued_by, issue_date, expiry_date, credential_id, credential_url]
    );

    const [newCert] = await pool.query('SELECT * FROM employee_certifications WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Certification added successfully',
      data: newCert[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add certification', error: error.message });
  }
};

export const updateCertification = async (req, res) => {
  try {
    const { userId, certId } = req.params;
    const updateData = req.body;

    const fields = Object.keys(updateData).filter(key => updateData[key] !== undefined).map(key => `${key} = ?`);
    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const values = Object.values(updateData).filter(val => val !== undefined);
    values.push(certId, userId);

    await pool.query(
      `UPDATE employee_certifications SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );

    const [updated] = await pool.query('SELECT * FROM employee_certifications WHERE id = ?', [certId]);

    res.json({
      success: true,
      message: 'Certification updated successfully',
      data: updated[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update certification', error: error.message });
  }
};

export const deleteCertification = async (req, res) => {
  try {
    const { userId, certId } = req.params;

    await pool.query('DELETE FROM employee_certifications WHERE id = ? AND user_id = ?', [certId, userId]);

    res.json({ success: true, message: 'Certification deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete certification', error: error.message });
  }
};

// ============================================
// BASIC PROFILE SECTION
// ============================================

export const getBasicProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const [profile] = await pool.query(
      'SELECT * FROM employee_basic_profile WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      data: profile.length > 0 ? profile[0] : null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch basic profile', error: error.message });
  }
};

export const updateBasicProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    const [existing] = await pool.query('SELECT id FROM employee_basic_profile WHERE user_id = ?', [userId]);

    if (existing.length === 0) {
      // Insert
      const fields = Object.keys(updateData);
      const placeholders = fields.map(() => '?').join(', ');
      const values = Object.values(updateData);

      await pool.query(
        `INSERT INTO employee_basic_profile (user_id, ${fields.join(', ')}) VALUES (?, ${placeholders})`,
        [userId, ...values]
      );
    } else {
      // Update
      const fields = Object.keys(updateData).map(key => `${key} = ?`);
      const values = Object.values(updateData);

      await pool.query(
        `UPDATE employee_basic_profile SET ${fields.join(', ')} WHERE user_id = ?`,
        [...values, userId]
      );
    }

    const [updated] = await pool.query('SELECT * FROM employee_basic_profile WHERE user_id = ?', [userId]);

    res.json({
      success: true,
      message: 'Basic profile updated successfully',
      data: updated[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update basic profile', error: error.message });
  }
};

// ============================================
// PRIVATE INFO SECTION
// ============================================

export const getPrivateInfo = async (req, res) => {
  try {
    const { userId } = req.params;

    const [info] = await pool.query(
      'SELECT * FROM employee_private_info WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      data: info.length > 0 ? info[0] : null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch private info', error: error.message });
  }
};

export const updatePrivateInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    const [existing] = await pool.query('SELECT id FROM employee_private_info WHERE user_id = ?', [userId]);

    if (existing.length === 0) {
      const fields = Object.keys(updateData);
      const placeholders = fields.map(() => '?').join(', ');
      const values = Object.values(updateData);

      await pool.query(
        `INSERT INTO employee_private_info (user_id, ${fields.join(', ')}) VALUES (?, ${placeholders})`,
        [userId, ...values]
      );
    } else {
      const fields = Object.keys(updateData).map(key => `${key} = ?`);
      const values = Object.values(updateData);

      await pool.query(
        `UPDATE employee_private_info SET ${fields.join(', ')} WHERE user_id = ?`,
        [...values, userId]
      );
    }

    const [updated] = await pool.query('SELECT * FROM employee_private_info WHERE user_id = ?', [userId]);

    res.json({
      success: true,
      message: 'Private info updated successfully',
      data: updated[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update private info', error: error.message });
  }
};

// ============================================
// BANK DETAILS SECTION
// ============================================

export const getBankDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const [details] = await pool.query(
      'SELECT * FROM employee_bank_details WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      data: details.length > 0 ? details[0] : null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch bank details', error: error.message });
  }
};

export const updateBankDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    const [existing] = await pool.query('SELECT id FROM employee_bank_details WHERE user_id = ?', [userId]);

    if (existing.length === 0) {
      const fields = Object.keys(updateData);
      const placeholders = fields.map(() => '?').join(', ');
      const values = Object.values(updateData);

      await pool.query(
        `INSERT INTO employee_bank_details (user_id, ${fields.join(', ')}) VALUES (?, ${placeholders})`,
        [userId, ...values]
      );
    } else {
      const fields = Object.keys(updateData).map(key => `${key} = ?`);
      const values = Object.values(updateData);

      await pool.query(
        `UPDATE employee_bank_details SET ${fields.join(', ')} WHERE user_id = ?`,
        [...values, userId]
      );
    }

    const [updated] = await pool.query('SELECT * FROM employee_bank_details WHERE user_id = ?', [userId]);

    res.json({
      success: true,
      message: 'Bank details updated successfully',
      data: updated[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update bank details', error: error.message });
  }
};

// ============================================
// DOCUMENTS SECTION
// ============================================

export const getDocuments = async (req, res) => {
  try {
    const { userId } = req.params;

    const [docs] = await pool.query(
      `SELECT d.*, u.name as uploaded_by_name, v.name as verified_by_name
       FROM employee_documents d
       LEFT JOIN users u ON d.uploaded_by = u.id
       LEFT JOIN users v ON d.verified_by = v.id
       WHERE d.user_id = ?
       ORDER BY d.uploaded_at DESC`,
      [userId]
    );

    res.json({ success: true, data: docs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch documents', error: error.message });
  }
};

export const uploadDocument = async (req, res) => {
  try {
    const { userId } = req.params;
    const { doc_type, file_name, file_url, file_size, mime_type } = req.body;

    if (!doc_type || !file_url) {
      return res.status(400).json({ success: false, message: 'Document type and file URL are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO employee_documents 
        (user_id, doc_type, file_name, file_url, file_size, mime_type, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, doc_type, file_name, file_url, file_size, mime_type, req.user.id]
    );

    const [newDoc] = await pool.query('SELECT * FROM employee_documents WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: newDoc[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to upload document', error: error.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { userId, docId } = req.params;

    await pool.query('DELETE FROM employee_documents WHERE id = ? AND user_id = ?', [docId, userId]);

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete document', error: error.message });
  }
};

export const verifyDocument = async (req, res) => {
  try {
    const { userId, docId } = req.params;

    await pool.query(
      'UPDATE employee_documents SET is_verified = TRUE, verified_by = ?, verified_at = NOW() WHERE id = ? AND user_id = ?',
      [req.user.id, docId, userId]
    );

    res.json({ success: true, message: 'Document verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to verify document', error: error.message });
  }
};
