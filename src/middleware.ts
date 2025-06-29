import { NextResponse, type NextRequest } from 'next/server';

// خريطة لتتبع عدد الطلبات لكل IP
const requestCounts = new Map<string, { count: number; resetTime: number }>()

// حدود الطلبات المخففة
const RATE_LIMITS = {
  '/api/auth': 8, // 8 طلبات في الدقيقة للتسجيل
  '/api/recommendations': 20, // 20 طلب في الدقيقة للتوصيات
  default: 50 // 50 طلب في الدقيقة للباقي
}

const WINDOW_MS = 60 * 1000 // نافزة زمنية دقيقة واحدة

function getRateLimit(pathname: string): number {
  for (const [path, limit] of Object.entries(RATE_LIMITS)) {
    if (pathname.startsWith(path) && path !== 'default') {
      return limit
    }
  }
  return RATE_LIMITS.default
}

function applyRateLimit(request: NextRequest): NextResponse | null {
  const ip = request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') || 
            'unknown'
  
  const pathname = request.nextUrl.pathname
  const now = Date.now()
  const limit = getRateLimit(pathname)
  const key = `${ip}-${pathname.split('/').slice(0, 3).join('/')}`
  
  const current = requestCounts.get(key)
  
  if (current) {
    if (now > current.resetTime) {
      requestCounts.set(key, { count: 1, resetTime: now + WINDOW_MS })
    } else {
      current.count++
      
      if (current.count > limit) {
        const retryAfter = Math.ceil((current.resetTime - now) / 1000)
        return NextResponse.json(
          { 
            error: 'Too many requests',
            message: 'كثرة الطلبات. انتظر قليلاً ثم حاول مرة أخرى.',
            retryAfter
          },
          { 
            status: 429,
            headers: {
              'Retry-After': retryAfter.toString(),
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': current.resetTime.toString()
            }
          }
        )
      }
    }
  } else {
    requestCounts.set(key, { count: 1, resetTime: now + WINDOW_MS })
  }
  
  return null
}

export async function middleware(request: NextRequest) {
  // Skip security checks for static files
  if (request.nextUrl.pathname.startsWith('/_next') ||
      request.nextUrl.pathname.startsWith('/public') ||
      request.nextUrl.pathname.includes('.')) {
    return NextResponse.next();
  }

  // Apply rate limiting for sensitive endpoints
  if (request.nextUrl.pathname.startsWith('/api/auth') || 
      request.nextUrl.pathname.startsWith('/api/recommendations')) {
    const rateLimitResponse = applyRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;
  }

  // Add security headers
  const response = NextResponse.next();
  
  // Basic security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  
  return response;
}

export const config = {
  matcher: [
    // Apply to all routes except static files
    '/((?!_next/static|favicon.ico).*)',
  ],
};
