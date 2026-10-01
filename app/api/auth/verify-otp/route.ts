import { NextResponse } from 'next/server';

function backendUrl() {
  return process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
}

export async function POST(request: Request) {
  try {
    const base = backendUrl();
    const rawBody = await request.text();
    const response = await fetch(`${base}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: rawBody,
    });
    const text = await response.text();
    let data: any = { success: false, message: 'Invalid response from server' };
    if (text && text.trim()) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { success: false, message: 'Invalid JSON response' };
      }
    }
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Unable to verify OTP. Please try again.',
    }, { status: 500 });
  }
}
