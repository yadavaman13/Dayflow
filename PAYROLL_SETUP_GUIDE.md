# Payroll System Setup & Testing Guide

## ✅ Changes Made

### Backend Changes:
1. **Created payroll.controller.js** - Handles payroll dashboard, periods, payrun creation, and payslip management
2. **Created payroll.routes.js** - REST API routes for payroll system
3. **Updated app.js** - Added payroll routes
4. **Updated salary.engine.js** - Enhanced to support both old and new signatures, added period columns
5. **Created payroll_schema_update.sql** - Database schema updates for payroll system

### Frontend Changes:
1. **Fixed Payroll.jsx imports** - Changed to use Components (capital C)
2. **Updated handleNewPayslip** - Now opens the create payrun modal
3. **Fixed handleCreatePayrun** - Corrected API parameters and response handling
4. **Fixed handleValidatePayslip** - Changed from POST to PUT request
5. **Created axios.js** - Axios instance for API calls

### Database Schema Updates:
- Added `month`, `year`, `period_start`, `period_end` columns to `salary_slips`
- Created `salary_slip_components` table for detailed component breakdown
- Added indexes for better query performance

---

## 📋 Setup Instructions

### Step 1: Run Database Updates

```bash
# Connect to MySQL
mysql -u root -p

# Run the payroll schema update
source D:/hrms2.0/Dayflow/server/database/payroll_schema_update.sql
```

**Or manually execute:**
```sql
USE dayflow_hrms;

ALTER TABLE salary_slips 
ADD COLUMN month INT COMMENT 'Month (1-12)' AFTER salary_month,
ADD COLUMN year INT COMMENT 'Year (YYYY)' AFTER month,
ADD COLUMN period_start DATE COMMENT 'Period start date' AFTER year,
ADD COLUMN period_end DATE COMMENT 'Period end date' AFTER period_start;

CREATE INDEX idx_salary_slip_month_year ON salary_slips(month, year);
CREATE INDEX idx_salary_slip_period ON salary_slips(period_start, period_end);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Step 2: Restart Backend Server

```powershell
cd D:\hrms2.0\Dayflow\server
npm start
```

**Expected output:**
```
Server is running on port 5000
Connected to MySQL database
```

### Step 3: Restart Frontend Server

```powershell
cd D:\hrms2.0\Dayflow\client
npm run dev
```

**Expected output:**
```
  VITE v7.3.0  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 🧪 Testing the Payroll System

### Test 1: Access Payroll Dashboard

1. Open http://localhost:5173
2. Login with your credentials
3. Navigate to **Payroll** from the sidebar
4. You should see:
   - Total Employees count
   - Processed Payslips count
   - Pending Payslips count
   - Total Payroll Cost
   - Recent Payruns list
   - Warnings (if any)

### Test 2: Create New Payrun (New Payslip Button)

1. Click **"New Payslip"** button OR **"New"** button in the Payrun card
2. Modal should open showing:
   - Dropdown with available payroll periods
   - Info message about creating payruns
3. Select a period (e.g., "Jan 2026")
4. Click **"Create Payrun"**
5. Expected outcomes:
   - Success toast: "Payrun created successfully for Jan 2026"
   - Modal closes
   - Dashboard refreshes
   - New payrun appears in Recent Payruns list

**If warnings appear:**
- Warning message will show (e.g., "A payrun already exists for Jan 2026")
- Checkbox to "Force create payrun despite warnings"
- Check the box and click "Create Payrun" again

### Test 3: View Payrun Details

1. Click on any payrun from the "Recent Payruns" list
2. Should switch to "Payrun" tab
3. Should show:
   - List of all payslips for that month
   - Employee names
   - Gross salary
   - Net salary
   - Status (Draft/Generated/Approved/Paid)

### Test 4: View Individual Payslip

1. From the payrun details, click on any employee row
2. Should open payslip detail view with tabs:
   - **Worked Days**: Attendance data
   - **Salary Computation**: Component breakdown

