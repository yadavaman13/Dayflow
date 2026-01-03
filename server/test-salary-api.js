/**
 * ============================================
 * SALARY ENGINE API TEST SUITE
 * ============================================
 * Tests all 11 salary engine REST API endpoints
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

import db from './config/db.js';

const API_BASE = 'http://localhost:5000/api';
let authToken = null;
let testEmployeeId = null;
let testStructureId = null;
let testSlipId = null;

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testNumber, testName) {
    log(`\n${'='.repeat(60)}`, 'cyan');
    log(`TEST ${testNumber}: ${testName}`, 'cyan');
    log('='.repeat(60), 'cyan');
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

async function makeRequest(method, endpoint, body = null, token = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    
    return { status: response.status, data };
}

async function setupTestData() {
    log('\n🔧 Setting up test data...', 'yellow');
    
    try {
        // Create test employee
        await db.query(`INSERT IGNORE INTO employees 
            (id, employee_code, company_id, first_name, last_name, date_of_birth, gender, 
             designation, employment_type, employee_status, date_of_joining, created_by) 
            VALUES (999, 'TEST999', 1, 'API', 'Test', '1990-01-01', 'MALE', 
                    'Test Engineer', 'FULL_TIME', 'ACTIVE', '2024-01-01', 1)`);
        
        testEmployeeId = 999;
        logSuccess('Test employee created (ID: 999)');

        // Create test user for authentication
        const hashedPassword = '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGH'; // Mock hash
        await db.query(`INSERT IGNORE INTO users 
            (id, employee_table_id, username, email, password_hash, user_role, status) 
            VALUES (999, 999, 'testapi', 'testapi@dayflow.com', ?, 'EMPLOYEE', 'ACTIVE')`,
            [hashedPassword]);
        
        logSuccess('Test user created');

        return true;
    } catch (error) {
        logError(`Setup failed: ${error.message}`);
        return false;
    }
}

async function cleanupTestData() {
    log('\n🧹 Cleaning up test data...', 'yellow');
    
    try {
        await db.query('DELETE FROM salary_slips WHERE employee_id = 999');
        await db.query('DELETE FROM salary_structures WHERE employee_id = 999');
        await db.query('DELETE FROM users WHERE id = 999');
        await db.query('DELETE FROM employees WHERE id = 999');
        logSuccess('Cleanup completed');
    } catch (error) {
        logError(`Cleanup failed: ${error.message}`);
    }
}

async function runTests() {
    log('\n' + '='.repeat(70), 'cyan');
    log('🚀 SALARY ENGINE API TEST SUITE', 'cyan');
    log('='.repeat(70), 'cyan');
    log(`📅 Date: ${new Date().toLocaleString()}`, 'blue');
    log(`🌐 API Base: ${API_BASE}`, 'blue');

    const setupSuccess = await setupTestData();
    if (!setupSuccess) {
        logError('Setup failed. Aborting tests.');
        process.exit(1);
    }

    let passedTests = 0;
    let failedTests = 0;
    const testResults = [];

    try {
        // ============================================
        // TEST 1: Get Component Types
        // ============================================
        logTest(1, 'GET /api/salary/component-types');
        try {
            const { status, data } = await makeRequest('GET', '/salary/component-types');
            
            if (status === 200 && data.success && Array.isArray(data.data)) {
                logSuccess(`Status: ${status}`);
                logSuccess(`Component Types: ${data.data.length}`);
                data.data.forEach(ct => {
                    logInfo(`  - ${ct.name} (${ct.component_code}): ${ct.default_mode} ${ct.default_value || 'RESIDUAL'}`);
                });
                passedTests++;
                testResults.push({ test: 1, name: 'Get Component Types', status: 'PASS' });
            } else {
                throw new Error('Invalid response structure');
            }
        } catch (error) {
            logError(`Failed: ${error.message}`);
            failedTests++;
            testResults.push({ test: 1, name: 'Get Component Types', status: 'FAIL', error: error.message });
        }

        // ============================================
        // TEST 2: Calculate Salary Components (Preview)
        // ============================================
        logTest(2, 'POST /api/salary/calculate (Preview)');
        try {
            const { status, data } = await makeRequest('POST', '/salary/calculate', {
                wage: 50000,
                componentTypeIds: [1, 2, 3, 4, 5, 6, 7, 8, 9]
            });
            
            if (status === 200 && data.success) {
                logSuccess(`Status: ${status}`);
                logSuccess(`Wage: ₹${data.data.calculation.wage}`);
                logSuccess(`Total Earnings: ₹${data.data.calculation.totalEarnings}`);
                logSuccess(`Components: ${data.data.calculation.components.length}`);
                data.data.calculation.components.forEach(c => {
                    logInfo(`  - ${c.component_name}: ₹${c.computed_amount}`);
                });
                passedTests++;
                testResults.push({ test: 2, name: 'Calculate Components', status: 'PASS' });
            } else {
                throw new Error('Invalid response structure');
            }
        } catch (error) {
            logError(`Failed: ${error.message}`);
            failedTests++;
            testResults.push({ test: 2, name: 'Calculate Components', status: 'FAIL', error: error.message });
        }

        // ============================================
        // TEST 3: Create Salary Structure
        // ============================================
        logTest(3, 'POST /api/salary/structure');
        try {
            const { status, data } = await makeRequest('POST', '/salary/structure', {
                employeeId: testEmployeeId,
                userId: testEmployeeId,
                structureData: {
                    effective_from: '2026-01-01',
                    designation: 'Test Engineer',
                    pay_grade: 'E3',
                    wage_amount: 50000,
                    basic_salary: 50000,
                    wage_type: 'FIXED',
                    pay_frequency: 'MONTHLY',
                    working_days_per_week: 5,
                    break_time_hours: 1,
                    approved_by: 1,
                    created_by: 1
                },
                componentTypeIds: [1, 2, 3, 4, 5, 6, 7, 8, 9]
            });
            
            if (status === 201 && data.success && data.data.salaryStructureId) {
                testStructureId = data.data.salaryStructureId;
                logSuccess(`Status: ${status}`);
                logSuccess(`Structure ID: ${testStructureId}`);
                logSuccess(`Wage: ₹${data.data.calculation.wage}`);
                logSuccess(`Components Created: ${data.data.calculation.components.length}`);
                passedTests++;
                testResults.push({ test: 3, name: 'Create Salary Structure', status: 'PASS' });
            } else {
                throw new Error('Invalid response structure');
            }
        } catch (error) {
            logError(`Failed: ${error.message}`);
            failedTests++;
            testResults.push({ test: 3, name: 'Create Salary Structure', status: 'FAIL', error: error.message });
        }

        // ============================================
        // TEST 4: Get Salary Structure by ID
        // ============================================
        logTest(4, 'GET /api/salary/structure/:id');
        try {
            const { status, data } = await makeRequest('GET', `/salary/structure/${testStructureId}`);
            
            if (status === 200 && data.success && data.data.structure) {
                logSuccess(`Status: ${status}`);
                logSuccess(`Structure ID: ${data.data.structure.id}`);
                logSuccess(`Employee ID: ${data.data.structure.employee_id}`);
                logSuccess(`Wage: ₹${data.data.structure.wage_amount}`);
                logSuccess(`Status: ${data.data.structure.status}`);
                logSuccess(`Components: ${data.data.components.length}`);
                passedTests++;
                testResults.push({ test: 4, name: 'Get Structure by ID', status: 'PASS' });
            } else {
                throw new Error('Invalid response structure');
            }
        } catch (error) {
            logError(`Failed: ${error.message}`);
            failedTests++;
            testResults.push({ test: 4, name: 'Get Structure by ID', status: 'FAIL', error: error.message });
        }

        // ============================================
        // TEST 5: Get Employee Salary Structure
        // ============================================
        logTest(5, 'GET /api/salary/structure/employee/:employeeId');
        try {
            const { status, data } = await makeRequest('GET', `/salary/structure/employee/${testEmployeeId}`);
            
            if (status === 200 && data.success && data.data.structure) {
                logSuccess(`Status: ${status}`);
                logSuccess(`Employee ID: ${data.data.structure.employee_id}`);
                logSuccess(`Structure ID: ${data.data.structure.id}`);
                logSuccess(`Effective From: ${data.data.structure.effective_from}`);
                logSuccess(`Components: ${data.data.components.length}`);
                passedTests++;
                testResults.push({ test: 5, name: 'Get Employee Structure', status: 'PASS' });
            } else {
                throw new Error('Invalid response structure');
            }
        } catch (error) {
            logError(`Failed: ${error.message}`);
            failedTests++;
            testResults.push({ test: 5, name: 'Get Employee Structure', status: 'FAIL', error: error.message });
        }

        // ============================================
        // TEST 6: Validate Salary Structure
        // ============================================
        logTest(6, 'GET /api/salary/structure/:id/validate');
        try {
            const { status, data } = await makeRequest('GET', `/salary/structure/${testStructureId}/validate`);
            
            if (status === 200 && data.success && data.data.valid !== undefined) {
                logSuccess(`Status: ${status}`);
                logSuccess(`Valid: ${data.data.valid}`);
                logSuccess(`Wage: ₹${data.data.wage}`);
                logSuccess(`Total Earnings: ₹${data.data.totalEarnings}`);
                logSuccess(`Components: ${data.data.componentCount}`);
                
                if (data.data.errors && data.data.errors.length > 0) {
                    logError('Validation Errors:');
                    data.data.errors.forEach(err => logError(`  - ${err}`));
                }
                
                passedTests++;
                testResults.push({ test: 6, name: 'Validate Structure', status: 'PASS' });
            } else {
                throw new Error('Invalid response structure');
            }
        } catch (error) {
            logError(`Failed: ${error.message}`);
            failedTests++;
            testResults.push({ test: 6, name: 'Validate Structure', status: 'FAIL', error: error.message });
        }

        // ============================================
        // TEST 7: Generate Salary Slip
        // ============================================
        logTest(7, 'POST /api/salary/slip/generate');
        try {
            const { status, data } = await makeRequest('POST', '/salary/slip/generate', {
                employeeId: testEmployeeId,
                salaryMonth: '2026-01-31',
                attendanceData: {
                    total_working_days: 30,
                    present_days: 28,
                    leave_days: 2,
                    absent_days: 0,
                    overtime_hours: 0,
                    late_days: 0
                }
            });
            
            if (status === 201 && data.success && data.data.slipId) {
                testSlipId = data.data.slipId;
                logSuccess(`Status: ${status}`);
                logSuccess(`Slip ID: ${testSlipId}`);
                logSuccess(`Gross Salary: ₹${data.data.grossSalary}`);
                logSuccess(`Deductions: ₹${data.data.deductions}`);
                logSuccess(`LOP: ₹${data.data.lopAmount}`);
                logSuccess(`Net Salary: ₹${data.data.netSalary}`);
                passedTests++;
                testResults.push({ test: 7, name: 'Generate Salary Slip', status: 'PASS' });
            } else {
                throw new Error('Invalid response structure');
            }
        } catch (error) {
            logError(`Failed: ${error.message}`);
            failedTests++;
            testResults.push({ test: 7, name: 'Generate Salary Slip', status: 'FAIL', error: error.message });
        }

        // ============================================
        // TEST 8: Get Salary Slip by ID
        // ============================================
        logTest(8, 'GET /api/salary/slip/:id');
        try {
            const { status, data } = await makeRequest('GET', `/salary/slip/${testSlipId}`);
            
            if (status === 200 && data.success && data.data) {
                logSuccess(`Status: ${status}`);
                logSuccess(`Slip ID: ${data.data.id}`);
                logSuccess(`Employee ID: ${data.data.employee_id}`);
                logSuccess(`Salary Month: ${data.data.salary_month}`);
                logSuccess(`Gross Salary: ₹${data.data.gross_salary}`);
                logSuccess(`Net Salary: ₹${data.data.net_salary}`);
                logSuccess(`Status: ${data.data.status}`);
                passedTests++;
                testResults.push({ test: 8, name: 'Get Slip by ID', status: 'PASS' });
            } else {
                throw new Error('Invalid response structure');
            }
        } catch (error) {
            logError(`Failed: ${error.message}`);
            failedTests++;
            testResults.push({ test: 8, name: 'Get Slip by ID', status: 'FAIL', error: error.message });
        }

        // ============================================
        // TEST 9: Get Employee Salary Slips
        // ============================================
        logTest(9, 'GET /api/salary/slip/employee/:employeeId');
        try {
            const { status, data } = await makeRequest('GET', `/salary/slip/employee/${testEmployeeId}`);
            
            if (status === 200 && data.success && Array.isArray(data.data)) {
                logSuccess(`Status: ${status}`);
                logSuccess(`Total Slips: ${data.data.length}`);
                data.data.forEach(slip => {
                    logInfo(`  - ${slip.salary_month}: ₹${slip.net_salary} (${slip.status})`);
                });
                passedTests++;
                testResults.push({ test: 9, name: 'Get Employee Slips', status: 'PASS' });
            } else {
                throw new Error('Invalid response structure');
            }
        } catch (error) {
            logError(`Failed: ${error.message}`);
            failedTests++;
            testResults.push({ test: 9, name: 'Get Employee Slips', status: 'FAIL', error: error.message });
        }

        // ============================================
        // TEST 10: Approve Salary Slip
        // ============================================
        logTest(10, 'PUT /api/salary/slip/:id/approve');
        try {
            const { status, data } = await makeRequest('PUT', `/salary/slip/${testSlipId}/approve`, {
                approvedBy: 1
            });
            
            if (status === 200 && data.success) {
                logSuccess(`Status: ${status}`);
                logSuccess(`Message: ${data.message}`);
                logSuccess(`New Status: APPROVED`);
                passedTests++;
                testResults.push({ test: 10, name: 'Approve Slip', status: 'PASS' });
            } else {
                throw new Error('Invalid response structure');
            }
        } catch (error) {
            logError(`Failed: ${error.message}`);
            failedTests++;
            testResults.push({ test: 10, name: 'Approve Slip', status: 'FAIL', error: error.message });
        }

        // ============================================
        // TEST 11: Mark Slip as Paid
        // ============================================
        logTest(11, 'PUT /api/salary/slip/:id/pay');
        try {
            const { status, data } = await makeRequest('PUT', `/salary/slip/${testSlipId}/pay`, {
                paidBy: 1,
                paymentMode: 'BANK_TRANSFER',
                paymentReference: 'TXN123456789'
            });
            
            if (status === 200 && data.success) {
                logSuccess(`Status: ${status}`);
                logSuccess(`Message: ${data.message}`);
                logSuccess(`New Status: PAID`);
                logSuccess(`Payment Mode: BANK_TRANSFER`);
                passedTests++;
                testResults.push({ test: 11, name: 'Mark Slip as Paid', status: 'PASS' });
            } else {
                throw new Error('Invalid response structure');
            }
        } catch (error) {
            logError(`Failed: ${error.message}`);
            failedTests++;
            testResults.push({ test: 11, name: 'Mark Slip as Paid', status: 'FAIL', error: error.message });
        }

    } catch (error) {
        logError(`Unexpected error: ${error.message}`);
        console.error(error);
    }

    // ============================================
    // TEST SUMMARY
    // ============================================
    log('\n' + '='.repeat(70), 'cyan');
    log('📊 TEST SUMMARY', 'cyan');
    log('='.repeat(70), 'cyan');

    testResults.forEach(result => {
        const icon = result.status === 'PASS' ? '✅' : '❌';
        const color = result.status === 'PASS' ? 'green' : 'red';
        log(`${icon} Test ${result.test}: ${result.name} - ${result.status}`, color);
        if (result.error) {
            log(`   Error: ${result.error}`, 'red');
        }
    });

    log('\n' + '-'.repeat(70), 'cyan');
    const totalTests = passedTests + failedTests;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    log(`Total Tests: ${totalTests}`, 'blue');
    log(`Passed: ${passedTests}`, 'green');
    log(`Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'green');
    log(`Success Rate: ${successRate}%`, successRate === '100.0' ? 'green' : 'yellow');
    log('='.repeat(70), 'cyan');

    // Cleanup
    await cleanupTestData();

    // Exit with appropriate code
    process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
    logError(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
});
