import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { cleanPhoneNumber, isValidMobileNumber } from '@/lib/authHelper';

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const authHeader = request.headers.get('authorization') || '';
    const bearerToken = authHeader.replace(/^Bearer\s+/i, '').trim();
    const token = bearerToken || cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      const cookieToken = cookieStore.get('auth_token')?.value;
      if (cookieToken && cookieToken !== token) {
        try {
          decoded = jwt.verify(cookieToken, JWT_SECRET);
        } catch {}
      }
      if (!decoded) {
        return NextResponse.json({ success: false, message: 'Token expired or invalid' }, { status: 401 });
      }
    }

    const userId = decoded.id || decoded._id || decoded.userId;

    const body = await request.json();
    const { phone } = body;
    const cleaned = cleanPhoneNumber(phone);

    if (!isValidMobileNumber(cleaned)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid 10-digit Indian mobile number (e.g., 9876543210)' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    if (db) {
      // Check if phone number is already registered by another user
      const duplicate = await User.findOne({
        phone: cleaned,
        _id: { $ne: userId },
      }).select('_id').lean();

      if (duplicate) {
        return NextResponse.json(
          { success: false, message: 'This mobile number is already associated with another account. Please use a different number.' },
          { status: 400 }
        );
      }

      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
      }

      user.phone = cleaned;
      await user.save();

      return NextResponse.json({
        success: true,
        message: 'Mobile number updated successfully',
        data: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar || '',
          authProvider: user.authProvider || 'local',
        },
      });
    }

    // Fallback to standalone Express backend if DB direct connection unavailable
    const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
    if (backendUrl) {
      const response = await fetch(`${backendUrl}/auth/phone`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json({ success: false, message: 'Database service is currently unavailable.' }, { status: 503 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Failed to update phone number' }, { status: 500 });
  }
}