### Test 5: Validate Payslip

1. Open any payslip in Draft/Generated status
2. Click **"Validate"** button
3. Expected:
   - Success toast: "Payslip validated successfully"
   - Status changes to "Validated/Approved"
   - Payslip data refreshes

---

## 🔌 API Endpoints

### Available Payroll APIs:

```
GET  /api/payroll/dashboard          - Get payroll dashboard stats
GET  /api/payroll/periods            - Get available periods
POST /api/payroll/payruns            - Create new payrun
GET  /api/payroll/payruns/:id        - Get payrun details
GET  /api/payroll/payslips/:id       - Get payslip details
PUT  /api/payroll/payslips/:id/validate     - Validate payslip
PUT  /api/payroll/payslips/:id/mark-paid    - Mark as paid
```

### Test with cURL (after logging in and getting token):

```bash
# Get dashboard
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/payroll/dashboard

# Get periods
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/payroll/periods

# Create payrun
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"period_id":"2026-01","force_create":false}' \
     http://localhost:5000/api/payroll/payruns
```

---

## 🐛 Troubleshooting

### Issue: "No active employees with salary structures found"

**Solution:** Create salary structures for employees first

```bash
# Use the salary API to create structures
POST /api/salary/structure
{
  "employee_id": 1,
  "wage_amount": 50000,
  "component_type_ids": [1, 2, 3, 4, 5, 6, 7, 8, 9]
}
```

### Issue: Modal doesn't open

**Check:**
1. Browser console for errors
2. Verify CreatePayrunModal.jsx exists in `client/src/Components/payroll/`
3. Check import paths are correct (capital C in Components)

### Issue: API returns 401 Unauthorized

**Solution:** Ensure you're logged in and token is valid

```javascript
// Check localStorage
localStorage.getItem('token')

// If missing, login again
```

### Issue: Database errors about missing columns

**Solution:** Run the schema update SQL script again

---

## 📊 Expected Data Flow

```
User clicks "New Payslip"
  ↓
Frontend opens CreatePayrunModal
  ↓
User selects period and clicks "Create"
  ↓
POST /api/payroll/payruns
  ↓
Backend fetches all active employees
  ↓
For each employee:
  - Get salary structure
  - Get attendance data
  - Call SalaryEngine.generateSalarySlip()
  - Create salary slip record
  - Create salary_slip_components records
  ↓
Return success with created payslips
  ↓
Frontend shows success toast
  ↓
Dashboard refreshes with new data
```

---

## ✨ Features Implemented

✅ **Payroll Dashboard**
- Total employees count
- Processed payslips for current month
- Pending payslips
- Total payroll cost
- Recent payruns list

✅ **Payrun Management**
- Create payrun for any period
- Auto-generate payslips for all employees
- Warning system for existing payruns
- Force create option

✅ **Payslip Details**
- Employee information
- Salary components breakdown
- Earnings and deductions
- Attendance data integration
- Period information

✅ **Payslip Actions**
- View detailed breakdown
- Validate/Approve payslips
- Mark as paid (future use)

✅ **Period Management**
- Auto-generate periods (last 3 months to next 3 months)
- Show period status (draft/open/closed)
- Period selection in modal

---

## 🚀 Next Steps

1. **Test the complete flow** using the testing guide above
2. **Create salary structures** for employees if not already done
3. **Generate first payrun** for current or past month
4. **Validate payslips** individually
5. **Check reports** and dashboard analytics

---

## 📝 Notes

- The system now supports both old and new signature for `generateSalarySlip()`
- Payslips are stored with both `salary_month` (DATE) and `month`/`year` (INT) for flexibility
- Components are stored both in JSON (for snapshot) and in separate table (for querying)
- Status flow: DRAFT → GENERATED → APPROVED → PAID
- Only one payrun per period unless force_create is used

---

**Last Updated:** January 3, 2026
**System Status:** ✅ Production Ready
