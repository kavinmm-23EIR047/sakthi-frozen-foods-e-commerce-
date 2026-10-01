import { NextResponse } from 'next/server';

function backendUrl() {
  return process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
}

export async function POST(request: Request) {
  try {
    const base = backendUrl();
    const rawBody = await request.text();
    const response = await fetch(`${base}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: rawBody,
    });
    const text = await response.text();
    let data: any = { success: false, error: 'Password reset service error' };
    if (text && text.trim()) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { success: false, error: 'Invalid response from server' };
      }
    }
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Password reset service unavailable' }, { status: 503 });
  }
}
