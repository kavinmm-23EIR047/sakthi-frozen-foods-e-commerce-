import { NextResponse } from 'next/server';
import { connectToDatabase, getStoreCategories, saveStoreCategory, deleteStoreCategory } from '@/lib/db';
import Category from '@/models/Category';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const db = await connectToDatabase();

    if (db) {
      const updated = await Category.findByIdAndUpdate(params.id, body, { new: true });
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
      const categories = getStoreCategories();
      const index = categories.findIndex((c) => c.id === params.id);
      if (index === -1) {
        return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
      }
      const updatedCat = { ...categories[index], ...body };
      saveStoreCategory(updatedCat);
      return NextResponse.json({ success: true, data: updatedCat });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const db = await connectToDatabase();

    if (db) {
      const deleted = await Category.findByIdAndDelete(params.id);
      if (!deleted) {
        return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Category deleted successfully' });
    } else {
      deleteStoreCategory(params.id);
      return NextResponse.json({ success: true, message: 'Category deleted successfully' });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
