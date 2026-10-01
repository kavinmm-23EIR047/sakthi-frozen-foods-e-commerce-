import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';

export async function GET(request: Request) {
  try {
    const db = await connectToDatabase();
    let categories = [];

    if (db) {
      const rawCategories = await Category.find().sort({ createdAt: 1 });
      categories = rawCategories.map((c) => ({
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

    return NextResponse.json({ success: true, count: categories.length, data: categories }, {
      headers: { 'Cache-Control': 'private, max-age=60, stale-while-revalidate=300' },
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
