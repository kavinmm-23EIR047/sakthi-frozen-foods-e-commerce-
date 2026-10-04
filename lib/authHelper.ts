import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Helper to sanitize and validate 10-digit Indian phone numbers
export const cleanPhoneNumber = (phone: string | number | undefined | null): string => {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
};

export const isValidMobileNumber = (phone: string | number | undefined | null): boolean => {
  const cleaned = cleanPhoneNumber(phone);
  return /^[6-9]\d{9}$/.test(cleaned);
};

export const generateAuthToken = (id: string, role: string, sessionVersion = 0): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return jwt.sign({ id, role, sessionVersion }, secret, {
    expiresIn: '7d',
  });
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 8);
};

export const comparePassword = async (enteredPassword: string, hashedPassword?: string): Promise<boolean> => {
  if (!enteredPassword || !hashedPassword) return false;
  if (/^\$2[aby]\$/.test(hashedPassword)) {
    try {
      return await bcrypt.compare(enteredPassword, hashedPassword);
    } catch {
      return false;
    }
  }

  const crypto = require('crypto');
  if (/^[a-f\d]{64}$/i.test(hashedPassword)) {
    const legacyHash = crypto.createHash('sha256').update(enteredPassword).digest('hex');
    const expected = Buffer.from(legacyHash, 'utf8');
    const stored = Buffer.from(hashedPassword.toLowerCase(), 'utf8');
    if (expected.length === stored.length && crypto.timingSafeEqual(expected, stored)) return true;
  }

  const entered = Buffer.from(enteredPassword, 'utf8');
  const stored = Buffer.from(hashedPassword, 'utf8');
  return entered.length === stored.length && crypto.timingSafeEqual(entered, stored);
};

export const isBcryptPasswordHash = (passwordHash?: string): boolean => /^\$2[aby]\$/.test(passwordHash || '');
