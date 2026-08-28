import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:5000/api';
    const upstreamController = new AbortController();
    const upstreamTimeout = setTimeout(() => upstreamController.abort(), 55000);
    const response = await fetch(`${backendUrl}/upload`, {
      method: 'POST',
      body: await request.arrayBuffer(),
      signal: upstreamController.signal,
      headers: {
        'Content-Type': request.headers.get('content-type') || 'multipart/form-data',
      },
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