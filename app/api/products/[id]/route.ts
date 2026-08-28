import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Product from '@/models/Product';
import { ProductType } from '@/lib/types';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const authError = requireAdmin();
    if (authError) return NextResponse.json({ success: false, error: authError.error }, { status: authError.status });

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'MongoDB is not connected. Product was not updated.' }, { status: 503 });
    }

    const updated = await Product.findByIdAndUpdate(params.id, await request.json(), { new: true, runValidators: true });
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    const product = updated.toObject();
    product.image = product.image === 'none' ? '' : product.image;
    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const authError = requireAdmin();
    if (authError) return NextResponse.json({ success: false, error: authError.error }, { status: authError.status });

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'MongoDB is not connected. Product was not deleted.' }, { status: 503 });
    }

    const deleted = await Product.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
