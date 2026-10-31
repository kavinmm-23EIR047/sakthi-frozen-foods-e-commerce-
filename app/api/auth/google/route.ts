import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { generateAuthToken } from '@/lib/authHelper';
import { OAuth2Client } from 'google-auth-library';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, idToken, credential } = body;

    const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!googleClientId) {
      return NextResponse.json(
        { success: false, message: 'Google OAuth is not configured on the server (missing GOOGLE_CLIENT_ID).' },
        { status: 500 }
      );
    }

    const oauthClient = new OAuth2Client(
      googleClientId,
      googleClientSecret,
      'postmessage'
    );

    let tokenToVerify = idToken || credential;

    // If an authorization code was provided by the frontend popup, exchange it for tokens
    if (!tokenToVerify && code) {
      try {
        const tokenResponse = await oauthClient.getToken({
          code,
          redirect_uri: 'postmessage',
        });
        tokenToVerify = tokenResponse.tokens.id_token;
      } catch (exchangeError: any) {
        console.error('Failed to exchange Google authorization code:', exchangeError.message);
        return NextResponse.json(
          { success: false, message: 'Failed to exchange Google authorization code. Please try again.' },
          { status: 400 }
        );
      }
    }

    if (!tokenToVerify) {
      return NextResponse.json(
        { success: false, message: 'Google authentication credential or code is required' },
        { status: 400 }
      );
    }

    // Cryptographically verify the Google ID token
    let ticket;
    try {
      ticket = await oauthClient.verifyIdToken({
        idToken: tokenToVerify,
        audience: googleClientId,
      });
    } catch (verifyError: any) {
      console.error('Google ID token verification failed:', verifyError.message);
      return NextResponse.json(
        { success: false, message: 'Invalid or expired Google authentication credentials.' },
        { status: 401 }
      );
    }

    const payload = ticket.getPayload();
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Failed to retrieve user profile from Google token.' },
        { status: 401 }
      );
    }

    const { sub: googleId, email, email_verified, name, picture } = payload;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'No email address found in your Google profile.' },
        { status: 400 }
      );
    }

    // Validate email verification status from Google
    if (!email_verified) {
      return NextResponse.json(
        { success: false, message: 'Your Google email address is not verified. Please verify your email with Google first.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanName = String(name || payload.given_name || 'Google User').trim();
    const avatar = String(picture || '').trim();

    const db = await connectToDatabase();
    if (db) {
      // Check whether user exists by googleId first, then by email
      let user = await User.findOne({ googleId });

      if (!user) {
        user = await User.findOne({ email: normalizedEmail });

        if (user) {
          // Safe account linking: Existing email/password user logging in with Google
          let needsSave = false;
          if (!user.googleId) {
            user.googleId = googleId;
            needsSave = true;
          }
          if (!user.avatar && avatar) {
            user.avatar = avatar;
            needsSave = true;
          }
          if (!user.isEmailVerified) {
            user.isEmailVerified = true;
            needsSave = true;
          }
          if (!user.authProvider) {
            user.authProvider = 'google';
            needsSave = true;
          }
          if (needsSave) {
            await user.save();
          }
        } else {
          // User does not exist, create a new account
          user = await User.create({
            name: cleanName,
            email: normalizedEmail,
            phone: '',
            googleId,
            avatar,
            authProvider: 'google',
            isEmailVerified: true,
            role: 'Customer',
            totalOrders: 0,
            totalSpent: 0,
            joinedDate: new Date().toISOString().split('T')[0],
            address: '',
            sessionVersion: 0,
          });
        }
      } else {
        // User found by googleId: Keep avatar and email verification up to date
        let needsSave = false;
        if (avatar && user.avatar !== avatar) {
          user.avatar = avatar;
          needsSave = true;
        }
        if (!user.isEmailVerified) {
          user.isEmailVerified = true;
          needsSave = true;
        }
        if (needsSave) {
          await user.save();
        }
      }

      const token = generateAuthToken(user._id.toString(), user.role, user.sessionVersion || 0);

      const responseData = {
        success: true,
        data: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          role: user.role,
          avatar: user.avatar || '',
          authProvider: user.authProvider || 'google',
          token,
        },
      };

      const res = NextResponse.json(responseData, { status: 200 });
      res.cookies.set('auth_token', token, {
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60,
        sameSite: 'lax',
      });

      return res;
    }

    // Fallback to standalone Express backend if direct DB connection is unavailable
    const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
    if (backendUrl) {
      const response = await fetch(`${backendUrl}/auth/google`, {
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
          maxAge: 7 * 24 * 60 * 60,
          sameSite: 'lax',
        });
      }
      return res;
    }

    return NextResponse.json({ success: false, message: 'Database service is currently unavailable.' }, { status: 503 });
  } catch (error: any) {
    console.error('Google auth route error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Google authentication failed' }, { status: 500 });
  }
}

