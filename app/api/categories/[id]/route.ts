import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Category from '@/models/Category';

import { requireAdmin } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authError = await requireAdmin();
    if (authError) return NextResponse.json({ success: false, error: authError.error }, { status: authError.status });

    const body = await request.json();
    const db = await connectToDatabase();

    if (db) {
      const updated = await Category.findByIdAndUpdate(id, body, { new: true });
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        data: {
          id: updated._id.toString(),
          name: updated.name,
          description: updated.description,
          image: updated.image,
          icon: updated.icon,
        },
      });
    } else {
      return NextResponse.json({ success: false, error: 'Database is not connected; category was not updated.' }, { status: 503 });
    }
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

    if (db) {
      const deleted = await Category.findByIdAndDelete(id);
      if (!deleted) {
        return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Category deleted successfully' });
    } else {
      return NextResponse.json({ success: false, error: 'Database is not connected; category was not deleted.' }, { status: 503 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
