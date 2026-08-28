import { NextResponse } from 'next/server';
import { connectToDatabase, getStoreCategories, saveStoreCategory } from '@/lib/db';
import Category from '@/models/Category';

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
    } else {
      categories = getStoreCategories();
    }

    return NextResponse.json({ success: true, count: categories.length, data: categories });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { requireAdmin } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const authError = requireAdmin();
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
      const newCat = {
        id: `cat-${Date.now()}`,
        name: body.name,
        description: body.description || '',
        image: body.image || '',
        icon: body.icon || 'Leaf',
      };
      saveStoreCategory(newCat);
      return NextResponse.json({ success: true, data: newCat });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
