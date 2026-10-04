const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, enum: ['Customer', 'Admin'], default: 'Customer' },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    joinedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    address: { type: String, default: '' },
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


userSchema.index({ phone: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  // rounds=8 (~25ms) vs rounds=10 (~100ms) — still very secure for stored passwords
  const salt = await bcrypt.genSalt(8);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  const storedPassword = String(this.password || '');
  if (/^\$2[aby]\$/.test(storedPassword)) {
    try {
      return await bcrypt.compare(enteredPassword, storedPassword);
    } catch {
      return false;
    }
  }

  if (/^[a-f\d]{64}$/i.test(storedPassword)) {
    const legacyHash = crypto.createHash('sha256').update(enteredPassword).digest('hex');
    const expected = Buffer.from(legacyHash, 'utf8');
    const stored = Buffer.from(storedPassword.toLowerCase(), 'utf8');
    if (expected.length === stored.length && crypto.timingSafeEqual(expected, stored)) return true;
  }

  const entered = Buffer.from(enteredPassword, 'utf8');
  const stored = Buffer.from(storedPassword, 'utf8');
  return entered.length === stored.length && crypto.timingSafeEqual(entered, stored);
};

module.exports = mongoose.model('User', userSchema);
