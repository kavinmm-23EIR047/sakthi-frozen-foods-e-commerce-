import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Review from '@/models/Review';

import { requireAdmin } from '@/lib/auth';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const authError = requireAdmin();
    if (authError) return NextResponse.json({ success: false, error: authError.error }, { status: authError.status });

    const db = await connectToDatabase();
    if (!db) return NextResponse.json({ success: false, error: 'MongoDB is not connected.' }, { status: 503 });
    const deleted = await Review.findByIdAndDelete(params.id);
    if (!deleted) return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Review deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}