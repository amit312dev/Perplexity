import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.GOOGLE_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const verifySMTPConnection = async () => {
  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('SMTP connection failed:', error.message);
    return false;
  }
};

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!to || !subject) {
      throw new Error('Recipient email and subject are required');
    }

    const mailOptions = {
      from: `"Perplexity" <${process.env.GOOGLE_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error.message);
    throw error;
  }
};

export const sendVerificationEmail = async ({ to, username, verificationLink }) => {
  const subject = 'Verify your account';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${username || 'there'},</h2>
      <p>Thanks for signing up for Perplexity.</p>
      <p>Please verify your account by clicking the button below:</p>
      <a href="${verificationLink}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
        Verify Account
      </a>
      <p>If the button does not work, copy and paste this link into your browser:</p>
      <p>${verificationLink}</p>
    </div>
  `;

  return sendEmail({
    to,
    subject,
    html,
    text: `Verify your account using this link: ${verificationLink}`,
  });
};

export default transporter;
