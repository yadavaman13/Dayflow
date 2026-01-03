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

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    setUser(JSON.parse(userData));

    // Fetch real attendance data
    fetchAttendanceRecords();
    fetchEmployees();
  }, [navigate, currentDate, department, status]);

  const fetchAttendanceRecords = async () => {
    try {
      const params = {
        startDate: currentDate.toISOString().split("T")[0],
        endDate: currentDate.toISOString().split("T")[0],
      };

      if (department !== "all") {
        params.department = department;
      }
      if (status !== "all") {
        params.status = status.toUpperCase();
      }

      const response = await api.get("/attendance/report", { params });
      if (response.data.success) {
        setAttendanceRecords(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      setAttendanceRecords([]);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/employees");
      if (response.data.success) {
        setEmployees(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      // Fallback to mock data if API fails
      setEmployees([
        {
          id: 1,
          full_name: "Aarav Mehta",
          work_email: "aarav.mehta@workzen.io",
          employee_status: "ACTIVE",
        },
        {
          id: 2,
          full_name: "Jiya Sharma",
          work_email: "jiya.sharma@workzen.io",
          employee_status: "ACTIVE",
        },
      ]);
    }
  };

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

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      (emp.full_name || emp.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (emp.work_email || emp.email || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Calculate stats from real data
  const stats = {
    attendanceRate:
      attendanceRecords.length > 0
        ? (
            (attendanceRecords.filter((r) => r.status === "PRESENT").length /
              attendanceRecords.length) *
            100
          ).toFixed(1)
        : 0,
    presentToday: attendanceRecords.filter((r) => r.status === "PRESENT")
      .length,
    lateArrivals: attendanceRecords.filter(
      (r) => r.check_in && new Date(r.check_in).getHours() >= 10
    ).length,
    absent: attendanceRecords.filter((r) => r.status === "ABSENT").length,
  };

  const getActiveNav = () => {
    const path = location.pathname;
    if (path.includes("/employees")) return "employees";
    if (path.includes("/attendance")) return "attendance";
    if (path.includes("/timeoff")) return "timeoff";
    if (path.includes("/payroll")) return "payroll";
    if (path.includes("/reports")) return "reports";
    if (path.includes("/settings")) return "settings";
    return "attendance"; // default
  };

  const handleNavigation = (path) => {
    navigate(`/dashboard/${path}`);
  };

  if (!user) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

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
            className={`nav-item ${
              getActiveNav() === "employees" ? "active" : ""
            }`}
            onClick={() => handleNavigation("employees")}
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
            className={`nav-item ${
              getActiveNav() === "attendance" ? "active" : ""
            }`}
            onClick={() => handleNavigation("attendance")}
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
            className={`nav-item ${
              getActiveNav() === "timeoff" ? "active" : ""
            }`}
            onClick={() => handleNavigation("timeoff")}
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
            className={`nav-item ${
              getActiveNav() === "payroll" ? "active" : ""
            }`}
            onClick={() => handleNavigation("payroll")}
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
            className={`nav-item ${
              getActiveNav() === "reports" ? "active" : ""
            }`}
            onClick={() => handleNavigation("reports")}
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
            className={`nav-item ${
              getActiveNav() === "settings" ? "active" : ""
            }`}
            onClick={() => handleNavigation("settings")}
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
          <Routes>
            <Route path="/" element={<Navigate to="attendance" replace />} />
            <Route
              path="attendance"
              element={
                <AttendanceSection
                  stats={stats}
                  activeTimeFilter={activeTimeFilter}
                  setActiveTimeFilter={setActiveTimeFilter}
                  department={department}
                  setDepartment={setDepartment}
                  status={status}
                  setStatus={setStatus}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  currentDate={currentDate}
                  formatDate={formatDate}
                  handlePrevDate={handlePrevDate}
                  handleNextDate={handleNextDate}
                  attendanceRecords={attendanceRecords}
                />
              }
            />
            <Route
              path="employees"
              element={
                <EmployeesSection
                  employees={filteredEmployees}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              }
            />
            <Route
              path="timeoff"
              element={<ComingSoonSection title="Time Off" />}
            />
            <Route
              path="payroll"
              element={<ComingSoonSection title="Payroll" />}
            />
            <Route
              path="reports"
              element={<ComingSoonSection title="Reports" />}
            />
            <Route
              path="settings"
              element={<ComingSoonSection title="Settings" />}
            />
          </Routes>
        </div>
      </main>
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
