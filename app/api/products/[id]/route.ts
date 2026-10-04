import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Product from '@/models/Product';
import { ProductType } from '@/lib/types';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'MongoDB is not connected. Product data was not loaded.' }, { status: 503 });
    }

    const p = await Product.findById(id);
      if (!p) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      }
      const product: ProductType = {
        id: p._id.toString(),
        code: p.code,
        name: p.name,
        weight: p.weight,
        mrp: p.mrp,
        price: p.price,
        category: p.category,
        description: p.description,
        stock: p.stock,
        isAvailable: p.isAvailable ?? p.stock > 0,
        image: p.image === 'none' ? '' : (p.image?.includes('via.placeholder.com') ? p.image.replace('via.placeholder.com', 'placehold.co').replace('?text=', '/png?text=') : p.image),
        rating: p.rating,
        isPopular: p.isPopular,
      };
      return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { requireAdmin } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authError = await requireAdmin();
    if (authError) return NextResponse.json({ success: false, error: authError.error }, { status: authError.status });

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'MongoDB is not connected. Product was not updated.' }, { status: 503 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};
    if (typeof body.isAvailable === 'boolean') updates.isAvailable = body.isAvailable;
    if (typeof body.isPopular === 'boolean') updates.isPopular = body.isPopular;
    if (body.stock !== undefined) {
      const stock = Number(body.stock);
      if (!Number.isInteger(stock) || stock < 0) return NextResponse.json({ success: false, error: 'Stock must be a non-negative integer.' }, { status: 400 });
      updates.stock = stock;
    }
    for (const key of ['name', 'category', 'weight', 'price', 'mrp', 'description', 'image', 'variants'] as const) {
      if (body[key] !== undefined) updates[key] = body[key];
    }
    if (!Object.keys(updates).length) return NextResponse.json({ success: false, error: 'No valid product fields provided.' }, { status: 400 });
    const updated = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    const product = updated.toObject();
    product.isAvailable = product.isAvailable ?? product.stock > 0;
    product.image = product.image === 'none' ? '' : product.image;
    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authError = await requireAdmin();
    if (authError) return NextResponse.json({ success: false, error: authError.error }, { status: authError.status });

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'MongoDB is not connected. Product was not deleted.' }, { status: 503 });
    }

    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
