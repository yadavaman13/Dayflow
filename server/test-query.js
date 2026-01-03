import mysql from "mysql2/promise";

async function testQuery() {
  try {
    const conn = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "!te5H@MySQL",
      database: "dayflow_hrms",
    });

    console.log("Testing attendance query with joins...\n");

    const [rows] = await conn.query(`
      SELECT a.*, 
             e.full_name as employee_name, 
             e.employee_code, 
             e.designation,
             e.work_email,
             d.name as department_name
      FROM attendance_records a
      JOIN employees e ON a.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE a.is_deleted = FALSE 
        AND a.attendance_date BETWEEN '2024-12-01' AND '2024-12-31'
      ORDER BY a.attendance_date DESC
    `);

    console.log(`Found ${rows.length} records\n`);

    if (rows.length > 0) {
      console.log("Sample record:");
      console.log(JSON.stringify(rows[0], null, 2));
    }

    await conn.end();
  } catch (e) {
    console.error("Error:", e.message);
  }
}

testQuery();
