import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/user.model.js';
import {
  sendVerificationEmail,
  sendEmail,
  verifySMTPConnection,
} from '../services/mail.service.js';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'secretkey', {
    expiresIn: '7d',
  });
};

const generateVerificationToken = (userId, email) => {
  return jwt.sign(
    { id: userId, email, purpose: 'verify-email' },
    process.env.JWT_SECRET || 'secretkey',
    { expiresIn: '1d' }
  );
};

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const verificationToken = generateVerificationToken(newUser._id, newUser.email);
    newUser.verificationToken = verificationToken;
    newUser.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    await newUser.save();

    const backendBaseUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    const verificationLink = `${backendBaseUrl}/api/auth/verify-email?token=${verificationToken}`;

    try {
      await sendVerificationEmail({
        to: newUser.email,
        username: newUser.username,
        verificationLink,
      });
    } catch (emailError) {
      console.error('Verification email failed:', emailError.message);
    }

    const token = generateToken(newUser._id);

    // Set token as cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      token,
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        verified: newUser.verified,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Email Verification</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
              .card { max-width: 520px; margin: auto; padding: 30px; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
              .error { color: #b91c1c; }
              .btn { display: inline-block; margin-top: 16px; padding: 10px 18px; text-decoration: none; background: #2563eb; color: white; border-radius: 8px; }
            </style>
          </head>
          <body>
            <div class="card">
              <h2 class="error">Verification Failed</h2>
              <p>Verification token is required.</p>
            </div>
          </body>
        </html>
      `);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');

    const user = await userModel.findOne({
      _id: decoded.id,
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Email Verification</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
              .card { max-width: 520px; margin: auto; padding: 30px; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
              .error { color: #b91c1c; }
            </style>
          </head>
          <body>
            <div class="card">
              <h2 class="error">Verification Failed</h2>
              <p>Invalid or expired verification token.</p>
            </div>
          </body>
        </html>
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
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .card { max-width: 520px; margin: auto; padding: 30px; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
            .success { color: #166534; }
            .btn { display: inline-block; margin-top: 16px; padding: 10px 18px; text-decoration: none; background: #2563eb; color: white; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2 class="success">Email Verified Successfully</h2>
            <p>Your account has been verified. You can now log in.</p>
            <a class="btn" href="/login">Go to Login</a>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Email Verification</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .card { max-width: 520px; margin: auto; padding: 30px; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
            .error { color: #b91c1c; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2 class="error">Verification Failed</h2>
            <p>${error.message}</p>
          </div>
        </body>
      </html>
    `);
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (!user.verified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in',
      });
    }

    const token = generateToken(user._id);

    // Set token as cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        verified: user.verified,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.verified) {
      return res.status(400).json({
        success: false,
        message: 'User is already verified',
      });
    }

    const verificationToken = generateVerificationToken(user._id, user.email);
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const backendBaseUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    const verificationLink = `${backendBaseUrl}/api/auth/verify-email?token=${verificationToken}`;

    await sendVerificationEmail({
      to: user.email,
      username: user.username,
      verificationLink,
    });

    return res.status(200).json({
      success: true,
      message: 'Verification email sent successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const testEmail = async (req, res) => {
  try {
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({
        success: false,
        message: 'Recipient email is required',
      });
    }

    const smtpStatus = await verifySMTPConnection();

    if (!smtpStatus) {
      return res.status(503).json({
        success: false,
        message: 'SMTP connection failed. Email service is not available.',
      });
    }

    const info = await sendEmail({
      to,
      subject: 'Perplexity SMTP Test Email',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>SMTP Test Successful</h2>
          <p>This is a test email from your Perplexity backend.</p>
        </div>
      `,
      text: 'SMTP test successful. This is a test email from your Perplexity backend.',
    });

    return res.status(200).json({
      success: true,
      message: 'Test email sent successfully',
      messageId: info.messageId,
      smtpConnected: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const mailHealthCheck = async (req, res) => {
  try {
    const smtpStatus = await verifySMTPConnection();

    return res.status(smtpStatus ? 200 : 503).json({
      success: smtpStatus,
      smtpConnected: smtpStatus,
      message: smtpStatus
        ? 'SMTP server is reachable and authenticated.'
        : 'SMTP server is not reachable or authentication failed.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      smtpConnected: false,
      message: error.message,
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
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
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
