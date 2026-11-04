const COMPANY_NAME = 'Sakthi Frozen Foods';
const COMPANY_PHONE = '+91 80563 89214';

export function buildOtpEmailHtml(userName: string, otp: string): string {
  const logoUrl = 'https://buy.tnmockmeat.com/logo.png';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign-In Verification Code</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F6F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1E201D;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6F0;">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background-color:#FFFFFF;border-radius:20px;overflow:hidden;border:1px solid #D4DBC9;box-shadow:0 8px 30px rgba(80,86,61,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background-color:#50563D;padding:26px 24px;text-align:center;">
              <img src="${logoUrl}" alt="${COMPANY_NAME}" style="height:48px;width:auto;margin-bottom:8px;display:inline-block;" />
              <h1 style="margin:0;color:#FFFFFF;font-size:20px;font-weight:800;letter-spacing:-0.5px;">${COMPANY_NAME}</h1>
              <p style="margin:4px 0 0;color:#EAF0E5;font-size:11px;letter-spacing:1px;text-transform:uppercase;font-weight:600;">Secure Passwordless Sign-In</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px 28px 24px;text-align:center;background:#FFFFFF;">
              <h2 style="margin:0 0 10px;font-size:20px;font-weight:800;color:#1E201D;letter-spacing:-0.3px;">Your One-Time Verification Code</h2>
              <p style="margin:0 0 20px;font-size:14px;color:#555E51;line-height:1.5;">
                Hello <strong>${userName || 'Valued Customer'}</strong>, enter the 6-digit code below to securely sign in to your Sakthi Frozen Foods account:
              </p>

              <!-- OTP Box -->
              <div style="margin:20px auto;display:inline-block;background:#F5F8F2;border:2px dashed #50563D;border-radius:14px;padding:16px 36px;">
                <span style="font-size:34px;font-weight:800;color:#50563D;letter-spacing:10px;font-family:'Courier New',Courier,monospace;">${otp}</span>
              </div>

              <p style="margin:18px 0 0;font-size:12px;color:#656B4F;line-height:1.5;">
                ⏱️ This code is valid for <strong>10 minutes</strong>. Never share this code with anyone.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#F5F8F2;padding:16px 24px;border-top:1px solid #E3E9DC;text-align:center;">
              <p style="margin:0;font-size:11px;color:#656B4F;font-weight:500;">
                ${COMPANY_NAME} • Pure Plant-Based Mock Meats • Helpline: ${COMPANY_PHONE}
              </p>
              <p style="margin:4px 0 0;font-size:10px;color:#9AA290;">
                If you did not request this verification code, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendOtpEmailDirect(email: string, userName: string, otp: string): Promise<{ success: boolean; error?: string }> {
  const fromEmail = process.env.EMAIL_FROM || 'sakthifrozenfoods@gmail.com';
  const html = buildOtpEmailHtml(userName, otp);
  const subject = `${otp} is your Sakthi Frozen Foods verification code`;
  const text = `Your Sakthi Frozen Foods verification code is: ${otp}. Valid for 10 minutes. Do not share this with anyone.`;

  // 1. Try Brevo HTTP API (Fastest and most reliable for Vercel/Serverless)
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (brevoApiKey) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoApiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: COMPANY_NAME, email: fromEmail },
          to: [{ email }],
          subject,
          htmlContent: html,
          textContent: text,
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        return { success: true };
      }
      const errText = await response.text();
      console.warn('Brevo API send failed, trying SMTP fallback:', errText);
    } catch (err: any) {
      console.warn('Brevo API network error, trying SMTP fallback:', err.message);
    }
  }

  // 2. Fallback to Nodemailer SMTP (if nodemailer is installed)
  const smtpPass = process.env.SMTP_PASS || brevoApiKey;
  if (smtpPass) {
    try {
      let nodemailerModule: any;
      try {
        nodemailerModule = require('nodemailer');
      } catch {
        // nodemailer not installed in root Next.js app
      }

      if (nodemailerModule) {
        const transporter = nodemailerModule.createTransport({
          host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: false,
          auth: {
            user: process.env.SMTP_USER || fromEmail,
            pass: smtpPass,
          },
          connectionTimeout: 10000,
        });

        await transporter.sendMail({
          from: `"${COMPANY_NAME}" <${fromEmail}>`,
          to: email,
          subject,
          text,
          html,
        });

        return { success: true };
      }
    } catch (smtpErr: any) {
      console.error('SMTP send error:', smtpErr);
      return { success: false, error: smtpErr.message };
    }
  }

  return { success: false, error: 'No email service credentials configured or delivery failed.' };
}

