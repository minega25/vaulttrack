import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  AUTH_COOKIE,
  authCookieOptions,
  authenticate,
  serializeAuth,
} from '@/db';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    );
  }

  try {
    const { pb, record } = await authenticate(email, password);

    // The token stays in an httpOnly cookie; it is never sent to the browser JS.
    cookies().set(AUTH_COOKIE, serializeAuth(pb), authCookieOptions);

    return NextResponse.json({
      id: record.id,
      email: record.email,
      firstName: record.firstName,
      lastName: record.lastName,
    });
  } catch {
    // Deliberately vague: don't reveal whether the address exists.
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    );
  }
}
