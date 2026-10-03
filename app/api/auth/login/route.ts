import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import {
  cleanPhoneNumber,
  isValidMobileNumber,
  generateAuthToken,
  comparePassword,
} from '@/lib/authHelper';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, identifier, password } = body;
    const rawInput = String(identifier || email || phone || '').trim();

    if (!rawInput || !password) {
      return NextResponse.json(
        { success: false, message: 'Please enter your mobile number or email and password' },
        { status: 400 }
      );
    }

    const cleanedPhone = cleanPhoneNumber(rawInput);
    const isMobile = isValidMobileNumber(cleanedPhone);
    const normalizedEmail = rawInput.toLowerCase();

    const db = await connectToDatabase();
    if (db) {
      const searchConditions = [];
      if (isMobile) {
        searchConditions.push({ phone: cleanedPhone });
        searchConditions.push({ phone: `+91${cleanedPhone}` });
        searchConditions.push({ phone: `91${cleanedPhone}` });
      }
      searchConditions.push({ email: normalizedEmail });
      if (rawInput && rawInput !== cleanedPhone && rawInput !== normalizedEmail) {
        searchConditions.push({ phone: rawInput });
      }

      const user = await User.findOne({ $or: searchConditions }).select('+password +sessionVersion');

      if (user && (await comparePassword(password, user.password))) {
        if (!user.phone || !isValidMobileNumber(user.phone)) {
          if (isMobile) {
            user.phone = cleanedPhone;
            await user.save();
          } else {
            return NextResponse.json(
              {
                success: false,
                message: 'Mobile number verification required. Please register with your 10-digit mobile number.',
              },
              { status: 403 }
            );
          }
        }

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

        const res = NextResponse.json(responseData, { status: 200 });
        res.cookies.set('auth_token', token, {
          httpOnly: true,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 30 * 24 * 60 * 60, // 30 days
          sameSite: 'lax',
        });

        return res;
      }

      return NextResponse.json(
        {
          success: false,
          message: isMobile ? 'Incorrect mobile number or password' : 'Incorrect email or password',
        },
        { status: 401 }
      );
    }

    // Fallback to external backend if configured and db connection is null
    const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
    if (backendUrl) {
      const response = await fetch(`${backendUrl}/auth/login`, {
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
    return NextResponse.json({ success: false, message: error.message || 'Login failed' }, { status: 500 });
  }
}
