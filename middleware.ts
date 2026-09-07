import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = [
  '/dashboard',
  '/workouts',
  '/nutrition',
  '/steps',
  '/weight',
  '/measurements',
  '/progress',
  '/calendar',
  '/achievements',
  '/profile',
  '/onboarding',
];

const AUTH_ROUTES = ['/auth/login', '/auth/signup', '/auth/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('gymin_session')?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !sessionCookie) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/workouts/:path*',
    '/nutrition/:path*',
    '/steps/:path*',
    '/weight/:path*',
    '/measurements/:path*',
    '/progress/:path*',
    '/calendar/:path*',
    '/achievements/:path*',
    '/profile/:path*',
    '/onboarding/:path*',
    '/auth/:path*',
  ],
};
