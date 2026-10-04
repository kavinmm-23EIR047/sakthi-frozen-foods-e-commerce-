const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const COMPANY_NAME = 'SAKTHI FROZEN FOODS';
const COMPANY_TAGLINE = '100% Plant-Based Meat & Vegan Delicacies';
const COMPANY_EMAIL = process.env.EMAIL_FROM || 'sakthifrozenfoods@gmail.com';
const COMPANY_PHONE = '+91 80563 89214';
const COMPANY_ADDRESS = 'peons colony, Kalpana Theatre, opposite Edayarpalayam - Koundampalayam Road, Koundampalayam, Coimbatore, Tamil Nadu - 641030, India';
const FSSAI_LIC_NO = '12421008000456';
const WEBSITE_URL = 'buy.tnmockmeat.com';

/**
 * Convert number into formal Indian Currency Words (e.g. "Four Hundred Sixteen and Fifty Paise")
 */
function numberToWords(num) {
  if (!num || num === 0) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertHundreds(n) {
    let str = '';
    if (n >= 100) { str += ones[Math.floor(n / 100)] + ' Hundred '; n %= 100; }
    if (n >= 20) { str += tens[Math.floor(n / 10)] + ' '; n %= 10; }
    if (n > 0) { str += ones[n] + ' '; }
    return str.trim();
  }

  const integer = Math.floor(num);
  const decimal = Math.round((num - integer) * 100);
  let result = '';

  if (integer >= 10000000) result += convertHundreds(Math.floor(integer / 10000000)) + ' Crore ';
  const lakh = Math.floor((integer % 10000000) / 100000);
  if (lakh > 0) result += convertHundreds(lakh) + ' Lakh ';
  const thousand = Math.floor((integer % 100000) / 1000);
  if (thousand > 0) result += convertHundreds(thousand) + ' Thousand ';
  const hundred = integer % 1000;
  if (hundred > 0) result += convertHundreds(hundred);

  result = result.trim();
  if (decimal > 0) {
    result += ' and ' + convertHundreds(decimal) + ' Paise';
  }
  return result || 'Zero';
}

