import { NextResponse } from 'next/server';

function backendUrl() {
  return process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
}

function authHeaders(request: Request) {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  const authorization = request.headers.get('authorization');
  const cookie = request.headers.get('cookie')?.match(/(?:^|; )auth_token=([^;]+)/)?.[1];
  if (authorization) headers.set('Authorization', authorization);
  else if (cookie) headers.set('Authorization', `Bearer ${decodeURIComponent(cookie)}`);
  return headers;
}

async function proxy(request: Request, id: string) {
  const base = backendUrl();
  if (!base) return NextResponse.json({ success: false, error: 'Render API is not configured' }, { status: 503 });
  const response = await fetch(`${base}/orders/${id}`, {
    method: request.method,
    headers: authHeaders(request),
    body: request.method === 'GET' ? undefined : await request.text(),
  });
  return NextResponse.json(await response.json(), { status: response.status });
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return proxy(request, (await params).id);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return proxy(request, (await params).id);
}
