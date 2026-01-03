import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI, attendanceAPI, leaveAPI } from "../services/api";
import "../Styles/dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("employees");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [leaveData, setLeaveData] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    console.log('Logged in user:', parsedUser);
    console.log('User role:', parsedUser.role);
    
    // Check if user object has role - if not, they need to re-login
    if (!parsedUser.role) {
      console.error('User object missing role! Please log out and log back in.');
      alert('Your session is outdated. Please log out and log back in to access all features.');
    }
    
    setUser(parsedUser);

    // Fetch data based on user role
    if (parsedUser.role === 'HR' || parsedUser.role === 'ADMIN') {
      console.log('User is HR/ADMIN, fetching HR dashboard data...');
      fetchHRDashboardData();
    } else {
      console.log('User is EMPLOYEE, fetching employee dashboard data...');
      fetchEmployeeDashboardData();
    }
  }, [navigate]);

  const fetchHRDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching HR dashboard data...');
      
      // Fetch all users for HR dashboard
      const usersResponse = await userAPI.getAllUsers({ limit: 100 });
      console.log('Users API Response:', usersResponse);
      console.log('Users data:', usersResponse.data);
      
      // Map users to employee format
      const usersWithStatus = usersResponse.data.data.map(user => ({
        id: user.id,
        name: user.full_name || user.name,
        designation: user.role,
        email: user.email,
        avatar: user.profile_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=667eea&color=fff`,
        status: user.status === 'ACTIVE' ? 'active' : 'inactive',
        role: user.role,
        employee_id: user.employee_id,
      }));
      
      console.log('Mapped employees:', usersWithStatus);
      setEmployees(usersWithStatus);

      // Fetch attendance report for today
      const today = new Date().toISOString().split('T')[0];
      try {
        const attendanceResponse = await attendanceAPI.getAttendanceReport({
          startDate: today,
          endDate: today,
        });
        setAttendanceData(attendanceResponse.data.data || []);
      } catch (attErr) {
        console.log('Attendance fetch error (non-critical):', attErr.response?.data);
      }

      // Fetch pending leaves
      try {
        const leaveResponse = await leaveAPI.getPendingLeaves();
        setLeaveData(leaveResponse.data.data || []);
      } catch (leaveErr) {
        console.log('Leave fetch error (non-critical):', leaveErr.response?.data);
      }

      // Fetch user stats
      try {
        const statsResponse = await userAPI.getUserStats();
        setStats(statsResponse.data.data);
      } catch (statsErr) {
        console.log('Stats fetch error (non-critical):', statsErr.response?.data);
      }

    } catch (err) {
      console.error('Error fetching HR dashboard data:', err);
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch employee's own attendance for today
      const todayResponse = await attendanceAPI.getTodayAttendance();
      setTodayAttendance(todayResponse.data.data);

      // Fetch attendance history for current month
      const startDate = new Date();
      startDate.setDate(1); // First day of month
      const endDate = new Date();
      
      const attendanceResponse = await attendanceAPI.getMyAttendance({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });
      setAttendanceData(attendanceResponse.data.data || []);

      // Fetch my leaves
      const leaveResponse = await leaveAPI.getMyLeaves({ limit: 10 });
      setLeaveData(leaveResponse.data.data || []);

      // Fetch leave balance
      const balanceResponse = await leaveAPI.getLeaveBalance();
      setLeaveBalance(balanceResponse.data.data || []);

    } catch (err) {
      console.error('Error fetching employee dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await attendanceAPI.checkIn({
        mode_id: 1,
        location: { latitude: 0, longitude: 0 },
        remarks: 'Check-in from dashboard'
      });
      
      // Refresh today's attendance
      const todayResponse = await attendanceAPI.getTodayAttendance();
      setTodayAttendance(todayResponse.data.data);
      
      alert('Checked in successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceAPI.checkOut({
        location: { latitude: 0, longitude: 0 },
        remarks: 'Check-out from dashboard'
      });
      
      // Refresh today's attendance
      const todayResponse = await attendanceAPI.getTodayAttendance();
      setTodayAttendance(todayResponse.data.data);
      
      alert('Checked out successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to check out');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return 'status-present';
      case 'absent':
        return 'status-absent';
      case 'leave':
        return 'status-leave';
      case 'active':
        return 'status-active';
      default:
        return 'status-default';
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return <div>Loading...</div>;
  }

  const isHROrAdmin = user.role === 'HR' || user.role === 'ADMIN';

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <div className="company-logo">Dayflow HRMS</div>
          <div className="header-tabs">
            <button
              className={`tab-button ${activeTab === "employees" ? "active" : ""}`}
              onClick={() => setActiveTab("employees")}
            >
              {isHROrAdmin ? 'Employees' : 'Dashboard'}
            </button>
            <button
              className={`tab-button ${activeTab === "attendance" ? "active" : ""}`}
              onClick={() => setActiveTab("attendance")}
            >
              Attendance
            </button>
            <button
              className={`tab-button ${activeTab === "timeoff" ? "active" : ""}`}
              onClick={() => setActiveTab("timeoff")}
            >
              Time Off
            </button>
          </div>
        </div>

        <div className="header-right">
          <input
            type="text"
            className="header-search"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="notification-icon">🔔</div>
          <div className="user-profile-dropdown">
            <img
              src={
                user.photoURL ||
                user.profile_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=667eea&color=fff`
              }
              alt="Profile"
              className="user-avatar"
              onClick={() => setShowDropdown(!showDropdown)}
            />
            {showDropdown && (
              <div className="dropdown-menu">
                <div className="dropdown-item">
                  {user.name || user.email}
                  <div style={{ fontSize: '12px', color: '#666' }}>{user.role}</div>
                </div>
                <div className="dropdown-item" onClick={() => navigate('/profile')}>
                  My Profile
                </div>
                <div className="dropdown-item" onClick={handleLogout}>
                  Log Out
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {loading && (
          <div className="loading-spinner">
            <p>Loading dashboard data...</p>
            <p style={{ fontSize: '14px', marginTop: '10px' }}>
              If this takes too long, check if the backend server is running on port 5000
            </p>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            <h3>Error Loading Data</h3>
            <p>{error}</p>
            <p style={{ fontSize: '14px', marginTop: '10px' }}>
              Check browser console (F12) for more details
            </p>
            <button 
              onClick={() => {
                setError(null);
                if (user.role === 'HR' || user.role === 'ADMIN') {
                  fetchHRDashboardData();
                } else {
                  fetchEmployeeDashboardData();
                }
              }}
              style={{ 
                marginTop: '15px', 
                padding: '10px 20px', 
                background: 'white', 
                color: '#667eea',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
        {/* EMPLOYEES TAB */}
        {activeTab === "employees" && (
          <>
            {isHROrAdmin ? (
              // HR/Admin View - Show all employees
              <>
                <div className="content-header">
                  <h2>All Employees ({employees.length})</h2>
                  <div className="header-actions">
                    <button className="new-button" onClick={() => navigate('/employees/new')}>
                      + NEW EMPLOYEE
                    </button>
                    <button className="settings-button">Settings</button>
                  </div>
                </div>

                {stats && (
                  <div className="stats-container">
                    <div className="stat-card">
                      <h3>{stats.total_users || 0}</h3>
                      <p>Total Users</p>
                    </div>
                    <div className="stat-card">
                      <h3>{stats.active_users || 0}</h3>
                      <p>Active</p>
                    </div>
                    <div className="stat-card">
                      <h3>{stats.inactive_users || 0}</h3>
                      <p>Inactive</p>
                    </div>
                  </div>
                )}

                {filteredEmployees.length === 0 ? (
                  <div className="empty-state">
                    <h3>No employees found</h3>
                    <p>Try adjusting your search query or add new employees</p>
                  </div>
                ) : (
                  <div className="employees-grid">
                    {filteredEmployees.map((employee) => (
                      <div key={employee.id} className="employee-card">
                        <div className={`status-indicator ${getStatusClass(employee.status)}`}></div>
                        <div className="employee-card-content">
                          <img
                            src={employee.avatar}
                            alt={employee.name}
                            className="employee-avatar"
                          />
                          <div className="employee-name">{employee.name}</div>
                          <div className="employee-designation">{employee.designation}</div>
                          <div className="employee-email">{employee.email}</div>
                          {employee.employee_id && (
                            <div className="employee-id">ID: {employee.employee_id}</div>
                          )}
                          <div className="employee-actions">
                            <button 
                              className="btn-view"
                              onClick={() => navigate(`/employees/${employee.id}`)}
                            >
                              View Profile
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              // Employee View - Show personal dashboard
              <div className="employee-dashboard">
                <div className="welcome-section">
                  <h2>Welcome back, {user.name}!</h2>
                  <p>{formatDate(new Date())}</p>
                </div>

                <div className="quick-actions">
                  <div className="action-card">
                    <h3>Today's Attendance</h3>
                    {todayAttendance ? (
                      <div className="attendance-status">
                        <p>✅ Checked In: {formatTime(todayAttendance.check_in)}</p>
                        {todayAttendance.check_out ? (
                          <p>✅ Checked Out: {formatTime(todayAttendance.check_out)}</p>
                        ) : (
                          <button className="btn-checkout" onClick={handleCheckOut}>
                            Check Out
                          </button>
                        )}
                        {todayAttendance.working_hours && (
                          <p>Hours: {parseFloat(todayAttendance.working_hours).toFixed(2)}h</p>
                        )}
                      </div>
                    ) : (
                      <div className="attendance-status">
                        <p>No check-in yet today</p>
                        <button className="btn-checkin" onClick={handleCheckIn}>
                          Check In
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="action-card">
                    <h3>Leave Balance</h3>
                    {leaveBalance.length > 0 ? (
                      <div className="leave-balance-list">
                        {leaveBalance.map((balance, idx) => (
                          <div key={idx} className="balance-item">
                            <span>{balance.leave_type_name || 'Leave'}</span>
                            <strong>{balance.remaining_days || 0} days</strong>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No leave balance data</p>
                    )}
                    <button 
                      className="btn-apply-leave"
                      onClick={() => navigate('/leave/apply')}
                    >
                      Apply Leave
                    </button>
                  </div>
                </div>

                <div className="stats-container">
                  <div className="stat-card">
                    <h3>{attendanceData.length}</h3>
                    <p>Days This Month</p>
                  </div>
                  <div className="stat-card">
                    <h3>{leaveData.length}</h3>
                    <p>Leave Requests</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === "attendance" && (
          <div className="attendance-container">
            <h2 style={{ marginBottom: "20px", color: "#333" }}>
              {isHROrAdmin ? 'Attendance Records' : 'My Attendance'}
            </h2>
            
            {attendanceData.length === 0 ? (
              <div className="empty-state">
                <p>No attendance records found</p>
              </div>
            ) : (
              <table className="attendance-table">
                <thead>
                  <tr>
                    {isHROrAdmin && <th>Employee</th>}
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((record) => (
                    <tr key={record.id}>
                      {isHROrAdmin && (
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {record.employee_name || 'Unknown'}
                          </div>
                        </td>
                      )}
                      <td>{formatDate(record.attendance_date)}</td>
                      <td>{formatTime(record.check_in)}</td>
                      <td>{formatTime(record.check_out)}</td>
                      <td>
                        {record.working_hours 
                          ? `${parseFloat(record.working_hours).toFixed(2)}h`
                          : record.check_out ? 'Calculating...' : 'In Progress'
                        }
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusClass(record.status)}`}>
                          {record.status || 'PRESENT'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TIME OFF TAB */}
        {activeTab === "timeoff" && (
          <div className="timeoff-container">
            <h2 style={{ marginBottom: "20px", color: "#333" }}>
              {isHROrAdmin ? 'Leave Requests' : 'My Leave Requests'}
            </h2>
            
            {leaveData.length === 0 ? (
              <div className="empty-state">
                <p>No leave requests found</p>
                {!isHROrAdmin && (
                  <button 
                    className="btn-apply-leave"
                    onClick={() => navigate('/leave/apply')}
                  >
                    Apply Leave
                  </button>
                )}
              </div>
            ) : (
              <table className="attendance-table">
                <thead>
                  <tr>
                    {isHROrAdmin && <th>Employee</th>}
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days</th>
                    <th>Status</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveData.map((leave) => (
                    <tr key={leave.id}>
                      {isHROrAdmin && <td>{leave.employee_name || 'Unknown'}</td>}
                      <td>{leave.leave_type || leave.leave_type_name || 'Leave'}</td>
                      <td>{formatDate(leave.start_date)}</td>
                      <td>{formatDate(leave.end_date)}</td>
                      <td>{leave.total_days}</td>
                      <td>
                        <span className={`status-badge status-${leave.status?.toLowerCase()}`}>
                          {leave.status}
                        </span>
                      </td>
                      <td>{leave.reason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
