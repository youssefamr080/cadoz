/**
 * مكون التوصيات الذكية المتقدم
 */

'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRecommendations, type UseRecommendationsOptions } from '@/lib/hooks/useRecommendations'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, ShoppingCart, Eye, TrendingUp, Heart, Sparkles } from 'lucide-react'

interface SmartRecommendationsProps extends UseRecommendationsOptions {
  title?: string
  showTitle?: boolean
  showReasons?: boolean
  showLoginPrompt?: boolean
  className?: string
  cardVariant?: 'default' | 'compact' | 'detailed'
  onProductClick?: (productId: string) => void
  onAddToCart?: (productId: string, product: Record<string, unknown>) => void
}

export function SmartRecommendations({
  title = 'توصيات مخصصة لك',
  showTitle = true,
  showReasons = true,
  showLoginPrompt = true,
  className = '',
  onProductClick,
  onAddToCart,
  ...options
}: SmartRecommendationsProps) {
  const {
    recommendations,
    loading,
    error,
    isPersonalized,
    loginRequired,
    trackInteraction,
    refreshRecommendations,
  } = useRecommendations(options)

  const handleProductClick = (productId: string) => {
    trackInteraction('click', productId)
    onProductClick?.(productId)
  }

  const handleAddToCart = (product: Record<string, unknown>) => {
    trackInteraction('add_to_cart', product.id as string, {
      price: product.price,
      quantity: 1,
    })
    onAddToCart?.(product.id as string, product)
  }

  const handleProductView = (productId: string) => {
    trackInteraction('view', productId, {
      source: 'recommendations',
      timestamp: new Date(),
    })
  }

  const getRecommendationTypeIcon = (type: string) => {
    switch (type) {
      case 'personalized':
        return <Sparkles className="w-4 h-4 text-purple-500" />
      case 'trending':
        return <TrendingUp className="w-4 h-4 text-orange-500" />
      case 'similar':
        return <Heart className="w-4 h-4 text-pink-500" />
      default:
        return <Star className="w-4 h-4 text-yellow-500" />
    }
  }

  const getRecommendationTypeText = (type: string) => {
    switch (type) {
      case 'personalized':
        return 'مخصص لك'
      case 'trending':
        return 'رائج'
      case 'similar':
        return 'مشابه'
      case 'category_based':
        return 'من فئتك المفضلة'
      default:
        return 'مقترح'
    }
  }

  // عرض رسالة تسجيل الدخول
  if (loginRequired && showLoginPrompt) {
    return (
      <div className={`bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 text-center ${className}`}>
        <div className="max-w-md mx-auto">
          <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            احصل على توصيات مخصصة لك
          </h3>
          <p className="text-gray-600 mb-6">
            سجل دخولك للحصول على توصيات ذكية بناءً على اهتماماتك وسلوكك في التسوق
          </p>
          <div className="space-y-2">
            <Link href="/login">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                تسجيل الدخول
              </Button>
            </Link>
            <p className="text-sm text-gray-500">
              أو تصفح التوصيات العامة بالأسفل
            </p>
          </div>
        </div>
      </div>
    )
  }

  // حالة التحميل
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {showTitle && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
            <div className="w-48 h-6 bg-gray-200 rounded animate-pulse" />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: options.limit || 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="w-full h-48 bg-gray-200 rounded mb-4" />
                <div className="w-3/4 h-4 bg-gray-200 rounded mb-2" />
                <div className="w-1/2 h-4 bg-gray-200 rounded mb-2" />
                <div className="w-1/4 h-6 bg-gray-200 rounded" />
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
      <div className={`text-center py-8 ${className}`}>
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={refreshRecommendations} variant="outline">
          إعادة المحاولة
        </Button>
      </div>
    )
  }

  // لا توجد توصيات
  if (recommendations.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>لا توجد توصيات متاحة حالياً</p>
        <Button onClick={refreshRecommendations} variant="outline" className="mt-4">
          تحديث التوصيات
        </Button>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* العنوان والمعلومات */}
      {showTitle && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-500" />
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {isPersonalized && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                مخصص لك
              </Badge>
            )}
          </div>
          
          <Button 
            onClick={refreshRecommendations} 
            variant="outline" 
            size="sm"
            className="text-sm"
          >
            تحديث
          </Button>
        </div>
      )}

      {/* شبكة التوصيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recommendations.map((product) => (
          <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-0">
              {/* صورة المنتج */}
              <div className="relative overflow-hidden rounded-t-lg">
                <Link 
                  href={`/product/${product.id}`}
                  onClick={() => handleProductClick(product.id)}
                  onMouseEnter={() => handleProductView(product.id)}
                >
                  <Image
                    src={product.image || '/placeholder.svg'}
                    alt={product.name}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                
                {/* نوع التوصية */}
                <div className="absolute top-2 left-2">
                  <Badge 
                    variant="secondary" 
                    className="bg-white/90 text-gray-700 text-xs flex items-center gap-1"
                  >
                    {getRecommendationTypeIcon(product.recommendationType)}
                    {getRecommendationTypeText(product.recommendationType)}
                  </Badge>
                </div>

                {/* نقاط الصلة (في حالة التطوير فقط) */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="bg-white/90 text-xs">
                      {Math.round(product.relevanceScore)}
                    </Badge>
                  </div>
                )}
              </div>

              {/* محتوى المنتج */}
              <div className="p-4 space-y-3">
                {/* اسم المنتج */}
                <Link 
                  href={`/product/${product.id}`}
                  onClick={() => handleProductClick(product.id)}
                >
                  <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-purple-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>

                {/* الفئة والتقييم */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{product.category}</span>
                  {product.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{product.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* السبب (إذا كان مفعلاً) */}
                {showReasons && product.reason && (
                  <p className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                    {product.reason}
                  </p>
                )}

                {/* السعر والإجراءات */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-lg font-bold text-gray-900">
                    {product.price.toLocaleString()} ج.م
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleProductView(product.id)}
                      className="p-2"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(product as unknown as Record<string, unknown>)}
                      className="p-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* إحصائيات التوصيات (في حالة التطوير) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 text-center">
          عدد التوصيات: {recommendations.length} | 
          مخصص: {isPersonalized ? 'نعم' : 'لا'} | 
          نوع: {options.type || 'مختلط'}
        </div>
      )}
    </div>
  )
}

/**
 * مكون التوصيات السريعة (مبسط)
 */
export function QuickRecommendations({ 
  productId, 
  category, 
  limit = 4,
  className = '' 
}: {
  productId?: string
  category?: string
  limit?: number
  className?: string
}) {
  return (
    <SmartRecommendations
      type={productId ? 'similar' : 'trending'}
      limit={limit}
      currentProductId={productId}
      currentCategory={category}
      title={productId ? 'منتجات مشابهة' : 'منتجات رائجة'}
      showReasons={false}
      cardVariant="compact"
      className={className}
    />
  )
}
