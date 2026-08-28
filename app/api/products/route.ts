import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Product from '@/models/Product';
import { ProductType } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  try {
    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'MongoDB is not connected. Product data was not loaded.' }, { status: 503 });
    }

    const query: any = {};
    if (category && category !== 'All') {
      query.category = category;
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    const rawProducts = await Product.find(query).sort({ code: 1 });
    const products: ProductType[] = rawProducts.map((p) => ({
      id: p._id.toString(),
      code: p.code,
      name: p.name,
      weight: p.weight,
      mrp: p.mrp,
      price: p.price,
      category: p.category,
      description: p.description,
      stock: p.stock,
      image: p.image === 'none' ? '' : (p.image?.includes('via.placeholder.com') ? p.image.replace('via.placeholder.com', 'placehold.co').replace('?text=', '/png?text=') : p.image),
      rating: p.rating,
      isPopular: p.isPopular,
    }));

    return NextResponse.json({ success: true, count: products.length, data: products });
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

    if (!db) {
      return NextResponse.json({ success: false, error: 'MongoDB is not connected. Product was not saved.' }, { status: 503 });
    }

    const newProd = await Product.create({
      code: body.code || String(Date.now()),
      name: body.name,
      weight: body.weight || '1 KG',
      mrp: Number(body.mrp) || Number(body.price),
      price: Number(body.price),
      category: body.category || 'Mutton Alternatives',
      description: body.description || '',
      stock: Number(body.stock) || 50,
      image: body.image || '',
      rating: body.rating || 4.8,
      isPopular: body.isPopular || false,
    });

    return NextResponse.json({ success: true, data: newProd }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
