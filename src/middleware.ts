import { NextResponse, type NextRequest } from 'next/server';
import { rateLimiter } from '@/lib/security/rate-limiter';
import { securityHeaders } from '@/lib/security/security-headers';

export async function middleware(request: NextRequest) {
  // Skip security checks for static files
  if (request.nextUrl.pathname.startsWith('/_next') ||
      request.nextUrl.pathname.startsWith('/public')) {
    return NextResponse.next();
  }

  // Apply rate limiting for auth endpoints
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    const rateLimit = await rateLimiter(request);
    if (rateLimit) return rateLimit;
  }
  // Apply security headers
  return securityHeaders(request);
}

export const config = {
  matcher: [
    // Apply to all routes except static files
    '/((?!_next/static|favicon.ico).*)',
  ],
};
