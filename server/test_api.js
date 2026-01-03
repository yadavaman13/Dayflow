/**
 * TEST API ENDPOINTS
 * Quick test to verify the API is working
 */

const testAPI = async () => {
  const baseURL = 'http://localhost:5000/api';
  
  console.log('========================================');
  console.log('TESTING DAYFLOW HRMS API');
  console.log('========================================\n');
  
  // Test 1: Health Check
  console.log('1. Testing Health Check...');
  try {
    const healthResponse = await fetch(`${baseURL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData);
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
  }
  
  // Test 2: Login
  console.log('\n2. Testing Login...');
  let token = null;
  try {
    const loginResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loginId: 'admin@dayflow.com',
        password: 'Admin@2026'
      })
    });
    const loginData = await loginResponse.json();
    
    if (loginData.success) {
      token = loginData.data.token;
      console.log('✅ Login Successful!');
      console.log('   User:', loginData.data.user);
      console.log('   Token:', token.substring(0, 20) + '...');
    } else {
      console.log('❌ Login Failed:', loginData.message);
    }
  } catch (error) {
    console.log('❌ Login Error:', error.message);
  }
  
  if (!token) {
    console.log('\n❌ Cannot continue tests without token');
    return;
  }
  
  // Test 3: Get All Users
  console.log('\n3. Testing Get All Users...');
  try {
    const usersResponse = await fetch(`${baseURL}/users?limit=10`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const usersData = await usersResponse.json();
    
    if (usersData.success) {
      console.log('✅ Get Users Successful!');
      console.log('   Total Users:', usersData.pagination?.total || usersData.data.length);
      console.log('   Users:');
      usersData.data.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - ${user.role} - ${user.employee_id}`);
      });
    } else {
      console.log('❌ Get Users Failed:', usersData.message);
      console.log('   Details:', usersData);
    }
  } catch (error) {
    console.log('❌ Get Users Error:', error.message);
  }
  
  // Test 4: Get User Stats
  console.log('\n4. Testing Get User Stats...');
  try {
    const statsResponse = await fetch(`${baseURL}/users/stats`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const statsData = await statsResponse.json();
    
    if (statsData.success) {
      console.log('✅ Get Stats Successful!');
      console.log('   Stats:', statsData.data);
    } else {
      console.log('❌ Get Stats Failed:', statsData.message);
    }
  } catch (error) {
    console.log('❌ Get Stats Error:', error.message);
  }
  
  console.log('\n========================================');
  console.log('TEST COMPLETE');
  console.log('========================================\n');
};

// Run the test
testAPI().catch(console.error);
