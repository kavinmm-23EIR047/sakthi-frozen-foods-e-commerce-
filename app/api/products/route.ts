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

// Fast in-memory cache for Next.js App Router (1-minute TTL)
const productCache = new Map<string, { data: string; expiresAt: number }>();

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  if (!rateLimit(ip)) {
    return new NextResponse(JSON.stringify({ success: false, error: 'Too many requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '0', 10);

  const cacheKey = `next:prod:${category.toLowerCase().trim()}:${search.toLowerCase().trim()}:${page}:${limit}`;
  const cached = productCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return new NextResponse(cached.data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
        'X-Cache': 'HIT',
      },
    });
  }

  try {
    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'MongoDB is not connected. Product data was not loaded.' }, { status: 503 });
    }

    const query: any = {};
    if (category && category !== 'All') {
      query.category = category;
    }
    if (search && search.trim()) {
      const cleanSearch = search.trim();
      const fullRegex = { $regex: cleanSearch, $options: 'i' };
      const words = cleanSearch.split(/\s+/).filter(Boolean);
      
      const searchConditions: any[] = [
        { name: fullRegex },
        { category: fullRegex },
        { description: fullRegex },
        { code: fullRegex },
      ];

      if (words.length > 1) {
        words.forEach((w) => {
          const wRegex = { $regex: w, $options: 'i' };
          searchConditions.push({ name: wRegex });
          searchConditions.push({ category: wRegex });
          searchConditions.push({ description: wRegex });
        });
      }

      query.$or = searchConditions;
    }
    
    let productQuery = Product.find(query)
      .select('code name weight mrp price category description stock isAvailable image isPopular variants')
      .sort({ code: 1 })
      .lean();
    
    if (limit > 0) {
      productQuery = productQuery.skip((page - 1) * limit).limit(limit);
    }
    
    let rawProducts: any[];
    let totalCount: number;
    if (page === 1 && limit > 0) {
      rawProducts = await productQuery;
      if (rawProducts.length < limit) {
        totalCount = rawProducts.length;
      } else {
        totalCount = await Product.countDocuments(query);
      }
    } else {
      [rawProducts, totalCount] = await Promise.all([
        productQuery,
        Product.countDocuments(query),
      ]);
    }
    
    const products: ProductType[] = rawProducts.map((p: any) => ({
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
    }));

    const responsePayload = JSON.stringify({ 
      success: true, 
      count: products.length, 
      total: totalCount,
      page,
      totalPages: limit > 0 ? Math.ceil(totalCount / limit) : 1,
      data: products 
    });

    productCache.set(cacheKey, { data: responsePayload, expiresAt: Date.now() + 60 * 1000 });

    return new NextResponse(responsePayload, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
        'X-Cache': 'MISS',
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
      isAvailable: typeof body.isAvailable === 'boolean' ? body.isAvailable : true,
      image: body.image || '',
      rating: body.rating || 4.8,
      isPopular: typeof body.isPopular === 'boolean' ? body.isPopular : false,
    });

    // Invalidate in-memory product cache on product creation
    productCache.clear();

    return NextResponse.json({ success: true, data: newProd }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
