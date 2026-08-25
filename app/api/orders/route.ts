import { NextResponse } from 'next/server';
import { connectToDatabase, getStoreOrders, saveStoreOrder } from '@/lib/db';
import Order from '@/models/Order';
import { OrderType } from '@/lib/seedData';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const db = await connectToDatabase();
    let orders: OrderType[] = [];

    if (db) {
      const query: any = {};
      if (email) {
        query.customerEmail = email;
      }
      const rawOrders = await Order.find(query).sort({ createdAt: -1 });
      orders = rawOrders.map((o) => ({
        id: o._id.toString(),
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        customerPhone: o.customerPhone,
        shippingAddress: o.shippingAddress,
        items: o.items,
        totalAmount: o.totalAmount,
        paymentMethod: o.paymentMethod,
        status: o.status,
        createdAt: o.createdAt.toISOString(),
      }));
    } else {
      orders = getStoreOrders();
      if (email) {
        orders = orders.filter((o) => o.customerEmail === email);
      }
    }

    return NextResponse.json({ success: true, count: orders.length, data: orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await connectToDatabase();

    const orderNumber = `SKT-${Math.floor(1000 + Math.random() * 9000)}`;

    if (db) {
      const created = await Order.create({
        orderNumber,
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        shippingAddress: body.shippingAddress,
        items: body.items,
        totalAmount: Number(body.totalAmount),
        paymentMethod: body.paymentMethod || 'UPI / Online',
        status: 'Pending',
      });

      return NextResponse.json({
        success: true,
        data: {
          id: created._id.toString(),
          orderNumber: created.orderNumber,
          customerName: created.customerName,
          customerEmail: created.customerEmail,
          customerPhone: created.customerPhone,
          shippingAddress: created.shippingAddress,
          items: created.items,
          totalAmount: created.totalAmount,
          paymentMethod: created.paymentMethod,
          status: created.status,
          createdAt: created.createdAt.toISOString(),
        },
      });
    } else {
      const newOrder: OrderType = {
        id: `ord-${Date.now()}`,
        orderNumber,
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        shippingAddress: body.shippingAddress,
        items: body.items,
        totalAmount: Number(body.totalAmount),
        paymentMethod: body.paymentMethod || 'UPI / Online',
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };
      saveStoreOrder(newOrder);
      return NextResponse.json({ success: true, data: newOrder });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
