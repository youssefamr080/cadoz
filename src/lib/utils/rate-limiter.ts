/**
 * خدمة معدل الطلبات (Rate Limiting) لمنع الإفراط في استدعاء API
 */

interface RateLimiter {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class APIRateLimiter {
  private static instance: APIRateLimiter;
  private limiters: RateLimiter = {};
  
  // الحدود الافتراضية
  public readonly DEFAULT_LIMITS = {
    suggestions: { requests: 10, windowMs: 60000 }, // 10 طلبات في الدقيقة
    search: { requests: 20, windowMs: 60000 }, // 20 طلب في الدقيقة
    products: { requests: 30, windowMs: 60000 }, // 30 طلب في الدقيقة
    default: { requests: 15, windowMs: 60000 } // الافتراضي
  };

  private constructor() {}

  static getInstance(): APIRateLimiter {
    if (!APIRateLimiter.instance) {
      APIRateLimiter.instance = new APIRateLimiter();
    }
    return APIRateLimiter.instance;
  }

  /**
   * التحقق من أن الطلب مسموح أم لا
   * @param key مفتاح فريد للطلب (مثل نوع API + IP)
   * @param endpoint نوع النقطة النهائية
   * @returns true إذا كان الطلب مسموح، false إذا تجاوز الحد
   */
  checkLimit(key: string, endpoint: keyof typeof this.DEFAULT_LIMITS = 'default'): boolean {
    const now = Date.now();
    const limit = this.DEFAULT_LIMITS[endpoint];

    if (!this.limiters[key]) {
      this.limiters[key] = {
        count: 1,
        resetTime: now + limit.windowMs
      };
      return true;
    }

    const limiter = this.limiters[key];

    // إعادة تعيين العداد إذا انتهى الوقت
    if (now > limiter.resetTime) {
      limiter.count = 1;
      limiter.resetTime = now + limit.windowMs;
      return true;
    }

    // التحقق من الحد
    if (limiter.count >= limit.requests) {
      return false;
    }

    limiter.count++;
    return true;
  }

  /**
   * الحصول على الوقت المتبقي للإعادة تعيين
   * @param key مفتاح الطلب
   * @returns الوقت المتبقي بالميللي ثانية
   */
  getResetTime(key: string): number {
    const limiter = this.limiters[key];
    if (!limiter) return 0;
    
    return Math.max(0, limiter.resetTime - Date.now());
  }

  /**
   * مسح البيانات القديمة
   */
  cleanup(): void {
    const now = Date.now();
    Object.keys(this.limiters).forEach(key => {
      if (now > this.limiters[key].resetTime) {
        delete this.limiters[key];
      }
    });
  }
}

export const rateLimiter = APIRateLimiter.getInstance();

/**
 * دالة مساعدة لإنشاء مفتاح فريد للطلب
 * @param userId معرف المستخدم أو IP
 * @param endpoint نوع النقطة النهائية
 * @returns مفتاح فريد
 */
export const createRateLimitKey = (userId: string | undefined, endpoint: string): string => {
  const identifier = userId || 'anonymous';
  return `${identifier}:${endpoint}`;
};

/**
 * middleware للتحقق من معدل الطلبات
 */
export const withRateLimit = (
  endpoint: keyof typeof APIRateLimiter.prototype.DEFAULT_LIMITS,
  getUserId?: () => string | undefined
) => {
  return (handler: any) => {
    return async (req: any, res: any) => {
      try {
        const userId = getUserId ? getUserId() : undefined;
        const clientIP = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
        const key = createRateLimitKey(userId || clientIP, endpoint);

        if (!rateLimiter.checkLimit(key, endpoint)) {
          const resetTime = rateLimiter.getResetTime(key);
          
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Too many requests',
              message: 'يرجى المحاولة مرة أخرى بعد قليل',
              resetIn: Math.ceil(resetTime / 1000)
            }),
            {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'Retry-After': Math.ceil(resetTime / 1000).toString(),
                'X-RateLimit-Limit': rateLimiter.DEFAULT_LIMITS[endpoint].requests.toString(),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': Math.ceil((Date.now() + resetTime) / 1000).toString()
              }
            }
          );
        }

        return await handler(req, res);
      } catch (error) {
        console.error('Rate limiting error:', error);
        return await handler(req, res); // السماح بالطلب في حالة الخطأ
      }
    };
  };
};

// تنظيف دوري للبيانات القديمة
if (typeof window === 'undefined') { // server-side only
  setInterval(() => {
    rateLimiter.cleanup();
  }, 5 * 60 * 1000); // كل 5 دقائق
}
