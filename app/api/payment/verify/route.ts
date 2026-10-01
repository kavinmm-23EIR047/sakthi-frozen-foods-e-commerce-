import { NextResponse } from 'next/server';

function backendUrl() {
  return process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
}

export async function POST(request: Request) {
  try {
    const base = backendUrl();
    const rawBody = await request.text();
    const response = await fetch(`${base}/payment/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: rawBody,
    });
    const text = await response.text();
    let data: any = { success: false, error: 'Payment verification failed' };
    if (text && text.trim()) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { success: false, error: 'Invalid response from payment server' };
      }
    }
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Payment service unavailable' }, { status: 503 });
  }
}
