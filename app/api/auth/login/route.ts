import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:5000/api';
    const body = await request.text();
    const response = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      body: body,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Attempt to parse JSON. If it fails, fallback to raw text response parsing.
    let data;
    try {
      data = await response.json();
    } catch (err) {
       return NextResponse.json({ success: false, error: 'Invalid response from backend' }, { status: response.status });
    }
    
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Auth service is unavailable. Start the backend server on port 5000.' }, { status: 503 });
  }
}
