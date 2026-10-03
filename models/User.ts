import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone: string;
  role: 'Customer' | 'Admin';
  totalOrders: number;
  totalSpent: number;
  joinedDate: string;
  address: string;
  sessionVersion: number;
  wishlist?: mongoose.Types.ObjectId[];
  passwordResetTokenHash?: string;
  passwordResetExpiresAt?: Date;
  otpHash?: string;
  otpExpiresAt?: Date;
  otpAttempts?: number;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, required: true, trim: true },
    role: { type: String, enum: ['Customer', 'Admin'], default: 'Customer' },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    joinedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    address: { type: String, default: '', trim: true },
    sessionVersion: { type: Number, default: 0 },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpiresAt: { type: Date, select: false },
    otpHash: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
    otpAttempts: { type: Number, default: 0, select: false },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
