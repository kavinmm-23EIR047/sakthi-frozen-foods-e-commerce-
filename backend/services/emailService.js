const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { generateInvoicePdf, numberToWords } = require('./pdfService');

// ─── Environment-aware URLs & Company Metadata ───────────────────────────────
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://buy.tnmockmeat.com';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const WEBSITE_URL = 'buy.tnmockmeat.com';
const COMPANY_NAME = 'Sakthi Frozen Foods';
const COMPANY_TAGLINE = '100% Plant-Based Meat & Vegan Delicacies';
const COMPANY_EMAIL = process.env.EMAIL_FROM || 'sakthifrozenfoods@gmail.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || 'sakthifrozenfoods@gmail.com';
const COMPANY_PHONE = '+91 80563 89214';
const COMPANY_ADDRESS = 'peons colony, Kalpana Theatre, opposite Edayarpalayam - Koundampalayam Road, Koundampalayam, Coimbatore, Tamil Nadu 641030';
const FSSAI_LIC_NO = '12421008000456';
const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/MC1p5twNCxzqwZ659';
const WHATSAPP_PHONE = '918056389214';

function getInvoiceToken(order) {
  try {
    return jwt.sign(
      {
        orderId: (order._id || order.id || '').toString(),
        email: order.customerEmail,
      },
      process.env.JWT_SECRET || 'sakthi_jwt_secret',
      { expiresIn: '90d' }
    );
  } catch (e) {
    return '';
  }
}

// ─── Company Logo URL (Lightweight, never base64 in emails to prevent Gmail clipping) ───
function getCompanyLogo() {
  return `${FRONTEND_URL}/logo.png`;
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// ─── Nodemailer Transporter ──────────────────────────────────────────────────
function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_FROM || 'sakthifrozenfoods@gmail.com',
      pass: process.env.SMTP_PASS || process.env.BREVO_API_KEY || '',
    },
  });
}

// ─── Unified Multi-Provider Email Dispatcher ────────────────────────────────
async function sendMail({ to, subject, html, text, attachments = [] }) {
  const textContent = text || stripHtml(html);
  const fromEmail = process.env.EMAIL_FROM || 'sakthifrozenfoods@gmail.com';
  let lastError = null;

  // Normalize attachments
  const normalizedAttachments = (attachments || []).map((att) => {
    let base64Content = '';
    let bufferContent = null;
    if (Buffer.isBuffer(att.content)) {
      bufferContent = att.content;
      base64Content = att.content.toString('base64');
    } else if (typeof att.content === 'string') {
      base64Content = att.content;
      bufferContent = Buffer.from(att.content, 'base64');
    }
    return {
      filename: att.filename || att.name || 'Invoice.pdf',
      name: att.filename || att.name || 'Invoice.pdf',
      content: bufferContent,
      base64: base64Content,
      contentType: att.contentType || 'application/pdf',
    };
  });

  // 1. Try Brevo HTTP API first (if API Key provided)
  if (process.env.BREVO_API_KEY) {
    try {
      const brevoAttachments = normalizedAttachments.map((a) => ({
        name: a.name,
        content: a.base64,
      }));

      const bodyPayload = {
        sender: { name: COMPANY_NAME, email: fromEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent,
        ...(brevoAttachments.length > 0 ? { attachment: brevoAttachments } : {}),
      };

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
        signal: AbortSignal.timeout(15000),
      });

      if (response.ok) {
        return { success: true, provider: 'brevo-api' };
      }
      const errText = await response.text();
      lastError = new Error(`Brevo API status ${response.status}: ${errText}`);
      console.warn('Brevo API send failed, falling back to SMTP:', lastError.message);
    } catch (err) {
      lastError = err;
      console.warn('Brevo API network error, falling back to SMTP:', err.message);
    }
  }

  // 2. Fallback to Nodemailer (Brevo SMTP or custom SMTP)
  if (process.env.SMTP_PASS || process.env.BREVO_API_KEY || process.env.SMTP_HOST) {
    try {
      const transporter = getTransporter();
      const nodemailerAttachments = normalizedAttachments.map((a) => ({
        filename: a.filename,
        content: a.content || Buffer.from(a.base64, 'base64'),
        contentType: a.contentType,
      }));

      await transporter.sendMail({
        from: `"${COMPANY_NAME}" <${fromEmail}>`,
        to,
        subject,
        html,
        text: textContent,
        ...(nodemailerAttachments.length > 0 ? { attachments: nodemailerAttachments } : {}),
      });
      return { success: true, provider: 'nodemailer-smtp' };
    } catch (err) {
      lastError = err;
      console.warn('Nodemailer SMTP send failed:', err.message);
    }
  }

  // 3. Fallback to Resend API
  if (process.env.RESEND_API_KEY) {
    try {
      const resendAttachments = normalizedAttachments.map((a) => ({
        filename: a.filename,
        content: a.base64,
      }));

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `"${COMPANY_NAME}" <${fromEmail}>`,
          to: [to],
          subject,
          html,
          text: textContent,
          ...(resendAttachments.length > 0 ? { attachments: resendAttachments } : {}),
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (response.ok) {
        return { success: true, provider: 'resend-api' };
      }
      const errText = await response.text();
      lastError = new Error(`Resend API status ${response.status}: ${errText}`);
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError) throw lastError;
  throw new Error('No email provider credentials configured (BREVO_API_KEY, SMTP_PASS, or RESEND_API_KEY).');
}

