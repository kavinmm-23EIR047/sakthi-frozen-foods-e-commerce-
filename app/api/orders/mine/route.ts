import { NextResponse } from 'next/server';

function backendUrl() {
  return process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
}

function authHeaders(request: Request) {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  const authorization = request.headers.get('authorization');
  const cookie = request.headers.get('cookie')?.match(/(?:^|; )auth_token=([^;]+)/)?.[1];
  if (authorization) headers.set('Authorization', authorization);
  else if (cookie) headers.set('Authorization', `Bearer ${decodeURIComponent(cookie)}`);
  return headers;
}

export async function GET(request: Request) {
  try {
    const base = backendUrl();
    if (!base) return NextResponse.json({ success: false, error: 'Backend API is not configured' }, { status: 503 });

    const response = await fetch(`${base}/orders/mine`, {
      method: 'GET',
      headers: authHeaders(request),
    });

    const text = await response.text();
    let data: any = { success: response.ok };
    if (text && text.trim()) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { success: false, error: 'Invalid JSON response from server' };
      }
    }
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Orders service unavailable' }, { status: 503 });
  }
}
