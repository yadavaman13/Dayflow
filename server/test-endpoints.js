import dotenv from 'dotenv';

dotenv.config();

async function testEndpoints() {
    try {
        console.log('\n=== Testing Payroll Database ===\n');

        // Check if any salary_slips exist
        console.log('1. Checking database for salary_slips...');
        const db = await import('./config/db.js');
        const connection = await db.default.getConnection();
        
        const [slips] = await connection.query(
            'SELECT COUNT(*) as count FROM salary_slips'
        );
        console.log(`✅ Total salary_slips in database: ${slips[0].count}`);

        const [employees] = await connection.query(
            'SELECT COUNT(*) as count FROM employees WHERE is_deleted = 0'
        );
        console.log(`✅ Total active employees: ${employees[0].count}`);

        const [structures] = await connection.query(
            'SELECT COUNT(*) as count FROM salary_structures WHERE status = "ACTIVE"'
        );
        console.log(`✅ Total active salary structures: ${structures[0].count}`);

        connection.release();

        console.log('\n=== Tests Complete ===\n');

    } catch (error) {
        console.error('Error running tests:', error.message);
    }
    process.exit(0);
}

testEndpoints();
