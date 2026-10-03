import { NextResponse } from 'next/server';

function backendUrl() {
  return process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
}

export async function GET() {
  try {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY;
    if (publicKey) {
      return NextResponse.json({ success: true, publicKey });
    }

    const base = backendUrl();
    const res = await fetch(`${base}/notifications/vapid-public-key`, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'VAPID key unavailable' }, { status: 503 });
  }
}
