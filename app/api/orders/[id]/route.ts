import { NextResponse } from 'next/server';
import { connectToDatabase, getStoreOrders, saveStoreOrder } from '@/lib/db';
import Order from '@/models/Order';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const db = await connectToDatabase();
    const id = params.id;

    if (db) {
      const updated = await Order.findByIdAndUpdate(id, { status: body.status }, { new: true });
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        data: {
          id: updated._id.toString(),
          orderNumber: updated.orderNumber,
          customerName: updated.customerName,
          customerEmail: updated.customerEmail,
          customerPhone: updated.customerPhone,
          shippingAddress: updated.shippingAddress,
          items: updated.items,
          totalAmount: updated.totalAmount,
          paymentMethod: updated.paymentMethod,
          status: updated.status,
          createdAt: updated.createdAt.toISOString(),
        },
      });
    } else {
      const orders = getStoreOrders();
      const existing = orders.find((o) => o.id === id);
      if (!existing) {
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      }
      const updatedOrder = { ...existing, status: body.status };
      saveStoreOrder(updatedOrder);
      return NextResponse.json({ success: true, data: updatedOrder });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
