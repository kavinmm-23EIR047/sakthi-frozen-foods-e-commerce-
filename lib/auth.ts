import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Note: This requires process.env.JWT_SECRET to be set in the Next.js environment.
// It should match the JWT_SECRET used in the Render backend.
const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

export interface TokenPayload {
  id: string;
  role: 'Customer' | 'Admin';
  iat: number;
  exp: number;
}

export function getSession(): TokenPayload | null {
  try {
    const token = cookies().get('auth_token')?.value;
    if (!token) return null;
    
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    // Token is invalid or expired
    return null;
  }
}

export function requireAdmin() {
  const session = getSession();
  if (!session) {
    return { error: 'Not authenticated', status: 401 };
  }
  
  if (session.role !== 'Admin') {
    return { error: 'Not authorized as an admin', status: 403 };
  }
  
  return null;
}
