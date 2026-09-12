import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
  productId: string;
  weight: string;
  quantity: number;
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId | string;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema: Schema = new Schema({
  productId: { type: String, required: true },
  weight: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1, max: 50 },
}, { _id: false });

const CartSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);
