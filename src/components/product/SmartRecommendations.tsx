"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay, FreeMode } from 'swiper/modules'
import { Star, Sparkles } from 'lucide-react'
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline"
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid"
import { motion } from 'framer-motion'
import Image from 'next/image'
import LoginModal from '@/components/auth/login-modal'
import { useSelector, useDispatch } from "react-redux"
import { selectWishlist, addToWishlist, removeFromWishlist } from "@/lib/redux/slices/wishlistSlice"

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/free-mode'

interface Recommendation {
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
  currentProductId?: string
  currentCategory?: string
  limit?: number
  title?: string
  type?: 'personalized' | 'similar' | 'trending' | 'category_based' | 'mixed'
  excludeIds?: string[]
  showLoginPrompt?: boolean
  className?: string
}

export default function SmartRecommendations({
  currentProductId,
  currentCategory,
  limit = 8,
  title = "منتجات مقترحة لك",
  type = 'mixed',
  excludeIds,
  className = ""
}: SmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { status } = useSession()
  const router = useRouter()
  const isLoadingRef = useRef(false)
  const lastFetchRef = useRef<string>('')
  const wishlist = useSelector(selectWishlist)
  const dispatch = useDispatch()

  // استخدام useMemo لمنع إعادة إنشاء array في كل render
  const memoizedExcludeIds = useMemo(() => {
    if (!excludeIds || excludeIds.length === 0) return []
    return [...excludeIds]
  }, [excludeIds])

  // استقرار dependencies للـ useCallback
  const excludeIdsString = useMemo(() => memoizedExcludeIds.join(','), [memoizedExcludeIds])

  // استخدام useCallback لمنع إعادة الإنشاء في كل render
  const fetchRecommendations = useCallback(async () => {
    if (status === 'loading' || isLoadingRef.current) return
    
    // التحقق من التخزين المؤقت أولاً
    const cacheKey = `recommendations_${type}_${limit}_${currentProductId || 'none'}_${currentCategory || 'none'}_${excludeIdsString}`
    
    // تجنب إعادة الطلب نفسه
    if (lastFetchRef.current === cacheKey) return
    
    isLoadingRef.current = true
    lastFetchRef.current = cacheKey
    
    const cached = sessionStorage.getItem(cacheKey)
    
    if (cached) {
      try {
        const { data: cachedData, timestamp } = JSON.parse(cached)
        // إذا كانت البيانات أحدث من 3 دقائق، استخدمها
        if (Date.now() - timestamp < 3 * 60 * 1000) {
          setRecommendations(cachedData)
          setLoading(false)
          isLoadingRef.current = false
          return
        }
      } catch {
        // تجاهل أخطاء تحليل التخزين المؤقت
      }
    }
    
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.append('limit', limit.toString())
      params.append('type', type)
      
      if (currentProductId) {
        params.append('currentProductId', currentProductId)
      }
      
      if (currentCategory) {
        params.append('currentCategory', currentCategory)
      }
      
      if (memoizedExcludeIds.length > 0) {
        params.append('excludeIds', memoizedExcludeIds.join(','))
      }

      const response = await fetch(`/api/recommendations?${params}`, {
        headers: {
          'Cache-Control': 'max-age=300', // 5 دقائق
        }
      })

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('كثرة الطلبات، انتظر قليلاً')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        const recommendations = data.data || []
        setRecommendations(recommendations)
        
        // حفظ في التخزين المؤقت
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({
            data: recommendations,
            timestamp: Date.now()
          }))
        } catch {
          // تجاهل أخطاء التخزين المؤقت
        }
      } else if (data.loginRequired) {
        setError('يجب تسجيل الدخول للحصول على توصيات مخصصة')
      } else {
        setError(data.message || 'فشل في جلب التوصيات')
      }
    } catch (err) {
      console.error('خطأ في جلب التوصيات:', err)
      if (err instanceof Error && err.message.includes('كثرة الطلبات')) {
        setError('كثرة الطلبات، انتظر قليلاً')
      } else {
        setError('حدث خطأ في الاتصال')
      }
    } finally {
      setLoading(false)
      isLoadingRef.current = false
    }
  }, [status, currentProductId, currentCategory, type, limit, excludeIdsString, memoizedExcludeIds])

  useEffect(() => {
    // تأخير طفيف لتجنب استدعاءات متعددة سريعة
    const timer = setTimeout(() => {
      fetchRecommendations()
    }, 100)

    return () => clearTimeout(timer)
  }, [fetchRecommendations])

  const handleProductClick = (productId: string) => {
    router.push(`/product/${productId}`)
  }

  const handleWishlistToggle = (e: React.MouseEvent, product: Recommendation) => {
    e.preventDefault()
    e.stopPropagation()
    if (wishlist.some((item) => item.id === product.id)) {
      dispatch(removeFromWishlist(product.id))
    } else {
      dispatch(addToWishlist({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        productId: product.id
      }))
    }
  }

  const handleLoginSuccess = () => {
    setShowLoginModal(false)
    toast.success('تم تسجيل الدخول بنجاح')
    // إعادة جلب التوصيات بعد تسجيل الدخول
    setTimeout(() => {
      fetchRecommendations()
    }, 1000)
  }

  // Add custom CSS styles for enhanced swiper effects
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .smart-recommendations-swiper {
        padding: 10px 5px 30px;
      }
      .smart-recommendations-swiper .swiper-button-next,
      .smart-recommendations-swiper .swiper-button-prev {
        color: #6b7280;
        background: rgba(255, 255, 255, 0.9);
        width: 32px;
        height: 32px;
        border-radius: 50%;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
      }
      .smart-recommendations-swiper .swiper-button-next:hover,
      .smart-recommendations-swiper .swiper-button-prev:hover {
        background: white;
        color: #3b82f6;
      }
      .smart-recommendations-swiper .swiper-button-next:after,
      .smart-recommendations-swiper .swiper-button-prev:after {
        font-size: 14px;
        font-weight: bold;
      }
      .smart-recommendations-swiper .swiper-pagination {
        bottom: 0;
      }
      .smart-recommendations-swiper .swiper-pagination-bullet {
        width: 6px;
        height: 6px;
        background: #d1d5db;
        opacity: 1;
      }
      .smart-recommendations-swiper .swiper-pagination-bullet-active {
        background: #c43ad1;
      }
      .line-clamp-1 {
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      @media (max-width: 640px) {
        .smart-recommendations-swiper .swiper-button-next,
        .smart-recommendations-swiper .swiper-button-prev {
          display: none;
        }
      }
    `
    document.head.appendChild(style)
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [])

  const getTypeIcon = (recType: string) => {
    switch (recType) {
      case 'personalized':
        return <Sparkles className="w-4 h-4 text-purple-500" />
      case 'similar':
        return <Star className="w-4 h-4 text-blue-500" />
      case 'trending':
        return <Star className="w-4 h-4 text-orange-500" />
      default:
        return <Star className="w-4 h-4 text-gray-500" />
    }
  }

  const getTypeColor = (recType: string) => {
    switch (recType) {
      case 'personalized':
        return 'bg-purple-500'
      case 'similar':
        return 'bg-blue-500'
      case 'trending':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <section className={`my-8 ${className}`}>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-800 md:text-2xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            {title}
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className={`my-8 ${className}`}>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-800 md:text-2xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            {title}
          </h2>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">{error}</p>
          {error.includes('تسجيل الدخول') ? (
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              تسجيل الدخول
            </button>
          ) : (
            <button
              onClick={fetchRecommendations}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              إعادة المحاولة
            </button>
          )}
        </div>
      </section>
    )
  }

  if (!recommendations.length) {
    return null
  }

  return (
    <>
      <section className={`my-8 ${className}`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 md:text-2xl">
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              {title}
            </span>
          </h2>
        </div>
        
        <Swiper
          modules={[Navigation, Pagination, Autoplay, FreeMode]}
          spaceBetween={16}
          slidesPerView={2}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
          loop={recommendations.length > 5}
          speed={600}
          grabCursor={true}
          breakpoints={{
            640: { slidesPerView: 3, spaceBetween: 16 },
            768: { slidesPerView: 4, spaceBetween: 16 },
            1024: { slidesPerView: 5, spaceBetween: 20 },
            1280: { slidesPerView: 6, spaceBetween: 20 },
          }}
          className="smart-recommendations-swiper"
        >
          {recommendations.map((product) => (
            <SwiperSlide key={product.id} className="h-auto pb-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
                className="group relative h-full"
              >
                <div 
                  onClick={() => handleProductClick(product.id)}
                  className="block h-full cursor-pointer"
                >
                  <div className="relative h-full overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-md">
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      />
                      
                      {/* شارة الخصم */}
                      <div className="absolute top-0 left-0">
                        {product.oldPrice && product.oldPrice > product.price ? (
                          <div className="bg-rose-500 px-2 py-1 rounded-br-lg text-xs font-medium text-white">
                            -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% خصم
                          </div>
                        ) : (
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-br-lg text-xs font-medium text-white ${getTypeColor(product.recommendationType)}`}>
                            {getTypeIcon(product.recommendationType)}
                            <span>{product.reason}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-3">
                      {/* Product Name */}
                      <h3 className="mb-1 line-clamp-1 text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300">
                        {product.name}
                      </h3>

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <div className="text-base font-bold text-gray-900">
                          {product.price} <span className="text-xs">ج.م</span>
                        </div>

                        {product.oldPrice && product.oldPrice > product.price && (
                          <div className="text-xs text-gray-500 line-through">
                            {product.oldPrice}
                          </div>
                        )}
                      </div>
                      
                      {/* Rating */}
                      {product.rating && (
                        <div className="mt-1 flex items-center">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < Math.floor(product.rating || 0) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                              />
                            ))}
                          </div>
                          <span className="mr-1 text-xs text-gray-500">({product.rating.toFixed(1)})</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* زر القلب للمفضلة */}
                <button
                  className="absolute top-1.5 right-1.5 z-10 p-1 bg-white/90 backdrop-blur-sm rounded-full shadow-sm transition-all hover:scale-110"
                  onClick={(e) => handleWishlistToggle(e, product)}
                >
                  {wishlist.some((item) => item.id === product.id) ? (
                    <HeartSolid className="w-4 h-4 text-red-600" />
                  ) : (
                    <HeartOutline className="w-4 h-4 text-gray-400 hover:text-red-500 transition" />
                  )}
                </button>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={handleLoginSuccess}
        />
      )}
    </>
  )
}
