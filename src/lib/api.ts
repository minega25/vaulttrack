import { NextResponse } from 'next/server';

// Turns a thrown error into a JSON response, preserving PocketBase's
// per-field validation messages instead of flattening everything to a 500.
export function apiError(err: unknown, fallback = 'Request failed') {
  const e = err as any;

  if (e?.message === 'Not authenticated') {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const fieldErrors = e?.response?.data ?? e?.data?.data;
  const first =
    fieldErrors && typeof fieldErrors === 'object'
      ? (Object.values(fieldErrors)[0] as any)?.message
      : null;

  const status =
    typeof e?.status === 'number' && e.status >= 400 && e.status < 600
      ? e.status
      : 500;

  return NextResponse.json(
    { error: first || e?.message || fallback },
    { status }
  );
}
