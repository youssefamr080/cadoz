import { NextResponse, type NextRequest } from 'next/server';

export function securityHeaders(request: NextRequest) {
  // Pass the request to next to maintain the middleware chain
  const response = NextResponse.next({ request });
  
  // Add security headers
  const headers = response.headers;
  
  // Prevent clickjacking attacks
  headers.set('X-Frame-Options', 'DENY');
  
  // Enable cross-site scripting filter
  headers.set('X-XSS-Protection', '1; mode=block');
  
  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff');
  
  // Strict CSP policy
  headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https:; " +
    "font-src 'self' data:; " +
    "object-src 'none'; " +
    "media-src 'self'; " +
    "frame-src 'self';"
  );
  
  // Enable HSTS
  headers.set('Strict-Transport-Security', 
    'max-age=31536000; includeSubDomains; preload'
  );
  
  // Referrer policy
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  headers.set('Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  
  return response;
}
