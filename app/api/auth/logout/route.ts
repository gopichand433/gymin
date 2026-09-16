import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  await clearSessionCookie();

  const acceptHeader = request.headers.get('accept') || '';
  const isBrowserForm = !acceptHeader.includes('application/json');

  if (isBrowserForm) {
    const response = NextResponse.redirect(new URL('/auth/login', request.url), 303);
    response.cookies.set('gymin_session', '', {
      path: '/',
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
    });
    return response;
  }

  const response = NextResponse.json({ success: true, redirectUrl: '/auth/login' });
  response.cookies.set('gymin_session', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
  });
  return response;
}

export async function GET(request: Request) {
  await clearSessionCookie();
  const response = NextResponse.redirect(new URL('/auth/login', request.url), 303);
  response.cookies.set('gymin_session', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
  });
  return response;
}
