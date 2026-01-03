# 🔑 TEST ADMIN CREDENTIALS

## ✅ Two Admin Accounts Created/Updated

### Option 1: Your Original Account (Updated)
```
Email:     work.yadavaman@gmail.com
Password:  Admin@2026
Employee ID: OIAMYA20260001
```

### Option 2: New Test Admin Account
```
Email:     admin@dayflow.com
Password:  Admin@2026
Employee ID: OIAD20260001
```

## 🚀 How to Use

1. **Log out** from your current session (if logged in)
2. Go to: `http://localhost:5173`
3. Use either of the credentials above
4. You'll see the **HR/Admin Dashboard** with all employees

## ✨ What You'll See

After logging in as ADMIN:
- ✅ **Employees Tab** - Shows all users from database
- ✅ **Employee Cards** with name, email, employee ID
- ✅ **Search** functionality
- ✅ **Statistics** (total, active, inactive users)
- ✅ **Attendance Reports**
- ✅ **Leave Management**

## 🛠️ Scripts Created

If you need to create more users:

### Create New Admin:
```bash
cd server
node database/create_test_admin.js
```

### Update Existing User to Admin:
```bash
cd server
node database/update_user_to_admin.js
```

## 📝 Database Status

**Users in Database:**
1. **work.yadavaman@gmail.com** - ADMIN - ACTIVE ✅
2. **admin@dayflow.com** - ADMIN - ACTIVE ✅

Both accounts have:
- ✅ Role: ADMIN
- ✅ Status: ACTIVE  
- ✅ Password: Admin@2026
- ✅ Ready to use immediately

## 🔐 Security Note

**Remember to change these passwords in production!**

For production, use strong passwords and consider:
- Password rotation policy
- Two-factor authentication
- Account lockout after failed attempts
- Password complexity requirements
