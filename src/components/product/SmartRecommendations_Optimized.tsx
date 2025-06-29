'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart, Star, Sparkles, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Autoplay, FreeMode } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/free-mode'

interface RecommendationProduct {
  id: string
  name: string
  price: number
  oldPrice?: number
  image: string
  category: string
  rating?: number
  recommendationType: string
  relevanceScore: number
  reason: string
}

interface SmartRecommendationsProps {
  type?: 'personalized' | 'similar' | 'trending' | 'category_based' | 'mixed'
  limit?: number
  currentProductId?: string
  currentCategory?: string
  excludeIds?: string[]
  title?: string
  showLoginPrompt?: boolean
  className?: string
}

// تخزين مؤقت للتوصيات في الذاكرة
const recommendationsCache = new Map<string, {
  data: RecommendationProduct[]
  timestamp: number
  expiry: number
}>()

// مدة صالحية التخزين المؤقت (5 دقائق)
const CACHE_DURATION = 5 * 60 * 1000

export default function SmartRecommendations({
  type = 'mixed',
  limit = 8,
  currentProductId,
  currentCategory,
  excludeIds = [],
  title,
  showLoginPrompt = true,
  className = ''
}: SmartRecommendationsProps) {
  const { data: session, status } = useSession()
  const [recommendations, setRecommendations] = useState<RecommendationProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [loginRequired, setLoginRequired] = useState(false)

  // إنشاء مفتاح التخزين المؤقت
  const cacheKey = useMemo(() => {
    const key = `${session?.user?.email || 'guest'}-${type}-${limit}-${currentProductId || ''}-${currentCategory || ''}-${excludeIds.join(',')}`
    return key
  }, [session?.user?.email, type, limit, currentProductId, currentCategory, excludeIds])

  // جلب التوصيات من التخزين المحلي أولاً
  const getLocalRecommendations = useCallback(() => {
    try {
      const stored = localStorage.getItem('smart_recommendations')
      if (stored) {
        const data = JSON.parse(stored)
        if (data.timestamp && Date.now() - data.timestamp < CACHE_DURATION) {
          return data.recommendations || []
        }
      }
    } catch (error) {
      console.error('خطأ في قراءة التوصيات المحلية:', error)
    }
    return null
  }, [])

  // حفظ التوصيات في التخزين المحلي
  const saveLocalRecommendations = useCallback((data: RecommendationProduct[]) => {
    try {
      localStorage.setItem('smart_recommendations', JSON.stringify({
        recommendations: data,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.error('خطأ في حفظ التوصيات المحلية:', error)
    }
  }, [])

  // جلب منتجات احتياطية (فقط عند الحاجة)
  const fetchFallbackProducts = useCallback(async () => {
    try {
      // فحص التخزين المؤقت أولاً
      const cached = recommendationsCache.get('fallback')
      if (cached && Date.now() < cached.expiry) {
        return cached.data
      }

      const response = await fetch(`/api/products?limit=${limit}&trending=true`)
      const data = await response.json()
      
      if (data.success) {
        const fallbackRecommendations = data.data.map((product: {
          id: string
          name: string
          price: number
          old_price?: number
          image?: string
          category?: string
          rating?: number
        }) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          oldPrice: product.old_price,
          image: product.image || '/placeholder.svg',
          category: product.category || 'عام',
          rating: product.rating,
          recommendationType: 'trending',
          relevanceScore: 50,
          reason: 'منتج مختار'
        }))

        // حفظ في التخزين المؤقت
        recommendationsCache.set('fallback', {
          data: fallbackRecommendations,
          timestamp: Date.now(),
          expiry: Date.now() + CACHE_DURATION
        })

        return fallbackRecommendations
      }
    } catch (error) {
      console.error('خطأ في جلب المنتجات الاحتياطية:', error)
    }
    return []
  }, [limit])

  // جلب التوصيات الذكية
  const fetchRecommendations = useCallback(async () => {
    if (status === 'loading') return

    // إذا كان المستخدم غير مسجل ونريد عرض التوصيات للمسجلين فقط
    if (!session && showLoginPrompt && !currentProductId) {
      setLoginRequired(true)
      setRecommendations([])
      setLoading(false)
      return
    }

    // فحص التخزين المؤقت أولاً
    const cached = recommendationsCache.get(cacheKey)
    if (cached && Date.now() < cached.expiry) {
      setRecommendations(cached.data)
      setLoading(false)
      return
    }

    // فحص التخزين المحلي إذا لم يكن في الصفحة الرئيسية
    if (!currentProductId) {
      const localData = getLocalRecommendations()
      if (localData && localData.length > 0) {
        setRecommendations(localData.slice(0, limit))
        setLoading(false)
        return
      }
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({
        type,
        limit: limit.toString(),
        ...(currentProductId && { currentProductId }),
        ...(currentCategory && { currentCategory }),
        ...(excludeIds.length > 0 && { excludeIds: excludeIds.join(',') })
      })

      const response = await fetch(`/api/recommendations?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.data && data.data.length > 0) {
        setRecommendations(data.data)
        setLoginRequired(false)

        // حفظ في التخزين المؤقت
        recommendationsCache.set(cacheKey, {
          data: data.data,
          timestamp: Date.now(),
          expiry: Date.now() + CACHE_DURATION
        })

        // حفظ في التخزين المحلي إذا لم يكن في صفحة المنتج
        if (!currentProductId) {
          saveLocalRecommendations(data.data)
        }
      } else if (data.loginRequired) {
        setLoginRequired(true)
        setRecommendations([])
      } else {
        // استخدام منتجات احتياطية فقط في صفحة المنتج
        if (currentProductId) {
          const fallbackData = await fetchFallbackProducts()
          setRecommendations(fallbackData)
        } else {
          setRecommendations([])
        }
      }
    } catch (error) {
      console.error('خطأ في جلب التوصيات:', error)
      // استخدام منتجات احتياطية فقط في صفحة المنتج
      if (currentProductId) {
        const fallbackData = await fetchFallbackProducts()
        setRecommendations(fallbackData)
      } else {
        setRecommendations([])
      }
    } finally {
      setLoading(false)
    }
  }, [
    session, 
    status, 
    type, 
    limit, 
    currentProductId, 
    currentCategory, 
    excludeIds, 
    showLoginPrompt, 
    cacheKey, 
    getLocalRecommendations, 
    saveLocalRecommendations, 
    fetchFallbackProducts
  ])

  // تحميل التوصيات عند التحميل الأول فقط
  useEffect(() => {
    fetchRecommendations()
  }, [fetchRecommendations])

  // تتبع النقر على المنتج (مُحسّن)
  const handleProductClick = useCallback(async (productId: string) => {
    if (session?.user?.email) {
      // تتبع غير متزامن لتجنب تأخير التنقل
      fetch('/api/tracking/behavior', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: session.user.email,
          action: 'click',
          productId,
          context: 'recommendations'
        })
      }).catch(error => console.error('خطأ في تسجيل النقرة:', error))
    }
  }, [session?.user?.email])

  // تحديد العنوان
  const getTitle = useCallback(() => {
    if (title) return title
    if (currentProductId) return 'توصيات أخرى لك'
    return session?.user ? 'مخصص خصيصاً لك' : 'منتجات مميزة'
  }, [title, currentProductId, session?.user])

  // عرض شاشة تسجيل الدخول
  if (loginRequired && showLoginPrompt) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-800">{getTitle()}</h2>
          </div>
        </div>
        
        <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <LogIn className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            احصل على توصيات مخصصة
          </h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            سجل دخولك لنتمكن من تقديم توصيات مخصصة بناءً على اهتماماتك وسلوك التسوق الخاص بك
          </p>
          <Link href="/login">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <LogIn className="w-4 h-4 ml-2" />
              تسجيل الدخول
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // شاشة التحميل المحسّنة
  if (loading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
            <h2 className="text-xl font-bold text-gray-800">{getTitle()}</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: Math.min(limit, 5) }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-4">
                <div className="bg-gray-200 aspect-square rounded-lg mb-3"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-3 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // لا توجد توصيات
  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className={`w-full ${className}`}>
      {/* العنوان */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-bold text-gray-800">{getTitle()}</h2>
          {session?.user && (
            <Badge variant="secondary" className="text-xs">
              مخصص لك
            </Badge>
          )}
        </div>
      </div>

      {/* سويبر التوصيات */}
      <Swiper
        modules={[Navigation, Autoplay, FreeMode]}
        spaceBetween={16}
        slidesPerView={2}
        freeMode={true}
        navigation={true}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        breakpoints={{
          640: {
            slidesPerView: 3,
          },
          768: {
            slidesPerView: 4,
          },
          1024: {
            slidesPerView: 5,
          },
        }}
        className="recommendations-swiper"
      >
        {recommendations.map((product) => (
          <SwiperSlide key={product.id}>
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white h-full">
              <CardContent className="p-0 h-full flex flex-col">
                <Link 
                  href={`/product/${product.id}`}
                  onClick={() => handleProductClick(product.id)}
                  className="block flex-1 flex flex-col"
                >
                  {/* صورة المنتج */}
                  <div className="relative aspect-square overflow-hidden rounded-t-lg">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    
                    {/* شارة نوع التوصية */}
                    <div className="absolute top-2 left-2">
                      <Badge 
                        variant="secondary" 
                        className="text-xs bg-blue-500/90 text-white backdrop-blur-sm"
                      >
                        {product.recommendationType === 'personalized' ? '⭐' : 
                         product.recommendationType === 'trending' ? '🔥' : 
                         product.recommendationType === 'similar' ? '🎯' : '✨'}
                      </Badge>
                    </div>

                    {/* أيقونة القلب */}
                    <button 
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                    >
                      <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                    </button>
                  </div>

                  {/* معلومات المنتج */}
                  <div className="p-3 flex-1 flex flex-col">
                    {/* اسم المنتج */}
                    <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors text-sm">
                      {product.name}
                    </h3>

                    {/* التقييم */}
                    {product.rating && (
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-600">{product.rating}</span>
                      </div>
                    )}

                    {/* السعر */}
                    <div className="flex items-center gap-2 mb-2 mt-auto">
                      <span className="text-base font-bold text-gray-800">
                        {product.price} ج.م
                      </span>
                      {product.oldPrice && (
                        <span className="text-xs text-gray-500 line-through">
                          {product.oldPrice} ج.م
                        </span>
                      )}
                    </div>

                    {/* زر إضافة للسلة */}
                    <Button 
                      size="sm" 
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-1.5"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                    >
                      <ShoppingCart className="w-3 h-3 ml-1" />
                      أضف للسلة
                    </Button>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* إضافة CSS مخصص للسويبر */}
      <style jsx global>{`
        .recommendations-swiper .swiper-button-next,
        .recommendations-swiper .swiper-button-prev {
          color: #3B82F6;
          background: white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          margin-top: -20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .recommendations-swiper .swiper-button-next:after,
        .recommendations-swiper .swiper-button-prev:after {
          font-size: 14px;
          font-weight: bold;
        }
      `}</style>
    </div>
  )
}
