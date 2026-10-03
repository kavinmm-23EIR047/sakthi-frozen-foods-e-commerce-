import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * POST /api/payment/verify
 *
 * Razorpay Standard Web Checkout — Step 3: Verify Payment Signature
 *
 * Verifies the HMAC-SHA256 signature that Razorpay sends after payment,
 * then proxies to the backend to mark the DB order as Paid.
 *
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId? }
 */
export async function POST(request: Request) {
  try {
    const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
    if (!KEY_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Razorpay secret is not configured on the server.' },
        { status: 500 }
      );
    }

    const rawBody = await request.text();
    let body: any = {};
    try { body = JSON.parse(rawBody); } catch {}

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Incomplete payment response: missing order_id, payment_id, or signature.' },
        { status: 400 }
      );
    }

    // --- Signature verification (HMAC-SHA256) ---
    const expected = crypto
      .createHmac('sha256', KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const expectedBuf = Buffer.from(expected, 'utf8');
    const receivedBuf = Buffer.from(razorpay_signature, 'utf8');

    const signaturesMatch =
      expectedBuf.length === receivedBuf.length &&
      crypto.timingSafeEqual(expectedBuf, receivedBuf);

    if (!signaturesMatch) {
      return NextResponse.json(
        { success: false, error: 'Payment signature verification failed. Do NOT mark as paid.' },
        { status: 400 }
      );
    }

    // --- Signature valid — proxy to backend to update order status in DB ---
    const backendUrl =
      process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    const response = await fetch(`${backendUrl}/payment/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: rawBody,
    });

    const text = await response.text();
    let data: any = { success: false, error: 'Payment verification failed' };
    if (text && text.trim()) {
      try { data = JSON.parse(text); } catch {}
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Payment service unavailable' },
      { status: 503 }
    );
  }
}
