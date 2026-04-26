import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAuth = request.cookies.get('is_auth')?.value === 'true';
  const { pathname } = request.nextUrl;

  // 1. If not authenticated and trying to access any page other than /login
  if (!isAuth && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. If already authenticated and trying to access /login, go to home
  if (isAuth && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Match all request paths except for:
// - api routes (/api/*)
// - static files (_next/static/*, _next/image/*, favicon.ico, etc.)
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
