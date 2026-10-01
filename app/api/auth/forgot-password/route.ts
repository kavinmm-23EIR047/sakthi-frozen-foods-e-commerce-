import { NextResponse } from 'next/server';

function backendUrl() {
  return process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
}

export async function POST(request: Request) {
  try {
    const base = backendUrl();
    const rawBody = await request.text();
    const response = await fetch(`${base}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: rawBody,
    });
    const text = await response.text();
    let data: any = { success: true, message: 'If an account exists, a 6-digit OTP has been sent to your email.' };
    if (text && text.trim()) {
      try {
        data = JSON.parse(text);
      } catch {
        // Fallback to default message
      }
    }
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      message: 'If an account exists, a 6-digit OTP has been sent to your email.',
    });
  }
}
