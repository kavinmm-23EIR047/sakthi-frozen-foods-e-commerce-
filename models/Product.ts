import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  code: string;
  name: string;
  weight: string;
  price: number;
  category: string;
  description: string;
  stock: number;
  image: string;
  rating: number;
  isPopular?: boolean;
}

const ProductSchema: Schema = new Schema(
  {
    code: { type: String, required: true },
    name: { type: String, required: true },
    weight: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String, default: '' },
    stock: { type: Number, default: 50 },
    image: { type: String, required: true },
    rating: { type: Number, default: 4.8 },
    isPopular: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
