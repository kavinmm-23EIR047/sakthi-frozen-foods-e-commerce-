import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { generateAuthToken, cleanPhoneNumber, isValidMobileNumber } from '@/lib/authHelper';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const otp = String(body.otp || '').trim();
    const name = String(body.name || '').trim();
    const rawPhone = String(body.phone || '').trim();

    if (!email || !otp || otp.length !== 6) {
      return NextResponse.json(
        { success: false, message: 'Please enter your email and the 6-digit verification code.' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, message: 'Database connection unavailable.' }, { status: 503 });
    }

    const user = await User.findOne({ email }).select('+otpHash +otpExpiresAt +otpAttempts +sessionVersion');

    if (!user || !user.otpHash || !user.otpExpiresAt) {
      return NextResponse.json(
        { success: false, message: 'No verification code found. Please request a new code.' },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (new Date() > new Date(user.otpExpiresAt)) {
      return NextResponse.json(
        { success: false, message: 'The verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify hash
    const submittedHash = crypto.createHash('sha256').update(otp).digest('hex');
    if (submittedHash !== user.otpHash) {
      return NextResponse.json(
        { success: false, message: 'Incorrect verification code. Please check your email and try again.' },
        { status: 400 }
      );
    }

    // Code is valid! Mark email as verified and clear OTP
    user.isEmailVerified = true;
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpAttempts = 0;

    // If a custom name was provided during registration
    if (name && (!user.name || user.name === email.split('@')[0])) {
      user.name = name;
    }

    // If phone number was provided during registration
    if (rawPhone) {
      const cleanPhone = cleanPhoneNumber(rawPhone);
      if (isValidMobileNumber(cleanPhone)) {
        const duplicatePhone = await User.findOne({ phone: cleanPhone, _id: { $ne: user._id } }).select('_id').lean();
        if (!duplicatePhone) {
          user.phone = cleanPhone;
        }
      }
    }

    await user.save();

    // Generate JWT auth session
    const token = generateAuthToken(user._id.toString(), user.role, user.sessionVersion || 0);

    const responseData = {
      success: true,
      message: 'Signed in successfully!',
      data: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        avatar: user.avatar || '',
        authProvider: user.authProvider || 'local',
        token,
      },
    };

    const res = NextResponse.json(responseData, { status: 200 });

    // Set secure HttpOnly cookie
    res.cookies.set('auth_token', token, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: 'lax',
    });

    return res;
  } catch (error: any) {
    console.error('OTP Verify error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to verify code.' },
      { status: 500 }
    );
  }
}
