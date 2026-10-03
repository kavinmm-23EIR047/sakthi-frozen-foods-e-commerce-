import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import {
  cleanPhoneNumber,
  isValidMobileNumber,
  generateAuthToken,
} from '@/lib/authHelper';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phone, address } = body;

    if (!name || !email || !password || !phone || password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Name, email, mobile number, and an 8-character password are required' },
        { status: 400 }
      );
    }

    const cleanedPhone = cleanPhoneNumber(phone);
    if (!isValidMobileNumber(cleanedPhone)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid 10-digit Indian mobile number (e.g., 9876543210)' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const db = await connectToDatabase();
    if (db) {
      // Fast indexed lookup for duplicate check
      const userExists = await User.findOne({
        $or: [{ email: normalizedEmail }, { phone: cleanedPhone }],
      }).select('_id email phone').lean();

      if (userExists) {
        const existingUser = userExists as any;
        if (existingUser.email === normalizedEmail) {
          return NextResponse.json(
            { success: false, message: 'An account with this email address already exists' },
            { status: 400 }
          );
        }
        return NextResponse.json(
          { success: false, message: 'An account with this mobile number already exists' },
          { status: 400 }
        );
      }

      const user = await User.create({
        name: String(name).trim(),
        email: normalizedEmail,
        password,
        phone: cleanedPhone,
        address: String(address || '').trim(),
      });

      if (user) {
        const token = generateAuthToken(user._id.toString(), user.role, user.sessionVersion || 0);

        const responseData = {
          success: true,
          data: {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            token,
          },
        };

        const res = NextResponse.json(responseData, { status: 201 });
        res.cookies.set('auth_token', token, {
          httpOnly: true,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 30 * 24 * 60 * 60, // 30 days
          sameSite: 'lax',
        });

        return res;
      }

      return NextResponse.json({ success: false, message: 'Invalid user registration data' }, { status: 400 });
    }

    // Fallback to external backend if configured and db connection is null
    const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
    if (backendUrl) {
      const response = await fetch(`${backendUrl}/auth/register`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      const token = data.success && data.data ? data.data.token : undefined;
      const res = NextResponse.json(data, { status: response.status });
      if (token) {
        res.cookies.set('auth_token', token, {
          httpOnly: true,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 30 * 24 * 60 * 60,
          sameSite: 'lax',
        });
      }
      return res;
    }

    return NextResponse.json({ success: false, error: 'Database service is currently unavailable.' }, { status: 503 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'An account with this email or phone already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, message: error.message || 'Registration failed' }, { status: 500 });
  }
}
