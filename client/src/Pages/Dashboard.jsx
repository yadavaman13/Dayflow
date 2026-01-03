import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeNav, setActiveNav] = useState("attendance");
  const [activeTimeFilter, setActiveTimeFilter] = useState("daily");
  const [searchQuery, setSearchQuery] = useState("");
  const [department, setDepartment] = useState("all");
  const [status, setStatus] = useState("all");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    setUser(JSON.parse(userData));
    // Mock data - replace with actual API calls
    setAttendanceRecords([]);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handlePrevDate = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDate = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  if (!user) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const stats = {
    attendanceRate: 0,
    presentToday: 0,
    lateArrivals: 0,
    absent: 0,
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">W</div>
          <div>
            <div className="brand-name">WorkZen</div>
            <div className="brand-subtitle">HRMS</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div
            className={`nav-item ${activeNav === "employees" ? "active" : ""}`}
            onClick={() => setActiveNav("employees")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <svg
                width="18"
                height="18"
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
              <span>Employees</span>
            </div>
            <span className="nav-arrow">›</span>
          </div>
          <div
            className={`nav-item ${activeNav === "attendance" ? "active" : ""}`}
            onClick={() => setActiveNav("attendance")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>Attendance</span>
            </div>
            <span className="nav-arrow">›</span>
          </div>
          <div
            className={`nav-item ${activeNav === "timeoff" ? "active" : ""}`}
            onClick={() => setActiveNav("timeoff")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>Time Off</span>
            </div>
            <span className="nav-arrow">›</span>
          </div>
          <div
            className={`nav-item ${activeNav === "payroll" ? "active" : ""}`}
            onClick={() => setActiveNav("payroll")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              <span>Payroll</span>
            </div>
            <span className="nav-arrow">›</span>
          </div>
          <div
            className={`nav-item ${activeNav === "reports" ? "active" : ""}`}
            onClick={() => setActiveNav("reports")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              <span>Reports</span>
            </div>
            <span className="nav-arrow">›</span>
          </div>
          <div
            className={`nav-item ${activeNav === "settings" ? "active" : ""}`}
            onClick={() => setActiveNav("settings")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6"></path>
                <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24"></path>
                <path d="M1 12h6m6 0h6"></path>
                <path d="m4.93 19.07 4.24-4.24m5.66-5.66 4.24-4.24"></path>
              </svg>
              <span>Settings</span>
            </div>
            <span className="nav-arrow">›</span>
          </div>
        </nav>

        <div className="sidebar-footer">v1.0.0 © 2026 WorkZen</div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <h1>Dashboard</h1>
            <p className="header-subtitle">
              Track and manage employee attendance
            </p>
          </div>

          <div className="header-right">
            <button className="header-action-btn">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ marginRight: "6px" }}
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Employee
            </button>
            <div className="notification-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <div className="notification-badge"></div>
            </div>
            <div className="user-profile">
              <div className="user-info">
                <div className="user-name">User</div>
                <div className="user-role">Admin</div>
              </div>
              <div className="user-avatar">U</div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="dashboard-content">
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
                    <path d="M12 6v6l4 2"></path>
                  </svg>
                </div>
              </div>
              <div className="stat-label">Attendance Rate</div>
              <div className="stat-value">{stats.attendanceRate}%</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-icon stat-icon-success">
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
              </div>
              <div className="stat-label">Present Today</div>
              <div className="stat-value">{stats.presentToday}</div>
              <div className="stat-detail">On time: 0</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-icon stat-icon-warning">
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
              </div>
              <div className="stat-label">Late Arrivals</div>
              <div className="stat-value">{stats.lateArrivals}</div>
              <div className="stat-detail">0% of total</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-icon stat-icon-danger">
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
              </div>
              <div className="stat-label">Absent</div>
              <div className="stat-value">{stats.absent}</div>
              <div className="stat-detail">Half day: 0</div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="filters-section">
            <div className="filters-row">
              <div className="search-wrapper">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="search-icon"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by name, ID, or email"
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

              <div className="filter-tabs">
                <button
                  className={`tab-btn ${
                    activeTimeFilter === "daily" ? "active" : ""
                  }`}
                  onClick={() => setActiveTimeFilter("daily")}
                >
                  Daily
                </button>
                <button
                  className={`tab-btn ${
                    activeTimeFilter === "weekly" ? "active" : ""
                  }`}
                  onClick={() => setActiveTimeFilter("weekly")}
                >
                  Weekly
                </button>
                <button
                  className={`tab-btn ${
                    activeTimeFilter === "monthly" ? "active" : ""
                  }`}
                  onClick={() => setActiveTimeFilter("monthly")}
                >
                  Monthly
                </button>
              </div>
            </div>

            <div className="filters-row">
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
                      <td>{record.employeeId}</td>
                      <td>{record.employeeName}</td>
                      <td>{record.department}</td>
                      <td>
                        <span className={`status-badge ${record.status}`}>
                          {record.status.toUpperCase()}
                        </span>
                      </td>
                      <td>{record.date}</td>
                      <td>{record.checkIn}</td>
                      <td>{record.checkOut}</td>
                      <td>{record.workHours}</td>
                      <td>{record.location}</td>
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
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
