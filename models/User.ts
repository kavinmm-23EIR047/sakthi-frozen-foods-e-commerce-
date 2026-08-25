import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  role: 'Customer' | 'Admin';
  totalOrders: number;
  totalSpent: number;
  joinedDate: string;
  address: string;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    role: { type: String, enum: ['Customer', 'Admin'], default: 'Customer' },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    joinedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    address: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
