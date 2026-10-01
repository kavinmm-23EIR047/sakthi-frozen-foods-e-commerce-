import { NextResponse } from 'next/server';
import { POST as wishlistPOST } from '../route';

export async function POST(request: Request) {
  return wishlistPOST(request);
}
