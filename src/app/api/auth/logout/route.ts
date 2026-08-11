import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AUTH_COOKIE } from '@/db';

export async function POST(request: Request) {
  cookies().delete(AUTH_COOKIE);
  return NextResponse.json({ ok: true });
}
