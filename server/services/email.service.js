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
  const resetLink = `${
    process.env.CLIENT_URL || "http://localhost:5173"
  }/reset-password/${resetToken}`;

  const mailOptions = {
    from: {
      name: "Dayflow HR",
      address: process.env.EMAIL_USER,
    },
    to: to,
    subject: "Password Reset Request",
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
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
          }
          h1 {
            color: #1a202c;
            margin: 0;
            font-size: 24px;
          }
          .content {
            margin: 30px 0;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
          }
          .button:hover {
            background: linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%);
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            font-size: 14px;
            color: #718096;
            text-align: center;
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 14px;
          }
          .link-text {
            word-break: break-all;
            background-color: #f7fafc;
            padding: 10px;
            border-radius: 4px;
            font-size: 13px;
            color: #4a5568;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">📦</div>
            <h1>Password Reset Request</h1>
          </div>
          
          <div class="content">
            <p>Hello ${userName},</p>
            
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </div>
            
            <p style="font-size: 14px; color: #718096;">Or copy and paste this link in your browser:</p>
            <div class="link-text">${resetLink}</div>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong><br>
              This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
            </div>
            
            <p>If you're having trouble clicking the button, copy and paste the URL above into your web browser.</p>
          </div>
          
          <div class="footer">
            <p>This is an automated email, please do not reply.</p>
            <p>&copy; ${new Date().getFullYear()} Dayflow. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Hello ${userName},

We received a request to reset your password.

To reset your password, click the link below:
${resetLink}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email.

---
This is an automated email, please do not reply.
© ${new Date().getFullYear()} Dayflow. All rights reserved.
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
  const setupLink = `${
    process.env.CLIENT_URL || "http://localhost:5173"
  }/reset-password/${resetToken}`;

  const mailOptions = {
    from: {
      name: "Dayflow HR",
      address: process.env.EMAIL_USER,
    },
    to: to,
    subject: "Welcome to Dayflow - Set Up Your Account",
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
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
          }
          h1 {
            color: #1a202c;
            margin: 0;
            font-size: 24px;
          }
          .content {
            margin: 30px 0;
          }
          .info-box {
            background-color: #f7fafc;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .info-box strong {
            color: #1a202c;
            display: block;
            margin-bottom: 5px;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
          }
          .button:hover {
            background: linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%);
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            font-size: 14px;
            color: #718096;
            text-align: center;
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 14px;
          }
          .link-text {
            word-break: break-all;
            background-color: #f7fafc;
            padding: 10px;
            border-radius: 4px;
            font-size: 13px;
            color: #4a5568;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎉</div>
            <h1>Welcome to Dayflow!</h1>
          </div>
          
          <div class="content">
            <p>Hello ${userName},</p>
            
            <p>Welcome aboard! Your employee account has been created by HR. Below are your account details:</p>
            
            <div class="info-box">
              <strong>Employee ID:</strong>
              <span style="font-size: 16px; color: #667eea; font-weight: 600;">${employeeId}</span>
            </div>
            
            <div class="info-box">
              <strong>Email:</strong>
              <span style="font-size: 14px;">${to}</span>
            </div>
            
            <p>To get started, you need to set up your password. Please click the button below:</p>
            
            <div style="text-align: center;">
              <a href="${setupLink}" class="button">Set Up Password</a>
            </div>
            
            <p style="font-size: 14px; color: #718096;">Or copy and paste this link in your browser:</p>
            <div class="link-text">${setupLink}</div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong><br>
              This link will expire in 7 days. Please set up your password as soon as possible to access your account.
            </div>
            
            <p><strong>Note:</strong> You can use either your Employee ID or Email address to log in to the system.</p>
          </div>
          
          <div class="footer">
            <p>If you have any questions, please contact HR.</p>
            <p>This is an automated email, please do not reply.</p>
            <p>&copy; ${new Date().getFullYear()} Dayflow. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to Dayflow!

Hello ${userName},

Welcome aboard! Your employee account has been created by HR.

Employee ID: ${employeeId}
Email: ${to}

To get started, you need to set up your password. Please click the link below:
${setupLink}

This link will expire in 7 days. Please set up your password as soon as possible.

Note: You can use either your Employee ID or Email address to log in to the system.

If you have any questions, please contact HR.

---
This is an automated email, please do not reply.
© ${new Date().getFullYear()} Dayflow. All rights reserved.
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
