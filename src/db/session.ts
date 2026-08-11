// Session helpers with no PocketBase import, so middleware can use them
// without pulling the whole SDK into the edge bundle.

export const AUTH_COOKIE = 'pb_auth';

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const part = token.split('.')[1];
  if (!part) return null;
  try {
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Mirrors pb.authStore.isValid: checks the token's local expiry only. The
// server still enforces the real thing on every API call.
export function isSignedIn(raw?: string) {
  if (!raw) return false;
  try {
    const { token } = JSON.parse(raw) as { token?: string };
    if (!token) return false;
    const payload = decodeJwtPayload(token);
    const exp = payload?.exp;
    return typeof exp === 'number' && exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
