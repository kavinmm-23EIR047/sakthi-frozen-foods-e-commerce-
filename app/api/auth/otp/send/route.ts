import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { sendOtpEmailDirect } from '@/lib/emailHelper';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const name = String(body.name || '').trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Generate secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const db = await connectToDatabase();
    let displayName = name || 'Customer';

    if (db) {
      let user = await User.findOne({ email }).select('+otpHash +otpExpiresAt +otpAttempts');

      if (user) {
        // Rate limit: Max 5 requests in 10 minutes
        if (user.otpExpiresAt && user.otpExpiresAt > new Date() && (user.otpAttempts || 0) >= 5) {
          return NextResponse.json(
            { success: false, message: 'Too many requests. Please wait a few minutes before requesting another code.' },
            { status: 429 }
          );
        }

        user.otpHash = otpHash;
        user.otpExpiresAt = otpExpiresAt;
        user.otpAttempts = (user.otpAttempts || 0) + 1;
        displayName = user.name || displayName;
        await user.save();
      } else {
        // User doesn't exist yet, create a pending/new user record
        const defaultName = name || email.split('@')[0];
        displayName = defaultName;
        await User.create({
          name: defaultName,
          email,
          phone: '',
          role: 'Customer',
          isEmailVerified: false,
          authProvider: 'local',
          otpHash,
          otpExpiresAt,
          otpAttempts: 1,
          totalOrders: 0,
          totalSpent: 0,
          joinedDate: new Date().toISOString().split('T')[0],
          address: '',
          sessionVersion: 0,
        });
      }
    }

    // Send email using Brevo / SMTP
    const emailRes = await sendOtpEmailDirect(email, displayName, otp);

    if (!emailRes.success) {
      console.error('Failed to dispatch OTP email:', emailRes.error);
      return NextResponse.json(
        { success: false, message: 'Unable to deliver verification code. Please check your email address or try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${email}`,
    });
  } catch (error: any) {
    console.error('OTP Send error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to send verification code.' },
      { status: 500 }
    );
  }
}

