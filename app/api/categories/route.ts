import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';

// Fast in-memory cache for Next.js categories (5-minute TTL)
let categoriesCache: { data: string; expiresAt: number } | null = null;

export async function GET(request: Request) {
  if (categoriesCache && categoriesCache.expiresAt > Date.now()) {
    return new NextResponse(categoriesCache.data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=1800',
        'X-Cache': 'HIT',
      },
    });
  }

  try {
    const db = await connectToDatabase();
    let categories = [];

    if (db) {
      const rawCategories = await Category.find().sort({ createdAt: 1 }).lean();
      categories = rawCategories.map((c: any) => ({
        id: c._id.toString(),
        name: c.name,
        description: c.description,
        image: c.image,
        icon: c.icon,
      }));
      if (categories.length === 0) {
        const productCategories = await Product.distinct('category', { category: { $type: 'string', $ne: '' } });
        categories = productCategories.sort().map((name) => ({
          id: `product-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          name,
          description: '',
          image: '',
          icon: 'Package',
        }));
      }
    } else {
      return NextResponse.json({ success: false, count: 0, data: [], error: 'Database is not connected; live categories are unavailable.' }, { status: 503 });
    }

    const payload = JSON.stringify({ success: true, count: categories.length, data: categories });
    categoriesCache = { data: payload, expiresAt: Date.now() + 5 * 60 * 1000 };

    return new NextResponse(payload, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=1800',
        'X-Cache': 'MISS',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { requireAdmin } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const authError = await requireAdmin();
    if (authError) return NextResponse.json({ success: false, error: authError.error }, { status: authError.status });

    const body = await request.json();
    const db = await connectToDatabase();

    if (db) {
      const newCat = await Category.create({
        name: body.name,
        description: body.description || '',
        image: body.image || '',
        icon: body.icon || 'Leaf',
      });

      categoriesCache = null;

      return NextResponse.json({
        success: true,
        data: {
          id: newCat._id.toString(),
          name: newCat.name,
          description: newCat.description,
          image: newCat.image,
          icon: newCat.icon,
        },
      });
    } else {
      return NextResponse.json({ success: false, error: 'Database is not connected; categories were not saved.' }, { status: 503 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
