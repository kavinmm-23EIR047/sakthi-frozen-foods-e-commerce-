import { NextResponse } from 'next/server';
import { connectToDatabase, getStoreUsers } from '@/lib/db';
import User from '@/models/User';
import { UserType } from '@/lib/types';

export async function GET() {
  try {
    const db = await connectToDatabase();
    let users: UserType[] = [];

    if (db) {
      const rawUsers = await User.find().sort({ createdAt: -1 });
      users = rawUsers.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        totalOrders: u.totalOrders,
        totalSpent: u.totalSpent,
        joinedDate: u.joinedDate,
        address: u.address,
      }));
    } else {
      users = getStoreUsers();
    }

    return NextResponse.json({ success: true, count: users.length, data: users });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
