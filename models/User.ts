import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: 'Customer' | 'Admin';
  googleId?: string;
  authProvider?: 'local' | 'google';
  avatar?: string;
  isEmailVerified?: boolean;
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
    password: { type: String, required: false },
    phone: { type: String, default: '', trim: true },
    role: { type: String, enum: ['Customer', 'Admin'], default: 'Customer' },
    googleId: { type: String, sparse: true, index: true },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    avatar: { type: String, default: '' },
    isEmailVerified: { type: Boolean, default: false },
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

UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(String(this.password), 8);
});

UserSchema.index({ phone: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ role: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
