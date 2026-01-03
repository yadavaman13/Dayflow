-- Check all users in the database
SELECT id, employee_id, name, full_name, email, role, status, is_deleted 
FROM users 
WHERE is_deleted = FALSE
ORDER BY id;

-- Check if admin user exists
SELECT id, employee_id, name, full_name, email, role, status 
FROM users 
WHERE email = 'work.yadavaman@gmail.com';
