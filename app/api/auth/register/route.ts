import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:5000/api';
    const body = await request.text();
    const response = await fetch(`${backendUrl}/auth/register`, {
      method: 'POST',
      body: body,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    let data;
    try {
      data = await response.json();
    } catch (err) {
       return NextResponse.json({ success: false, error: 'Invalid response from backend' }, { status: response.status });
    }
    
    const res = NextResponse.json(data, { status: response.status });
    
    // If successful and token is present, store it in an HttpOnly cookie
    if (data.success && data.data && data.data.token) {
      res.cookies.set('auth_token', data.data.token, {
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        sameSite: 'lax',
      });
      // Do not send the token back in the JSON payload
      delete data.data.token;
    }
    
    return res;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Auth service is unavailable. Start the backend server on port 5000.' }, { status: 503 });
  }
}
