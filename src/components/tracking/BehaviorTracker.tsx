/**
 * نظام التتبع التلقائي لسلوك العملاء
 * يعمل على تتبع النشاطات في الخلفية لتحسين التوصيات
 */

'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname, useSearchParams } from 'next/navigation'
import { behaviorTracker } from '@/lib/services/behavior-tracker'

interface BehaviorTrackerProviderProps {
  children: React.ReactNode
}

export function BehaviorTrackerProvider({ children }: BehaviorTrackerProviderProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const sessionId = useRef(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const pageStartTime = useRef(Date.now())
  const isTracking = useRef(false)

  // تتبع تغيير الصفحات - سيتم التعامل معه في النهاية
  // useCallback لتجنب إعادة الإنشاء
  const trackPageView = useCallback(async () => {
    if (!session?.user?.email) return

    try {
      // تحديد نوع الصفحة
      let pageType = 'other'
      let context: Record<string, unknown> = {}

      if (pathname === '/') {
        pageType = 'home'
      } else if (pathname.startsWith('/product/')) {
        pageType = 'product'
        const productId = pathname.split('/')[2]
        context = { productId }
      } else if (pathname.startsWith('/category/')) {
        pageType = 'category'
        const category = pathname.split('/')[2]
        context = { category }
      } else if (pathname === '/search') {
        pageType = 'search'
        const query = searchParams?.get('q')
        const category = searchParams?.get('category')
        context = { query, category }
      } else if (pathname === '/cart') {
        pageType = 'cart'
      } else if (pathname === '/profile') {
        pageType = 'profile'
      }

      // إرسال بيانات التتبع
      await fetch('/api/tracking/page-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageType,
          pathname,
          context,
          sessionId: sessionId.current,
          timestamp: new Date(),
        }),
      })

    } catch (error) {
      console.error('خطأ في تتبع مشاهدة الصفحة:', error)
    }
  }, [session, pathname, searchParams])

  const trackPageDuration = useCallback(async (duration: number) => {
    if (!session?.user?.email) return

    try {
      await fetch('/api/tracking/page-duration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pathname,
          duration,
          sessionId: sessionId.current,
        }),
      })
    } catch (error) {
      console.error('خطأ في تتبع مدة البقاء:', error)
    }
  }, [session, pathname])

  // تحديث dependencies في useEffect
  useEffect(() => {
    // تسجيل الخروج من الصفحة السابقة
    if (pageStartTime.current > 0) {
      const duration = Date.now() - pageStartTime.current
      if (duration > 1000) {
        trackPageDuration(duration)
      }
    }

    // تسجيل دخول الصفحة الجديدة
    pageStartTime.current = Date.now()
    trackPageView()
    isTracking.current = true

  }, [pathname, searchParams, trackPageView, trackPageDuration])

  // تتبع الخروج من الصفحة
  useEffect(() => {
    const handleBeforeUnload = () => {
      const duration = Date.now() - pageStartTime.current
      if (duration > 1000) {
        trackPageDuration(duration)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [trackPageDuration])

  return <>{children}</>
}

/**
 * Hook لتتبع تفاعلات محددة
 */
export function useActivityTracker() {
  const { data: session } = useSession()
  const sessionId = useRef(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)

  const trackSearch = async (searchTerm: string, resultsCount: number, category?: string) => {
    if (!session?.user?.email) return

    try {
      const customer = await fetch('/api/auth/me')
        .then(res => res.json())
        .then(data => data.customer)

      if (customer?.id) {
        await behaviorTracker.trackSearch({
          customerId: customer.id,
          sessionId: sessionId.current,
          searchTerm,
          category,
          resultsCount,
          source: 'search_bar',
        })
      }
    } catch (error) {
      console.error('خطأ في تتبع البحث:', error)
    }
  }

  const trackProductView = async (productId: string, duration?: number, source?: string) => {
    if (!session?.user?.email) return

    try {
      const customer = await fetch('/api/auth/me')
        .then(res => res.json())
        .then(data => data.customer)

      if (customer?.id) {
        await behaviorTracker.trackProductView({
          customerId: customer.id,
          sessionId: sessionId.current,
          productId,
          duration,
          source,
        })
      }
    } catch (error) {
      console.error('خطأ في تتبع مشاهدة المنتج:', error)
    }
  }

  const trackAddToCart = async (productId: string, quantity: number, price: number) => {
    if (!session?.user?.email) return

    try {
      const customer = await fetch('/api/auth/me')
        .then(res => res.json())
        .then(data => data.customer)

      if (customer?.id) {
        await behaviorTracker.trackAddToCart({
          customerId: customer.id,
          sessionId: sessionId.current,
          productId,
          quantity,
          price,
          source: 'product_page',
        })
      }
    } catch (error) {
      console.error('خطأ في تتبع إضافة للسلة:', error)
    }
  }

  const trackCustomEvent = async (eventType: string, data: Record<string, unknown>) => {
    if (!session?.user?.email) return

    try {
      const customer = await fetch('/api/auth/me')
        .then(res => res.json())
        .then(data => data.customer)

      if (customer?.id) {
        await behaviorTracker.trackEvent({
          customerId: customer.id,
          sessionId: sessionId.current,
          eventType,
          context: data,
        })
      }
    } catch (error) {
      console.error('خطأ في تتبع الحدث المخصص:', error)
    }
  }

  return {
    trackSearch,
    trackProductView,
    trackAddToCart,
    trackCustomEvent,
  }
}
