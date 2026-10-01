const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { generateInvoicePdf, numberToWords } = require('./pdfService');

// ─── Environment-aware URLs & Company Metadata ───────────────────────────────
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3005';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const COMPANY_NAME = 'Sakthi Frozen Foods';
const COMPANY_TAGLINE = '100% Plant-Based Meat & Vegan Delicacies';
const COMPANY_EMAIL = process.env.EMAIL_FROM || 'sakthifrozenfoods@gmail.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || 'sakthifrozenfoods@gmail.com';
const COMPANY_PHONE = '+91 98765 43210';
const COMPANY_ADDRESS = 'Sulur, Coimbatore, Tamil Nadu - 641402, India';
const FSSAI_LIC_NO = '12421008000456';
const GOOGLE_MAPS_URL = 'https://www.google.com/maps?ftid=0x3ba8590cc15b53eb:0x46fec529d6a8bb00';
const WHATSAPP_PHONE = '919876543210';

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
    <tr style="border-bottom:1px solid #d4dbc9;${idx % 2 === 1 ? 'background-color:#fafcf8;' : ''}">
      <td style="padding:10px 12px;font-size:12px;font-weight:700;color:#2E4C33;text-align:center;border-right:1px solid #d4dbc9;">${idx + 1}</td>
      <td style="padding:10px 14px;font-size:13px;font-weight:700;color:#1a1e16;border-right:1px solid #d4dbc9;">
        ${item.name}
        <span style="display:block;font-size:11px;font-weight:500;color:#61665d;">100% Pure Veg Frozen Meat Alternative</span>
      </td>
      <td style="padding:10px 12px;font-size:12px;font-weight:700;color:#2E4C33;text-align:center;border-right:1px solid #d4dbc9;">${item.weight || '1 KG'}</td>
      <td style="padding:10px 12px;font-size:13px;font-weight:800;color:#1a1e16;text-align:center;border-right:1px solid #d4dbc9;">${item.quantity}</td>
      <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#1a1e16;text-align:right;border-right:1px solid #d4dbc9;">₹${Number(item.price).toFixed(2)}</td>
      <td style="padding:10px 14px;font-size:13px;font-weight:800;color:#2E4C33;text-align:right;">₹${(item.price * item.quantity).toFixed(2)}</td>
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
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: #f3f5ed;
    color: #1a1e16;
    padding: 24px 12px;
  }
  .invoice-card {
    max-width: 840px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    border: 1px solid #d4dbc9;
    overflow: hidden;
  }
  @media print {
    body { background: #ffffff !important; padding: 0 !important; }
    .invoice-card { box-shadow: none !important; border: none !important; max-width: 100% !important; border-radius: 0 !important; }
    .no-print { display: none !important; }
  }
</style>
</head>
<body>

<div class="invoice-card">
  <!-- Top Action Toolbar (Hidden in Print) -->
  <div class="no-print" style="background:#1E2E1F;padding:12px 24px;display:flex;justify-content:space-between;align-items:center;color:#fff;">
    <div style="font-size:13px;font-weight:700;display:flex;align-items:center;gap:8px;">
      <span style="color:#86EFAC;">●</span> Official Order Invoice • #${order.orderNumber}
    </div>
    <div style="display:flex;gap:10px;">
      <button onclick="window.print()" style="background:#2E4C33;color:#fff;border:none;padding:8px 18px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px;">
        🖨️ Print / Save as PDF
      </button>
    </div>
  </div>

  <div style="padding:32px 36px;">
    <!-- 1. Header Section -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:2px solid #2E4C33;padding-bottom:20px;margin-bottom:24px;">
      <tr>
        <td valign="top" style="width:58%;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td valign="top" style="padding-right:16px;">
                <img src="${logoSrc}" alt="${COMPANY_NAME}" style="height:64px;width:auto;max-width:160px;object-fit:contain;" />
              </td>
              <td valign="top">
                <h1 style="margin:0;font-size:20px;font-weight:900;color:#1E2E1F;letter-spacing:-0.3px;line-height:1.1;">${COMPANY_NAME}</h1>
                <p style="margin:3px 0 0;font-size:11px;font-weight:800;color:#2E4C33;text-transform:uppercase;">${COMPANY_TAGLINE}</p>
                <p style="margin:4px 0 0;font-size:11px;color:#555E51;line-height:1.4;">${COMPANY_ADDRESS}</p>
                <p style="margin:2px 0 0;font-size:11px;color:#555E51;">Phone: <strong>${COMPANY_PHONE}</strong> | Email: <strong>${COMPANY_EMAIL}</strong></p>
                <p style="margin:2px 0 0;font-size:10px;font-weight:700;color:#2E4C33;">FSSAI Central Lic. No: ${FSSAI_LIC_NO}</p>
              </td>
            </tr>
          </table>
        </td>

        <td valign="top" align="right" style="width:42%;">
          <h2 style="margin:0 0 6px;font-size:24px;font-weight:900;color:#1E2E1F;letter-spacing:1px;">TAX INVOICE</h2>
          <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1.5px solid #2E4C33;border-radius:8px;overflow:hidden;width:100%;max-width:280px;text-align:center;">
            <tr style="background-color:#EBF1E8;border-bottom:1px solid #2E4C33;">
              <th style="padding:6px 8px;font-size:10px;font-weight:800;color:#2E4C33;text-transform:uppercase;border-right:1px solid #2E4C33;">INVOICE #</th>
              <th style="padding:6px 8px;font-size:10px;font-weight:800;color:#2E4C33;text-transform:uppercase;">DATE</th>
            </tr>
            <tr style="background:#ffffff;border-bottom:1px solid #2E4C33;">
              <td style="padding:6px 8px;font-size:12px;font-weight:800;color:#1a1e16;font-family:monospace;border-right:1px solid #2E4C33;">${order.orderNumber}</td>
              <td style="padding:6px 8px;font-size:12px;font-weight:700;color:#1a1e16;">${formattedDate}</td>
            </tr>
            <tr style="background-color:#EBF1E8;border-bottom:1px solid #2E4C33;">
              <th style="padding:6px 8px;font-size:10px;font-weight:800;color:#2E4C33;text-transform:uppercase;border-right:1px solid #2E4C33;">PAYMENT METHOD</th>
              <th style="padding:6px 8px;font-size:10px;font-weight:800;color:#2E4C33;text-transform:uppercase;">STATUS</th>
            </tr>
            <tr style="background:#ffffff;">
              <td style="padding:6px 8px;font-size:11px;font-weight:700;color:#1a1e16;border-right:1px solid #2E4C33;">${order.paymentMethod || 'Online'}</td>
              <td style="padding:6px 8px;font-size:11px;font-weight:800;color:${isPaid ? '#15803D' : '#B45309'};">
                ${isPaid ? 'PAID (Verified)' : 'PENDING'}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- 2. BILL TO & SHIP TO -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td width="48%" valign="top" style="border:1.5px solid #d4dbc9;border-radius:12px;overflow:hidden;background:#ffffff;">
          <div style="background-color:#EBF1E8;padding:8px 14px;border-bottom:1.5px solid #d4dbc9;">
            <span style="font-size:11px;font-weight:800;color:#2E4C33;text-transform:uppercase;letter-spacing:1px;">BILLED TO (BUYER DETAILS)</span>
          </div>
          <div style="padding:14px 16px;font-size:12px;line-height:1.5;color:#2D3823;">
            <p style="margin:0 0 2px;font-size:14px;font-weight:800;color:#1a1e16;">${order.customerName}</p>
            <p style="margin:0 0 2px;color:#555E51;">Email: <strong>${order.customerEmail}</strong></p>
            <p style="margin:0 0 2px;color:#555E51;">Phone: <strong>+91 ${order.customerPhone}</strong></p>
            <p style="margin:4px 0 0;color:#555E51;">Address: ${order.shippingAddress}</p>
          </div>
        </td>

        <td width="4%"></td>

        <td width="48%" valign="top" style="border:1.5px solid #d4dbc9;border-radius:12px;overflow:hidden;background:#ffffff;">
          <div style="background-color:#EBF1E8;padding:8px 14px;border-bottom:1.5px solid #d4dbc9;">
            <span style="font-size:11px;font-weight:800;color:#2E4C33;text-transform:uppercase;letter-spacing:1px;">SHIPPED TO (DELIVERY ADDRESS)</span>
          </div>
          <div style="padding:14px 16px;font-size:12px;line-height:1.5;color:#2D3823;">
            <p style="margin:0 0 2px;font-size:14px;font-weight:800;color:#1a1e16;">${order.customerName}</p>
            <p style="margin:0 0 2px;color:#555E51;">Address: ${order.shippingAddress}</p>
            ${order.landmark ? `<p style="margin:0 0 2px;color:#555E51;">Landmark: <strong>${order.landmark}</strong></p>` : ''}
            <p style="margin:0 0 2px;color:#555E51;">${[order.city, order.district, order.state].filter(Boolean).join(', ')}${order.pincode ? ' - ' + order.pincode : ''}</p>
            <p style="margin:4px 0 0;color:#555E51;">Contact Phone: <strong>+91 ${order.customerPhone}</strong></p>
          </div>
        </td>
      </tr>
    </table>

    <!-- 3. Items Table -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #2E4C33;border-radius:12px;overflow:hidden;border-collapse:collapse;margin-bottom:20px;">
      <thead>
        <tr style="background-color:#2E4C33;color:#ffffff;text-align:left;">
          <th style="padding:10px 12px;font-size:11px;font-weight:800;text-transform:uppercase;width:40px;text-align:center;border-right:1px solid #48684D;">#</th>
          <th style="padding:10px 14px;font-size:11px;font-weight:800;text-transform:uppercase;border-right:1px solid #48684D;">DESCRIPTION</th>
          <th style="padding:10px 12px;font-size:11px;font-weight:800;text-transform:uppercase;text-align:center;width:90px;border-right:1px solid #48684D;">PACK SIZE</th>
          <th style="padding:10px 12px;font-size:11px;font-weight:800;text-transform:uppercase;text-align:center;width:60px;border-right:1px solid #48684D;">QTY</th>
          <th style="padding:10px 14px;font-size:11px;font-weight:800;text-transform:uppercase;text-align:right;width:100px;border-right:1px solid #48684D;">UNIT PRICE</th>
          <th style="padding:10px 14px;font-size:11px;font-weight:800;text-transform:uppercase;text-align:right;width:110px;">AMOUNT</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <!-- 4. Financial Summary & Amount in Words -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td width="55%" valign="top" style="padding-right:24px;">
          <div style="background-color:#F8FAF5;border:1.5px dashed #2E4C33;border-radius:12px;padding:14px 18px;margin-bottom:14px;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:800;color:#2E4C33;text-transform:uppercase;">Amount in Words:</p>
            <p style="margin:0;font-size:13px;font-weight:800;color:#1E2E1F;font-style:italic;">Indian Rupees ${numberToWords(order.totalAmount)} Only</p>
          </div>

          <div style="background-color:#F9FAF6;border:1px solid #d4dbc9;border-radius:12px;padding:12px 16px;font-size:11px;color:#2E4C33;line-height:1.4;">
            <p style="margin:0 0 4px;font-weight:800;color:#2E4C33;">Cold Storage & Handling Directions:</p>
            <p style="margin:0;color:#555E51;">Store immediately at <strong>-18°C</strong> upon receipt. Keep tightly sealed in frozen food packaging until cooking. Do not refreeze thawed items.</p>
          </div>
        </td>

        <td width="45%" valign="top">
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #d4dbc9;border-radius:12px;overflow:hidden;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 14px;font-size:13px;color:#555E51;border-bottom:1px solid #e8ece0;">Subtotal</td>
              <td style="padding:8px 14px;font-size:13px;color:#1a1e16;text-align:right;font-weight:700;border-bottom:1px solid #e8ece0;">₹${Number(subtotal).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding:8px 14px;font-size:13px;color:#555E51;border-bottom:1px solid #e8ece0;">Cold Chain Delivery</td>
              <td style="padding:8px 14px;font-size:13px;color:#1a1e16;text-align:right;font-weight:700;border-bottom:1px solid #e8ece0;">${deliveryFee === 0 ? 'FREE' : `₹${Number(deliveryFee).toFixed(2)}`}</td>
            </tr>
            ${order.convenienceFee ? `
            <tr>
              <td style="padding:8px 14px;font-size:13px;color:#555E51;border-bottom:1px solid #e8ece0;">Convenience Fee (2.5%)</td>
              <td style="padding:8px 14px;font-size:13px;color:#1a1e16;text-align:right;font-weight:700;border-bottom:1px solid #e8ece0;">₹${Number(order.convenienceFee).toFixed(2)}</td>
            </tr>` : ''}
            <tr style="background-color:#EBF1E8;">
              <td style="padding:12px 14px;font-size:15px;font-weight:900;color:#1E2E1F;border-top:2px solid #2E4C33;">TOTAL AMOUNT</td>
              <td style="padding:12px 14px;font-size:18px;font-weight:900;color:#2E4C33;text-align:right;border-top:2px solid #2E4C33;">₹${Number(order.totalAmount).toFixed(2)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- 5. Footer -->
    <div style="border-top:1.5px solid #d4dbc9;padding-top:16px;display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#666E61;">
      <div>
        <p style="margin:0;font-weight:700;color:#2E4C33;font-style:italic;">Thank you for choosing ${COMPANY_NAME}!</p>
        <p style="margin:2px 0 0;">Customer Helpline: <strong>${COMPANY_PHONE}</strong> | Email: <strong>${COMPANY_EMAIL}</strong></p>
      </div>
      <div style="text-align:right;">
        <p style="margin:0;font-family:monospace;">Ref: ${order._id || order.id}</p>
        <p style="margin:2px 0 0;">Computer Generated Tax Invoice</p>
      </div>
    </div>
  </div>
</div>

</body>
</html>`;
}

// ─── 2. USER ORDER CONFIRMATION & INVOICE EMAIL TEMPLATE ────────────────────
// Lightweight, clean, highly responsive HTML designed specifically for Gmail/Outlook/Apple Mail
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
    <tr style="border-bottom:1px solid #e2e8dc;${idx % 2 === 1 ? 'background-color:#f9fbf7;' : ''}">
      <td style="padding:10px 8px;font-size:11px;font-weight:700;color:#2E4C33;text-align:center;">${idx + 1}</td>
      <td style="padding:10px 8px;font-size:12px;font-weight:700;color:#1a1e16;">
        ${item.name}
        <span style="display:block;font-size:10px;font-weight:500;color:#61665d;">100% Pure Veg Delicacy</span>
      </td>
      <td style="padding:10px 8px;font-size:11px;font-weight:700;color:#2E4C33;text-align:center;">${item.weight || '1 KG'}</td>
      <td style="padding:10px 8px;font-size:12px;font-weight:800;color:#1a1e16;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 8px;font-size:12px;font-weight:600;color:#1a1e16;text-align:right;">₹${Number(item.price).toFixed(2)}</td>
      <td style="padding:10px 8px;font-size:12px;font-weight:800;color:#2E4C33;text-align:right;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Order Confirmed #${order.orderNumber} - ${COMPANY_NAME}</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f6ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f6ee;">
<tr><td align="center" style="padding:20px 10px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 3px 18px rgba(0,0,0,0.06);border:1px solid #d4dbc9;">

<!-- 1. Brand Header -->
<tr>
<td style="background-color:#1E2E1F;padding:22px 24px;text-align:center;">
  <img src="${logoSrc}" alt="${COMPANY_NAME}" style="height:56px;width:auto;max-width:160px;object-fit:contain;margin-bottom:6px;display:inline-block;" />
  <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:900;letter-spacing:0.5px;">${COMPANY_NAME}</h1>
  <p style="margin:3px 0 0;color:#A9C8AB;font-size:11px;letter-spacing:0.8px;text-transform:uppercase;font-weight:700;">${COMPANY_TAGLINE}</p>
</td>
</tr>

<!-- 2. Order Confirmation Banner -->
<tr>
<td style="padding:20px 24px 10px;">
  <div style="background-color:#EBF1E8;border:1.5px solid #2E4C33;border-radius:10px;padding:14px 18px;margin-bottom:18px;text-align:center;">
    <h2 style="margin:0;color:#1E2E1F;font-size:17px;font-weight:900;">Order Confirmed & Invoice Generated</h2>
    <p style="margin:4px 0 0;color:#2D3823;font-size:12px;line-height:1.4;">
      Hello <strong>${order.customerName}</strong>, thank you for choosing Sakthi Frozen Foods! Your official PDF invoice is attached with this email.
    </p>
  </div>

  <!-- Invoice Meta Box -->
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #d4dbc9;border-radius:8px;overflow:hidden;border-collapse:collapse;margin-bottom:16px;">
    <tr style="background-color:#EBF1E8;">
      <td style="padding:8px 10px;font-size:10px;font-weight:800;color:#2E4C33;text-transform:uppercase;border-right:1px solid #d4dbc9;">INVOICE #</td>
      <td style="padding:8px 10px;font-size:10px;font-weight:800;color:#2E4C33;text-transform:uppercase;border-right:1px solid #d4dbc9;">DATE</td>
      <td style="padding:8px 10px;font-size:10px;font-weight:800;color:#2E4C33;text-transform:uppercase;">PAYMENT</td>
    </tr>
    <tr style="background:#ffffff;">
      <td style="padding:8px 10px;font-size:13px;font-weight:800;color:#2E4C33;font-family:monospace;border-right:1px solid #d4dbc9;">${order.orderNumber}</td>
      <td style="padding:8px 10px;font-size:11px;font-weight:700;color:#1a1e16;border-right:1px solid #d4dbc9;">${formattedDate}</td>
      <td style="padding:8px 10px;font-size:11px;font-weight:800;color:${isPaid ? '#15803D' : '#B45309'};">
        ${isPaid ? 'PAID (Verified)' : 'PENDING'} (${order.paymentMethod || 'Online'})
      </td>
    </tr>
  </table>

  <!-- Customer Addresses -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
    <tr>
      <td width="48%" valign="top" style="border:1px solid #d4dbc9;border-radius:8px;overflow:hidden;">
        <div style="background-color:#EBF1E8;padding:6px 10px;border-bottom:1px solid #d4dbc9;">
          <span style="font-size:10px;font-weight:800;color:#2E4C33;text-transform:uppercase;">BILLED TO</span>
        </div>
        <div style="padding:8px 10px;font-size:11px;line-height:1.4;color:#2D3823;">
          <p style="margin:0 0 2px;font-weight:800;color:#1a1e16;">${order.customerName}</p>
          <p style="margin:0 0 2px;color:#555E51;">Email: ${order.customerEmail}</p>
          <p style="margin:0;color:#555E51;">Phone: +91 ${order.customerPhone}</p>
        </div>
      </td>
      <td width="4%"></td>
      <td width="48%" valign="top" style="border:1px solid #d4dbc9;border-radius:8px;overflow:hidden;">
        <div style="background-color:#EBF1E8;padding:6px 10px;border-bottom:1px solid #d4dbc9;">
          <span style="font-size:10px;font-weight:800;color:#2E4C33;text-transform:uppercase;">SHIPPED TO</span>
        </div>
        <div style="padding:8px 10px;font-size:11px;line-height:1.4;color:#2D3823;">
          <p style="margin:0 0 2px;font-weight:800;color:#1a1e16;">${order.customerName}</p>
          <p style="margin:0 0 2px;color:#555E51;">${order.shippingAddress}</p>
          <p style="margin:0;color:#555E51;">${[order.city, order.state].filter(Boolean).join(', ')}${order.pincode ? ' - ' + order.pincode : ''}</p>
        </div>
      </td>
    </tr>
  </table>

  <!-- Items Table -->
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #2E4C33;border-radius:8px;overflow:hidden;border-collapse:collapse;margin-bottom:14px;">
    <thead>
      <tr style="background-color:#2E4C33;color:#ffffff;text-align:left;">
        <th style="padding:7px 8px;font-size:9px;font-weight:800;text-transform:uppercase;width:24px;text-align:center;">#</th>
        <th style="padding:7px 8px;font-size:9px;font-weight:800;text-transform:uppercase;">DESCRIPTION</th>
        <th style="padding:7px 8px;font-size:9px;font-weight:800;text-transform:uppercase;text-align:center;">PACK</th>
        <th style="padding:7px 8px;font-size:9px;font-weight:800;text-transform:uppercase;text-align:center;">QTY</th>
        <th style="padding:7px 8px;font-size:9px;font-weight:800;text-transform:uppercase;text-align:right;">RATE</th>
        <th style="padding:7px 8px;font-size:9px;font-weight:800;text-transform:uppercase;text-align:right;">AMOUNT</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <!-- Calculation Summary -->
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #d4dbc9;border-radius:8px;overflow:hidden;border-collapse:collapse;margin-bottom:16px;">
    <tr>
      <td style="padding:6px 12px;font-size:12px;color:#555E51;border-bottom:1px solid #e8ece0;">Subtotal</td>
      <td style="padding:6px 12px;font-size:12px;color:#1a1e16;text-align:right;font-weight:700;border-bottom:1px solid #e8ece0;">₹${Number(subtotal).toFixed(2)}</td>
    </tr>
    <tr>
      <td style="padding:6px 12px;font-size:12px;color:#555E51;border-bottom:1px solid #e8ece0;">Cold Chain Delivery</td>
      <td style="padding:6px 12px;font-size:12px;color:#1a1e16;text-align:right;font-weight:700;border-bottom:1px solid #e8ece0;">${deliveryFee === 0 ? 'FREE' : `₹${Number(deliveryFee).toFixed(2)}`}</td>
    </tr>
    ${order.convenienceFee ? `
    <tr>
      <td style="padding:6px 12px;font-size:12px;color:#555E51;border-bottom:1px solid #e8ece0;">Convenience Fee (2.5%)</td>
      <td style="padding:6px 12px;font-size:12px;color:#1a1e16;text-align:right;font-weight:700;border-bottom:1px solid #e8ece0;">₹${Number(order.convenienceFee).toFixed(2)}</td>
    </tr>` : ''}
    <tr style="background-color:#EBF1E8;">
      <td style="padding:10px 12px;font-size:14px;font-weight:900;color:#1E2E1F;border-top:1.5px solid #2E4C33;">TOTAL AMOUNT</td>
      <td style="padding:10px 12px;font-size:16px;font-weight:900;color:#2E4C33;text-align:right;border-top:1.5px solid #2E4C33;">₹${Number(order.totalAmount).toFixed(2)}</td>
    </tr>
  </table>

  <!-- Action Buttons (Print & WhatsApp) -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
    <tr>
      <td align="center">
        <a href="${invoiceUrl}" target="_blank" style="display:inline-block;background-color:#2E4C33;color:#ffffff;padding:10px 20px;border-radius:8px;font-size:12px;font-weight:800;text-decoration:none;margin:0 4px 6px;">
          📄 View & Print Invoice
        </a>
        <a href="${whatsappUrl}" target="_blank" style="display:inline-block;background-color:#25D366;color:#ffffff;padding:10px 20px;border-radius:8px;font-size:12px;font-weight:800;text-decoration:none;margin:0 4px 6px;">
          💬 WhatsApp Help
        </a>
      </td>
    </tr>
  </table>

  <p style="margin:12px 0 0;font-size:11px;color:#788273;text-align:center;line-height:1.4;">
    Storage Notice: Store products immediately at -18°C upon delivery. Keep sealed until cooking.
  </p>
</td>
</tr>

<!-- 3. Email Footer -->
<tr>
<td style="background-color:#F5F8F2;padding:16px 20px;border-top:1px solid #d4dbc9;text-align:center;">
  <p style="margin:0 0 2px;font-size:12px;font-weight:800;color:#2E4C33;">${COMPANY_NAME}</p>
  <p style="margin:0 0 4px;font-size:10px;color:#555E51;">${COMPANY_ADDRESS}</p>
  <p style="margin:0;font-size:10px;color:#555E51;">Phone: ${COMPANY_PHONE} | Email: ${COMPANY_EMAIL} | FSSAI: ${FSSAI_LIC_NO}</p>
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
    <tr style="border-bottom:1px solid #e2e8dc;">
      <td style="padding:6px 8px;font-size:11px;font-weight:700;color:#1a1e16;">${i + 1}</td>
      <td style="padding:6px 8px;font-size:12px;font-weight:700;color:#1a1e16;">${item.name}</td>
      <td style="padding:6px 8px;font-size:11px;color:#555E51;text-align:center;">${item.weight || '1 KG'}</td>
      <td style="padding:6px 8px;font-size:12px;color:#1a1e16;font-weight:800;text-align:center;">${item.quantity}</td>
      <td style="padding:6px 8px;font-size:12px;color:#2E4C33;font-weight:800;text-align:right;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Admin Order Notification</title></head>
<body style="margin:0;padding:0;background-color:#f3f6ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f6ee;">
<tr><td align="center" style="padding:20px 10px;">
<table role="presentation" width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #d4dbc9;">

<tr>
<td style="background:#1E2E1F;padding:16px 20px;color:#fff;">
  <h2 style="margin:0;font-size:16px;font-weight:900;color:#ffffff;">🔔 New Order Received #${order.orderNumber}</h2>
  <p style="margin:2px 0 0;font-size:11px;color:#A9C8AB;">Total Value: ₹${Number(order.totalAmount).toFixed(2)} • ${order.paymentStatus || 'Pending'} (${order.paymentMethod || 'Online'})</p>
</td>
</tr>

<tr>
<td style="padding:16px 20px;">
  <p style="margin:0 0 12px;font-size:11px;color:#666E61;">Placed on: ${formattedDate}</p>

  <div style="background:#F5F8F2;border:1px solid #d4dbc9;border-radius:8px;padding:10px 12px;margin-bottom:12px;font-size:11px;color:#2D3823;">
    <p style="margin:0 0 2px;font-size:12px;font-weight:800;color:#1a1e16;">Customer: ${order.customerName}</p>
    <p style="margin:0 0 2px;color:#555E51;">Email: ${order.customerEmail} | Phone: +91 ${order.customerPhone}</p>
    <p style="margin:0;color:#555E51;">Address: ${order.shippingAddress}${order.city ? ', ' + order.city : ''}${order.pincode ? ' - ' + order.pincode : ''}</p>
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #d4dbc9;border-radius:8px;overflow:hidden;border-collapse:collapse;margin-bottom:12px;">
    <tr style="background:#2E4C33;color:#fff;">
      <th style="padding:6px;font-size:10px;text-align:center;">#</th>
      <th style="padding:6px;font-size:10px;text-align:left;">Item</th>
      <th style="padding:6px;font-size:10px;text-align:center;">Pack</th>
      <th style="padding:6px;font-size:10px;text-align:center;">Qty</th>
      <th style="padding:6px;font-size:10px;text-align:right;">Total</th>
    </tr>
    ${itemRows}
  </table>

  <div style="text-align:center;margin:12px 0 6px;">
    <a href="${FRONTEND_URL}/admin" style="display:inline-block;background:#2E4C33;color:#fff;padding:8px 16px;border-radius:6px;font-size:11px;font-weight:700;text-decoration:none;margin:0 3px;">
      Open Admin Dashboard
    </a>
    <a href="${invoiceUrl}" target="_blank" style="display:inline-block;background:#1E2E1F;color:#fff;padding:8px 16px;border-radius:6px;font-size:11px;font-weight:700;text-decoration:none;margin:0 3px;">
      View Invoice Slip
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
<body style="margin:0;padding:0;background-color:#f3f6ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f6ee;">
<tr><td align="center" style="padding:20px 10px;">
<table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #d4dbc9;">

<tr>
<td style="background-color:#1E2E1F;padding:18px 24px;text-align:center;">
  <h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:900;">${COMPANY_NAME}</h1>
  <p style="margin:2px 0 0;color:#A9C8AB;font-size:10px;letter-spacing:0.8px;text-transform:uppercase;">Password Security Verification</p>
</td>
</tr>

<tr>
<td style="padding:24px 24px 20px;text-align:center;">
  <h2 style="margin:0 0 6px;font-size:16px;font-weight:800;color:#1a1e16;">Password Reset Code</h2>
  <p style="margin:0 0 16px;font-size:12px;color:#555E51;line-height:1.5;">
    Hello <strong>${userName || 'Customer'}</strong>, use the single-use OTP code below to reset your account password:
  </p>

  <div style="margin:16px auto;display:inline-block;background:#EBF1E8;border:2px solid #2E4C33;border-radius:10px;padding:12px 28px;">
    <span style="font-size:28px;font-weight:900;color:#2E4C33;letter-spacing:8px;font-family:monospace;">${otp}</span>
  </div>

  <p style="margin:14px 0 0;font-size:10px;color:#788273;">
    This code expires in 10 minutes. If you did not request this, you can safely ignore this email.
  </p>
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
    Confirmed: 'Your order has been confirmed successfully.',
    'Awaiting Payment': 'Your order is awaiting online payment.',
    'Payment Failed': 'Your order payment could not be completed or window expired.',
    Cancelled: 'Your order has been cancelled.',
  };
  const ordersUrl = `${FRONTEND_URL}/orders`;
  const invoiceToken = getInvoiceToken(order);
  const invoiceUrl = `${FRONTEND_URL}/api/orders/${order._id || order.id}/invoice${invoiceToken ? `?token=${invoiceToken}` : ''}`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Order Status Update</title></head>
<body style="margin:0;padding:0;background-color:#f3f6ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f6ee;">
<tr><td align="center" style="padding:20px 10px;">
<table role="presentation" width="540" cellpadding="0" cellspacing="0" style="max-width:540px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #d4dbc9;">

<tr>
<td style="background-color:#1E2E1F;padding:18px 24px;text-align:center;">
  <h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:900;">${COMPANY_NAME}</h1>
  <p style="margin:2px 0 0;color:#A9C8AB;font-size:10px;letter-spacing:0.8px;text-transform:uppercase;">Order Status Notification</p>
</td>
</tr>

<tr>
<td style="padding:20px 24px;">
  <div style="background:#EBF1E8;border:1.5px solid #2E4C33;border-radius:10px;padding:14px 18px;margin-bottom:16px;text-align:center;">
    <h2 style="margin:0;font-size:16px;font-weight:900;color:#2E4C33;">Order #${order.orderNumber} Status: ${newStatus}</h2>
    <p style="margin:4px 0 0;font-size:12px;font-weight:600;color:#2D3823;">
      ${statusMessages[newStatus] || `Status updated to ${newStatus}.`}
    </p>
  </div>

  <div style="text-align:center;margin:16px 0 8px;">
    <a href="${ordersUrl}" style="display:inline-block;background:#2E4C33;color:#fff;padding:10px 20px;border-radius:8px;font-size:12px;font-weight:800;text-decoration:none;margin:0 4px;">
      View My Orders
    </a>
    <a href="${invoiceUrl}" target="_blank" style="display:inline-block;background:#1E2E1F;color:#fff;padding:10px 20px;border-radius:8px;font-size:12px;font-weight:800;text-decoration:none;margin:0 4px;">
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
