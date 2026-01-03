import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../services/api";
import { Box, ArrowLeft, Mail, Send, CheckCircle2, Info } from "lucide-react";
import "../Styles/auth.css";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [resetLink, setResetLink] = useState("");

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    // Real-time validation for touched field
    if (touched) {
      setErrors({ email: validateEmail(value) });
    }
  };

  const handleBlur = () => {
    setTouched(true);
    setErrors({ email: validateEmail(email) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark field as touched
    setTouched(true);

    const emailError = validateEmail(email);
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }

    setIsLoading(true);
    setErrors({});
    setSuccessMessage("");
    setResetLink("");

    try {
      const response = await authAPI.forgotPassword({ email });

      if (response.data.success) {
        setSuccessMessage(response.data.message);
        // For development - show the reset link
        if (response.data.resetLink) {
          setResetLink(response.data.resetLink);
        }
        setEmail("");
        setTouched(false);
      } else {
        setErrors({
          submit: response.data.message || "Failed to send reset link",
        });
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setErrors({
        submit:
          error.response?.data?.message ||
          "Failed to send reset link. Please try again.",
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
              <Mail size={32} strokeWidth={2} />
            </div>
            <h1 className="auth-title">Forgot Password?</h1>
            <p className="auth-subtitle">
              No worries! Enter your email address and we'll send you a link to
              reset your password
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="success-alert">
              <div className="alert-icon">
                <CheckCircle2 size={24} />
              </div>
              <div className="alert-content">
                <h4 className="alert-title">Email Sent Successfully!</h4>
                <p className="alert-message">{successMessage}</p>
                {resetLink && (
                  <div className="dev-mode-notice">
                    <Info size={16} />
                    <div>
                      <p className="dev-mode-title">Development Mode</p>
                      <p className="dev-mode-text">
                        Click the link below to reset your password
                      </p>
                      <a href={resetLink} className="reset-dev-link">
                        {resetLink}
                      </a>
                    </div>
                  </div>
                )}
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

          {/* Forgot Password Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Email Input */}
            <div
              className={`form-group ${
                errors.email
                  ? "has-error"
                  : email && !errors.email && touched
                  ? "is-valid"
                  : ""
              }`}
            >
              <label htmlFor="email" className="form-label">
                <Mail size={16} />
                Email Address
              </label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="form-input"
                  placeholder="your.email@example.com"
                  disabled={isLoading || successMessage}
                  autoComplete="email"
                  autoFocus
                />
                {email && !errors.email && touched && (
                  <div className="input-icon valid">
                    <CheckCircle2 size={20} />
                  </div>
                )}
              </div>
              {errors.email && touched && (
                <span className="form-error">
                  <Info size={14} />
                  {errors.email}
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
                  Sending Reset Link...
                </>
              ) : successMessage ? (
                <>
                  <CheckCircle2 size={20} />
                  Email Sent
                </>
              ) : (
                <>
                  <Send size={20} />
                  Send Reset Link
                </>
              )}
            </button>

            {/* Back to Login */}
            <div className="auth-footer">
              <Link to="/login" className="back-to-login-link">
                <ArrowLeft size={18} />
                <span>Back to Login</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
