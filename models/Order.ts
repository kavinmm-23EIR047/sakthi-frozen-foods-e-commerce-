import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  productId: string;
  name: string;
  weight: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: IOrderItem[];
  totalAmount: number;
  paymentMethod: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
}

const OrderSchema: Schema = new Schema(
  {
    orderNumber: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    shippingAddress: { type: String, required: true },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        weight: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, default: 'UPI / Online' },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
