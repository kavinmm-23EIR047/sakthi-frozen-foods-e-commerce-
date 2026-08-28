import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const token = cookies().get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }
    
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:5000/api';
    
    // Forward the request to the backend with the token
    const response = await fetch(`${backendUrl}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      // Ensure we don't aggressively cache the me route
      cache: 'no-store'
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      // If the token is invalid or expired, clear the cookie
      const res = NextResponse.json(data, { status: response.status });
      res.cookies.delete('auth_token');
      return res;
    }
    
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Auth service is unavailable.' }, { status: 503 });
  }
}
