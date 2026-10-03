import { NextResponse } from 'next/server';

function backendUrl() {
  return process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const base = backendUrl();
    const response = await fetch(`${base}/payment/status/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const text = await response.text();
    let data: any = { success: false, error: 'Status check failed' };
    if (text && text.trim()) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { success: false, error: 'Invalid response from payment server' };
      }
    }
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Payment status service unavailable' }, { status: 503 });
  }
}
