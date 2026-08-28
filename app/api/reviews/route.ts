import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Review from '@/models/Review';

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (!db) return NextResponse.json({ success: false, error: 'MongoDB is not connected.' }, { status: 503 });
    const reviews = await Review.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: reviews.length, data: reviews });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = await connectToDatabase();
    if (!db) return NextResponse.json({ success: false, error: 'MongoDB is not connected.' }, { status: 503 });
    const body = await request.json();
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
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}