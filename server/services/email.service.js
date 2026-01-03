import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email service configuration error:", error.message);
  } else {
    console.log("✅ Email service is ready to send emails");
  }
});

/**
 * Send password reset email
 * @param {string} to - Recipient email address
 * @param {string} resetToken - Password reset token
 * @param {string} userName - User's name
 */
export const sendPasswordResetEmail = async (
  to,
  resetToken,
  userName = "User"
) => {
  const resetLink = `${process.env.CLIENT_URL || "http://localhost:5173"
    }/reset-password/${resetToken}`;

  const mailOptions = {
    from: {
      name: "Day Flow HR",
      address: process.env.EMAIL_USER,
    },
    to: to,
    subject: "Password Reset Request - Day Flow",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #374151;
            max-width: 600px;
            margin: 0 auto;
            padding: 0;
            background-color: #f3f0f2;
          }
          .email-wrapper {
            padding: 40px 20px;
          }
          .container {
            background-color: #ffffff;
            border-radius: 16px;
            padding: 0;
            box-shadow: 0 4px 20px rgba(113, 75, 103, 0.12);
            overflow: hidden;
          }
          .header-bar {
            background: linear-gradient(135deg, #714B67 0%, #5a3c52 100%);
            padding: 32px 40px;
            text-align: center;
          }
          .logo {
            width: 56px;
            height: 56px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 14px;
            margin: 0 auto 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 20px;
            font-weight: 800;
            letter-spacing: -0.5px;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .header-title {
            color: #ffffff;
            margin: 0;
            font-size: 22px;
            font-weight: 600;
            letter-spacing: -0.3px;
          }
          .header-subtitle {
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
            margin-top: 6px;
          }
          .content {
            padding: 36px 40px;
          }
          .greeting {
            font-size: 16px;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .message-text {
            font-size: 15px;
            color: #4b5563;
            margin-bottom: 28px;
            line-height: 1.7;
          }
          .button-container {
            text-align: center;
            margin: 32px 0;
          }
          .button {
            display: inline-block;
            padding: 14px 36px;
            background: linear-gradient(135deg, #714B67 0%, #5a3c52 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 600;
            font-size: 15px;
            box-shadow: 0 4px 14px rgba(113, 75, 103, 0.35);
            transition: all 0.3s ease;
          }
          .link-section {
            margin-top: 24px;
          }
          .link-label {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 8px;
          }
          .link-text {
            word-break: break-all;
            background-color: #faf8f9;
            padding: 14px 16px;
            border-radius: 10px;
            font-size: 12px;
            color: #714B67;
            border: 1px solid #ebe5e9;
            font-family: monospace;
          }
          .warning {
            background: linear-gradient(135deg, #fef9e7 0%, #fef3c7 100%);
            border-left: 4px solid #f59e0b;
            padding: 16px 18px;
            margin: 28px 0;
            border-radius: 0 10px 10px 0;
            font-size: 14px;
            color: #92400e;
          }
          .warning-title {
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
            color: #b45309;
          }
          .help-text {
            font-size: 14px;
            color: #6b7280;
            margin-top: 24px;
          }
          .footer {
            background-color: #faf8f9;
            padding: 24px 40px;
            border-top: 1px solid #ebe5e9;
            text-align: center;
          }
          .footer-text {
            font-size: 13px;
            color: #9ca3af;
            margin: 0;
            line-height: 1.6;
          }
          .footer-brand {
            color: #714B67;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="container">
            <div class="header-bar">
              <div class="logo">DF</div>
              <h1 class="header-title">Password Reset Request</h1>
              <p class="header-subtitle">We're here to help you get back in</p>
            </div>
            
            <div class="content">
              <p class="greeting">Hello <strong>${userName}</strong>,</p>
              
              <p class="message-text">
                We received a request to reset your password for your Day Flow account. 
                Click the button below to create a new secure password.
              </p>
              
              <div class="button-container">
                <a href="${resetLink}" class="button">Reset My Password</a>
              </div>
              
              <div class="link-section">
                <p class="link-label">Or copy and paste this link in your browser:</p>
                <div class="link-text">${resetLink}</div>
              </div>
              
              <div class="warning">
                <div class="warning-title">⚠️ Security Notice</div>
                This link will expire in <strong>1 hour</strong> for your security. 
                If you didn't request this password reset, you can safely ignore this email.
              </div>
              
              <p class="help-text">
                Having trouble? Contact your HR administrator for assistance.
              </p>
            </div>
            
            <div class="footer">
              <p class="footer-text">
                This is an automated message from <span class="footer-brand">Day Flow</span>.<br>
                Please do not reply to this email.
              </p>
              <p class="footer-text" style="margin-top: 12px;">
                &copy; ${new Date().getFullYear()} Day Flow. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Hello ${userName},

We received a request to reset your password for your Day Flow account.

To reset your password, click the link below:
${resetLink}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email.

---
This is an automated email, please do not reply.
© ${new Date().getFullYear()} Day Flow. All rights reserved.
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Password reset email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};

/**
 * Send employee invite email with password setup link
 * @param {string} to - Recipient email address
 * @param {string} resetToken - Password setup token
 * @param {string} userName - Employee's name
 * @param {string} employeeId - Employee ID
 */
export const sendEmployeeInviteEmail = async (
  to,
  resetToken,
  userName,
  employeeId
) => {
  const setupLink = `${process.env.CLIENT_URL || "http://localhost:5173"
    }/reset-password/${resetToken}`;

  const mailOptions = {
    from: {
      name: "Day Flow HR",
      address: process.env.EMAIL_USER,
    },
    to: to,
    subject: "Welcome to Day Flow - Set Up Your Account 🎉",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #374151;
            max-width: 600px;
            margin: 0 auto;
            padding: 0;
            background-color: #f3f0f2;
          }
          .email-wrapper {
            padding: 40px 20px;
          }
          .container {
            background-color: #ffffff;
            border-radius: 16px;
            padding: 0;
            box-shadow: 0 4px 20px rgba(113, 75, 103, 0.12);
            overflow: hidden;
          }
          .header-bar {
            background: linear-gradient(135deg, #714B67 0%, #5a3c52 100%);
            padding: 36px 40px;
            text-align: center;
          }
          .logo {
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 16px;
            margin: 0 auto 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 22px;
            font-weight: 800;
            letter-spacing: -0.5px;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .welcome-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 12px;
            color: white;
            font-weight: 600;
            margin-bottom: 12px;
            letter-spacing: 0.5px;
          }
          .header-title {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.3px;
          }
          .header-subtitle {
            color: rgba(255, 255, 255, 0.85);
            font-size: 14px;
            margin-top: 8px;
          }
          .content {
            padding: 36px 40px;
          }
          .greeting {
            font-size: 16px;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .message-text {
            font-size: 15px;
            color: #4b5563;
            margin-bottom: 28px;
            line-height: 1.7;
          }
          .info-card {
            background: linear-gradient(135deg, #faf8f9 0%, #f5f1f4 100%);
            border: 1px solid #ebe5e9;
            border-radius: 12px;
            padding: 20px 24px;
            margin: 20px 0;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
          }
          .info-row:not(:last-child) {
            border-bottom: 1px solid #e5e0e4;
          }
          .info-label {
            font-size: 13px;
            color: #6b7280;
            font-weight: 500;
          }
          .info-value {
            font-size: 15px;
            color: #714B67;
            font-weight: 700;
            letter-spacing: 0.02em;
          }
          .info-value-email {
            font-size: 14px;
            color: #374151;
            font-weight: 500;
          }
          .button-container {
            text-align: center;
            margin: 32px 0;
          }
          .button {
            display: inline-block;
            padding: 16px 40px;
            background: linear-gradient(135deg, #714B67 0%, #5a3c52 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 15px;
            box-shadow: 0 6px 20px rgba(113, 75, 103, 0.35);
            letter-spacing: 0.02em;
          }
          .link-section {
            margin-top: 24px;
          }
          .link-label {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 8px;
          }
          .link-text {
            word-break: break-all;
            background-color: #faf8f9;
            padding: 14px 16px;
            border-radius: 10px;
            font-size: 12px;
            color: #714B67;
            border: 1px solid #ebe5e9;
            font-family: monospace;
          }
          .warning {
            background: linear-gradient(135deg, #fef9e7 0%, #fef3c7 100%);
            border-left: 4px solid #f59e0b;
            padding: 16px 18px;
            margin: 28px 0;
            border-radius: 0 10px 10px 0;
            font-size: 14px;
            color: #92400e;
          }
          .warning-title {
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
            color: #b45309;
          }
          .tip-box {
            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
            border-left: 4px solid #10b981;
            padding: 16px 18px;
            margin: 20px 0;
            border-radius: 0 10px 10px 0;
            font-size: 14px;
            color: #065f46;
          }
          .tip-title {
            font-weight: 600;
            margin-bottom: 6px;
            color: #047857;
          }
          .footer {
            background-color: #faf8f9;
            padding: 24px 40px;
            border-top: 1px solid #ebe5e9;
            text-align: center;
          }
          .footer-text {
            font-size: 13px;
            color: #9ca3af;
            margin: 0;
            line-height: 1.6;
          }
          .footer-brand {
            color: #714B67;
            font-weight: 600;
          }
          .contact-link {
            color: #714B67;
            text-decoration: none;
            font-weight: 500;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="container">
            <div class="header-bar">
              <div class="logo">DF</div>
              <div class="welcome-badge">🎉 WELCOME ABOARD</div>
              <h1 class="header-title">Welcome to Day Flow!</h1>
              <p class="header-subtitle">Your account is ready to be activated</p>
            </div>
            
            <div class="content">
              <p class="greeting">Hello <strong>${userName}</strong>,</p>
              
              <p class="message-text">
                Great news! Your employee account has been successfully created by HR. 
                Below are your account details to get you started on your Day Flow journey.
              </p>
              
              <div class="info-card">
                <div class="info-row">
                  <span class="info-label">Employee ID</span>
                  <span class="info-value">${employeeId}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Email Address</span>
                  <span class="info-value-email">${to}</span>
                </div>
              </div>
              
              <p class="message-text" style="margin-top: 28px;">
                To access your account, you'll need to set up a secure password. 
                Click the button below to get started:
              </p>
              
              <div class="button-container">
                <a href="${setupLink}" class="button">Set Up My Password</a>
              </div>
              
              <div class="link-section">
                <p class="link-label">Or copy and paste this link in your browser:</p>
                <div class="link-text">${setupLink}</div>
              </div>
              
              <div class="warning">
                <div class="warning-title">⏰ Important</div>
                This setup link will expire in <strong>7 days</strong>. 
                Please complete your password setup as soon as possible to access your account.
              </div>
              
              <div class="tip-box">
                <div class="tip-title">💡 Quick Tip</div>
                You can use either your <strong>Employee ID</strong> or <strong>Email address</strong> to log in to Day Flow.
              </div>
            </div>
            
            <div class="footer">
              <p class="footer-text">
                Need help? Contact your <span class="contact-link">HR Administrator</span> for assistance.
              </p>
              <p class="footer-text" style="margin-top: 12px;">
                This is an automated message from <span class="footer-brand">Day Flow</span>.<br>
                Please do not reply to this email.
              </p>
              <p class="footer-text" style="margin-top: 12px;">
                &copy; ${new Date().getFullYear()} Day Flow. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to Day Flow!

Hello ${userName},

Great news! Your employee account has been successfully created by HR.

Your Account Details:
- Employee ID: ${employeeId}
- Email: ${to}

To get started, you need to set up your password. Please click the link below:
${setupLink}

This link will expire in 7 days. Please set up your password as soon as possible.

Quick Tip: You can use either your Employee ID or Email address to log in to Day Flow.

Need help? Contact your HR Administrator for assistance.

---
This is an automated email, please do not reply.
© ${new Date().getFullYear()} Day Flow. All rights reserved.
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Employee invite email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending employee invite email:", error);
    throw new Error("Failed to send employee invite email");
  }
};

export default { sendPasswordResetEmail, sendEmployeeInviteEmail };
