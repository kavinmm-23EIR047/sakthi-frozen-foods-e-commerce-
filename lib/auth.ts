import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from './db';
import User from '@/models/User';

// Note: This requires process.env.JWT_SECRET to be set in the Next.js environment.
// It should match the JWT_SECRET used in the Render backend.
const JWT_SECRET = process.env.JWT_SECRET;

export interface TokenPayload {
  id: string;
  role: 'Customer' | 'Admin';
  sessionVersion?: number;
  iat: number;
  exp: number;
}

export async function getAuthToken(): Promise<string | null> {
  return (await cookies()).get('auth_token')?.value || null;
}

export async function getSession(): Promise<TokenPayload | null> {
  try {
    if (!JWT_SECRET) return null;
    const token = await getAuthToken();
    if (!token) return null;
    
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    // Token is invalid or expired
    return null;
  }
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    return { error: 'Not authenticated', status: 401 };
  }

  const db = await connectToDatabase();
  if (db) {
    const user = await User.findById(session.id).select('role sessionVersion').lean() as { role?: string; sessionVersion?: number } | null;
    if (!user || Number(session.sessionVersion || 0) !== Number(user.sessionVersion || 0)) {
      return { error: 'Session expired, please sign in again', status: 401 };
    }
    if (user.role !== 'Admin') {
      return { error: 'Not authorized as an admin', status: 403 };
    }
    return null;
  }

  const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
  const token = await getAuthToken();
  if (!backendUrl || !token) return { error: 'Authentication service unavailable', status: 503 };

  try {
    const response = await fetch(`${backendUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    const data = await response.json();
    if (response.status === 401) return { error: 'Session expired, please sign in again', status: 401 };
    if (!response.ok || !data.success) return { error: 'Authentication service unavailable', status: 503 };
    if (data.data?.role !== 'Admin') return { error: 'Not authorized as an admin', status: 403 };
    return null;
  } catch {
    return { error: 'Authentication service unavailable', status: 503 };
  }
}
