import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err: any) {
      const res = NextResponse.json({ success: false, error: 'Token expired or invalid' }, { status: 401 });
      res.cookies.delete('auth_token');
      return res;
    }

    // Direct DB lookup — no backend hop needed
    const db = await connectToDatabase();
    if (db) {
      const user = await User.findById(decoded.id)
        .select('_id name email phone role totalOrders totalSpent address sessionVersion')
        .lean();

      if (!user) {
        const res = NextResponse.json({ success: false, error: 'User not found' }, { status: 401 });
        res.cookies.delete('auth_token');
        return res;
      }

      const u = user as any;

      // Invalidate if sessionVersion mismatch (e.g. password was changed)
      if (decoded.sessionVersion !== undefined && u.sessionVersion !== decoded.sessionVersion) {
        const res = NextResponse.json({ success: false, error: 'Session expired, please log in again' }, { status: 401 });
        res.cookies.delete('auth_token');
        return res;
      }

      return NextResponse.json({
        success: true,
        data: {
          _id: u._id.toString(),
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          totalOrders: u.totalOrders,
          totalSpent: u.totalSpent,
          address: u.address,
        },
      });
    }

    // Fallback: proxy to external backend if DB unavailable
    const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
    if (backendUrl) {
      const response = await fetch(`${backendUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const text = await response.text();
      let data: any = { success: false, error: 'Invalid response' };
      try { data = JSON.parse(text); } catch {}
      if (!response.ok || !data.success) {
        const res = NextResponse.json(data, { status: response.status });
        res.cookies.delete('auth_token');
        return res;
      }
      return NextResponse.json(data);
    }

    return NextResponse.json({ success: false, error: 'Auth service unavailable' }, { status: 503 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Auth check failed' }, { status: 500 });
  }
}
