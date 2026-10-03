import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * POST /api/payment/create-order
 *
 * Razorpay Standard Web Checkout — Step 1: Create Order
 *
 * Creates a Razorpay order directly via the Razorpay REST API using
 * server-side credentials (KEY_SECRET never reaches the browser).
 *
 * Body: { amount: number (INR, e.g. 499.00), currency?: string, receipt?: string }
 * Returns: { order_id, amount (paise), currency, key_id }
 */
export async function POST(request: Request) {
  try {
    const KEY_ID = process.env.RAZORPAY_KEY_ID;
    const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

    if (!KEY_ID || !KEY_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Razorpay credentials are not configured on the server.' },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { amount, currency = 'INR', receipt } = body as {
      amount?: number;
      currency?: string;
      receipt?: string;
    };

    // Convert to paise (multiply by 100 if amount looks like INR rupees)
    const amountInPaise = Math.round(
      typeof amount === 'number' && amount > 0
        ? amount < 500 // heuristic: if < 500 assume it is already in paise
          ? amount
          : amount * 100
        : 0
    );

    if (!amountInPaise || amountInPaise < 100) {
      return NextResponse.json(
        { success: false, error: 'Amount must be at least ₹1 (100 paise).' },
        { status: 400 }
      );
    }

    const receiptId = receipt || `rcpt_${crypto.randomBytes(5).toString('hex')}`;

    // Call Razorpay Orders API (server-to-server — KEY_SECRET stays on server)
    const razorpayRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64')}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency,
        receipt: receiptId,
      }),
    });

    if (!razorpayRes.ok) {
      const errText = await razorpayRes.text();
      let errJson: any = {};
      try { errJson = JSON.parse(errText); } catch {}
      return NextResponse.json(
        { success: false, error: errJson?.error?.description || 'Razorpay order creation failed.' },
        { status: razorpayRes.status }
      );
    }

    const order = await razorpayRes.json();

    return NextResponse.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      // KEY_ID is public — safe to return for frontend modal initialization
      key_id: KEY_ID,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Order creation failed.' },
      { status: 500 }
    );
  }
}
