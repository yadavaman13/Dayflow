import db from './config/db.js';

const connection = await db.getConnection();

const [tables] = await connection.query("SHOW TABLES LIKE '%attendance%'");
console.log('Attendance tables:', tables);

const [allTables] = await connection.query("SHOW TABLES");
console.log('\nAll tables:');
allTables.forEach(t => console.log('  -', Object.values(t)[0]));

connection.release();
process.exit();
