const path = require('node:path');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config({ path: path.join(__dirname, '.env') });

async function main() {
  const recipient = process.argv[2] || process.env.SMTP_TEST_TO;
  if (!recipient) {
    throw new Error('Provide a recipient email: node backend/test-smtp.js you@example.com');
  }

  const fromEmail = process.env.EMAIL_FROM || 'sakthifrozenfoods@gmail.com';
  const smtpUser = process.env.SMTP_USER || fromEmail;
  const smtpPassword = process.env.SMTP_PASS;

  if (!smtpPassword) {
    throw new Error('SMTP_PASS is missing. Set your SMTP password/key in backend/.env; a Brevo API key is not an SMTP password.');
  }

  const port = Number.parseInt(process.env.SMTP_PORT || '587', 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('SMTP_PORT must be a valid port number.');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port,
    secure: port === 465,
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
  });

  try {
    const result = await transporter.sendMail({
      from: `"Sakthi Frozen Foods" <${fromEmail}>`,
      to: recipient,
      subject: '[SMTP Test] Sakthi Frozen Foods',
      text: 'This is a test email to confirm that SMTP email sending is working.',
      html: '<p>This is a test email to confirm that SMTP email sending is working.</p>',
    });

    console.log(`Test email sent to ${recipient}. Message ID: ${result.messageId}`);
  } finally {
    transporter.close();
  }
}

main().catch((error) => {
  console.error(`SMTP test failed: ${error.message}`);
  process.exitCode = 1;
});