// ─── 1. OFFICIAL WEB INVOICE HTML (PRINTABLE & BROWSER VIEW) ──────────────────
// Styled with Olive Green (#656B4F), White Cards, Box-based layout, and Times New Roman font
function buildInvoiceHtml(order) {
  const logoSrc = getCompanyLogo();
  const formattedDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const subtotal = order.subtotal ?? (order.totalAmount - (order.deliveryFee || 0) - (order.convenienceFee || 0));
  const deliveryFee = order.deliveryFee || 0;
  const isPaid = order.paymentStatus === 'Paid';

  const itemRows = (order.items || []).map((item, idx) => `
    <tr style="border-bottom:1px solid #D4DBC9;${idx % 2 === 1 ? 'background-color:#FBFDF9;' : 'background-color:#FFFFFF;'}">
      <td style="padding:12px 10px;font-size:13px;font-weight:700;color:#50563D;text-align:center;border-right:1px solid #D4DBC9;">${idx + 1}</td>
      <td style="padding:12px 14px;font-size:14px;font-weight:700;color:#1E201D;border-right:1px solid #D4DBC9;">
        ${item.name}
        <span style="display:block;font-size:12px;font-weight:400;color:#656B4F;font-style:italic;margin-top:2px;">100% Pure Veg Meat Alternative</span>
      </td>
      <td style="padding:12px 10px;font-size:13px;font-weight:700;color:#50563D;text-align:center;border-right:1px solid #D4DBC9;">${item.weight || '1 KG'}</td>
      <td style="padding:12px 10px;font-size:14px;font-weight:700;color:#1E201D;text-align:center;border-right:1px solid #D4DBC9;">${item.quantity}</td>
      <td style="padding:12px 14px;font-size:13px;color:#1E201D;text-align:right;border-right:1px solid #D4DBC9;">₹${Number(item.price).toFixed(2)}</td>
      <td style="padding:12px 14px;font-size:14px;font-weight:700;color:#50563D;text-align:right;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tax Invoice - ${order.orderNumber} - ${COMPANY_NAME}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Times New Roman', Times, Baskerville, Georgia, serif;
    background-color: #F4F6F0;
    color: #1E201D;
    padding: 28px 12px;
    line-height: 1.5;
  }
  .invoice-card {
    max-width: 860px;
    margin: 0 auto;
    background: #FFFFFF;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(101, 107, 79, 0.08);
    border: 1px solid #D4DBC9;
    overflow: hidden;
  }
  @media print {
    body { background: #FFFFFF !important; padding: 0 !important; }
    .invoice-card { box-shadow: none !important; border: none !important; max-width: 100% !important; border-radius: 0 !important; }
    .no-print { display: none !important; }
  }
</style>
</head>
<body>

<div class="invoice-card">
  <!-- Top Action Toolbar (Hidden in Print) -->
  <div class="no-print" style="background:#50563D;padding:14px 28px;display:flex;justify-content:space-between;align-items:center;color:#FFFFFF;">
    <div style="font-size:14px;font-weight:700;letter-spacing:0.5px;display:flex;align-items:center;gap:8px;">
      <span style="color:#C6D8A8;">●</span> Commercial Tax Invoice • #${order.orderNumber}
    </div>
    <div style="display:flex;gap:10px;">
      <button onclick="window.print()" style="background:#656B4F;color:#FFFFFF;border:1px solid #848C6B;padding:8px 20px;border-radius:6px;font-size:13px;font-weight:700;font-family:'Times New Roman',serif;cursor:pointer;">
        🖨️ Print / Save as PDF
      </button>
    </div>
  </div>

  <div style="padding:36px 40px;background:#FFFFFF;">
    <!-- 1. Header Box Section -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:2px solid #656B4F;padding-bottom:24px;margin-bottom:28px;">
      <tr>
        <td valign="top" style="width:58%;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td valign="top" style="padding-right:18px;">
                <img src="${logoSrc}" alt="${COMPANY_NAME}" style="height:68px;width:auto;max-width:160px;object-fit:contain;" />
              </td>
              <td valign="top">
                <h1 style="margin:0;font-size:22px;font-weight:700;color:#50563D;letter-spacing:0.2px;line-height:1.2;">${COMPANY_NAME}</h1>
                <p style="margin:4px 0 0;font-size:12px;font-weight:700;color:#656B4F;text-transform:uppercase;letter-spacing:0.5px;">${COMPANY_TAGLINE}</p>
                <p style="margin:5px 0 0;font-size:12px;color:#555E51;line-height:1.4;">${COMPANY_ADDRESS}</p>
                <p style="margin:3px 0 0;font-size:12px;color:#555E51;">Phone: <strong>${COMPANY_PHONE}</strong> | Email: <strong>${COMPANY_EMAIL}</strong></p>
                <p style="margin:3px 0 0;font-size:11px;font-weight:700;color:#656B4F;">Website: <strong>${WEBSITE_URL}</strong> | FSSAI Central Lic. No: ${FSSAI_LIC_NO}</p>
              </td>
            </tr>
          </table>
        </td>

        <td valign="top" align="right" style="width:42%;">
          <h2 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#50563D;letter-spacing:1px;">TAX INVOICE</h2>
          <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1.5px solid #656B4F;border-radius:8px;overflow:hidden;width:100%;max-width:280px;text-align:center;">
            <tr style="background-color:#EAF0E5;border-bottom:1px solid #656B4F;">
              <th style="padding:7px 8px;font-size:11px;font-weight:700;color:#50563D;text-transform:uppercase;border-right:1px solid #656B4F;">INVOICE #</th>
              <th style="padding:7px 8px;font-size:11px;font-weight:700;color:#50563D;text-transform:uppercase;">DATE</th>
            </tr>
            <tr style="background:#FFFFFF;border-bottom:1px solid #656B4F;">
              <td style="padding:8px 8px;font-size:13px;font-weight:700;color:#1E201D;font-family:monospace;border-right:1px solid #656B4F;">${order.orderNumber}</td>
              <td style="padding:8px 8px;font-size:13px;font-weight:700;color:#1E201D;">${formattedDate}</td>
            </tr>
            <tr style="background-color:#EAF0E5;border-bottom:1px solid #656B4F;">
              <th style="padding:7px 8px;font-size:11px;font-weight:700;color:#50563D;text-transform:uppercase;border-right:1px solid #656B4F;">PAYMENT METHOD</th>
              <th style="padding:7px 8px;font-size:11px;font-weight:700;color:#50563D;text-transform:uppercase;">STATUS</th>
            </tr>
            <tr style="background:#FFFFFF;">
              <td style="padding:8px 8px;font-size:12px;font-weight:700;color:#1E201D;border-right:1px solid #656B4F;">${order.paymentMethod || 'Online'}</td>
              <td style="padding:8px 8px;font-size:12px;font-weight:700;color:${isPaid ? '#2E6930' : '#B45309'};">
                ${isPaid ? 'PAID (Verified)' : 'PENDING'}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- 2. Box-Based Billed To & Shipped To Cards -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td width="48%" valign="top" style="border:1.5px solid #D4DBC9;border-radius:10px;overflow:hidden;background:#FFFFFF;">
          <div style="background-color:#EAF0E5;padding:9px 16px;border-bottom:1.5px solid #D4DBC9;">
            <span style="font-size:12px;font-weight:700;color:#50563D;text-transform:uppercase;letter-spacing:0.8px;">BILLED TO (BUYER DETAILS)</span>
          </div>
          <div style="padding:16px 18px;font-size:13px;line-height:1.5;color:#2D3823;">
            <p style="margin:0 0 3px;font-size:15px;font-weight:700;color:#1E201D;">${order.customerName}</p>
            <p style="margin:0 0 3px;color:#555E51;">Email: <strong>${order.customerEmail}</strong></p>
            <p style="margin:0 0 3px;color:#555E51;">Phone: <strong>+91 ${order.customerPhone}</strong></p>
            <p style="margin:4px 0 0;color:#555E51;">Address: ${order.shippingAddress}</p>
          </div>
        </td>

        <td width="4%"></td>

        <td width="48%" valign="top" style="border:1.5px solid #D4DBC9;border-radius:10px;overflow:hidden;background:#FFFFFF;">
          <div style="background-color:#EAF0E5;padding:9px 16px;border-bottom:1.5px solid #D4DBC9;">
            <span style="font-size:12px;font-weight:700;color:#50563D;text-transform:uppercase;letter-spacing:0.8px;">SHIPPED TO (DELIVERY ADDRESS)</span>
          </div>
          <div style="padding:16px 18px;font-size:13px;line-height:1.5;color:#2D3823;">
            <p style="margin:0 0 3px;font-size:15px;font-weight:700;color:#1E201D;">${order.customerName}</p>
            <p style="margin:0 0 3px;color:#555E51;">Address: ${order.shippingAddress}</p>
            ${order.landmark ? `<p style="margin:0 0 3px;color:#555E51;">Landmark: <strong>${order.landmark}</strong></p>` : ''}
            <p style="margin:0 0 3px;color:#555E51;">${[order.city, order.district, order.state].filter(Boolean).join(', ')}${order.pincode ? ' - ' + order.pincode : ''}</p>
            <p style="margin:4px 0 0;color:#555E51;">Contact Phone: <strong>+91 ${order.customerPhone}</strong></p>
          </div>
        </td>
      </tr>
    </table>

    <!-- 3. Items Box Table -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #656B4F;border-radius:10px;overflow:hidden;border-collapse:collapse;margin-bottom:24px;">
      <thead>
        <tr style="background-color:#656B4F;color:#FFFFFF;text-align:left;">
          <th style="padding:11px 12px;font-size:12px;font-weight:700;text-transform:uppercase;width:40px;text-align:center;border-right:1px solid #7E8566;">#</th>
          <th style="padding:11px 14px;font-size:12px;font-weight:700;text-transform:uppercase;border-right:1px solid #7E8566;">DESCRIPTION OF GOODS</th>
          <th style="padding:11px 12px;font-size:12px;font-weight:700;text-transform:uppercase;text-align:center;width:95px;border-right:1px solid #7E8566;">PACK SIZE</th>
          <th style="padding:11px 12px;font-size:12px;font-weight:700;text-transform:uppercase;text-align:center;width:60px;border-right:1px solid #7E8566;">QTY</th>
          <th style="padding:11px 14px;font-size:12px;font-weight:700;text-transform:uppercase;text-align:right;width:105px;border-right:1px solid #7E8566;">UNIT PRICE</th>
          <th style="padding:11px 14px;font-size:12px;font-weight:700;text-transform:uppercase;text-align:right;width:115px;">AMOUNT</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <!-- 4. Financial Summary & Amount in Words -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td width="55%" valign="top" style="padding-right:24px;">
          <div style="background-color:#F8FAF5;border:1.5px dashed #656B4F;border-radius:10px;padding:16px 20px;margin-bottom:16px;">
            <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#50563D;text-transform:uppercase;letter-spacing:0.5px;">Amount in Words:</p>
            <p style="margin:0;font-size:14px;font-weight:700;color:#1E201D;font-style:italic;">Indian Rupees ${numberToWords(order.totalAmount)} Only</p>
          </div>

          <div style="background-color:#FAFCF8;border:1px solid #D4DBC9;border-radius:10px;padding:14px 18px;font-size:12px;color:#50563D;line-height:1.5;">
            <p style="margin:0 0 4px;font-weight:700;color:#50563D;">Cold Storage & Handling Instructions:</p>
            <p style="margin:0;color:#555E51;">Store immediately at <strong>-18°C</strong> upon receipt. Keep tightly sealed in frozen food packaging until cooking. Do not refreeze thawed items.</p>
          </div>
        </td>

        <td width="45%" valign="top">
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #D4DBC9;border-radius:10px;overflow:hidden;border-collapse:collapse;background:#FFFFFF;">
            <tr>
              <td style="padding:9px 16px;font-size:13px;color:#555E51;border-bottom:1px solid #E4E9DC;">Subtotal</td>
              <td style="padding:9px 16px;font-size:13px;color:#1E201D;text-align:right;font-weight:700;border-bottom:1px solid #E4E9DC;">₹${Number(subtotal).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding:9px 16px;font-size:13px;color:#555E51;border-bottom:1px solid #E4E9DC;">Cold Chain Delivery</td>
              <td style="padding:9px 16px;font-size:13px;color:#1E201D;text-align:right;font-weight:700;border-bottom:1px solid #E4E9DC;">${deliveryFee === 0 ? 'FREE' : `₹${Number(deliveryFee).toFixed(2)}`}</td>
            </tr>
            ${order.convenienceFee ? `
            <tr>
              <td style="padding:9px 16px;font-size:13px;color:#555E51;border-bottom:1px solid #E4E9DC;">Convenience Fee (2.5%)</td>
              <td style="padding:9px 16px;font-size:13px;color:#1E201D;text-align:right;font-weight:700;border-bottom:1px solid #E4E9DC;">₹${Number(order.convenienceFee).toFixed(2)}</td>
            </tr>` : ''}
            <tr style="background-color:#EAF0E5;">
              <td style="padding:14px 16px;font-size:16px;font-weight:700;color:#50563D;border-top:2px solid #656B4F;">TOTAL AMOUNT</td>
              <td style="padding:14px 16px;font-size:19px;font-weight:700;color:#50563D;text-align:right;border-top:2px solid #656B4F;">₹${Number(order.totalAmount).toFixed(2)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- 5. Footer -->
    <div style="border-top:1.5px solid #D4DBC9;padding-top:18px;display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#656B4F;">
      <div>
        <p style="margin:0;font-weight:700;color:#50563D;font-style:italic;">Thank you for choosing ${COMPANY_NAME}!</p>
        <p style="margin:3px 0 0;color:#555E51;">Customer Helpline: <strong>${COMPANY_PHONE}</strong> | Email: <strong>${COMPANY_EMAIL}</strong></p>
      </div>
      <div style="text-align:right;">
        <p style="margin:0;font-family:monospace;font-size:11px;">Ref: ${order._id || order.id}</p>
        <p style="margin:3px 0 0;color:#555E51;">Computer Generated Tax Invoice</p>
      </div>
    </div>
  </div>
</div>

</body>
</html>`;
}

// ─── 2. USER ORDER CONFIRMATION & INVOICE EMAIL TEMPLATE ────────────────────
// Styled with Olive Green (#656B4F), White Cards, Box-based layout, and Times New Roman font
function buildUserOrderEmail(order) {
  const logoSrc = getCompanyLogo();
  const formattedDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const invoiceToken = getInvoiceToken(order);
  const invoiceUrl = `${FRONTEND_URL}/api/orders/${order._id || order.id}/invoice${invoiceToken ? `?token=${invoiceToken}` : ''}`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(`Hi Sakthi Frozen Foods, I have a question regarding my Order #${order.orderNumber}.`)}`;
  const subtotal = order.subtotal ?? (order.totalAmount - (order.deliveryFee || 0) - (order.convenienceFee || 0));
  const deliveryFee = order.deliveryFee || 0;
  const isPaid = order.paymentStatus === 'Paid';

  const itemRows = (order.items || []).map((item, idx) => `
    <tr style="border-bottom:1px solid #D4DBC9;${idx % 2 === 1 ? 'background-color:#FBFDF9;' : 'background-color:#FFFFFF;'}">
      <td style="padding:10px 8px;font-size:12px;font-weight:700;color:#50563D;text-align:center;border-right:1px solid #D4DBC9;">${idx + 1}</td>
      <td style="padding:10px 10px;font-size:13px;font-weight:700;color:#1E201D;border-right:1px solid #D4DBC9;">
        ${item.name}
        <span style="display:block;font-size:11px;font-weight:400;color:#656B4F;font-style:italic;">100% Pure Veg Delicacy</span>
      </td>
      <td style="padding:10px 8px;font-size:12px;font-weight:700;color:#50563D;text-align:center;border-right:1px solid #D4DBC9;">${item.weight || '1 KG'}</td>
      <td style="padding:10px 8px;font-size:13px;font-weight:700;color:#1E201D;text-align:center;border-right:1px solid #D4DBC9;">${item.quantity}</td>
      <td style="padding:10px 8px;font-size:12px;color:#1E201D;text-align:right;border-right:1px solid #D4DBC9;">₹${Number(item.price).toFixed(2)}</td>
      <td style="padding:10px 8px;font-size:13px;font-weight:700;color:#50563D;text-align:right;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Order Confirmed #${order.orderNumber} - ${COMPANY_NAME}</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F6F0;font-family:'Times New Roman',Times,Baskerville,Georgia,serif;color:#1E201D;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6F0;">
<tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;background-color:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(101,107,79,0.08);border:1px solid #D4DBC9;">

<!-- 1. Olive Green Brand Header -->
<tr>
<td style="background-color:#656B4F;padding:26px 24px;text-align:center;">
  <img src="${logoSrc}" alt="${COMPANY_NAME}" style="height:60px;width:auto;max-width:160px;object-fit:contain;margin-bottom:8px;display:inline-block;" />
  <h1 style="margin:0;color:#FFFFFF;font-size:22px;font-weight:700;letter-spacing:0.5px;">${COMPANY_NAME}</h1>
  <p style="margin:4px 0 0;color:#EAF0E5;font-size:12px;letter-spacing:0.8px;text-transform:uppercase;font-weight:700;">${COMPANY_TAGLINE}</p>
</td>
</tr>

<!-- 2. Order Confirmation Content Body -->
<tr>
<td style="padding:26px 28px 16px;background:#FFFFFF;">
  
  <!-- Hero Order Status Box -->
  <div style="background-color:#EAF0E5;border:1.5px solid #656B4F;border-radius:10px;padding:16px 20px;margin-bottom:20px;text-align:center;">
    <h2 style="margin:0;color:#50563D;font-size:18px;font-weight:700;">Order Confirmed & Invoice Generated</h2>
    <p style="margin:5px 0 0;color:#2D3823;font-size:13px;line-height:1.5;">
      Hello <strong>${order.customerName}</strong>, thank you for ordering from Sakthi Frozen Foods! Your order is confirmed and your official Tax Invoice PDF is attached to this email.
    </p>
  </div>

  <!-- Invoice Meta Box -->
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #D4DBC9;border-radius:8px;overflow:hidden;border-collapse:collapse;margin-bottom:18px;">
    <tr style="background-color:#EAF0E5;">
      <td style="padding:9px 12px;font-size:11px;font-weight:700;color:#50563D;text-transform:uppercase;border-right:1px solid #D4DBC9;">INVOICE #</td>
      <td style="padding:9px 12px;font-size:11px;font-weight:700;color:#50563D;text-transform:uppercase;border-right:1px solid #D4DBC9;">DATE</td>
      <td style="padding:9px 12px;font-size:11px;font-weight:700;color:#50563D;text-transform:uppercase;">PAYMENT</td>
    </tr>
    <tr style="background:#FFFFFF;">
      <td style="padding:9px 12px;font-size:13px;font-weight:700;color:#50563D;font-family:monospace;border-right:1px solid #D4DBC9;">${order.orderNumber}</td>
      <td style="padding:9px 12px;font-size:12px;font-weight:700;color:#1E201D;border-right:1px solid #D4DBC9;">${formattedDate}</td>
      <td style="padding:9px 12px;font-size:12px;font-weight:700;color:${isPaid ? '#2E6930' : '#B45309'};">
        ${isPaid ? 'PAID (Verified)' : 'PENDING'} (${order.paymentMethod || 'Online'})
      </td>
    </tr>
  </table>

  <!-- Customer Addresses Side-by-Side Boxes -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
    <tr>
      <td width="48%" valign="top" style="border:1.5px solid #D4DBC9;border-radius:8px;overflow:hidden;background:#FFFFFF;">
        <div style="background-color:#EAF0E5;padding:8px 12px;border-bottom:1.5px solid #D4DBC9;">
          <span style="font-size:11px;font-weight:700;color:#50563D;text-transform:uppercase;letter-spacing:0.5px;">BILLED TO</span>
        </div>
        <div style="padding:10px 12px;font-size:12px;line-height:1.4;color:#2D3823;">
          <p style="margin:0 0 2px;font-weight:700;color:#1E201D;">${order.customerName}</p>
          <p style="margin:0 0 2px;color:#555E51;">Email: ${order.customerEmail}</p>
          <p style="margin:0;color:#555E51;">Phone: +91 ${order.customerPhone}</p>
        </div>
      </td>
      <td width="4%"></td>
      <td width="48%" valign="top" style="border:1.5px solid #D4DBC9;border-radius:8px;overflow:hidden;background:#FFFFFF;">
        <div style="background-color:#EAF0E5;padding:8px 12px;border-bottom:1.5px solid #D4DBC9;">
          <span style="font-size:11px;font-weight:700;color:#50563D;text-transform:uppercase;letter-spacing:0.5px;">SHIPPED TO</span>
        </div>
        <div style="padding:10px 12px;font-size:12px;line-height:1.4;color:#2D3823;">
          <p style="margin:0 0 2px;font-weight:700;color:#1E201D;">${order.customerName}</p>
          <p style="margin:0 0 2px;color:#555E51;">${order.shippingAddress}</p>
          <p style="margin:0;color:#555E51;">${[order.city, order.state].filter(Boolean).join(', ')}${order.pincode ? ' - ' + order.pincode : ''}</p>
        </div>
      </td>
    </tr>
  </table>

  <!-- Items Table Box -->
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #656B4F;border-radius:8px;overflow:hidden;border-collapse:collapse;margin-bottom:16px;">
    <thead>
      <tr style="background-color:#656B4F;color:#FFFFFF;text-align:left;">
        <th style="padding:9px 8px;font-size:10px;font-weight:700;text-transform:uppercase;width:24px;text-align:center;border-right:1px solid #7E8566;">#</th>
        <th style="padding:9px 10px;font-size:10px;font-weight:700;text-transform:uppercase;border-right:1px solid #7E8566;">DESCRIPTION</th>
        <th style="padding:9px 8px;font-size:10px;font-weight:700;text-transform:uppercase;text-align:center;border-right:1px solid #7E8566;">PACK</th>
        <th style="padding:9px 8px;font-size:10px;font-weight:700;text-transform:uppercase;text-align:center;border-right:1px solid #7E8566;">QTY</th>
        <th style="padding:9px 8px;font-size:10px;font-weight:700;text-transform:uppercase;text-align:right;border-right:1px solid #7E8566;">RATE</th>
        <th style="padding:9px 8px;font-size:10px;font-weight:700;text-transform:uppercase;text-align:right;">AMOUNT</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <!-- Calculation Summary Box -->
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #D4DBC9;border-radius:8px;overflow:hidden;border-collapse:collapse;margin-bottom:18px;background:#FFFFFF;">
    <tr>
      <td style="padding:8px 14px;font-size:13px;color:#555E51;border-bottom:1px solid #E4E9DC;">Subtotal</td>
      <td style="padding:8px 14px;font-size:13px;color:#1E201D;text-align:right;font-weight:700;border-bottom:1px solid #E4E9DC;">₹${Number(subtotal).toFixed(2)}</td>
    </tr>
    <tr>
      <td style="padding:8px 14px;font-size:13px;color:#555E51;border-bottom:1px solid #E4E9DC;">Cold Chain Delivery</td>
      <td style="padding:8px 14px;font-size:13px;color:#1E201D;text-align:right;font-weight:700;border-bottom:1px solid #E4E9DC;">${deliveryFee === 0 ? 'FREE' : `₹${Number(deliveryFee).toFixed(2)}`}</td>
    </tr>
    ${order.convenienceFee ? `
    <tr>
      <td style="padding:8px 14px;font-size:13px;color:#555E51;border-bottom:1px solid #E4E9DC;">Convenience Fee (2.5%)</td>
      <td style="padding:8px 14px;font-size:13px;color:#1E201D;text-align:right;font-weight:700;border-bottom:1px solid #E4E9DC;">₹${Number(order.convenienceFee).toFixed(2)}</td>
    </tr>` : ''}
    <tr style="background-color:#EAF0E5;">
      <td style="padding:12px 14px;font-size:15px;font-weight:700;color:#50563D;border-top:2px solid #656B4F;">TOTAL AMOUNT</td>
      <td style="padding:12px 14px;font-size:18px;font-weight:700;color:#50563D;text-align:right;border-top:2px solid #656B4F;">₹${Number(order.totalAmount).toFixed(2)}</td>
    </tr>
  </table>

  <!-- Action Buttons (Print & WhatsApp) -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 10px;">
    <tr>
      <td align="center">
        <a href="${invoiceUrl}" target="_blank" style="display:inline-block;background-color:#656B4F;color:#FFFFFF;padding:11px 22px;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none;font-family:'Times New Roman',serif;margin:0 5px 6px;">
          📄 View & Print Invoice
        </a>
        <a href="${whatsappUrl}" target="_blank" style="display:inline-block;background-color:#25D366;color:#FFFFFF;padding:11px 22px;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none;font-family:'Times New Roman',serif;margin:0 5px 6px;">
          💬 WhatsApp Support
        </a>
      </td>
    </tr>
  </table>

  <p style="margin:14px 0 0;font-size:12px;color:#656B4F;text-align:center;line-height:1.4;font-style:italic;">
    Cold Storage Notice: Please store all products immediately at -18°C upon delivery. Keep tightly sealed until cooking.
  </p>
</td>
</tr>

<!-- 3. Olive Green Email Footer -->
<tr>
<td style="background-color:#F5F8F2;padding:18px 24px;border-top:1.5px solid #D4DBC9;text-align:center;">
  <p style="margin:0 0 3px;font-size:13px;font-weight:700;color:#50563D;">${COMPANY_NAME}</p>
  <p style="margin:0 0 4px;font-size:11px;color:#555E51;">${COMPANY_ADDRESS}</p>
  <p style="margin:0;font-size:11px;color:#555E51;">Phone: ${COMPANY_PHONE} | Email: ${COMPANY_EMAIL} | FSSAI Lic. No: ${FSSAI_LIC_NO}</p>
</td>
</tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// ─── 3. ADMIN ORDER NOTIFICATION EMAIL ──────────────────────────────────────
function buildAdminOrderEmail(order) {
  const logoSrc = getCompanyLogo();
  const formattedDate = new Date(order.createdAt || Date.now()).toLocaleString('en-IN', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  });
  const invoiceToken = getInvoiceToken(order);
  const invoiceUrl = `${FRONTEND_URL}/api/orders/${order._id || order.id}/invoice${invoiceToken ? `?token=${invoiceToken}` : ''}`;

  const itemRows = (order.items || []).map((item, i) => `
    <tr style="border-bottom:1px solid #D4DBC9;${i % 2 === 1 ? 'background-color:#FBFDF9;' : 'background-color:#FFFFFF;'}">
      <td style="padding:8px 10px;font-size:12px;font-weight:700;color:#50563D;text-align:center;border-right:1px solid #D4DBC9;">${i + 1}</td>
      <td style="padding:8px 10px;font-size:13px;font-weight:700;color:#1E201D;border-right:1px solid #D4DBC9;">${item.name}</td>
      <td style="padding:8px 10px;font-size:12px;color:#50563D;text-align:center;border-right:1px solid #D4DBC9;">${item.weight || '1 KG'}</td>
      <td style="padding:8px 10px;font-size:13px;color:#1E201D;font-weight:700;text-align:center;border-right:1px solid #D4DBC9;">${item.quantity}</td>
      <td style="padding:8px 10px;font-size:13px;color:#50563D;font-weight:700;text-align:right;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Admin Order Notification</title></head>
<body style="margin:0;padding:0;background-color:#F4F6F0;font-family:'Times New Roman',Times,Baskerville,Georgia,serif;color:#1E201D;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6F0;">
<tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:12px;overflow:hidden;border:1px solid #D4DBC9;box-shadow:0 4px 20px rgba(101,107,79,0.08);">

<tr>
<td style="background:#50563D;padding:20px 24px;color:#FFFFFF;">
  <h2 style="margin:0;font-size:18px;font-weight:700;color:#FFFFFF;">🔔 New Order Received #${order.orderNumber}</h2>
  <p style="margin:4px 0 0;font-size:13px;color:#EAF0E5;">Total Value: ₹${Number(order.totalAmount).toFixed(2)} • ${order.paymentStatus || 'Pending'} (${order.paymentMethod || 'Online'})</p>
</td>
</tr>

<tr>
<td style="padding:22px 24px;background:#FFFFFF;">
  <p style="margin:0 0 14px;font-size:12px;color:#656B4F;">Order Placed on: ${formattedDate}</p>

  <div style="background:#F5F8F2;border:1.5px solid #D4DBC9;border-radius:8px;padding:12px 16px;margin-bottom:16px;font-size:12px;color:#2D3823;">
    <p style="margin:0 0 3px;font-size:14px;font-weight:700;color:#1E201D;">Customer: ${order.customerName}</p>
    <p style="margin:0 0 3px;color:#555E51;">Email: <strong>${order.customerEmail}</strong> | Phone: <strong>+91 ${order.customerPhone}</strong></p>
    <p style="margin:0;color:#555E51;">Delivery Address: ${order.shippingAddress}${order.city ? ', ' + order.city : ''}${order.pincode ? ' - ' + order.pincode : ''}</p>
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #656B4F;border-radius:8px;overflow:hidden;border-collapse:collapse;margin-bottom:18px;">
    <tr style="background:#656B4F;color:#FFFFFF;">
      <th style="padding:8px;font-size:11px;text-align:center;border-right:1px solid #7E8566;">#</th>
      <th style="padding:8px 10px;font-size:11px;text-align:left;border-right:1px solid #7E8566;">Item</th>
      <th style="padding:8px;font-size:11px;text-align:center;border-right:1px solid #7E8566;">Pack</th>
      <th style="padding:8px;font-size:11px;text-align:center;border-right:1px solid #7E8566;">Qty</th>
      <th style="padding:8px 10px;font-size:11px;text-align:right;">Total</th>
    </tr>
    ${itemRows}
  </table>

  <div style="text-align:center;margin:16px 0 6px;">
    <a href="${FRONTEND_URL}/admin" style="display:inline-block;background:#656B4F;color:#FFFFFF;padding:10px 20px;border-radius:6px;font-size:12px;font-weight:700;text-decoration:none;font-family:'Times New Roman',serif;margin:0 4px;">
      Open Admin Dashboard
    </a>
    <a href="${invoiceUrl}" target="_blank" style="display:inline-block;background:#50563D;color:#FFFFFF;padding:10px 20px;border-radius:6px;font-size:12px;font-weight:700;text-decoration:none;font-family:'Times New Roman',serif;margin:0 4px;">
      View Invoice PDF
    </a>
  </div>
</td>
</tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// ─── 4. OTP PASSWORD RESET EMAIL ───────────────────────────────────────────
function buildOtpEmail(userName, otp) {
  const logoSrc = getCompanyLogo();
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Password Reset OTP</title></head>
<body style="margin:0;padding:0;background-color:#F4F6F0;font-family:'Times New Roman',Times,Baskerville,Georgia,serif;color:#1E201D;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6F0;">
<tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background-color:#FFFFFF;border-radius:12px;overflow:hidden;border:1px solid #D4DBC9;box-shadow:0 4px 20px rgba(101,107,79,0.08);">

<tr>
<td style="background-color:#656B4F;padding:22px 24px;text-align:center;">
  <img src="${logoSrc}" alt="${COMPANY_NAME}" style="height:52px;width:auto;max-width:140px;object-fit:contain;margin-bottom:6px;display:inline-block;" />
  <h1 style="margin:0;color:#FFFFFF;font-size:20px;font-weight:700;">${COMPANY_NAME}</h1>
  <p style="margin:3px 0 0;color:#EAF0E5;font-size:11px;letter-spacing:0.8px;text-transform:uppercase;">Password Security Verification</p>
</td>
</tr>

<tr>
<td style="padding:28px 26px 22px;text-align:center;background:#FFFFFF;">
  <h2 style="margin:0 0 8px;font-size:18px;font-weight:700;color:#50563D;">Password Reset Verification Code</h2>
  <p style="margin:0 0 18px;font-size:13px;color:#555E51;line-height:1.5;">
    Hello <strong>${userName || 'Customer'}</strong>, use the single-use OTP code below to securely reset your account password:
  </p>

  <div style="margin:18px auto;display:inline-block;background:#EAF0E5;border:2px solid #656B4F;border-radius:10px;padding:14px 32px;">
    <span style="font-size:30px;font-weight:700;color:#50563D;letter-spacing:8px;font-family:monospace;">${otp}</span>
  </div>

  <p style="margin:16px 0 0;font-size:11px;color:#656B4F;font-style:italic;">
    This security code expires in 10 minutes. If you did not request this, you can safely ignore this email.
  </p>
</td>
</tr>

<tr>
<td style="background-color:#F5F8F2;padding:14px 20px;border-top:1.5px solid #D4DBC9;text-align:center;">
  <p style="margin:0;font-size:11px;color:#555E51;">${COMPANY_NAME} • Customer Helpline: ${COMPANY_PHONE}</p>
</td>
</tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// ─── 5. ORDER STATUS UPDATE EMAIL ───────────────────────────────────────────
function buildOrderStatusUpdateEmail(order, newStatus) {
  const statusMessages = {
    Confirmed: 'Your order has been confirmed successfully and is being prepared.',
    'Awaiting Payment': 'Your order is currently awaiting online payment.',
    'Payment Failed': 'Your order payment could not be completed or the payment window expired.',
    Cancelled: 'Your order has been cancelled.',
  };
  const ordersUrl = `${FRONTEND_URL}/orders`;
  const invoiceToken = getInvoiceToken(order);
  const invoiceUrl = `${FRONTEND_URL}/api/orders/${order._id || order.id}/invoice${invoiceToken ? `?token=${invoiceToken}` : ''}`;
  const logoSrc = getCompanyLogo();

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Order Status Update</title></head>
<body style="margin:0;padding:0;background-color:#F4F6F0;font-family:'Times New Roman',Times,Baskerville,Georgia,serif;color:#1E201D;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6F0;">
<tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#FFFFFF;border-radius:12px;overflow:hidden;border:1px solid #D4DBC9;box-shadow:0 4px 20px rgba(101,107,79,0.08);">

<tr>
<td style="background-color:#656B4F;padding:22px 24px;text-align:center;">
  <img src="${logoSrc}" alt="${COMPANY_NAME}" style="height:52px;width:auto;max-width:140px;object-fit:contain;margin-bottom:6px;display:inline-block;" />
  <h1 style="margin:0;color:#FFFFFF;font-size:20px;font-weight:700;">${COMPANY_NAME}</h1>
  <p style="margin:3px 0 0;color:#EAF0E5;font-size:11px;letter-spacing:0.8px;text-transform:uppercase;">Order Status Notification</p>
</td>
</tr>

<tr>
<td style="padding:24px 26px;background:#FFFFFF;">
  <div style="background:#EAF0E5;border:1.5px solid #656B4F;border-radius:10px;padding:16px 20px;margin-bottom:18px;text-align:center;">
    <h2 style="margin:0;font-size:17px;font-weight:700;color:#50563D;">Order #${order.orderNumber} Status: ${newStatus}</h2>
    <p style="margin:5px 0 0;font-size:13px;font-weight:400;color:#2D3823;line-height:1.4;">
      ${statusMessages[newStatus] || `Your order status has been updated to ${newStatus}.`}
    </p>
  </div>

  <div style="text-align:center;margin:20px 0 10px;">
    <a href="${ordersUrl}" style="display:inline-block;background:#656B4F;color:#FFFFFF;padding:11px 22px;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none;font-family:'Times New Roman',serif;margin:0 5px;">
      View My Orders
    </a>
    <a href="${invoiceUrl}" target="_blank" style="display:inline-block;background:#50563D;color:#FFFFFF;padding:11px 22px;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none;font-family:'Times New Roman',serif;margin:0 5px;">
      View Invoice PDF
    </a>
  </div>
</td>
</tr>

<tr>
<td style="background-color:#F5F8F2;padding:14px 20px;border-top:1.5px solid #D4DBC9;text-align:center;">
  <p style="margin:0;font-size:11px;color:#555E51;">${COMPANY_NAME} • Customer Support: ${COMPANY_PHONE} | ${COMPANY_EMAIL}</p>
</td>
</tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// ─── High-Level Send Functions ───────────────────────────────────────────────
async function sendUserOrderConfirmation(order, pdfBuffer = null) {
  const html = buildUserOrderEmail(order);
  let buffer = pdfBuffer;
  if (!buffer) {
    try {
      buffer = await generateInvoicePdf(order);
    } catch (err) {
      console.warn('Could not generate PDF invoice for attachment:', err.message);
    }
  }

  const attachments = buffer ? [{
    filename: `Invoice-${order.orderNumber}.pdf`,
    content: buffer,
    contentType: 'application/pdf',
  }] : [];

  return sendMail({
    to: order.customerEmail,
    subject: `✅ Order Confirmed & Invoice #${order.orderNumber} - ${COMPANY_NAME}`,
    html,
    attachments,
  });
}

