import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';

function backendUrl() {
  return process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
}

async function getAuthToken(request: Request): Promise<string | null> {
  const authorization = request.headers.get('authorization');
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.substring(7).trim();
  }
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  return token || null;
}

function verifyUserToken(token: string | null): string | null {
  if (!token) return null;
  const secret = process.env.JWT_SECRET || 'sakthi_frozen_foods_jwt_secret_key_2026_super_secure_auth_token_9988';
  try {
    const decoded = jwt.verify(token, secret) as { id?: string; _id?: string };
    return decoded.id || decoded._id || null;
  } catch {
    return null;
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params;
  const token = await getAuthToken(request);
  const base = backendUrl();

  if (base) {
    try {
      const response = await fetch(`${base}/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (response.ok) {
        const text = await response.text();
        if (text && text.trim()) {
          return NextResponse.json(JSON.parse(text));
        }
      }
    } catch {
      // Fallback
    }
  }

  const userId = verifyUserToken(token);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }

  try {
    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    const user = await User.findById(userId);
    if (user && Array.isArray(user.wishlist)) {
      user.wishlist = user.wishlist.filter((id: any) => id && id.toString() !== productId);
      await user.save();
    }

    return NextResponse.json({ success: true, message: 'Item removed from wishlist' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
