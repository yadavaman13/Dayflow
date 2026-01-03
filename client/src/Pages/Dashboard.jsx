import React, { useEffect, useState } from "react";
import {
  useNavigate,
  useLocation,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import api from "../services/api";
import "../Styles/dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [activeTimeFilter, setActiveTimeFilter] = useState("daily");
  const [searchQuery, setSearchQuery] = useState("");
  const [department, setDepartment] = useState("all");
  const [status, setStatus] = useState("all");
  const [currentDate, setCurrentDate] = useState(new Date(2024, 11, 2)); // December 2, 2024 to show seed data
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [leaveData, setLeaveData] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
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

// Attendance Section Component
const AttendanceSection = ({
  stats,
  activeTimeFilter,
  setActiveTimeFilter,
  department,
  setDepartment,
  status,
  setStatus,
  searchQuery,
  setSearchQuery,
  currentDate,
  formatDate,
  handlePrevDate,
  handleNextDate,
  attendanceRecords,
}) => (
  <>
    {/* Stats Cards */}
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-card-header">
          <div className="stat-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <span className="stat-label">Attendance Rate</span>
        </div>
        <div className="stat-value">{stats.attendanceRate}%</div>
        <div className="stat-footer">
          <span className="stat-trend positive">+2.5%</span>
          <span className="stat-period">vs last month</span>
        </div>
      </div>

      <div className="stat-card success">
        <div className="stat-card-header">
          <div className="stat-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <span className="stat-label">Present Today</span>
        </div>
        <div className="stat-value">{stats.presentToday}</div>
        <div className="stat-footer">
          <span className="stat-period">Out of 0 employees</span>
        </div>
      </div>

      <div className="stat-card warning">
        <div className="stat-card-header">
          <div className="stat-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <span className="stat-label">Late Arrivals</span>
        </div>
        <div className="stat-value">{stats.lateArrivals}</div>
        <div className="stat-footer">
          <span className="stat-period">Today</span>
        </div>
      </div>

      <div className="stat-card danger">
        <div className="stat-card-header">
          <div className="stat-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <span className="stat-label">Absent</span>
        </div>
        <div className="stat-value">{stats.absent}</div>
        <div className="stat-footer">
          <span className="stat-period">Today</span>
        </div>
      </div>
    </div>

    {/* Filters */}
    <div className="filters-section">
      <div className="filters-header">
        <h2 className="section-title">Attendance Records</h2>
      </div>

      <div className="filters-row">
        <div className="search-wrapper">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Search employees..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="all">All Departments</option>
          <option value="engineering">Engineering</option>
          <option value="hr">HR</option>
          <option value="sales">Sales</option>
        </select>

        <select
          className="filter-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
        </select>
      </div>

      <div className="time-filters">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${
              activeTimeFilter === "daily" ? "active" : ""
            }`}
            onClick={() => setActiveTimeFilter("daily")}
          >
            Daily
          </button>
          <button
            className={`filter-tab ${
              activeTimeFilter === "weekly" ? "active" : ""
            }`}
            onClick={() => setActiveTimeFilter("weekly")}
          >
            Weekly
          </button>
          <button
            className={`filter-tab ${
              activeTimeFilter === "monthly" ? "active" : ""
            }`}
            onClick={() => setActiveTimeFilter("monthly")}
          >
            Monthly
          </button>
        </div>

        <div className="date-navigation">
          <button className="date-nav-btn" onClick={handlePrevDate}>
            ‹
          </button>
          <div className="date-display">{formatDate(currentDate)}</div>
          <button className="date-nav-btn" onClick={handleNextDate}>
            ›
          </button>
        </div>

        <div className="status-legend">
          <div className="legend-item">
            <div className="legend-dot present"></div>
            <span>Present</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot absent"></div>
            <span>Absent</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot late"></div>
            <span>Late</span>
          </div>
        </div>
      </div>
    </div>

    {/* Table */}
    <div className="table-container">
      <div className="table-header">
        <div className="records-count">
          Showing <strong>0</strong> of <strong>0</strong> records
        </div>
      </div>

      <table className="attendance-table">
        <thead>
          <tr>
            <th>EMPLOYEE ID</th>
            <th>EMPLOYEE NAME</th>
            <th>DEPARTMENT</th>
            <th>STATUS</th>
            <th>DATE</th>
            <th>CHECK IN</th>
            <th>CHECK OUT</th>
            <th>WORK HOURS</th>
            <th>LOCATION</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {attendanceRecords.length === 0 ? (
            <tr>
              <td colSpan="10">
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                    </svg>
                  </div>
                  <h3>No attendance records found</h3>
                </div>
              </td>
            </tr>
          ) : (
            attendanceRecords.map((record) => (
              <tr key={record.id}>
                <td>{record.employee_code || record.employee_id}</td>
                <td>{record.employee_name || "Unknown"}</td>
                <td>{record.department_name || "N/A"}</td>
                <td>
                  <span
                    className={`status-badge ${(
                      record.status || "absent"
                    ).toLowerCase()}`}
                  >
                    {(record.status || "ABSENT").toUpperCase()}
                  </span>
                </td>
                <td>
                  {record.attendance_date
                    ? new Date(record.attendance_date).toLocaleDateString()
                    : "-"}
                </td>
                <td>
                  {record.check_in
                    ? new Date(record.check_in).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </td>
                <td>
                  {record.check_out
                    ? new Date(record.check_out).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </td>
                <td>
                  {record.working_hours
                    ? `${parseFloat(record.working_hours).toFixed(2)}h`
                    : "-"}
                </td>
                <td>
                  {record.check_in_location
                    ? JSON.parse(record.check_in_location).type || "Office"
                    : "N/A"}
                </td>
                <td>
                  <button className="action-btn">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="12" cy="5" r="1" />
                      <circle cx="12" cy="19" r="1" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </>
);

// Employees Section Component
const EmployeesSection = ({ employees, searchQuery, setSearchQuery }) => {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredByStatus = employees.filter((emp) => {
    const empStatus = (
      emp.employee_status ||
      emp.status ||
      "active"
    ).toLowerCase();
    return activeFilter === "all" || empStatus === activeFilter.toLowerCase();
  });

  return (
    <>
      {/* Content Header */}
      <div className="content-header-employees">
        <h2 className="content-title">Employees</h2>

        <div className="header-actions">
          <div className="search-wrapper">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search employees..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button className="filter-btn-icon">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </button>

          <button className="add-employee-btn">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Employee
          </button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="quick-filters-employees">
        <span className="filter-label">Quick Filter:</span>
        <div className="filter-buttons">
          <button
            className={`filter-chip ${activeFilter === "all" ? "active" : ""}`}
            onClick={() => setActiveFilter("all")}
          >
            All
          </button>
          <button
            className={`filter-chip ${
              activeFilter === "present" ? "active" : ""
            }`}
            onClick={() => setActiveFilter("present")}
          >
            <span className="status-dot-chip present"></span>
            Present
          </button>
          <button
            className={`filter-chip ${
              activeFilter === "leave" ? "active" : ""
            }`}
            onClick={() => setActiveFilter("leave")}
          >
            <span className="status-dot-chip leave"></span>
            On Leave
          </button>
          <button
            className={`filter-chip ${
              activeFilter === "absent" ? "active" : ""
            }`}
            onClick={() => setActiveFilter("absent")}
          >
            <span className="status-dot-chip absent"></span>
            Absent
          </button>
        </div>
      </div>

      {/* Employees Grid */}
      <div className="employees-grid-section">
        {filteredByStatus.map((employee) => (
          <div key={employee.id} className="employee-card-grid">
            <div className="card-status-indicator">
              <span
                className={`status-indicator-dot ${(
                  employee.employee_status ||
                  employee.status ||
                  "active"
                ).toLowerCase()}`}
              ></span>
            </div>
            <div className="employee-avatar-wrapper">
              <div className="employee-avatar-icon">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>
            <h3 className="employee-name-grid">
              {employee.full_name || employee.name}
            </h3>
            <p className="employee-email-grid">
              {employee.work_email || employee.email}
            </p>
          </div>
        ))}
      </div>

      {filteredByStatus.length === 0 && (
        <div className="empty-state">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <h3>No employees found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      )}
    </>
  );
};

// Coming Soon Section Component
const ComingSoonSection = ({ title }) => (
  <div className="coming-soon-section">
    <svg
      width="80"
      height="80"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
    <h2>{title}</h2>
    <p>This section is coming soon...</p>
  </div>
);

export default Dashboard;
