import { NextResponse } from 'next/server';
import { connectToDatabase, getStoreProducts, saveStoreProduct } from '@/lib/db';
import Product from '@/models/Product';
import { ProductType } from '@/lib/seedData';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  try {
    const db = await connectToDatabase();
    let products: ProductType[] = [];

    if (db) {
      const query: any = {};
      if (category && category !== 'All') {
        query.category = category;
      }
      if (search) {
        query.name = { $regex: search, $options: 'i' };
      }
      const rawProducts = await Product.find(query).sort({ code: 1 });
      products = rawProducts.map((p) => ({
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
      }));
    } else {
      // Local fallback
      products = getStoreProducts();
      if (category && category !== 'All') {
        products = products.filter((p) => p.category === category);
      }
      if (search) {
        const q = search.toLowerCase();
        products = products.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
      }
    }

    return NextResponse.json({ success: true, count: products.length, data: products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await connectToDatabase();

    if (db) {
      const newProd = await Product.create({
        code: body.code || String(Date.now()),
        name: body.name,
        weight: body.weight || '1 KG',
        price: Number(body.price),
        category: body.category || 'Mutton Alternatives',
        description: body.description || '',
        stock: Number(body.stock) || 50,
        image: body.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
        rating: body.rating || 4.8,
        isPopular: body.isPopular || false,
      });

      return NextResponse.json({
        success: true,
        data: {
          id: newProd._id.toString(),
          code: newProd.code,
          name: newProd.name,
          weight: newProd.weight,
          price: newProd.price,
          category: newProd.category,
          description: newProd.description,
          stock: newProd.stock,
          image: newProd.image,
          rating: newProd.rating,
          isPopular: newProd.isPopular,
        },
      });
    } else {
      const newProduct: ProductType = {
        id: `prod-${Date.now()}`,
        code: body.code || String(Date.now()),
        name: body.name,
        weight: body.weight || '1 KG',
        price: Number(body.price),
        category: body.category || 'Mutton Alternatives',
        description: body.description || '',
        stock: Number(body.stock) || 50,
        image: body.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
        rating: body.rating || 4.8,
        isPopular: body.isPopular || false,
      };
      saveStoreProduct(newProduct);
      return NextResponse.json({ success: true, data: newProduct });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
