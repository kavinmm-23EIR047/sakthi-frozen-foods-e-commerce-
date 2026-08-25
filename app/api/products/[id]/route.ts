import { NextResponse } from 'next/server';
import { connectToDatabase, getStoreProducts } from '@/lib/db';
import Product from '@/models/Product';
import { ProductType } from '@/lib/seedData';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const db = await connectToDatabase();
    
    if (db) {
      const p = await Product.findById(id);
      if (!p) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      }
      const product: ProductType = {
        id: p._id.toString(),
        code: p.code,
        name: p.name,
        weight: p.weight,
        price: p.price,
        category: p.category,
        description: p.description,
        stock: p.stock,
        image: p.image,
        rating: p.rating,
        isPopular: p.isPopular,
      };
      return NextResponse.json({ success: true, data: product });
    } else {
      // Local fallback
      const products = getStoreProducts();
      const product = products.find(p => p.id === id);
      if (!product) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: product });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
