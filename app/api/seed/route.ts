import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';
import User from '@/models/User';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_USERS } from '@/lib/seedData';

export async function POST() {
  try {
    const db = await connectToDatabase();

    if (db) {
      await Product.deleteMany({});
      await Order.deleteMany({});
      await User.deleteMany({});

      await Product.insertMany(
        INITIAL_PRODUCTS.map(({ id, ...rest }) => rest)
      );

      await Order.insertMany(
        INITIAL_ORDERS.map(({ id, ...rest }) => rest)
      );

      await User.insertMany(
        INITIAL_USERS.map(({ id, ...rest }) => rest)
      );

      return NextResponse.json({
        success: true,
        message: 'Successfully seeded MongoDB with all 20 Vegan Meat spreadsheet items, mock orders, and users!',
      });
    } else {
      return NextResponse.json({
        success: true,
        message: 'Running in mock database mode. All 20 Vegan Meat items are active!',
      });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
