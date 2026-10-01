import { NextResponse } from 'next/server';

function backendUrl() {
  return process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
}

function authHeaders(request: Request) {
  const headers = new Headers();
  const authorization = request.headers.get('authorization');
  const cookie = request.headers.get('cookie')?.match(/(?:^|; )auth_token=([^;]+)/)?.[1];
  // Also check for token in query params for invoice viewing
  const url = new URL(request.url);
  const queryToken = url.searchParams.get('token');
  if (authorization) headers.set('Authorization', authorization);
  else if (cookie) headers.set('Authorization', `Bearer ${decodeURIComponent(cookie)}`);
  else if (queryToken) headers.set('Authorization', `Bearer ${queryToken}`);
  return headers;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const base = backendUrl();
    const headers = authHeaders(request);
    const url = new URL(request.url);
    const queryToken = url.searchParams.get('token');
    const backendEndpoint = `${base}/orders/${id}/invoice${queryToken ? `?token=${encodeURIComponent(queryToken)}` : ''}`;

    const response = await fetch(backendEndpoint, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      const data = await response.json().catch(() => ({ success: false, error: 'Invoice not available' }));
      return NextResponse.json(data, { status: response.status });
    }
    
    const contentType = response.headers.get('content-type') || 'application/pdf';
    const disposition = response.headers.get('content-disposition') || `inline; filename="Invoice-${id}.pdf"`;
    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': disposition,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Unable to fetch invoice' }, { status: 500 });
  }
}
