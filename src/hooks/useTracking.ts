'use client'

import { useSession } from 'next-auth/react'
import { useCallback, useRef } from 'react'

interface TrackingOptions {
  eventType: string
  productId?: string
  searchQuery?: string
  categoryId?: string
  duration?: number
  context?: Record<string, unknown>
  source?: string
}

export function useTracking() {
  const { data: session } = useSession()
  const startTimeRef = useRef<Record<string, number>>({})

  // تتبع حدث عام
  const trackEvent = useCallback(async (options: TrackingOptions) => {
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      await fetch('/api/tracking/behavior', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId
        },
        body: JSON.stringify(options)
      })
    } catch (error) {
      console.error('خطأ في تتبع الحدث:', error)
    }
  }, [])

  // تتبع مشاهدة المنتج مع حساب الوقت
  const trackProductView = useCallback(async (productId: string, source?: string) => {
    const startTime = Date.now()
    startTimeRef.current[productId] = startTime

    await trackEvent({
      eventType: 'product_view',
      productId,
      source: source || 'direct',
      context: {
        timestamp: startTime,
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    })

    // إرجاع دالة لإنهاء التتبع وحساب الوقت المقضي
    return () => {
      const endTime = Date.now()
      const duration = endTime - startTime
      
      trackEvent({
        eventType: 'product_view_end',
        productId,
        duration,
        source: source || 'direct',
        context: {
          timeSpent: duration,
          endTimestamp: endTime
        }
      })
      
      delete startTimeRef.current[productId]
    }
  }, [trackEvent])

  // تتبع البحث
  const trackSearch = useCallback(async (
    searchQuery: string, 
    resultsCount?: number,
    filters?: Record<string, unknown>
  ) => {
    await trackEvent({
      eventType: 'search',
      searchQuery,
      context: {
        resultsCount: resultsCount || 0,
        filters: filters || {},
        timestamp: Date.now(),
        url: window.location.href
      }
    })
  }, [trackEvent])

  // تتبع إضافة للسلة
  const trackAddToCart = useCallback(async (
    productId: string, 
    quantity: number = 1,
    source?: string
  ) => {
    await trackEvent({
      eventType: 'add_to_cart',
      productId,
      source: source || 'product_page',
      context: {
        quantity,
        timestamp: Date.now(),
        url: window.location.href
      }
    })
  }, [trackEvent])

  // تتبع النقر على التوصيات
  const trackRecommendationClick = useCallback(async (
    productId: string,
    recommendationType: string,
    relevanceScore?: number
  ) => {
    await trackEvent({
      eventType: 'recommendation_click',
      productId,
      source: 'smart_recommendations',
      context: {
        recommendationType,
        relevanceScore,
        timestamp: Date.now(),
        url: window.location.href
      }
    })
  }, [trackEvent])

  // تتبع تفاعل مع الفئات
  const trackCategoryView = useCallback(async (categoryId: string, categoryName?: string) => {
    await trackEvent({
      eventType: 'category_view',
      categoryId,
      context: {
        categoryName,
        timestamp: Date.now(),
        url: window.location.href
      }
    })
  }, [trackEvent])

  // تتبع إنهاء الشراء
  const trackPurchase = useCallback(async (
    productIds: string[],
    totalAmount: number,
    orderDetails?: Record<string, unknown>
  ) => {
    await trackEvent({
      eventType: 'purchase',
      context: {
        productIds,
        totalAmount,
        productCount: productIds.length,
        orderDetails: orderDetails || {},
        timestamp: Date.now(),
        url: window.location.href
      }
    })
  }, [trackEvent])

  // تتبع عرض التوصيات
  const trackRecommendationsShown = useCallback(async (
    recommendationType: string,
    count: number,
    context?: Record<string, unknown>
  ) => {
    await trackEvent({
      eventType: 'recommendations_shown',
      source: 'smart_recommendations',
      context: {
        recommendationType,
        count,
        timestamp: Date.now(),
        url: window.location.href,
        ...context
      }
    })
  }, [trackEvent])

  // تتبع الوقت المقضي في الصفحة
  const trackPageView = useCallback(async (pageName: string, pageType?: string) => {
    const startTime = Date.now()
    startTimeRef.current[pageName] = startTime

    await trackEvent({
      eventType: 'page_view',
      source: pageType || 'web',
      context: {
        pageName,
        pageType,
        timestamp: startTime,
        url: window.location.href,
        referrer: document.referrer
      }
    })

    // إرجاع دالة لإنهاء تتبع الصفحة
    return () => {
      const endTime = Date.now()
      const duration = endTime - startTime
      
      trackEvent({
        eventType: 'page_view_end',
        source: pageType || 'web',
        duration,
        context: {
          pageName,
          pageType,
          timeSpent: duration,
          endTimestamp: endTime
        }
      })
      
      delete startTimeRef.current[pageName]
    }
  }, [trackEvent])

  return {
    trackEvent,
    trackProductView,
    trackSearch,
    trackAddToCart,
    trackRecommendationClick,
    trackCategoryView,
    trackPurchase,
    trackRecommendationsShown,
    trackPageView,
    isLoggedIn: !!session?.user
  }
}
