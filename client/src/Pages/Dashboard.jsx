import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("employees");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    setUser(JSON.parse(userData));

    // Mock employee data - replace with API call in production
    setEmployees([
      {
        id: 1,
        name: "John Doe",
        designation: "Senior Developer",
        avatar:
          "https://ui-avatars.com/api/?name=John+Doe&background=667eea&color=fff",
        status: "present",
        checkInTime: "09:00 AM",
        checkOutTime: null,
      },
      {
        id: 2,
        name: "Jane Smith",
        designation: "UI/UX Designer",
        avatar:
          "https://ui-avatars.com/api/?name=Jane+Smith&background=764ba2&color=fff",
        status: "present",
        checkInTime: "09:15 AM",
        checkOutTime: null,
      },
      {
        id: 3,
        name: "Mike Johnson",
        designation: "Project Manager",
        avatar:
          "https://ui-avatars.com/api/?name=Mike+Johnson&background=2ecc71&color=fff",
        status: "leave",
        checkInTime: null,
        checkOutTime: null,
      },
      {
        id: 4,
        name: "Sarah Williams",
        designation: "HR Manager",
        avatar:
          "https://ui-avatars.com/api/?name=Sarah+Williams&background=e74c3c&color=fff",
        status: "absent",
        checkInTime: null,
        checkOutTime: null,
      },
      {
        id: 5,
        name: "David Brown",
        designation: "Backend Developer",
        avatar:
          "https://ui-avatars.com/api/?name=David+Brown&background=3498db&color=fff",
        status: "present",
        checkInTime: "08:45 AM",
        checkOutTime: null,
      },
      {
        id: 6,
        name: "Emily Davis",
        designation: "QA Engineer",
        avatar:
          "https://ui-avatars.com/api/?name=Emily+Davis&background=f39c12&color=fff",
        status: "present",
        checkInTime: "09:30 AM",
        checkOutTime: null,
      },
    ]);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleCheckIn = (employeeId) => {
    setEmployees(
      employees.map((emp) =>
        emp.id === employeeId
          ? {
              ...emp,
              checkInTime: new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              status: "present",
            }
          : emp
      )
    );
  };

  const handleCheckOut = (employeeId) => {
    setEmployees(
      employees.map((emp) =>
        emp.id === employeeId
          ? {
              ...emp,
              checkOutTime: new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }
          : emp
      )
    );
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "present":
        return "status-present";
      case "leave":
        return "status-leave";
      case "absent":
        return "status-absent";
      default:
        return "status-absent";
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <div className="company-logo">Company Logo</div>
          <div className="header-tabs">
            <button
              className={`tab-button ${
                activeTab === "employees" ? "active" : ""
              }`}
              onClick={() => setActiveTab("employees")}
            >
              Employees
            </button>
            <button
              className={`tab-button ${
                activeTab === "attendance" ? "active" : ""
              }`}
              onClick={() => setActiveTab("attendance")}
            >
              Attendance
            </button>
            <button
              className={`tab-button ${
                activeTab === "timeoff" ? "active" : ""
              }`}
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
                "https://ui-avatars.com/api/?name=" +
                  (user.name || user.email) +
                  "&background=667eea&color=fff"
              }
              alt="Profile"
              className="user-avatar"
              onClick={() => setShowDropdown(!showDropdown)}
            />
            {showDropdown && (
              <div className="dropdown-menu">
                <div className="dropdown-item">My Profile</div>
                <div className="dropdown-item" onClick={handleLogout}>
                  Log Out
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        {activeTab === "employees" && (
          <>
            <div className="content-header">
              <button className="new-button">NEW</button>
              <button className="settings-button">Settings</button>
            </div>

            {filteredEmployees.length === 0 ? (
              <div className="empty-state">
                <h3>No employees found</h3>
                <p>Try adjusting your search query</p>
              </div>
            ) : (
              <div className="employees-grid">
                {filteredEmployees.map((employee) => (
                  <div key={employee.id} className="employee-card">
                    <div
                      className={`status-indicator ${getStatusClass(
                        employee.status
                      )}`}
                    ></div>

                    <div className="employee-card-content">
                      <img
                        src={employee.avatar}
                        alt={employee.name}
                        className="employee-avatar"
                      />
                      <div className="employee-name">{employee.name}</div>
                      <div className="employee-designation">
                        {employee.designation}
                      </div>

                      <div className="attendance-actions">
                        <button
                          className="check-in-button"
                          onClick={() => handleCheckIn(employee.id)}
                          disabled={
                            employee.checkInTime !== null ||
                            employee.status === "leave"
                          }
                        >
                          Check IN →
                        </button>
                        <button
                          className="check-out-button"
                          onClick={() => handleCheckOut(employee.id)}
                          disabled={
                            employee.checkInTime === null ||
                            employee.checkOutTime !== null
                          }
                        >
                          Check Out →
                        </button>
                      </div>

                      {employee.checkInTime && (
                        <div className="attendance-time">
                          Since {employee.checkInTime}
                        </div>
                      )}
                      {employee.checkOutTime && (
                        <div className="attendance-time">
                          Out at {employee.checkOutTime}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "attendance" && (
          <div className="attendance-container">
            <h2 style={{ marginBottom: "20px", color: "#333" }}>
              Attendance Records
            </h2>
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                  <th>Hours</th>
                </tr>
              </thead>
              <tbody>
                {employees
                  .filter((e) => e.checkInTime)
                  .map((employee) => (
                    <tr key={employee.id}>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <img
                            src={employee.avatar}
                            alt=""
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                            }}
                          />
                          {employee.name}
                        </div>
                      </td>
                      <td>{new Date().toLocaleDateString()}</td>
                      <td>{employee.checkInTime || "-"}</td>
                      <td>{employee.checkOutTime || "-"}</td>
                      <td>
                        <span className={`status-badge ${employee.status}`}>
                          {employee.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {employee.checkInTime && employee.checkOutTime
                          ? "8h 30m"
                          : "In Progress"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "timeoff" && (
          <div className="attendance-container">
            <h2 style={{ marginBottom: "20px", color: "#333" }}>
              Time Off Requests
            </h2>
            <p style={{ color: "#666" }}>Time off management coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
