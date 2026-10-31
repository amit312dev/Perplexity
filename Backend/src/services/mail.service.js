
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const gmail = google.gmail({
  version: 'v1',
  auth: oauth2Client,
});

// Checks whether the required Gmail API configuration exists.
export const verifySMTPConnection = async () => {
  const isConfigured = Boolean(
    process.env.GOOGLE_USER &&
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN
  );

  if (isConfigured) {
    console.log('Gmail API configuration loaded successfully');
  } else {
    console.error('Gmail API configuration is incomplete');
  }

  return isConfigured;
};

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!to || !subject) {
      throw new Error('Recipient email and subject are required');
    }

    const from = process.env.GOOGLE_USER;

    if (!from) {
      throw new Error('GOOGLE_USER is missing from environment variables');
    }

    const boundary = `boundary_${Date.now()}`;

    const encodeBase64 = (value) =>
      Buffer.from(value || '', 'utf8').toString('base64');

    const encodedSubject = `=?UTF-8?B?${encodeBase64(subject)}?=`;

    const message = [
      `From: "Perplexity" <${from}>`,
      `To: ${to}`,
      `Subject: ${encodedSubject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      encodeBase64(text || ''),
      `--${boundary}`,
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      encodeBase64(html || text || ''),
      `--${boundary}--`,
    ].join('\r\n');

    const raw = Buffer.from(message, 'utf8')
      .toString('base64url');

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw },
    });

    console.log('Email sent successfully:', response.data.id);

    return response.data;
  } catch (error) {
    console.error(
      'Email sending failed:',
      error.response?.data || error.message
    );

    throw error;
  }
};

export const sendVerificationEmail = async ({
  to,
  username,
  verificationLink,
}) => {
  const subject = 'Verify your account';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${username || 'there'},</h2>
      <p>Thanks for signing up for Perplexity.</p>
      <p>Please verify your account by clicking the button below:</p>
      <a href="${verificationLink}"
         style="display: inline-block; background: #2563eb; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
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

export default gmail;
