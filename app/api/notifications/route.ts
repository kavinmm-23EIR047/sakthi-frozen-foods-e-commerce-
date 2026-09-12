import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

function backendUrl() {
  return process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
}

async function getAuthToken(request: Request): Promise<string | null> {
  const authorization = request.headers.get('authorization');
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.substring(7).trim();
  }
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  return token || null;
}

export async function GET(request: Request) {
  try {
    const base = backendUrl();
    const token = await getAuthToken(request);
    const url = new URL(request.url);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const response = await fetch(`${base}/notifications${url.search}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json({ success: true, count: 0, total: 0, data: [] });
  }
}
