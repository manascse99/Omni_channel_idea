const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Sends a reply back to an original email sender, maintaining the thread.
 */
async function sendReply(to, content, subject, originalMessageId) {
  try {
    const mailOptions = {
      from: `"OmniBank AI" <${process.env.GMAIL_USER}>`,
      to,
      subject: subject.startsWith('Re:') ? subject : `Re: ${subject}`,
      text: content,
      // Threading headers
      headers: {
        'In-Reply-To': originalMessageId,
        'References': originalMessageId
      }
    };

    console.log(`[EMAIL] Attempting to send reply to ${to}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] SMTPSuccess: Reply sent to ${to}. MessageId: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[EMAIL] SMTPError: Failed to send reply to ${to}. Error:`, error.message);
    throw error;
  }
}

module.exports = {
  sendReply,
  transporter
};
