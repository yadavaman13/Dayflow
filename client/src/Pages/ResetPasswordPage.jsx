import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { authAPI } from "../services/api";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Info,
  KeyRound,
  Shield,
} from "lucide-react";
import "../Styles/auth.css";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  // Validation functions
  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword !== password) return "Passwords do not match";
    return "";
  };

  const validateForm = () => {
    const newErrors = {
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(
        formData.confirmPassword,
        formData.password
      ),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time validation for touched fields
    if (touched[name]) {
      if (name === "password") {
        setErrors((prev) => ({
          ...prev,
          password: validatePassword(value),
          // Revalidate confirmPassword if it's been touched
          ...(touched.confirmPassword && {
            confirmPassword: validateConfirmPassword(
              formData.confirmPassword,
              value
            ),
          }),
        }));
      } else if (name === "confirmPassword") {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: validateConfirmPassword(value, formData.password),
        }));
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    if (name === "password") {
      setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
    } else if (name === "confirmPassword") {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(value, formData.password),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ password: true, confirmPassword: true });

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const response = await authAPI.resetPassword({
        token,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (response.data.success) {
        setSuccessMessage(response.data.message);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login", {
            state: {
              message:
                "Password reset successful! Please login with your new password.",
            },
          });
        }, 3000);
      } else {
        setErrors({
          submit: response.data.message || "Failed to reset password",
        });
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setErrors({
        submit:
          error.response?.data?.message ||
          "Failed to reset password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background Decorations */}
      <div className="auth-bg-shapes">
        <div className="auth-shape auth-shape-1"></div>
        <div className="auth-shape auth-shape-2"></div>
        <div className="auth-shape auth-shape-3"></div>
      </div>

      <div className="auth-container">
        <div className="auth-card animate-slide-up">
          {/* Header Section */}
          <div className="auth-header">
            <div className="auth-icon-wrapper">
              <Shield size={32} strokeWidth={2} />
            </div>
            <h1 className="auth-title">Create New Password</h1>
            <p className="auth-subtitle">
              Enter a strong password to secure your account
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="success-alert">
              <div className="alert-icon">
                <CheckCircle2 size={24} />
              </div>
              <div className="alert-content">
                <h4 className="alert-title">Password Reset Successful!</h4>
                <p className="alert-message">{successMessage}</p>
                <p className="alert-subtext">Redirecting to login page...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="form-error-banner">
              <Info size={20} />
              {errors.submit}
            </div>
          )}

          {/* Reset Password Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Password Input */}
            <div
              className={`form-group ${
                errors.password && touched.password
                  ? "has-error"
                  : formData.password && !errors.password && touched.password
                  ? "is-valid"
                  : ""
              }`}
            >
              <label htmlFor="password" className="form-label">
                <KeyRound size={16} />
                New Password
              </label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="form-input"
                  placeholder="Enter your new password"
                  disabled={isLoading || successMessage}
                  autoComplete="new-password"
                  autoFocus
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || successMessage}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && touched.password && (
                <span className="form-error">
                  <Info size={14} />
                  {errors.password}
                </span>
              )}
            </div>

            {/* Confirm Password Input */}
            <div
              className={`form-group ${
                errors.confirmPassword && touched.confirmPassword
                  ? "has-error"
                  : formData.confirmPassword &&
                    !errors.confirmPassword &&
                    touched.confirmPassword
                  ? "is-valid"
                  : ""
              }`}
            >
              <label htmlFor="confirmPassword" className="form-label">
                <Lock size={16} />
                Confirm Password
              </label>
              <div className="input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="form-input"
                  placeholder="Confirm your new password"
                  disabled={isLoading || successMessage}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading || successMessage}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && touched.confirmPassword && (
                <span className="form-error">
                  <Info size={14} />
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading || successMessage}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Resetting Password...
                </>
              ) : successMessage ? (
                <>
                  <CheckCircle2 size={20} />
                  Password Reset Successfully
                </>
              ) : (
                <>
                  <Shield size={20} />
                  Reset Password
                </>
              )}
            </button>

            {/* Back to Login */}
            {!successMessage && (
              <div className="auth-footer">
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--gray-600)",
                    marginBottom: "12px",
                  }}
                >
                  Remember your password?
                </p>
                <Link to="/login" className="auth-link">
                  Back to Login
                </Link>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
