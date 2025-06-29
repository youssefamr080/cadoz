'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, FreeMode } from 'swiper/modules'
import { Star, ShoppingCart, Eye, TrendingUp, Heart, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTracking } from '@/hooks/useTracking'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/free-mode'

interface SimilarProduct {
  id: string
  name: string
  price: number
  oldPrice?: number
  image: string
  category: string
  rating?: number
  inStock: boolean
  trending?: boolean
  similarityReason: string
  similarityScore: number
}

interface SimilarProductsProps {
  currentProductId: string
  currentProductName?: string
  currentCategory?: string
  currentPrice?: number
  currentTags?: string[]
  limit?: number
  className?: string
}

export default function SimilarProducts({
  currentProductId,
  currentProductName,
  currentCategory,
  currentPrice,
  currentTags = [],
  limit = 8,
  className = ''
}: SimilarProductsProps) {
  const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { trackEvent, trackRecommendationClick } = useTracking()

  // جلب المنتجات المشابهة
  useEffect(() => {
    const fetchSimilarProducts = async () => {
      if (!currentProductId) return

      setLoading(true)
      setError(null)

      try {
        // بناء معاملات البحث
        const params = new URLSearchParams({
          currentProductId,
          excludeIds: currentProductId,
          limit: limit.toString()
        })

        if (currentCategory) params.append('category', currentCategory)
        if (currentPrice) params.append('price', currentPrice.toString())
        if (currentTags.length > 0) params.append('tags', currentTags.join(','))

        const response = await fetch(`/api/products/similar?${params}`)
        const data = await response.json()

        if (data.success) {
          setSimilarProducts(data.data.map((product: {
            id: string
            name: string
            price: number
            old_price?: number
            image?: string
            category?: string
            rating?: number
            inStock?: boolean
            trending?: boolean
          }) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            oldPrice: product.old_price,
            image: product.image || '/placeholder.svg',
            category: product.category || 'عام',
            rating: product.rating,
            inStock: product.inStock !== false,
            trending: product.trending,
            similarityReason: getSimilarityReason(product, currentCategory, currentPrice, currentTags),
            similarityScore: calculateSimilarityScore(product, currentCategory, currentPrice, currentTags)
          })).sort((a: SimilarProduct, b: SimilarProduct) => b.similarityScore - a.similarityScore))
        } else {
          setError('فشل في جلب المنتجات المشابهة')
        }
      } catch (err) {
        console.error('خطأ في جلب المنتجات المشابهة:', err)
        setError('حدث خطأ أثناء جلب المنتجات المشابهة')
      } finally {
        setLoading(false)
      }
    }

    fetchSimilarProducts()
  }, [currentProductId, currentCategory, currentPrice, currentTags, limit])

  // حساب سبب التشابه
  const getSimilarityReason = (product: {
    category?: string
    price: number
    trending?: boolean
    tags?: string[]
  }, category?: string, price?: number, tags?: string[]) => {
    const reasons = []

    if (product.category === category) {
      reasons.push('نفس الفئة')
    }

    if (price && product.price) {
      const priceDiff = Math.abs(product.price - price) / price
      if (priceDiff < 0.3) {
        reasons.push('نطاق سعري مشابه')
      }
    }

    if (tags && product.tags) {
      const commonTags = tags.filter(tag => 
        product.tags!.some((pTag: string) => 
          pTag.toLowerCase().includes(tag.toLowerCase()) || 
          tag.toLowerCase().includes(pTag.toLowerCase())
        )
      )
      if (commonTags.length > 0) {
        reasons.push('خصائص مشتركة')
      }
    }

    if (product.trending) {
      reasons.push('رائج حالياً')
    }

    return reasons.length > 0 ? reasons.join(' • ') : 'منتج مشابه'
  }

  // حساب درجة التشابه
  const calculateSimilarityScore = (product: {
    category?: string
    price: number
    tags?: string[]
    trending?: boolean
    rating?: number
    inStock?: boolean
  }, category?: string, price?: number, tags?: string[]) => {
    let score = 0

    // نقاط الفئة
    if (product.category === category) {
      score += 40
    }

    // نقاط السعر
    if (price && product.price) {
      const priceDiff = Math.abs(product.price - price) / price
      if (priceDiff < 0.1) score += 30
      else if (priceDiff < 0.2) score += 20
      else if (priceDiff < 0.3) score += 10
    }

    // نقاط العلامات
    if (tags && product.tags) {
      const commonTags = tags.filter(tag => 
        product.tags.some((pTag: string) => 
          pTag.toLowerCase().includes(tag.toLowerCase()) || 
          tag.toLowerCase().includes(pTag.toLowerCase())
        )
      )
      score += commonTags.length * 5
    }

    // نقاط إضافية
    if (product.trending) score += 10
    if (product.rating > 4) score += 5
    if (product.inStock) score += 5

    return score
  }

  // تتبع النقر على منتج
  const handleProductClick = async (product: SimilarProduct) => {
    await trackRecommendationClick(product.id, 'similar', product.similarityScore)
    await trackEvent({
      eventType: 'similar_product_click',
      productId: product.id,
      context: {
        currentProductId,
        similarityReason: product.similarityReason,
        similarityScore: product.similarityScore,
        source: 'similar_products'
      }
    })
  }

  // حالة التحميل
  if (loading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">منتجات مشابهة</h2>
          <p className="text-gray-600">جاري تحميل المنتجات المشابهة...</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
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

  // حالة الخطأ
  if (error) {
    return (
      <div className={`w-full ${className}`}>
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            حاول مرة أخرى
          </Button>
        </div>
      </div>
    )
  }

  // لا توجد منتجات مشابهة
  if (similarProducts.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        <div className="text-center py-8">
          <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">لا توجد منتجات مشابهة متاحة حالياً</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      {/* العنوان */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-500" />
            منتجات مشابهة
          </h2>
          <p className="text-gray-600">
            منتجات تشبه &ldquo;{currentProductName || 'هذا المنتج'}&rdquo;
          </p>
        </div>
        
        {/* رابط عرض المزيد */}
        {similarProducts.length >= limit && (
          <Link 
            href={`/category/${currentCategory}?similar_to=${currentProductId}`}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            عرض المزيد
            <ArrowLeft className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* شبكة المنتجات للشاشات الكبيرة */}
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        {similarProducts.slice(0, limit).map((product) => (
          <ProductCard 
            key={product.id}
            product={product}
            onProductClick={handleProductClick}
          />
        ))}
      </div>

      {/* سويبر للهواتف المحمولة */}
      <div className="md:hidden">
        <Swiper
          modules={[Navigation, FreeMode]}
          spaceBetween={16}
          slidesPerView={2.2}
          freeMode={true}
          navigation={{
            nextEl: '.similar-products-next',
            prevEl: '.similar-products-prev',
          }}
          className="!overflow-visible"
        >
          {similarProducts.slice(0, limit).map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard 
                product={product}
                onProductClick={handleProductClick}
                compact={true}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        
        {/* أزرار التنقل للموبايل */}
        <div className="flex justify-center gap-4 mt-4">
          <button className="similar-products-prev p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <ArrowLeft className="w-5 h-5 rotate-180" />
          </button>
          <button className="similar-products-next p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// مكون بطاقة المنتج
interface ProductCardProps {
  product: SimilarProduct
  onProductClick: (product: SimilarProduct) => void
  compact?: boolean
}

function ProductCard({ product, onProductClick, compact = false }: ProductCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white overflow-hidden">
      <CardContent className="p-0">
        <Link 
          href={`/product/${product.id}`}
          onClick={() => onProductClick(product)}
          className="block"
        >
          {/* صورة المنتج */}
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* شارات المنتج */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.trending && (
                <Badge className="text-xs bg-red-500 text-white">
                  🔥 رائج
                </Badge>
              )}
              {!product.inStock && (
                <Badge variant="secondary" className="text-xs">
                  غير متوفر
                </Badge>
              )}
            </div>

            {/* أيقونة المفضلة */}
            <button className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
            </button>
          </div>

          {/* معلومات المنتج */}
          <div className={`p-${compact ? '3' : '4'}`}>
            {/* اسم المنتج */}
            <h3 className={`font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors ${compact ? 'text-sm' : 'text-base'}`}>
              {product.name}
            </h3>

            {/* التقييم */}
            {product.rating && (
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-gray-600">{product.rating}</span>
              </div>
            )}

            {/* السعر */}
            <div className="flex items-center gap-2 mb-2">
              <span className={`font-bold text-gray-800 ${compact ? 'text-sm' : 'text-lg'}`}>
                {product.price} ج.م
              </span>
              {product.oldPrice && (
                <span className="text-sm text-gray-500 line-through">
                  {product.oldPrice} ج.م
                </span>
              )}
            </div>

            {/* سبب التشابه */}
            <p className="text-xs text-blue-600 mb-3 line-clamp-1">
              {product.similarityReason}
            </p>

            {/* زر الإضافة للسلة */}
            {!compact && (
              <Button 
                size="sm" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={(e) => {
                  e.preventDefault()
                  // يمكن إضافة منطق إضافة للسلة هنا
                }}
              >
                <ShoppingCart className="w-4 h-4 ml-2" />
                أضف للسلة
              </Button>
            )}
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}
