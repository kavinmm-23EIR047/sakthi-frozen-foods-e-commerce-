import { NextResponse } from 'next/server';
import { connectToDatabase, getStoreUsers } from '@/lib/db';
import User from '@/models/User';
import { UserType } from '@/lib/types';
import Order from '@/models/Order';
import { getAuthToken, requireAdmin } from '@/lib/auth';

// 30-second micro-cache for admin users list
let usersCache: { data: string; expiresAt: number } | null = null;

export async function GET() {
  try {
    const authError = await requireAdmin();
    if (authError) {
      return NextResponse.json({ success: false, error: authError.error }, { status: authError.status });
    }

    if (usersCache && usersCache.expiresAt > Date.now()) {
      return new NextResponse(usersCache.data, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'private, max-age=15',
          'X-Cache': 'HIT',
        },
      });
    }

    const db = await connectToDatabase();
    let users: UserType[] = [];

    if (db) {
      const rawUsers = await User.find().sort({ createdAt: -1 }).select('-password -sessionVersion').lean() as any[];
      const userEmails = rawUsers
        .map((user) => String(user.email || '').trim().toLowerCase())
        .filter(Boolean);
      const rawOrders = userEmails.length
        ? await Order.find({ customerEmail: { $in: userEmails } })
            .select('customerEmail status paymentStatus totalAmount orderNumber createdAt items')
            .sort({ createdAt: -1 })
            .lean()
        : [];
      const ordersByEmail = new Map<string, any[]>();
      for (const order of rawOrders) {
        const email = String(order.customerEmail || '').trim().toLowerCase();
        const history = ordersByEmail.get(email) || [];
        history.push(order);
        ordersByEmail.set(email, history);
      }

      users = rawUsers.map((user) => {
        const orderHistory = ordersByEmail.get(String(user.email || '').trim().toLowerCase()) || [];
        const countedOrders = orderHistory.filter((order) => !['Cancelled', 'Failed', 'Payment Failed'].includes(order.status));
        const paidOrders = countedOrders.filter((order) => order.paymentStatus === 'Paid' || order.status === 'Confirmed');

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          totalOrders: countedOrders.length,
          totalSpent: paidOrders.reduce((total, order) => total + Number(order.totalAmount || 0), 0),
          joinedDate: user.joinedDate,
          address: user.address,
          orderHistory: orderHistory.map((order) => ({
            id: order._id.toString(),
            orderNumber: order.orderNumber,
            status: order.status || 'Pending',
            paymentStatus: order.paymentStatus || 'Pending',
            totalAmount: Number(order.totalAmount || 0),
            createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : '',
            items: Array.isArray(order.items) ? order.items : [],
          })),
        };
      });

      const payload = JSON.stringify({ success: true, count: users.length, data: users });
      usersCache = { data: payload, expiresAt: Date.now() + 30 * 1000 };

      return new NextResponse(payload, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'private, max-age=15',
          'X-Cache': 'MISS',
        },
      });
    } else {
      const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
      const token = await getAuthToken();
      if (backendUrl && token) {
        const response = await fetch(`${backendUrl}/users`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
      }
      users = getStoreUsers();
    }

    return NextResponse.json({ success: true, count: users.length, data: users });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
