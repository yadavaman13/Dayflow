import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkSchema() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'dayflow_hrms',
            port: process.env.DB_PORT || 3306
        });

        console.log('Checking salary_slips columns...\n');
        const [columns] = await connection.query('SHOW COLUMNS FROM salary_slips');
        console.log('SALARY_SLIPS COLUMNS:');
        columns.forEach(col => {
            console.log(`  ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `KEY: ${col.Key}` : ''}`);
        });

        console.log('\n\nChecking salary_structures columns...\n');
        const [structColumns] = await connection.query('SHOW COLUMNS FROM salary_structures');
        console.log('SALARY_STRUCTURES COLUMNS:');
        structColumns.forEach(col => {
            console.log(`  ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `KEY: ${col.Key}` : ''}`);
        });

        console.log('\n\nChecking employees columns...\n');
        const [empColumns] = await connection.query('SHOW COLUMNS FROM employees');
        console.log('EMPLOYEES COLUMNS:');
        empColumns.forEach(col => {
            console.log(`  ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `KEY: ${col.Key}` : ''}`);
        });

        await connection.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkSchema();
