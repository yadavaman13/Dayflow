/**
 * Run this script to update the database schema for payroll system
 * node run-schema-update.js
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dayflow_hrms',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
};

async function runSchemaUpdate() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        
        console.log('Adding columns to salary_slips table...');
        
        // Add month column
        try {
            await connection.query(`ALTER TABLE salary_slips ADD COLUMN month INT COMMENT 'Month (1-12)' AFTER salary_month`);
            console.log('✅ Added month column');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('⚠️  month column already exists');
            } else throw err;
        }
        
        // Add year column
        try {
            await connection.query(`ALTER TABLE salary_slips ADD COLUMN year INT COMMENT 'Year (YYYY)' AFTER month`);
            console.log('✅ Added year column');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('⚠️  year column already exists');
            } else throw err;
        }
        
        // Add period_start column
        try {
            await connection.query(`ALTER TABLE salary_slips ADD COLUMN period_start DATE COMMENT 'Period start date' AFTER year`);
            console.log('✅ Added period_start column');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('⚠️  period_start column already exists');
            } else throw err;
        }
        
        // Add period_end column
        try {
            await connection.query(`ALTER TABLE salary_slips ADD COLUMN period_end DATE COMMENT 'Period end date' AFTER period_start`);
            console.log('✅ Added period_end column');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('⚠️  period_end column already exists');
            } else throw err;
        }
        
        // Create indexes
        console.log('\nCreating indexes...');
        try {
            await connection.query(`CREATE INDEX idx_salary_slip_month_year ON salary_slips(month, year)`);
            console.log('✅ Created month_year index');
        } catch (err) {
            if (err.code === 'ER_DUP_KEYNAME') {
                console.log('⚠️  month_year index already exists');
            } else throw err;
        }
        
        try {
            await connection.query(`CREATE INDEX idx_salary_slip_period ON salary_slips(period_start, period_end)`);
            console.log('✅ Created period index');
        } catch (err) {
            if (err.code === 'ER_DUP_KEYNAME') {
                console.log('⚠️  period index already exists');
            } else throw err;
        }
        
        // Create salary_slip_components table
        console.log('\nCreating salary_slip_components table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS salary_slip_components (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                slip_id BIGINT NOT NULL,
                component_type_id BIGINT NOT NULL,
                amount DECIMAL(12,2) NOT NULL,
                is_deduction BOOLEAN DEFAULT FALSE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                
                FOREIGN KEY (slip_id) REFERENCES salary_slips(id) ON DELETE CASCADE,
                FOREIGN KEY (component_type_id) REFERENCES salary_component_types(id) ON DELETE RESTRICT,
                
                INDEX idx_slip_components_slip (slip_id),
                INDEX idx_slip_components_type (component_type_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ salary_slip_components table ready');
        
        // Update existing records
        console.log('\nUpdating existing salary_slips records...');
        const [result] = await connection.query(`
            UPDATE salary_slips 
            SET 
                month = MONTH(salary_month),
                year = YEAR(salary_month),
                period_start = salary_month,
                period_end = LAST_DAY(salary_month)
            WHERE (month IS NULL OR month = 0) AND salary_month IS NOT NULL
        `);
        console.log(`✅ Updated ${result.affectedRows} existing records`);
        
        console.log('\n✅ Schema updates completed successfully!');
        
        // Verify the changes
        const [columns] = await connection.query(
            `SHOW COLUMNS FROM salary_slips WHERE Field IN ('month', 'year', 'period_start', 'period_end')`
        );
        console.log('\nAdded columns:');
        columns.forEach(col => {
            console.log(`  - ${col.Field} (${col.Type})`);
        });
        
        const [tables] = await connection.query(
            `SHOW TABLES LIKE 'salary_slip_components'`
        );
        if (tables.length > 0) {
            console.log('\n✅ salary_slip_components table exists');
        }
        
    } catch (error) {
        console.error('\n❌ Error updating schema:', error.message);
        if (error.sqlMessage) {
            console.error('SQL Error:', error.sqlMessage);
        }
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

runSchemaUpdate();
