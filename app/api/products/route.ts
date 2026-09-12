import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Product from '@/models/Product';
import { ProductType } from '@/lib/types';

// Simple in-memory rate limiting map
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100; // 100 requests per minute
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  const data = rateLimitMap.get(ip)!;
  if (now > data.resetTime) {
    data.count = 1;
    data.resetTime = now + windowMs;
    return true;
  }
  
  data.count++;
  if (data.count > maxRequests) {
    return false;
  }
  return true;
}

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  if (!rateLimit(ip)) {
    return new NextResponse(JSON.stringify({ success: false, error: 'Too many requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '0', 10);

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
    
    let productQuery = Product.find(query).sort({ code: 1 });
    
    if (limit > 0) {
      productQuery = productQuery.skip((page - 1) * limit).limit(limit);
    }
    
    const [rawProducts, totalCount] = await Promise.all([
      productQuery,
      Product.countDocuments(query)
    ]);
    
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

    return new NextResponse(JSON.stringify({ 
      success: true, 
      count: products.length, 
      total: totalCount,
      page,
      totalPages: limit > 0 ? Math.ceil(totalCount / limit) : 1,
      data: products 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=60, stale-while-revalidate=120'
      }
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
