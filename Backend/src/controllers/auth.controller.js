
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/user.model.js';

import {
  sendVerificationEmail,
  sendEmail,
  verifySMTPConnection,
} from '../services/mail.service.js';

// Generate authentication token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'secretkey',
    { expiresIn: '7d' }
  );
};

// Generate email verification token
const generateVerificationToken = (userId, email) => {
  return jwt.sign(
    {
      id: userId,
      email,
      purpose: 'verify-email',
    },
    process.env.JWT_SECRET || 'secretkey',
    { expiresIn: '1d' }
  );
};

// Create verification link
const createVerificationLink = (token) => {
  const backendBaseUrl =
    process.env.BACKEND_URL || 'http://localhost:3000';

  return `${backendBaseUrl}/api/auth/verify-email?token=${token}`;
};

// Register user
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields.',
      });
    }

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.',
      });
    }

    const existingUser = await userModel.findOne({
      $or: [
        { email: normalizedEmail },
        { username: normalizedUsername },
      ],
    });

    if (existingUser) {
      const message =
        existingUser.email === normalizedEmail
          ? 'This email address is already registered.'
          : 'This username is already taken.';

      return res.status(409).json({
        success: false,
        message,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
    });

    await newUser.save();

    const verificationToken = generateVerificationToken(
      newUser._id,
      newUser.email
    );

    newUser.verificationToken = verificationToken;
    newUser.verificationTokenExpires =
      Date.now() + 24 * 60 * 60 * 1000;

    await newUser.save();

    const verificationLink = createVerificationLink(
      verificationToken
    );

    try {
      await sendVerificationEmail({
        to: newUser.email,
        username: newUser.username,
        verificationLink,
      });
    } catch (emailError) {
      console.error(
        'Verification email failed:',
        emailError.response?.data || emailError.message
      );

      return res.status(503).json({
        success: false,
        accountCreated: true,
        message:
          'Your account was created, but the verification email could not be sent. Please try resending the verification email.',
      });
    }

    return res.status(201).json({
      success: true,
      message:
        'Registration successful! Please check your email and verify your account.',
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        verified: newUser.verified,
      },
    });

  } catch (error) {
    console.error('Registration error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This email or username is already registered.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Unable to register your account. Please try again.',
    });
  }
};

// Verify email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const frontendUrl =
      process.env.FRONTEND_URL || 'http://localhost:5173';

    if (!token) {
      return res.status(400).send(`
        <h2>Email Verification Failed</h2>
        <p>Verification token is required.</p>
      `);
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secretkey'
    );

    if (decoded.purpose !== 'verify-email') {
      return res.status(400).send('Invalid verification token.');
    }

    const user = await userModel.findOne({
      _id: decoded.id,
      email: decoded.email,
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send(`
        <h2>Verification Failed</h2>
        <p>Invalid or expired verification token.</p>
      `);
    }

    user.verified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;

    await user.save();

    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Email Verification</title>
        </head>
        <body style="font-family:Arial;text-align:center;padding:50px;background:#f5f5f5;">
          <div style="max-width:520px;margin:auto;padding:30px;background:white;border-radius:12px;">
            <h2 style="color:#166534;">Email Verified Successfully</h2>
            <p>Your account has been verified. You can now log in.</p>
            <a href="${frontendUrl}/login"
              style="display:inline-block;margin-top:16px;padding:10px 18px;text-decoration:none;background:#2563eb;color:white;border-radius:8px;">
              Go to Login
            </a>
          </div>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('Email verification error:', error.message);

    const frontendUrl =
      process.env.FRONTEND_URL || 'http://localhost:5173';

    return res.status(400).send(`
      <h2>Verification Failed</h2>
      <p>Your verification link is invalid or has expired.</p>
      <a href="${frontendUrl}/login">Go to Login</a>
    `);
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await userModel.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.verified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in.',
      });
    }

    const token = generateToken(user._id);

    // Local and production cookie configuration
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('authToken', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        verified: user.verified,
      },
    });

  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to login. Please try again.',
    });
  }
};

// Log out user
export const logoutUser = (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.clearCookie('authToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });

  return res.status(200).json({
    success: true,
    message: 'Logout successful.',
  });
};

// Resend verification email
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await userModel.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (user.verified) {
      return res.status(400).json({
        success: false,
        message: 'This account is already verified.',
      });
    }

    const verificationToken = generateVerificationToken(
      user._id,
      user.email
    );

    user.verificationToken = verificationToken;
    user.verificationTokenExpires =
      Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    const verificationLink = createVerificationLink(
      verificationToken
    );

    await sendVerificationEmail({
      to: user.email,
      username: user.username,
      verificationLink,
    });

    return res.status(200).json({
      success: true,
      message: 'Verification email sent successfully.',
    });

  } catch (error) {
    console.error('Resend verification error:', error);

    return res.status(500).json({
      success: false,
      message:
        'Unable to send verification email. Please try again later.',
    });
  }
};

// Test email
export const testEmail = async (req, res) => {
  try {
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({
        success: false,
        message: 'Recipient email is required.',
      });
    }

    const emailServiceReady = await verifySMTPConnection();

    if (!emailServiceReady) {
      return res.status(503).json({
        success: false,
        message: 'Gmail API configuration is incomplete.',
      });
    }

    const info = await sendEmail({
      to,
      subject: 'Perplexity Gmail API Test Email',
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;">
          <h2>Gmail API Test Successful</h2>
          <p>This is a test email from your Perplexity backend.</p>
        </div>
      `,
      text:
        'Gmail API test successful. This is a test email from your Perplexity backend.',
    });

    return res.status(200).json({
      success: true,
      message: 'Test email sent successfully.',
      messageId: info.id,
      emailServiceConnected: true,
    });

  } catch (error) {
    console.error('Test email error:', error);

    return res.status(500).json({
      success: false,
      message:
        error.response?.data?.error?.message ||
        error.message ||
        'Unable to send test email.',
    });
  }
};

// Email service health check
export const mailHealthCheck = async (req, res) => {
  try {
    const emailServiceReady = await verifySMTPConnection();

    return res.status(emailServiceReady ? 200 : 503).json({
      success: emailServiceReady,
      emailServiceConnected: emailServiceReady,
      message: emailServiceReady
        ? 'Gmail API configuration is available.'
        : 'Gmail API configuration is incomplete.',
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      emailServiceConnected: false,
      message: error.message,
    });
  }
};

// Get logged-in user
export const getMe = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);

    if (!user) {
      res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite:
          process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
      });

      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        verified: user.verified,
      },
    });

  } catch (error) {
    console.error('Get user error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve user information.',
    });
  }
};
