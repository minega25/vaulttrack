import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE, isSignedIn } from '@/db/session';

// Everything under /auth is reachable signed out; everything else needs a session.
const PUBLIC_PREFIXES = ['/auth'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const signedIn = isSignedIn(request.cookies.get(AUTH_COOKIE)?.value);
  const isPublic = PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isPublic) {
    // Already signed in? Skip the login/register pages.
    if (signedIn) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (!signedIn) {
    const url = new URL('/auth/login', request.url);
    // Remember where they were headed so login can send them back.
    if (pathname !== '/') url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo.svg).*)'],
};
