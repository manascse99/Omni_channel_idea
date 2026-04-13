const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

console.log('--- SMTP DIAGNOSTIC ---');
console.log('User:', process.env.GMAIL_USER);
console.log('Pass Length:', process.env.GMAIL_APP_PASSWORD ? process.env.GMAIL_APP_PASSWORD.length : 0);

async function testConnection() {
  try {
    console.log('Verifying connection...');
    await transporter.verify();
    console.log('SUCCESS: SMTP connection is valid!');
    
    console.log('Attempting to send test email to ' + process.env.GMAIL_USER + '...');
    const info = await transporter.sendMail({
      from: `"OmniBank Diagnostic" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: 'SMTP Connection Test',
      text: 'If you receive this, your Gmail SMTP configuration is WORKING properly.'
    });
    console.log('SUCCESS: Test email sent! MessageId:', info.messageId);
  } catch (err) {
    console.error('FAILURE: SMTP Error occurred:');
    console.error(err);
  }
}

testConnection();
