import mysql from "mysql2/promise";

async function checkEmployees() {
  try {
    const conn = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "!te5H@MySQL",
      database: "dayflow_hrms",
    });

    console.log("Checking employees table...\n");

    const [employees] = await conn.query("SELECT * FROM employees LIMIT 10");
    console.log(`Found ${employees.length} employees\n`);

    if (employees.length > 0) {
      console.log("First employee:", JSON.stringify(employees[0], null, 2));
    }

    console.log("\n--- Checking users table ---\n");
    const [users] = await conn.query(
      "SELECT id, employee_id, name, email, role FROM users LIMIT 10"
    );
    console.log(`Found ${users.length} users\n`);

    if (users.length > 0) {
      console.log("Users:", JSON.stringify(users, null, 2));
    }

    await conn.end();
  } catch (e) {
    console.error("Error:", e.message);
  }
}

checkEmployees();
