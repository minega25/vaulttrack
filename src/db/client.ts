import PocketBase, { type RecordModel } from 'pocketbase';

export { AUTH_COOKIE, isSignedIn } from './session';

export const POCKET_BASE_URL =
  process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

export type AuthPayload = { token: string; record: RecordModel };

// A signed-in user record, as stored in the auth cookie.
export type SessionUser = RecordModel & {
  email: string;
  firstName: string;
  lastName: string;
  companyId: string;
  role?: string;
};

// Every request gets its own client. A module-level singleton would share
// authStore between concurrent requests on the server, which leaks one user's
// session into another user's request.
export function newClient() {
  return new PocketBase(POCKET_BASE_URL);
}

// Rehydrates a client from the cookie value written by serializeAuth().
// A missing or malformed cookie yields a signed-out client rather than throwing.
export function clientFromCookie(raw?: string) {
  const pb = newClient();
  if (!raw) return pb;

  try {
    const { token, record } = JSON.parse(raw) as AuthPayload;
    if (token && record) {
      pb.authStore.save(token, record);
    }
  } catch {
    // fall through as signed out
  }
  return pb;
}

export function serializeAuth(pb: PocketBase) {
  return JSON.stringify({
    token: pb.authStore.token,
    record: pb.authStore.record,
  });
}

export const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 14,
};
