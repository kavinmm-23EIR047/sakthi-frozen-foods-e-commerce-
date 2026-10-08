import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Review from '@/models/Review';

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db) {
      const reviews = await Review.find().sort({ rating: -1, createdAt: -1 });
      return NextResponse.json({ success: true, count: (reviews || []).length, data: reviews || [] }, {
        headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300' }
      });
    }
    return NextResponse.json({ success: true, count: 0, data: [] });
  } catch (error: any) {
    console.warn('Reviews GET error:', error?.message);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to fetch reviews', data: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = await connectToDatabase();
    const body = await request.json();
    if (db) {
      const review = await Review.create({
        authorName: body.authorName || 'Google User',
        location: body.location || 'India',
        rating: Number(body.rating) || 5,
        comment: body.comment,
        avatar: body.avatar || '',
        dateText: body.dateText || 'Just now',
        isGoogleReview: true,
      });
      return NextResponse.json({ success: true, data: review }, { status: 201 });
    }
    return NextResponse.json({ success: false, error: 'Database not connected' }, { status: 503 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}