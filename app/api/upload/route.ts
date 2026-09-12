import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const upstreamController = new AbortController();
    const upstreamTimeout = setTimeout(() => upstreamController.abort(), 55000);

    let authHeader = request.headers.get('authorization');
    if (!authHeader) {
      const cookieStore = await cookies();
      const token = cookieStore.get('auth_token')?.value;
      if (token) {
        authHeader = `Bearer ${token}`;
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': request.headers.get('content-type') || 'multipart/form-data',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${backendUrl}/upload`, {
      method: 'POST',
      body: await request.arrayBuffer(),
      signal: upstreamController.signal,
      headers,
    });
    clearTimeout(upstreamTimeout);
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return NextResponse.json({ success: false, error: 'Image upload timed out. Check the Cloudinary service and try again.' }, { status: 504 });
    }
    return NextResponse.json({ success: false, error: 'Upload service is unavailable. Start the backend server on port 5000.' }, { status: 503 });
  }
}