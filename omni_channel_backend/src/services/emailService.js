const nodemailer = require('nodemailer');

// Create a transporter using Gmail + App Password (No SMS needed, free & scalable)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,       // Your Gmail address e.g. manas@gmail.com
    pass: process.env.GMAIL_APP_PASSWORD // 16-char App Password from Google Account > Security
  }
});

/**
 * Sends a 6-digit OTP to the provided email address.
 * @param {string} email - recipient's email
 * @param {string} otp   - the 6-digit OTP code
 */
async function sendOtpEmail(email, otp) {
  const mailOptions = {
    from: `"OMNI Bank AI" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Your OmniBank Login OTP',
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 540px; margin: auto; padding: 40px; background: #f9fafb; border-radius: 16px;">
        <div style="background: #0F2F55; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: #00CCA3; font-size: 22px; margin: 0; letter-spacing: -0.5px;">OMNI Bank AI</h1>
          <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 4px 0 0 0;">Secure Agent Authentication</p>
        </div>
        <h2 style="color: #0F2F55; font-size: 18px;">Your One-Time Password</h2>
        <p style="color: #6b7280; font-size: 14px;">Use this OTP to sign in to your OMNI workspace. It expires in <strong>5 minutes</strong>.</p>
        <div style="background: white; border: 2px solid #00CCA3; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; letter-spacing: 12px;">
          <span style="font-size: 36px; font-weight: 900; color: #0F2F55;">${otp}</span>
        </div>
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">If you did not request this, please ignore this email. Never share your OTP.</p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendOtpEmail };
