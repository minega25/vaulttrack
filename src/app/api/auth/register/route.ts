import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  AUTH_COOKIE,
  authCookieOptions,
  registerCompanyAndOwner,
  serializeAuth,
} from '@/db';

export async function POST(request: Request) {
  const body = await request.json();
  const {
    email,
    password,
    confirmPassword,
    name,
    phone,
    firstName,
    lastName,
  } = body;

  if (!email || !password || !name || !firstName || !lastName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
  }

  try {
    const pb = await registerCompanyAndOwner({
      companyName: name,
      phone,
      email,
      password,
      passwordConfirm: confirmPassword,
      firstName,
      lastName,
    });

    cookies().set(AUTH_COOKIE, serializeAuth(pb), authCookieOptions);

    return NextResponse.json({ id: pb.authStore.record?.id, email });
  } catch (err: any) {
    // PocketBase reports per-field validation errors; surface the first one
    // so "email already in use" doesn't read as a generic failure.
    const fieldErrors = err?.response?.data ?? err?.data?.data;
    const first =
      fieldErrors && typeof fieldErrors === 'object'
        ? (Object.values(fieldErrors)[0] as any)?.message
        : null;

    return NextResponse.json(
      { error: first || err?.message || 'Failed to create account' },
      { status: 400 }
    );
  }
}
