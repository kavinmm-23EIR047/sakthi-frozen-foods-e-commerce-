import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  code: string;
  name: string;
  weight: string;
  mrp: number;
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
    mrp: { type: Number, default: 0 },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String, default: '' },
    stock: { type: Number, default: 50 },
    image: { type: String, default: '' },
    rating: { type: Number, default: 4.8 },
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', description: 'text', category: 'text' });
ProductSchema.index({ category: 1, code: 1 });
ProductSchema.index({ name: 1 });
ProductSchema.index({ isPopular: -1, price: 1 });
ProductSchema.index({ price: 1 });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
