import { NextResponse } from 'next/server';
import { connectToDatabase, getStoreUsers } from '@/lib/db';
import User from '@/backend/models/User';

import { requireAdmin } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authError = await requireAdmin();
    if (authError) return NextResponse.json({ success: false, error: authError.error }, { status: authError.status });

    const body = await request.json();
    const db = await connectToDatabase();

    if (db) {
      const updated = await User.findByIdAndUpdate(id, { role: body.role }, { new: true });
      if (!updated) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Role updated successfully', role: updated.role });
    } else {
      const users = getStoreUsers();
      const user = users.find((u) => u.id === id);
      if (!user) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }
      user.role = body.role;
      return NextResponse.json({ success: true, message: 'Role updated successfully', role: user.role });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
