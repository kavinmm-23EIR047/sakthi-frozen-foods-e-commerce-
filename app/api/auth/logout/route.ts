import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ success: true, message: 'Logged out successfully' });
  
  // Clear the auth_token cookie
  res.cookies.delete('auth_token');
  
  return res;
}
