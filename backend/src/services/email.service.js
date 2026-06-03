const logger = require('../utils/logger');

/**
 * Create a Nodemailer transporter.
 * In production, set SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS in .env
 * For development you can use Mailtrap, Ethereal, or leave unset (logs to console).
 */
let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  // Only require nodemailer when actually needed (lazy load)
  let nodemailer;
  try {
    nodemailer = require('nodemailer');
  } catch {
    logger.warn('nodemailer is not installed — email sending is disabled. Run: npm i nodemailer');
    return null;
  }

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    logger.info(`Email transporter configured via ${process.env.SMTP_HOST}`);
  } else {
    // Ethereal test account for dev
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    logger.info('Using Ethereal test email — check https://ethereal.email');
  }

  return transporter;
}

/**
 * Send a password-reset email with a tokenized link.
 * @param {string} to        — recipient email
 * @param {string} resetUrl  — full URL the user clicks to reset
 */
async function sendPasswordResetEmail(to, resetUrl) {
  const transport = await getTransporter();

  if (!transport) {
    // Fallback: log the reset URL so dev can still test
    logger.info(`[DEV] Password reset link for ${to}: ${resetUrl}`);
    return;
  }

  const mailOptions = {
    from: process.env.FROM_EMAIL || '"CareerLens" <noreply@careerlens.ai>',
    to,
    subject: 'CareerLens — Reset Your Password',
    html: `
      <div style="max-width:520px;margin:0 auto;font-family:'Inter',Arial,sans-serif;background:#0F0F1A;padding:40px;border-radius:12px;border:1px solid rgba(108,92,231,0.25);">
        <div style="text-align:center;margin-bottom:32px;">
          <div style="display:inline-block;width:48px;height:48px;border-radius:10px;background:linear-gradient(135deg,#6C5CE7,#4834D4);line-height:48px;color:#fff;font-weight:800;font-size:1.4rem;">C</div>
          <h2 style="color:#e5e0ed;margin:12px 0 4px;">Password Reset</h2>
          <p style="color:#928ea0;font-size:0.9rem;">You requested to reset your CareerLens password.</p>
        </div>
        <div style="text-align:center;margin-bottom:32px;">
          <a href="${resetUrl}" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#6C5CE7,#4834D4);color:#fff;border-radius:8px;font-weight:600;text-decoration:none;font-size:1rem;">
            Reset Password
          </a>
        </div>
        <p style="color:#928ea0;font-size:0.82rem;text-align:center;line-height:1.6;">
          This link expires in <strong style="color:#c6bfff;">15 minutes</strong>.<br/>
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  try {
    const info = await transport.sendMail(mailOptions);
    logger.info(`Reset email sent to ${to} — messageId: ${info.messageId}`);

    // If using Ethereal, log the preview URL
    const nodemailer = require('nodemailer');
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.info(`Preview URL: ${previewUrl}`);
    }
  } catch (error) {
    logger.error('Failed to send reset email', error);
    throw new Error('Email could not be sent');
  }
}

module.exports = { sendPasswordResetEmail };
