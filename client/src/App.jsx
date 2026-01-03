import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LandingPage from "./Pages/LandingPage";
import LoginPage from "./Pages/LoginPage";
import RegisterPage from "./Pages/RegisterPage";
import ForgotPasswordPage from "./Pages/ForgotPasswordPage";
import ResetPasswordPage from "./Pages/ResetPasswordPage";
import Employees from "./Pages/Employees";
import Attendance from "./Pages/Attendance";
import TimeOff from "./Pages/TimeOff";
import Payroll from "./Pages/Payroll";
import Reports from "./Pages/Reports";
import Profile from "./Pages/Profile";
import Settings from "./Pages/Settings";
import DashboardLayout from "./Components/layout/DashboardLayout";
import Dashboard from "./Pages/Dashboard";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Dashboard Routes with Layout */}
        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <Navigate to="/dashboard/employees" replace />
            </DashboardLayout>
          }
        />

        <Route
          path="/dashboard/employees"
          element={
            <DashboardLayout>
              <Employees />
            </DashboardLayout>
          }
        />

        <Route
          path="/dashboard/attendance"
          element={
            <DashboardLayout>
              <Attendance />
            </DashboardLayout>
          }
        />

        <Route
          path="/dashboard/timeoff"
          element={
            <DashboardLayout>
              <TimeOff />
            </DashboardLayout>
          }
        />

        <Route
          path="/dashboard/payroll"
          element={
            <DashboardLayout>
              <Payroll />
            </DashboardLayout>
          }
        />

        <Route
          path="/dashboard/reports"
          element={
            <DashboardLayout>
              <Reports />
            </DashboardLayout>
          }
        />

        <Route
          path="/dashboard/profile"
          element={
            <DashboardLayout>
              <Profile />
            </DashboardLayout>
          }
        />

        <Route
          path="/dashboard/settings"
          element={
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
