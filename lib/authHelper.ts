import jwt from 'jsonwebtoken';

let bcryptInstance: any = null;
try {
  bcryptInstance = require('bcryptjs');
} catch {
  try {
    bcryptInstance = require('../backend/node_modules/bcryptjs');
  } catch {
    bcryptInstance = null;
  }
}

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
  const secret = process.env.JWT_SECRET || 'sakthi_frozen_foods_jwt_secret_key_2026_super_secure_auth_token_9988';
  return jwt.sign({ id, role, sessionVersion }, secret, {
    expiresIn: '7d',
  });
};

export const hashPassword = async (password: string): Promise<string> => {
  if (bcryptInstance?.hash) {
    // rounds=8 (~25ms) matches backend — still very secure
    const salt = await bcryptInstance.genSalt(8);
    return bcryptInstance.hash(password, salt);
  }
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(password).digest('hex');
};

export const comparePassword = async (enteredPassword: string, hashedPassword?: string): Promise<boolean> => {
  if (!enteredPassword || !hashedPassword) return false;
  if (bcryptInstance?.compare) {
    try {
      const match = await bcryptInstance.compare(enteredPassword, hashedPassword);
      if (match) return true;
    } catch {
      // fallback
    }
  }
  const crypto = require('crypto');
  const hashedEntered = crypto.createHash('sha256').update(enteredPassword).digest('hex');
  return hashedEntered === hashedPassword;
};
