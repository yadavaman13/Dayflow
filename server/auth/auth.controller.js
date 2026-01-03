import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import db from "../config/db.js";
import { sendPasswordResetEmail, sendEmployeeInviteEmail } from "../services/email.service.js";
import { createEmployee, findUserByEmail, findUserByEmployeeId, emailExists, updateFirstLoginStatus } from "./auth.service.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Login Controller
 * Authenticates user with email/employee ID and password
 * @param {boolean} rememberMe - If true, token expires in 30 days, otherwise 7 days
 */
export const login = async (req, res) => {
  try {
    const { loginId, password, rememberMe } = req.body;

    // Validation
    if (!loginId || !password) {
      return res.status(400).json({
        success: false,
        message: "Login ID and password are required",
      });
    }

    // Find user by email or employee ID
    let user = null;
    
    // Check if loginId is email format
    if (loginId.includes('@')) {
      user = await findUserByEmail(loginId);
    } else {
      user = await findUserByEmployeeId(loginId);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact HR.",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Set token expiration based on Remember Me
    const expiresIn = rememberMe ? "30d" : JWT_EXPIRES_IN;

    // Generate JWT token
    const token = jwt.sign({ 
      id: user.id, 
      email: user.email,
      employeeId: user.employee_id,
      role: user.role 
    }, JWT_SECRET, {
      expiresIn,
    });

    // Return success response (exclude password)
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          employeeId: user.employee_id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          isFirstLogin: user.is_first_login === 1,
        },
        expiresIn: rememberMe ? "30 days" : "7 days",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
};

/**
 * Register Controller (HR Only)
 * Creates new employee account and sends invite email
 */
export const register = async (req, res) => {
  try {
    const { email, name, phone, joiningYear, role, createdBy } = req.body;

    // Validation
    if (!email || !name || !joiningYear || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, name, joining year, and role are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Validate joining year
    const currentYear = new Date().getFullYear();
    if (joiningYear < 2000 || joiningYear > currentYear + 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid joining year",
      });
    }

    // Check if email already exists
    if (await emailExists(email)) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // Create employee
    const employee = await createEmployee({
      email,
      name,
      phone,
      joiningYear,
      role,
      createdBy: createdBy || null,
    });

    // Send invite email
    try {
      await sendEmployeeInviteEmail(
        employee.email,
        employee.resetToken,
        employee.name,
        employee.employeeId
      );

      res.status(201).json({
        success: true,
        message: "Employee registered successfully. Invite email sent.",
        data: {
          employeeId: employee.employeeId,
          email: employee.email,
          name: employee.name,
        },
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      res.status(201).json({
        success: true,
        message: "Employee registered successfully, but email sending failed. Please contact IT.",
        data: {
          employeeId: employee.employeeId,
          email: employee.email,
          name: employee.name,
        },
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
};

/**
 * Forgot Password Controller
 * Generates a reset token and saves it to the database
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find user by email
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({
        success: true,
        message:
          "If your email is registered, you will receive a password reset link",
      });
    }

    const user = users[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await db.query(
      "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?",
      [resetToken, resetTokenExpiry, user.id]
    );

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken, user.name);

      res.status(200).json({
        success: true,
        message: "Password reset link has been sent to your email",
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Even if email fails, we don't want to reveal this to the user
      res.status(200).json({
        success: true,
        message:
          "If your email is registered, you will receive a password reset link",
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process request. Please try again.",
    });
  }
};

/**
 * Reset Password Controller
 * Validates reset token and updates password
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    // Validation
    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Find user by reset token
    const [users] = await db.query(
      "SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW() AND is_deleted = 0",
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    const user = users[0];

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update password and clear reset token
    await db.query(
      "UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL, is_first_login = 0 WHERE id = ?",
      [hashedPassword, user.id]
    );

    res.status(200).json({
      success: true,
      message:
        "Password has been set successfully. You can now login with your credentials.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password. Please try again.",
    });
  }
};
