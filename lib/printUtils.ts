export interface OrderPrintData {
  id?: string;
  _id?: string;
  orderNumber: string;
  createdAt?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  landmark?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  paymentStatus?: string;
  status?: string;
  paymentMethod?: string;
  deliveryMode?: string;
  items?: Array<{
    name: string;
    weight?: string;
    quantity: number;
    price: number;
  }>;
  subtotal?: number;
  deliveryFee?: number;
  convenienceFee?: number;
  totalAmount: number;
}

export function generatePrintSlipHtml(order: OrderPrintData): string {
  const isPaid = order.paymentStatus === 'Paid' || order.status === 'Confirmed';
  const isCOD =
    String(order.paymentMethod || '').toLowerCase().includes('cash') ||
    String(order.paymentMethod || '').toLowerCase().includes('cod');
  const payBadge = isPaid
    ? '<span class="status-badge status-paid">PAID (Verified)</span>'
    : isCOD
    ? '<span class="status-badge status-cod">CASH ON DELIVERY</span>'
    : '<span class="status-badge status-pending">PAYMENT PENDING</span>';

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const calculatedSubtotal =
    order.subtotal ??
    order.totalAmount - (order.deliveryFee || 0) - (order.convenienceFee || 0);

  const destinationParts = [order.city, order.district, order.state].filter(Boolean).join(', ');
  const fullDestination = `${order.shippingAddress}${order.landmark ? ` (Landmark: ${order.landmark})` : ''}${
    destinationParts ? `, ${destinationParts}` : ''
  }${order.pincode ? ` - ${order.pincode}` : ''}`;

  const rowsHtml = (order.items || [])
    .map(
      (item, idx) => `
      <tr>
        <td style="text-align:center;font-weight:700;color:#50563D;">${idx + 1}</td>
        <td>
          <div class="item-title">${escapeHtml(item.name || 'Plant-Based Mock Meat')}</div>
          <div class="item-sub">100% Pure Vegetarian Frozen Alternative</div>
        </td>
        <td style="text-align:center;font-weight:700;color:#444;">${escapeHtml(item.weight || '1 KG')}</td>
        <td style="text-align:center;font-weight:800;color:#1A1E16;">${item.quantity || 1}</td>
        <td style="text-align:right;color:#444;">₹${Number(item.price || 0).toFixed(2)}</td>
        <td style="text-align:right;font-weight:800;color:#50563D;">₹${Number((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Tax_Invoice_${escapeHtml(order.orderNumber)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 10mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1A1E16;
      background: #FFFFFF;
      font-size: 10.5px;
      line-height: 1.3;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .slip-container {
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
      background: #FFFFFF;
      page-break-inside: avoid !important;
      page-break-after: avoid !important;
      break-inside: avoid !important;
    }

    /* 1. Header Box */
    .header-box {
      border: 1.5px solid #50563D;
      border-radius: 8px;
      padding: 9px 12px;
      background: #FAFBF7;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }
    .header-left {
      max-width: 63%;
    }
    .brand-title {
      font-size: 16px;
      font-weight: 900;
      color: #50563D;
      letter-spacing: -0.2px;
      line-height: 1.1;
      margin-bottom: 2px;
    }
    .brand-tagline {
      font-size: 9.5px;
      font-weight: 800;
      color: #656B4F;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 3px;
    }
    .brand-addr, .brand-contact {
      font-size: 9px;
      color: #4B5244;
      line-height: 1.25;
    }
    .brand-meta {
      font-size: 9px;
      color: #50563D;
      font-weight: 700;
      margin-top: 2px;
    }

    .header-right {
      text-align: right;
      min-width: 35%;
      border-left: 1px solid #D4DBC9;
      padding-left: 10px;
    }
    .invoice-title {
      font-size: 10.5px;
      font-weight: 900;
      color: #50563D;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .invoice-no {
      font-family: monospace;
      font-size: 12.5px;
      font-weight: 900;
      color: #1A1E16;
      margin: 1px 0;
    }
    .invoice-date {
      font-size: 9px;
      color: #555;
    }
    .status-badge {
      display: inline-block;
      padding: 1.5px 7px;
      border-radius: 3px;
      font-size: 8.5px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 3px 0 1px;
    }
    .status-paid {
      background: #EAF0E5;
      color: #2D3823;
      border: 1px solid #B4CEB1;
    }
    .status-cod {
      background: #FEF3C7;
      color: #92400E;
      border: 1px solid #FCD34D;
    }
    .status-pending {
      background: #FEE2E2;
      color: #991B1B;
      border: 1px solid #FCA5A5;
    }
    .meta-line {
      font-size: 8.5px;
      color: #555;
    }

    /* 2. Customer & Delivery Grid */
    .address-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 8px;
    }
    .addr-card {
      border: 1px solid #D4DBC9;
      border-radius: 6px;
      overflow: hidden;
      background: #FFFFFF;
    }
    .addr-card-title {
      background: #EAF0E5;
      padding: 3.5px 8px;
      font-size: 9px;
      font-weight: 900;
      color: #50563D;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #D4DBC9;
    }
    .addr-card-body {
      padding: 6px 8px;
      font-size: 9.5px;
      line-height: 1.3;
      color: #333;
    }
    .addr-card-body .cust-name {
      font-weight: 800;
      color: #1A1E16;
      font-size: 10.5px;
      margin-bottom: 1px;
    }

    /* 3. Items Table */
    .table-box {
      border: 1.5px solid #656B4F;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 9.5px;
    }
    thead th {
      background: #50563D;
      color: #FFFFFF;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 8.5px;
      letter-spacing: 0.5px;
      padding: 5px 6px;
      border-right: 1px solid rgba(255,255,255,0.25);
    }
    thead th:last-child {
      border-right: none;
    }
    tbody tr {
      border-bottom: 1px solid #E5E7EB;
    }
    tbody tr:nth-child(even) {
      background: #FAFBF7;
    }
    tbody tr:last-child {
      border-bottom: none;
    }
    tbody td {
      padding: 5px 6px;
      vertical-align: middle;
      border-right: 1px solid #E5E7EB;
    }
    tbody td:last-child {
      border-right: none;
    }
    .item-title {
      font-weight: 800;
      color: #1A1E16;
      font-size: 10px;
    }
    .item-sub {
      font-size: 8px;
      color: #666;
      font-style: italic;
    }

    /* 4. Financial Calculation & Guidelines */
    .bottom-grid {
      display: grid;
      grid-template-columns: 1.3fr 1fr;
      gap: 8px;
      align-items: start;
      margin-bottom: 8px;
    }
    .cold-box {
      border: 1px solid #D4DBC9;
      border-radius: 6px;
      padding: 7px 9px;
      background: #F7FAF4;
    }
    .cold-title {
      font-weight: 800;
      font-size: 9px;
      color: #50563D;
      margin-bottom: 2px;
    }
    .cold-text {
      font-size: 8.5px;
      color: #555;
      line-height: 1.25;
    }
    .declaration {
      font-size: 7.5px;
      color: #888;
      font-style: italic;
      margin-top: 5px;
    }

    .summary-card {
      border: 1px solid #D4DBC9;
      border-radius: 6px;
      overflow: hidden;
      background: #FFFFFF;
    }
    .summary-inner {
      padding: 5px 8px;
    }
    .sum-row {
      display: flex;
      justify-content: space-between;
      font-size: 9.5px;
      color: #555;
      padding: 1.5px 0;
    }
    .sum-row .val {
      font-weight: 700;
      color: #1A1E16;
    }
    .grand-total-bar {
      background: #50563D;
      color: #FFFFFF;
      padding: 6px 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .grand-total-label {
      font-weight: 900;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .grand-total-val {
      font-weight: 900;
      font-size: 13px;
    }

    /* 5. Signatory Strip */
    .sign-strip {
      border-top: 1px solid #D4DBC9;
      padding-top: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8px;
      color: #666;
    }
    .sign-brand {
      font-weight: 800;
      color: #50563D;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="slip-container">
    <!-- 1. Header Box -->
    <div class="header-box">
      <div class="header-left">
        <h1 class="brand-title">SAKTHI FROZEN FOODS</h1>
        <p class="brand-tagline">100% Plant-Based Meat & Vegan Delicacies</p>
        <p class="brand-addr">Peons Colony, Kalpana Theatre, opposite Edayarpalayam - Koundampalayam Road, Coimbatore - 641030</p>
        <p class="brand-contact">Phone: <strong>+91 80563 89214</strong> | Email: <strong>sakthifrozenfoods@gmail.com</strong></p>
        <p class="brand-meta">Website: <strong>buy.tnmockmeat.com</strong> | FSSAI Lic. No: <strong>12421008000456</strong></p>
      </div>

      <div class="header-right">
        <span class="invoice-title">DELIVERY SLIP & TAX INVOICE</span>
        <div class="invoice-no">#${escapeHtml(order.orderNumber)}</div>
        <div class="invoice-date">Date: ${orderDate}</div>
        <div>${payBadge}</div>
        <div class="meta-line">Payment: <strong>${escapeHtml(order.paymentMethod || 'Online Gateway')}</strong></div>
        ${
          order.deliveryMode
            ? `<div class="meta-line" style="color:#50563D;font-weight:700;">Mode: ${escapeHtml(order.deliveryMode)} Express (-18°C)</div>`
            : ''
        }
      </div>
    </div>

    <!-- 2. Address Breakdown -->
    <div class="address-grid">
      <div class="addr-card">
        <div class="addr-card-title">CUSTOMER / BILLED TO</div>
        <div class="addr-card-body">
          <div class="cust-name">${escapeHtml(order.customerName || 'Valued Customer')}</div>
          <div>Phone: <strong>+91 ${escapeHtml(order.customerPhone || 'N/A')}</strong></div>
          ${order.customerEmail ? `<div>Email: ${escapeHtml(order.customerEmail)}</div>` : ''}
          <div style="color:#666;margin-top:2px;">Address: ${escapeHtml(order.shippingAddress || 'N/A')}</div>
        </div>
      </div>

      <div class="addr-card">
        <div class="addr-card-title">SHIP TO / DELIVERY DESTINATION</div>
        <div class="addr-card-body">
          <div class="cust-name">${escapeHtml(order.customerName || 'Valued Customer')}</div>
          <div>${escapeHtml(fullDestination)}</div>
          <div style="color:#50563D;font-weight:700;margin-top:2px;">Dispatch Condition: Frozen Thermal Box (-18°C)</div>
        </div>
      </div>
    </div>

    <!-- 3. Product Items Table -->
    <div class="table-box">
      <table>
        <thead>
          <tr>
            <th style="width:24px;text-align:center;">#</th>
            <th>Item Description</th>
            <th style="width:65px;text-align:center;">Pack</th>
            <th style="width:35px;text-align:center;">Qty</th>
            <th style="width:75px;text-align:right;">Unit Price</th>
            <th style="width:85px;text-align:right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>

    <!-- 4. Financial Calculation & Guidelines -->
    <div class="bottom-grid">
      <div class="cold-box">
        <div class="cold-title">❄️ Cold Storage Guidelines:</div>
        <div class="cold-text">
          Store immediately at <strong>-18°C</strong> upon delivery. Keep sealed until cooking. Do not refreeze once thawed.
        </div>
        <div class="cold-text" style="color:#50563D;font-weight:700;margin-top:3px;">
          For support or queries, contact us on WhatsApp: +91 80563 89214
        </div>
        <div class="declaration">
          Certified 100% Pure Vegetarian Plant-Based Products. Computer generated commercial delivery bill.
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-inner">
          <div class="sum-row">
            <span>Items Subtotal:</span>
            <span class="val">₹${Number(calculatedSubtotal).toFixed(2)}</span>
          </div>
          <div class="sum-row">
            <span>Cold Chain Delivery:</span>
            <span class="val">${(order.deliveryFee || 0) === 0 ? 'FREE' : `₹${Number(order.deliveryFee).toFixed(2)}`}</span>
          </div>
          ${
            order.convenienceFee
              ? `<div class="sum-row">
                  <span>Convenience Fee:</span>
                  <span class="val">₹${Number(order.convenienceFee).toFixed(2)}</span>
                </div>`
              : ''
          }
          <div class="sum-row" style="font-size:8.5px;color:#777;border-top:1px solid #F0F0F0;padding-top:2px;margin-top:1px;">
            <span>GST (Food Products):</span>
            <span>Inclusive in MRP</span>
          </div>
        </div>

        <div class="grand-total-bar">
          <span class="grand-total-label">Grand Total:</span>
          <span class="grand-total-val">₹${Number(order.totalAmount).toFixed(2)}</span>
        </div>
      </div>
    </div>

    <!-- 5. Signatory Footer -->
    <div class="sign-strip">
      <span>Thank you for choosing Sakthi Frozen Foods!</span>
      <span class="sign-brand">For SAKTHI FROZEN FOODS • [ Authorized Digital Signatory ]</span>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(str: unknown): string {
  if (typeof str !== 'string') return String(str || '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Print commercial packing slip directly into an isolated iframe to guarantee 1-page fit
 * with zero browser modal artifacts or duplicate pages.
 */
export function printCommercialBill(order: OrderPrintData): void {
  if (typeof window === 'undefined') return;

  const htmlContent = generatePrintSlipHtml(order);

  // Use an invisible iframe for pristine print execution
  let iframe = document.getElementById('sakthi-print-frame') as HTMLIFrameElement | null;
  if (iframe) {
    document.body.removeChild(iframe);
  }

  iframe = document.createElement('iframe');
  iframe.id = 'sakthi-print-frame';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!doc) {
    // Fallback to window.open
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 350);
    }
    return;
  }

  doc.open();
  doc.write(htmlContent);
  doc.close();

  // Trigger print after iframe renders
  setTimeout(() => {
    try {
      iframe?.contentWindow?.focus();
      iframe?.contentWindow?.print();
    } catch (err) {
      console.warn('Iframe print failed, falling back to popup:', err);
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 350);
      }
    }
  }, 250);
}