function getLogoPath() {
  const possiblePaths = [
    path.join(__dirname, '../../public/logo.png'),
    path.join(__dirname, '../../logo.png'),
    path.join(process.cwd(), 'public/logo.png'),
    path.join(process.cwd(), 'logo.png'),
    path.join(process.cwd(), '../public/logo.png'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/**
 * Generate official, full-page, executive commercial Tax Invoice PDF buffer for an order.
 * @param {Object} order - Order document
 * @returns {Promise<Buffer>}
 */
function generateInvoicePdf(order) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 28,
        size: 'A4',
        info: {
          Title: `Tax Invoice - ${order.orderNumber}`,
          Author: 'Sakthi Frozen Foods',
          Subject: `Commercial Tax Invoice for Order #${order.orderNumber}`,
        },
      });

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // ─── Design Tokens & Color Palette ──────────────────────────────────────
      const C_PRIMARY = '#50563D';       // Deep Olive Primary
      const C_ACCENT = '#656B4F';        // Brand Olive Green
      const C_DARK = '#1E201D';          // Crisp Dark Neutral
      const C_MUTED = '#555E51';         // Secondary Label Gray
      const C_LIGHT_BG = '#F4F7F0';      // Soft Light Olive Background
      const C_BORDER = '#D4DBC9';        // Clean Box Border
      const C_BORDER_STRONG = '#656B4F'; // Olive Accent Border
      const C_WHITE = '#FFFFFF';

      const pageWidth = doc.page.width;   // 595.28 pt
      const pageHeight = doc.page.height; // 841.89 pt
      const margin = 28;
      const contentWidth = pageWidth - (margin * 2); // 539.28 pt

      // ─── 1. TOP HEADER SECTION (Logo + Brand + Tax Invoice Meta) ────────────
      const headerH = 104;
      doc.roundedRect(margin, margin, contentWidth, headerH, 6).fillAndStroke(C_WHITE, C_BORDER);
      doc.rect(margin, margin, 5, headerH).fill(C_ACCENT);

      const logoPath = getLogoPath();
      let textStartX = margin + 16;
      if (logoPath) {
        try {
          doc.image(logoPath, margin + 14, margin + 16, { fit: [68, 68], align: 'center', valign: 'center' });
          textStartX = margin + 92;
        } catch (e) {
          // fallback gracefully
        }
      }

      // Tax Invoice Meta Block (Right Column)
      const metaBoxW = 185;
      const metaBoxX = pageWidth - margin - metaBoxW - 12;

      // Available width for Left Column (strictly bounded to prevent any overlap with right column)
      const leftColW = metaBoxX - textStartX - 15;

      // Company Info (Left Column)
      doc.fillColor(C_PRIMARY).fontSize(14).font('Helvetica-Bold')
        .text(COMPANY_NAME, textStartX, margin + 10, { width: leftColW, ellipsis: true });

      doc.fillColor(C_ACCENT).fontSize(8).font('Helvetica-Bold')
        .text(COMPANY_TAGLINE, textStartX, margin + 27, { width: leftColW, ellipsis: true });

      doc.fillColor(C_MUTED).fontSize(7).font('Helvetica')
        .text(COMPANY_ADDRESS, textStartX, margin + 39, { width: leftColW, height: 26, ellipsis: true, lineGap: 1 });

      doc.fillColor(C_MUTED).fontSize(7).font('Helvetica')
        .text(`Phone: ${COMPANY_PHONE}  |  Email: ${COMPANY_EMAIL}`, textStartX, margin + 67, { width: leftColW, ellipsis: true });

      doc.fillColor(C_PRIMARY).fontSize(7).font('Helvetica-Bold')
        .text(`FSSAI Lic. No: ${FSSAI_LIC_NO}  |  State: Tamil Nadu (33)`, textStartX, margin + 78, { width: leftColW, ellipsis: true });

      doc.fillColor(C_ACCENT).fontSize(7).font('Helvetica-Bold')
        .text(`Website: ${WEBSITE_URL}`, textStartX, margin + 89, { width: leftColW, ellipsis: true });

      // Tax Invoice Meta Block (Right Column)
      doc.fillColor(C_PRIMARY).fontSize(15).font('Helvetica-Bold')
        .text('TAX INVOICE', metaBoxX, margin + 10, { width: metaBoxW, align: 'right' });

      doc.fillColor(C_DARK).fontSize(8.5).font('Helvetica-Bold')
        .text(`Invoice No: ${order.orderNumber}`, metaBoxX, margin + 28, { width: metaBoxW, align: 'right' });

      const formattedDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
      });
      doc.fillColor(C_MUTED).fontSize(7.5).font('Helvetica')
        .text(`Invoice Date: ${formattedDate}`, metaBoxX, margin + 41, { width: metaBoxW, align: 'right' });

      const isPaid = order.paymentStatus === 'Paid';
      const payStatusText = isPaid ? 'PAID (Online Gateway)' : 'PAYMENT PENDING (Online)';

      doc.fillColor(isPaid ? '#15803D' : '#DC2626')
        .fontSize(8).font('Helvetica-Bold')
        .text(`Status: ${payStatusText}`, metaBoxX, margin + 55, { width: metaBoxW, align: 'right' });

      doc.fillColor(C_MUTED).fontSize(7.5).font('Helvetica')
        .text(`Payment Mode: ${order.paymentMethod || 'Online'}`, metaBoxX, margin + 68, { width: metaBoxW, align: 'right' });

      doc.fillColor(C_PRIMARY).fontSize(7).font('Helvetica-Bold')
        .text(`Delivery: -18°C Cold Chain Express`, metaBoxX, margin + 81, { width: metaBoxW, align: 'right' });

      let currentY = margin + headerH + 10;

      // ─── 2. BILLED TO & SHIPPED TO ADDRESS CARDS ─────────────────────────────
      const cardW = (contentWidth - 10) / 2;
      const cardH = 88;

      // Billed To Card
      doc.roundedRect(margin, currentY, cardW, cardH, 5).fillAndStroke(C_WHITE, C_BORDER);
      doc.roundedRect(margin, currentY, cardW, 18, 4).fill(C_LIGHT_BG);
      doc.rect(margin, currentY + 12, cardW, 6).fill(C_LIGHT_BG); // square bottom of top header
      doc.rect(margin, currentY + 18, cardW, 0.5).fill(C_BORDER);

      doc.fillColor(C_ACCENT).fontSize(8).font('Helvetica-Bold')
        .text('BILLED TO (BUYER DETAILS)', margin + 10, currentY + 5);

      doc.fillColor(C_DARK).fontSize(9).font('Helvetica-Bold')
        .text(order.customerName || 'Customer', margin + 10, currentY + 24);

      doc.fillColor(C_MUTED).fontSize(8).font('Helvetica')
        .text(`Email: ${order.customerEmail || 'N/A'}`, margin + 10, currentY + 37, { width: cardW - 20, ellipsis: true })
        .text(`Phone: +91 ${order.customerPhone || 'N/A'}`, margin + 10, currentY + 49)
        .text(`Address: ${order.shippingAddress || 'Customer Address'}`, margin + 10, currentY + 61, { width: cardW - 20, height: 22, ellipsis: true });

      // Shipped To Card
      const shipX = margin + cardW + 10;
      doc.roundedRect(shipX, currentY, cardW, cardH, 5).fillAndStroke(C_WHITE, C_BORDER);
      doc.roundedRect(shipX, currentY, cardW, 18, 4).fill(C_LIGHT_BG);
      doc.rect(shipX, currentY + 12, cardW, 6).fill(C_LIGHT_BG);
      doc.rect(shipX, currentY + 18, cardW, 0.5).fill(C_BORDER);

      doc.fillColor(C_ACCENT).fontSize(8).font('Helvetica-Bold')
        .text('SHIPPED TO (DELIVERY ADDRESS)', shipX + 10, currentY + 5);

      doc.fillColor(C_DARK).fontSize(9).font('Helvetica-Bold')
        .text(order.customerName || 'Customer', shipX + 10, currentY + 24);

      const shipLocation = [order.city, order.district, order.state, order.pincode].filter(Boolean).join(', ');
      doc.fillColor(C_MUTED).fontSize(8).font('Helvetica')
        .text(`Address: ${order.shippingAddress || ''}`, shipX + 10, currentY + 37, { width: cardW - 20, height: 20, ellipsis: true })
        .text(order.landmark ? `Landmark: ${order.landmark}` : (shipLocation ? `Destination: ${shipLocation}` : `City: Coimbatore`), shipX + 10, currentY + 58, { width: cardW - 20, ellipsis: true })
        .text(`Contact: +91 ${order.customerPhone || 'N/A'}`, shipX + 10, currentY + 70);

      currentY += cardH + 12;

      // ─── 3. ITEMIZED PRODUCTS TABLE ──────────────────────────────────────────
      const col = {
        num: { x: margin, w: 26 },
        desc: { x: margin + 26, w: 216 },
        pack: { x: margin + 242, w: 68 },
        qty: { x: margin + 310, w: 38 },
        rate: { x: margin + 348, w: 90 },
        amount: { x: margin + 438, w: contentWidth - 438 },
      };

      const tableHeaderH = 22;
      doc.roundedRect(margin, currentY, contentWidth, tableHeaderH, 4).fill(C_ACCENT);
      doc.rect(margin, currentY + 14, contentWidth, 8).fill(C_ACCENT);

      doc.fillColor(C_WHITE).fontSize(8).font('Helvetica-Bold')
        .text('#', col.num.x, currentY + 7, { width: col.num.w, align: 'center' })
        .text('ITEM DESCRIPTION', col.desc.x + 8, currentY + 7, { width: col.desc.w - 8 })
        .text('PACK SIZE', col.pack.x, currentY + 7, { width: col.pack.w, align: 'center' })
        .text('QTY', col.qty.x, currentY + 7, { width: col.qty.w, align: 'center' })
        .text('UNIT PRICE (INR)', col.rate.x, currentY + 7, { width: col.rate.w - 8, align: 'right' })
        .text('AMOUNT (INR)', col.amount.x, currentY + 7, { width: col.amount.w - 10, align: 'right' });

      currentY += tableHeaderH;

      // Table Rows
      const items = order.items || [];
      const rowH = 28;
      items.forEach((item, index) => {
        const isEven = index % 2 === 1;
        if (isEven) {
          doc.rect(margin, currentY, contentWidth, rowH).fill(C_LIGHT_BG);
        }
        doc.rect(margin, currentY, contentWidth, rowH).stroke(C_BORDER);

        doc.fillColor(C_PRIMARY).fontSize(8.5).font('Helvetica-Bold')
          .text(`${index + 1}`, col.num.x, currentY + 9, { width: col.num.w, align: 'center' });

        doc.fillColor(C_DARK).fontSize(8.5).font('Helvetica-Bold')
          .text(item.name || 'Plant-Based Food Product', col.desc.x + 8, currentY + 5, { width: col.desc.w - 12, ellipsis: true });
        
        doc.fillColor(C_MUTED).fontSize(7).font('Helvetica')
          .text('100% Pure Vegetarian / Frozen Meat Alternative', col.desc.x + 8, currentY + 16, { width: col.desc.w - 12, ellipsis: true });

        doc.fillColor(C_MUTED).fontSize(8).font('Helvetica-Bold')
          .text(item.weight || '1 KG', col.pack.x, currentY + 9, { width: col.pack.w, align: 'center' });

        doc.fillColor(C_PRIMARY).fontSize(8.5).font('Helvetica-Bold')
          .text(`${item.quantity || 1}`, col.qty.x, currentY + 9, { width: col.qty.w, align: 'center' });

        const price = Number(item.price || 0);
        const itemTotal = price * (item.quantity || 1);

        doc.fillColor(C_DARK).fontSize(8.5).font('Helvetica')
          .text(price.toFixed(2), col.rate.x, currentY + 9, { width: col.rate.w - 8, align: 'right' });

        doc.fillColor(C_PRIMARY).fontSize(8.5).font('Helvetica-Bold')
          .text(itemTotal.toFixed(2), col.amount.x, currentY + 9, { width: col.amount.w - 10, align: 'right' });

        currentY += rowH;
      });

      currentY += 12;

      // ─── 4. FINANCIAL SUMMARY & INSTRUCTIONS SECTION ─────────────────────────
      const summaryW = 215;
      const summaryX = pageWidth - margin - summaryW;
      const subtotal = order.subtotal ?? (order.totalAmount - (order.deliveryFee || 0) - (order.convenienceFee || 0));
      const deliveryFee = order.deliveryFee || 0;
      const convFee = order.convenienceFee || 0;

      // Left Column (Words + Storage Instructions + Declarations)
      const leftW = contentWidth - summaryW - 12;
      
      // Amount in words box
      doc.roundedRect(margin, currentY, leftW, 36, 4).fillAndStroke(C_WHITE, C_BORDER);
      doc.fillColor(C_ACCENT).fontSize(7.5).font('Helvetica-Bold').text('AMOUNT IN WORDS:', margin + 8, currentY + 6);
      doc.fillColor(C_PRIMARY).fontSize(8.5).font('Helvetica-BoldOblique')
        .text(`Indian Rupees ${numberToWords(order.totalAmount)} Only`, margin + 8, currentY + 18, { width: leftW - 16 });

      // Cold storage directions box
      doc.roundedRect(margin, currentY + 42, leftW, 46, 4).fillAndStroke(C_LIGHT_BG, C_BORDER);
      doc.fillColor(C_ACCENT).fontSize(8).font('Helvetica-Bold')
        .text('Cold Storage & Quality Assurance Guidelines:', margin + 8, currentY + 48);
      doc.fillColor(C_MUTED).fontSize(7.5).font('Helvetica')
        .text('Store immediately at -18 deg C or colder upon arrival. Keep tightly sealed in food-grade packaging until preparation. Do not refreeze once thawed.', margin + 8, currentY + 60, { width: leftW - 16, lineGap: 1.5 });

      // Terms & Declaration box
      doc.roundedRect(margin, currentY + 94, leftW, 36, 4).fillAndStroke(C_WHITE, C_BORDER);
      doc.fillColor(C_DARK).fontSize(7).font('Helvetica-Bold')
        .text('Declaration & Certification:', margin + 8, currentY + 100);
      doc.fillColor(C_MUTED).fontSize(6.8).font('Helvetica')
        .text('This invoice confirms delivery of 100% vegetarian plant-based mock meats. All taxes and cold-chain charges are included as specified. Computer generated official bill.', margin + 8, currentY + 110, { width: leftW - 16 });

      // Right Column: Summary Card
      const sumCardH = 130;
      doc.roundedRect(summaryX, currentY, summaryW, sumCardH, 5).fillAndStroke(C_WHITE, C_BORDER);

      let sumY = currentY + 10;
      doc.fillColor(C_MUTED).fontSize(8).font('Helvetica').text('Subtotal (Items):', summaryX + 10, sumY);
      doc.fillColor(C_DARK).fontSize(8.5).font('Helvetica-Bold').text(`INR ${Number(subtotal).toFixed(2)}`, summaryX + 90, sumY, { width: summaryW - 100, align: 'right' });

      sumY += 18;
      doc.fillColor(C_MUTED).fontSize(8).font('Helvetica').text('Cold Chain Delivery:', summaryX + 10, sumY);
      doc.fillColor(deliveryFee === 0 ? '#15803D' : C_DARK).fontSize(8.5).font('Helvetica-Bold')
        .text(deliveryFee === 0 ? 'FREE' : `INR ${Number(deliveryFee).toFixed(2)}`, summaryX + 90, sumY, { width: summaryW - 100, align: 'right' });

      if (convFee > 0) {
        sumY += 18;
        doc.fillColor(C_MUTED).fontSize(8).font('Helvetica').text('Convenience Fee (2.5%):', summaryX + 10, sumY);
        doc.fillColor(C_DARK).fontSize(8.5).font('Helvetica-Bold').text(`INR ${Number(convFee).toFixed(2)}`, summaryX + 90, sumY, { width: summaryW - 100, align: 'right' });
      }

      sumY += 18;
      doc.fillColor(C_MUTED).fontSize(8).font('Helvetica').text('GST (Food Products):', summaryX + 10, sumY);
      doc.fillColor(C_MUTED).fontSize(8).font('Helvetica').text('Inclusive in MRP', summaryX + 90, sumY, { width: summaryW - 100, align: 'right' });

      // Grand Total Highlight Banner
      const totalBarY = currentY + sumCardH - 36;
      doc.roundedRect(summaryX, totalBarY, summaryW, 36, 4).fill(C_ACCENT);
      doc.fillColor(C_WHITE).fontSize(9).font('Helvetica-Bold').text('TOTAL AMOUNT', summaryX + 10, totalBarY + 13);
      doc.fillColor(C_WHITE).fontSize(12).font('Helvetica-Bold').text(`INR ${Number(order.totalAmount).toFixed(2)}`, summaryX + 85, totalBarY + 11, { width: summaryW - 95, align: 'right' });

      // ─── 5. SIGNATORY & VERIFICATION BLOCK ────────────────────────────────────
      const signY = pageHeight - margin - 78;
      doc.rect(margin, signY, contentWidth, 0.5).fill(C_BORDER);

      // Left side: Customer Care & Helpline
      doc.fillColor(C_PRIMARY).fontSize(8).font('Helvetica-Bold')
        .text(`Thank you for shopping with ${COMPANY_NAME}!`, margin, signY + 6);
      doc.fillColor(C_MUTED).fontSize(7.2).font('Helvetica')
        .text(`Need assistance? WhatsApp/Call: ${COMPANY_PHONE}  |  Email: ${COMPANY_EMAIL}`, margin, signY + 17)
        .text(`Storefront: ${WEBSITE_URL}  |  Location: Koundampalayam, Coimbatore - 641030`, margin, signY + 27);

      // Right side: Authorized Digital Signatory
      const signBoxW = 160;
      const signBoxX = pageWidth - margin - signBoxW;
      doc.fillColor(C_PRIMARY).fontSize(7.5).font('Helvetica-Bold')
        .text(`For ${COMPANY_NAME}`, signBoxX, signY + 6, { width: signBoxW, align: 'right' });
      doc.fillColor(C_ACCENT).fontSize(7).font('Helvetica-Bold')
        .text('[ Authorized Digital Signatory ]', signBoxX, signY + 19, { width: signBoxW, align: 'right' });
      doc.fillColor(C_MUTED).fontSize(6.5).font('Helvetica')
        .text('Computer Generated Tax Invoice', signBoxX, signY + 29, { width: signBoxW, align: 'right' });

      // ─── 6. BOTTOM SECURITY & IDENTIFIER STRIP ────────────────────────────────
      const footerBarY = pageHeight - margin - 22;
      doc.roundedRect(margin, footerBarY, contentWidth, 18, 3).fill(C_LIGHT_BG);
      doc.fillColor(C_MUTED).fontSize(6.5).font('Helvetica')
        .text(`Order Reference: ${order._id || order.id || order.orderNumber}  |  FSSAI Lic: ${FSSAI_LIC_NO}  |  Certified 100% Pure Vegetarian Plant-Based Product Range`, margin, footerBarY + 5.5, { align: 'center', width: contentWidth });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generateInvoicePdf,
  numberToWords,
};
