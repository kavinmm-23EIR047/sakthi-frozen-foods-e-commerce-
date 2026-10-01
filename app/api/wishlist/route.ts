import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import Product from '@/models/Product';

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

function authHeaders(request: Request, token: string | null) {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
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

function formatProduct(p: any) {
  if (!p) return null;
  return {
    id: p._id.toString(),
    code: p.code,
    name: p.name,
    weight: p.weight,
    mrp: p.mrp,
    price: p.price,
    category: p.category,
    description: p.description,
    stock: p.stock,
    image: p.image === 'none' ? '' : p.image,
    isPopular: p.isPopular,
    variants: p.variants || [],
  };
}

// GET /api/wishlist
export async function GET(request: Request) {
  const token = await getAuthToken(request);
  const base = backendUrl();

  // Try proxying to Express backend
  if (base) {
    try {
      const response = await fetch(`${base}/wishlist`, {
        method: 'GET',
        headers: authHeaders(request, token),
        cache: 'no-store',
      });
      if (response.ok) {
        const text = await response.text();
        if (text && text.trim()) {
          return NextResponse.json(JSON.parse(text));
        }
      }
    } catch {
      // Fallback to direct DB
    }
  }

  // Direct DB Fallback
  const userId = verifyUserToken(token);
  if (!userId) {
    return NextResponse.json({ success: true, data: [], count: 0 });
  }

  try {
    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: true, data: [], count: 0 });
    }

    const user = await User.findById(userId).populate('wishlist').lean() as any;
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const products = (user.wishlist || [])
      .filter((p: any) => p && p._id)
      .map(formatProduct);

    return NextResponse.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/wishlist (Sync or Toggle)
export async function POST(request: Request) {
  const token = await getAuthToken(request);
  const base = backendUrl();
  const rawBody = await request.text();

  if (base) {
    try {
      let parsed: any = {};
      try {
        parsed = rawBody ? JSON.parse(rawBody) : {};
      } catch {
        parsed = {};
      }
      const endpoint = parsed.productIds ? `${base}/wishlist/sync` : `${base}/wishlist/toggle`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: authHeaders(request, token),
        body: rawBody,
      });
      if (response.ok) {
        const text = await response.text();
        if (text && text.trim()) {
          return NextResponse.json(JSON.parse(text));
        }
      }
    } catch {
      // Fallback to direct DB
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

    let parsedBody: any = {};
    try {
      parsedBody = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (!Array.isArray(user.wishlist)) {
      user.wishlist = [];
    }

    // If batch sync
    if (Array.isArray(parsedBody.productIds)) {
      const existingSet = new Set(user.wishlist.map((id: any) => id.toString()));
      for (const pid of parsedBody.productIds) {
        if (mongoose.isValidObjectId(pid) && !existingSet.has(pid.toString())) {
          user.wishlist.push(new mongoose.Types.ObjectId(pid));
        }
      }
      await user.save();

      const populated = await User.findById(userId).populate('wishlist').lean() as any;
      const products = (populated.wishlist || []).filter((p: any) => p && p._id).map(formatProduct);
      return NextResponse.json({
        success: true,
        count: products.length,
        data: products,
        wishlistIds: (populated.wishlist || []).map((p: any) => p._id.toString()),
      });
    }

    // If single toggle
    const { productId } = parsedBody;
    if (!productId || !mongoose.isValidObjectId(productId)) {
      return NextResponse.json({ success: false, error: 'Valid productId is required' }, { status: 400 });
    }

    const strId = productId.toString();
    const existingIndex = user.wishlist.findIndex((id: any) => id && id.toString() === strId);
    let isSaved = false;

    if (existingIndex > -1) {
      user.wishlist.splice(existingIndex, 1);
      isSaved = false;
    } else {
      user.wishlist.push(new mongoose.Types.ObjectId(productId));
      isSaved = true;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      isSaved,
      wishlistIds: user.wishlist.map((id: any) => id.toString()),
      message: isSaved ? 'Added to wishlist' : 'Removed from wishlist',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/wishlist
export async function DELETE(request: Request) {
  const token = await getAuthToken(request);
  const base = backendUrl();

  if (base) {
    try {
      const response = await fetch(`${base}/wishlist`, {
        method: 'DELETE',
        headers: authHeaders(request, token),
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
    return NextResponse.json({ success: true, data: [] });
  }

  try {
    const db = await connectToDatabase();
    if (db) {
      await User.findByIdAndUpdate(userId, { $set: { wishlist: [] } });
    }
    return NextResponse.json({ success: true, data: [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
