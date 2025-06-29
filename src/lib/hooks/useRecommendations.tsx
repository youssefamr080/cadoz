/**
 * Hook لاستخدام نظام التوصيات الذكي
 */

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

export interface RecommendationResult {
  id: string
  name: string
  price: number
  image: string
  category: string
  rating?: number
  recommendationType: string
  relevanceScore: number
  reason: string
}

export interface UseRecommendationsOptions {
  type?: 'personalized' | 'similar' | 'trending' | 'category_based' | 'mixed'
  limit?: number
  excludeIds?: string[]
  currentProductId?: string
  currentCategory?: string
  autoFetch?: boolean
}

export interface UseRecommendationsReturn {
  recommendations: RecommendationResult[]
  loading: boolean
  error: string | null
  isPersonalized: boolean
  loginRequired: boolean
  fetchRecommendations: () => Promise<void>
  trackInteraction: (action: string, productId: string, context?: Record<string, unknown>) => Promise<void>
  refreshRecommendations: () => Promise<void>
}

export function useRecommendations(options: UseRecommendationsOptions = {}): UseRecommendationsReturn {
  const { data: session, status } = useSession()
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPersonalized, setIsPersonalized] = useState(false)
  const [loginRequired, setLoginRequired] = useState(false)

  const {
    type = 'mixed',
    limit = 12,
    excludeIds = [],
    currentProductId,
    currentCategory,
    autoFetch = true,
  } = options

  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const fetchRecommendations = useCallback(async () => {
    if (status === 'loading') return

    setLoading(true)
    setError(null)
    setLoginRequired(false)

    try {
      const params = new URLSearchParams()
      params.append('type', type)
      params.append('limit', limit.toString())
      
      if (sessionId) {
        params.append('sessionId', sessionId)
      }

      if (excludeIds.length > 0) {
        params.append('excludeIds', excludeIds.join(','))
      }

      if (currentProductId) {
        params.append('currentProductId', currentProductId)
      }

      if (currentCategory) {
        params.append('currentCategory', currentCategory)
      }

      const response = await fetch(`/api/recommendations?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          setLoginRequired(true)
          setError('يجب تسجيل الدخول للحصول على توصيات مخصصة')
        } else {
          throw new Error(data.message || 'فشل في جلب التوصيات')
        }
        return
      }

      setRecommendations(data.data || [])
      setIsPersonalized(data.meta?.isPersonalized || false)
      
      if (data.meta?.isFallback) {
        console.warn('تم استخدام توصيات احتياطية')
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
      setError(errorMessage)
      console.error('خطأ في جلب التوصيات:', err)
    } finally {
      setLoading(false)
    }
  }, [status, type, limit, excludeIds, currentProductId, currentCategory, sessionId])

  const trackInteraction = useCallback(async (
    action: string,
    productId: string,
    context?: Record<string, unknown>
  ) => {
    if (!session?.user) {
      console.warn('لا يمكن تتبع التفاعل بدون تسجيل دخول')
      return
    }

    try {
      await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          productId,
          sessionId,
          context,
        }),
      })

      // تحديث الواجهة حسب نوع التفاعل
      if (action === 'click') {
        console.log(`تم تسجيل النقر على المنتج ${productId}`)
      } else if (action === 'add_to_cart') {
        console.log('تم إضافة المنتج للسلة - سنقوم بتحسين توصياتنا بناءً على اختيارك')
      }

    } catch (err) {
      console.error('خطأ في تتبع التفاعل:', err)
    }
  }, [session, sessionId])

  const refreshRecommendations = useCallback(async () => {
    await fetchRecommendations()
  }, [fetchRecommendations])

  // جلب التوصيات تلقائياً
  useEffect(() => {
    if (autoFetch && status !== 'loading') {
      fetchRecommendations()
    }
  }, [autoFetch, status, fetchRecommendations])

  return {
    recommendations,
    loading,
    error,
    isPersonalized,
    loginRequired,
    fetchRecommendations,
    trackInteraction,
    refreshRecommendations,
  }
}

/**
 * Hook مبسط للتوصيات السريعة
 */
export function useQuickRecommendations(productId?: string, category?: string) {
  return useRecommendations({
    type: productId ? 'similar' : 'trending',
    limit: 8,
    currentProductId: productId,
    currentCategory: category,
    autoFetch: true,
  })
}

/**
 * Hook للتوصيات الشخصية فقط
 */
export function usePersonalizedRecommendations(limit = 12) {
  return useRecommendations({
    type: 'personalized',
    limit,
    autoFetch: true,
  })
}
