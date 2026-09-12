import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import Cart from '@/models/Cart';
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

async function saveItemsDirect(userId: string, items: any[]) {
  const merged = new Map<string, { productId: string; weight: string; quantity: number }>();
  for (const item of Array.isArray(items) ? items : []) {
    const productId = String(item.productId || '');
    const weight = String(item.weight || '');
    const quantity = Number(item.quantity);
    if (!productId || !weight || !Number.isInteger(quantity) || quantity < 1 || quantity > 50) continue;
    const key = `${productId}:${weight}`;
    const prev = merged.get(key);
    merged.set(key, { productId, weight, quantity: Math.min(50, (prev?.quantity || 0) + quantity) });
  }

  const normalized = Array.from(merged.values());
  const productIds = Array.from(new Set(normalized.map((item) => item.productId))).filter((id) => mongoose.isValidObjectId(id));
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const productMap = new Map(products.map((p: any) => [p._id.toString(), p]));

  const available: any[] = [];
  const unavailable: any[] = [];

  for (const item of normalized) {
    const product: any = productMap.get(item.productId);
    if (!product) {
      unavailable.push(item);
      continue;
    }
    available.push({
      productId: item.productId,
      weight: item.weight,
      quantity: item.quantity,
      name: product.name,
      price: product.price,
      stock: product.stock,
      image: product.image === 'none' ? '' : product.image,
    });
  }

  const storedItems = available.map(({ productId, weight, quantity }) => ({ productId, weight, quantity }));
  const cart = (await Cart.findOneAndUpdate(
    { userId },
    { userId, items: storedItems },
    { upsert: true, new: true, runValidators: true }
  ).lean()) as any;

  return { available, unavailable, updatedAt: cart?.updatedAt };
}

// POST /api/cart/items
export async function POST(request: Request) {
  const token = await getAuthToken(request);
  const base = backendUrl();
  const rawBody = await request.text();

  if (base) {
    try {
      const response = await fetch(`${base}/cart/items`, {
        method: 'POST',
        headers: authHeaders(request, token),
        body: rawBody,
      });
      if (response.ok) {
        return NextResponse.json(await response.json());
      }
    } catch {
      // Fallback
    }
  }

  const userId = verifyUserToken(token);
  if (!userId) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });

  try {
    const db = await connectToDatabase();
    if (!db) return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });

    const body = rawBody ? JSON.parse(rawBody) : {};
    const { productId, weight, quantity = 1 } = body;
    if (!productId || !weight) return NextResponse.json({ success: false, error: 'Invalid cart item' }, { status: 400 });

    const cart = (await Cart.findOne({ userId }).lean()) as any;
    const result = await saveItemsDirect(userId, [...(cart?.items || []), { productId, weight, quantity: Number(quantity) }]);
    return NextResponse.json({ success: true, data: result.available, unavailable: result.unavailable, updatedAt: result.updatedAt });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH /api/cart/items
export async function PATCH(request: Request) {
  const token = await getAuthToken(request);
  const base = backendUrl();
  const rawBody = await request.text();

  if (base) {
    try {
      const response = await fetch(`${base}/cart/items`, {
        method: 'PATCH',
        headers: authHeaders(request, token),
        body: rawBody,
      });
      if (response.ok) {
        return NextResponse.json(await response.json());
      }
    } catch {
      // Fallback
    }
  }

  const userId = verifyUserToken(token);
  if (!userId) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });

  try {
    const db = await connectToDatabase();
    if (!db) return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });

    const body = rawBody ? JSON.parse(rawBody) : {};
    const { productId, weight, quantity } = body;
    if (!productId || !weight || quantity === undefined) return NextResponse.json({ success: false, error: 'Invalid cart item' }, { status: 400 });

    const cart = (await Cart.findOne({ userId }).lean()) as any;
    const items = (cart?.items || []).filter((item: any) => !(item.productId === productId && item.weight === weight));
    if (Number(quantity) > 0) {
      items.push({ productId, weight, quantity: Number(quantity) });
    }
    const result = await saveItemsDirect(userId, items);
    return NextResponse.json({ success: true, data: result.available, unavailable: result.unavailable, updatedAt: result.updatedAt });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/cart/items
export async function DELETE(request: Request) {
  const token = await getAuthToken(request);
  const base = backendUrl();
  const rawBody = await request.text();

  if (base) {
    try {
      const response = await fetch(`${base}/cart/items`, {
        method: 'DELETE',
        headers: authHeaders(request, token),
        body: rawBody,
      });
      if (response.ok) {
        return NextResponse.json(await response.json());
      }
    } catch {
      // Fallback
    }
  }

  const userId = verifyUserToken(token);
  if (!userId) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });

  try {
    const db = await connectToDatabase();
    if (!db) return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });

    const body = rawBody ? JSON.parse(rawBody) : {};
    const { productId, weight } = body;
    if (!productId || !weight) return NextResponse.json({ success: false, error: 'Invalid cart item' }, { status: 400 });

    const cart = (await Cart.findOne({ userId }).lean()) as any;
    const items = (cart?.items || []).filter((item: any) => !(item.productId === productId && item.weight === weight));
    const result = await saveItemsDirect(userId, items);
    return NextResponse.json({ success: true, data: result.available, unavailable: result.unavailable, updatedAt: result.updatedAt });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
