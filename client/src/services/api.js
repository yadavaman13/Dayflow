import axios from "axios";

const API_URL = "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  login: (credentials) => axiosInstance.post("/auth/login", credentials),
  register: (userData) => axiosInstance.post("/auth/register", userData),
  forgotPassword: (data) => axiosInstance.post("/auth/forgot-password", data),
  resetPassword: (data) => axiosInstance.post("/auth/reset-password", data),
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

// User API
export const userAPI = {
  getAllUsers: (params) => axiosInstance.get("/users", { params }),
  getUserById: (id) => axiosInstance.get(`/users/${id}`),
  getUserProfile: () => axiosInstance.get("/users/profile"),
  updateUserProfile: (data) => axiosInstance.put("/users/profile", data),
  changePassword: (data) => axiosInstance.put("/users/change-password", data),
  getUserStats: () => axiosInstance.get("/users/stats"),
  getUsersByRole: (role) => axiosInstance.get(`/users/role/${role}`),
  createUser: (data) => axiosInstance.post("/users", data),
  updateUser: (id, data) => axiosInstance.put(`/users/${id}`, data),
  deleteUser: (id) => axiosInstance.delete(`/users/${id}`),
  restoreUser: (id) => axiosInstance.post(`/users/${id}/restore`),
  changeUserRole: (id, role) => axiosInstance.put(`/users/${id}/role`, { role }),
  changeUserStatus: (id, status) => axiosInstance.put(`/users/${id}/status`, { status }),
};

// Employee API
export const employeeAPI = {
  getAllEmployees: (params) => axiosInstance.get("/employees", { params }),
  getEmployeeById: (id) => axiosInstance.get(`/employees/${id}`),
  getEmployeeStats: () => axiosInstance.get("/employees/stats"),
  getEmployeesByDepartment: (departmentId) => axiosInstance.get(`/employees/department/${departmentId}`),
  getEmployeesByManager: (managerId) => axiosInstance.get(`/employees/manager/${managerId}`),
  createEmployee: (data) => axiosInstance.post("/employees", data),
  updateEmployee: (id, data) => axiosInstance.put(`/employees/${id}`, data),
  deleteEmployee: (id) => axiosInstance.delete(`/employees/${id}`),
  restoreEmployee: (id) => axiosInstance.post(`/employees/${id}/restore`),
};

// Attendance API
export const attendanceAPI = {
  // Employee routes
  checkIn: (data) => axiosInstance.post("/attendance/check-in", data),
  checkOut: (data) => axiosInstance.post("/attendance/check-out", data),
  getMyAttendance: (params) => axiosInstance.get("/attendance/my-attendance", { params }),
  getTodayAttendance: () => axiosInstance.get("/attendance/today"),
  getMonthlyAttendance: (year, month) => axiosInstance.get(`/attendance/monthly/${year}/${month}`),
  getAttendanceSummary: () => axiosInstance.get("/attendance/summary"),
  
  // HR/Admin routes
  getAttendanceReport: (params) => axiosInstance.get("/attendance/report", { params }),
  getAttendanceByEmployee: (employeeId, params) => axiosInstance.get(`/attendance/employee/${employeeId}`, { params }),
  updateAttendance: (id, data) => axiosInstance.put(`/attendance/${id}`, data),
  approveAttendance: (id) => axiosInstance.post(`/attendance/${id}/approve`),
};

// Leave API
export const leaveAPI = {
  // Employee routes
  applyLeave: (data) => axiosInstance.post("/leave/apply", data),
  getMyLeaves: (params) => axiosInstance.get("/leave/my-leaves", { params }),
  getLeaveBalance: () => axiosInstance.get("/leave/balance"),
  cancelLeave: (id) => axiosInstance.post(`/leave/${id}/cancel`),
  
  // Leave types
  getLeaveTypes: () => axiosInstance.get("/leave/types"),
  createLeaveType: (data) => axiosInstance.post("/leave/types", data),
  updateLeaveType: (id, data) => axiosInstance.put(`/leave/types/${id}`, data),
  deleteLeaveType: (id) => axiosInstance.delete(`/leave/types/${id}`),
  
  // HR/Admin routes
  getAllLeaves: (params) => axiosInstance.get("/leave/all", { params }),
  getPendingLeaves: () => axiosInstance.get("/leave/pending"),
  getLeaveById: (id) => axiosInstance.get(`/leave/${id}`),
  approveLeave: (id, data) => axiosInstance.post(`/leave/${id}/approve`, data),
  rejectLeave: (id, data) => axiosInstance.post(`/leave/${id}/reject`, data),
};

// Company API
export const companyAPI = {
  getAllCompanies: (params) => axiosInstance.get("/companies", { params }),
  getCompanyById: (id) => axiosInstance.get(`/companies/${id}`),
  createCompany: (data) => axiosInstance.post("/companies", data),
  updateCompany: (id, data) => axiosInstance.put(`/companies/${id}`, data),
  deleteCompany: (id) => axiosInstance.delete(`/companies/${id}`),
  restoreCompany: (id) => axiosInstance.post(`/companies/${id}/restore`),
};

// Department API
export const departmentAPI = {
  getAllDepartments: (params) => axiosInstance.get("/departments", { params }),
  getDepartmentById: (id) => axiosInstance.get(`/departments/${id}`),
  getDepartmentsByCompany: (companyId) => axiosInstance.get(`/departments/company/${companyId}`),
  createDepartment: (data) => axiosInstance.post("/departments", data),
  updateDepartment: (id, data) => axiosInstance.put(`/departments/${id}`, data),
  deleteDepartment: (id) => axiosInstance.delete(`/departments/${id}`),
  restoreDepartment: (id) => axiosInstance.post(`/departments/${id}/restore`),
};

// Office API
export const officeAPI = {
  getAllOffices: (params) => axiosInstance.get("/offices", { params }),
  getOfficeById: (id) => axiosInstance.get(`/offices/${id}`),
  getOfficesByCompany: (companyId) => axiosInstance.get(`/offices/company/${companyId}`),
  createOffice: (data) => axiosInstance.post("/offices", data),
  updateOffice: (id, data) => axiosInstance.put(`/offices/${id}`, data),
  deleteOffice: (id) => axiosInstance.delete(`/offices/${id}`),
  restoreOffice: (id) => axiosInstance.post(`/offices/${id}/restore`),
};

export default axiosInstance;
