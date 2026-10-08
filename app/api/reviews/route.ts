import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Review from '@/models/Review';

const AUTHENTIC_GOOGLE_REVIEWS = [
  {
    _id: '6abd3b5d5ba05dd78c577cbf',
    authorName: 'vasanthan',
    location: 'Dindukkal',
    rating: 5,
    comment: 'Recently brought some frozen food which is good especially those vegan foods. The quality and pricing of the products are good. They are doing bulk orders also for marriage function and more.',
    avatar: '',
    dateText: '8 months ago',
    isGoogleReview: true,
  },
  {
    _id: '6abd3b5d5ba05dd78c577cc0',
    authorName: 'DHARSHAN S',
    location: 'Nilgiris',
    rating: 5,
    comment: 'I recently visited a place near Kavundapalayam. The products were really good—veg fish, veg chicken, and veg mutton. The taste was exactly like non-veg. Everyone should definitely visit this place and explore it.',
    avatar: '',
    dateText: '8 months ago',
    isGoogleReview: true,
  },
  {
    _id: '6abd3b5d5ba05dd78c577cc1',
    authorName: 'Kiruthika Ganesan',
    location: 'Coimbatore',
    rating: 5,
    comment: 'I tried food at mock meat,It was an amazing experience that I first time tried a very different food amazed by its taste. I love this new concept they tried in food. I think even a crazy non-veg lovers also fell in love with this taste.',
    avatar: '',
    dateText: '2 years ago',
    isGoogleReview: true,
  },
  {
    _id: '6abd3b5d5ba05dd78c577cc2',
    authorName: 'Sathish Kumar',
    location: 'Coimbatore',
    rating: 5,
    comment: 'Food quality is very good. French fries and samosa must try. Cheap and best service very affordable',
    avatar: '',
    dateText: 'a year ago',
    isGoogleReview: true,
  },
  {
    _id: '6abd3b5d5ba05dd78c577cc3',
    authorName: 'sathyapushpavanam sathyapushpavanam',
    location: 'Coimbatore',
    rating: 5,
    comment: 'Very friendly shop, lot of mock meat and frozen foods, taste and quality is soo good very useful shop for veg food shops and catering people',
    avatar: '',
    dateText: 'a year ago',
    isGoogleReview: true,
  },
  {
    _id: '6abd3b5d5ba05dd78c577cc4',
    authorName: 'Tarun Teja',
    location: 'Vijayawada',
    rating: 5,
    comment: 'Best place to buy Vegan products in Coimbatore and Frozen snacks also available at excellent prices along with good quality',
    avatar: '',
    dateText: 'a year ago',
    isGoogleReview: true,
  },
  {
    _id: '6abd3b5d5ba05dd78c577cc5',
    authorName: 'Pushpa Valli',
    location: 'Coimbatore',
    rating: 5,
    comment: 'Very nice product. Excellent taste and fresh also. Very easy to cook',
    avatar: '',
    dateText: 'a year ago',
    isGoogleReview: true,
  },
];

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db) {
      const reviews = await Review.find().sort({ rating: -1, createdAt: -1 });
      const data = reviews && reviews.length > 0 ? reviews : AUTHENTIC_GOOGLE_REVIEWS;
      return NextResponse.json({ success: true, count: data.length, data }, {
        headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300' }
      });
    }
    return NextResponse.json({ success: true, count: AUTHENTIC_GOOGLE_REVIEWS.length, data: AUTHENTIC_GOOGLE_REVIEWS });
  } catch (error: any) {
    console.warn('Reviews GET fallback to authentic reviews:', error?.message);
    return NextResponse.json({ success: true, count: AUTHENTIC_GOOGLE_REVIEWS.length, data: AUTHENTIC_GOOGLE_REVIEWS });
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