async function sendAdminOrderNotification(order) {
  const html = buildAdminOrderEmail(order);
  return sendMail({
    to: ADMIN_EMAIL,
    subject: `🔔 New Order #${order.orderNumber} - ₹${order.totalAmount.toFixed(2)} - ${COMPANY_NAME}`,
    html,
  });
}

async function sendOtpEmail(email, userName, otp) {
  const html = buildOtpEmail(userName, otp);
  return sendMail({
    to: email,
    subject: `${otp} is your ${COMPANY_NAME} password reset OTP`,
    html,
  });
}

async function sendOrderStatusUpdate(order, newStatus) {
  const html = buildOrderStatusUpdateEmail(order, newStatus);
  return sendMail({
    to: order.customerEmail,
    subject: `Order Update #${order.orderNumber}: ${newStatus} - ${COMPANY_NAME}`,
    html,
  });
}

module.exports = {
  sendMail,
  sendOtpEmail,
  sendAdminOrderNotification,
  sendUserOrderConfirmation,
  sendOrderStatusUpdate,
  generateInvoicePdf,
  buildInvoiceHtml,
  buildUserOrderEmail,
  buildAdminOrderEmail,
  buildOtpEmail,
  buildOrderStatusUpdateEmail,
  numberToWords,
  getCompanyLogo,
  FRONTEND_URL,
  BACKEND_URL,
  ADMIN_EMAIL,
  COMPANY_NAME,
};
