import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth.config"
import { prisma } from '@/lib/prisma'

// تخزين مؤقت في الذاكرة (للأداء السريع)
interface CacheItem {
  data: Recommendation[]
  timestamp: number
  expiry: number
}

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

const recommendationsCache = new Map<string, CacheItem>()

const CACHE_DURATION = 5 * 60 * 1000 // 5 دقائق (مدة أقصر للتحديث المستمر)
const DB_CACHE_DURATION = 60 * 60 * 1000 // ساعة واحدة للحفظ في قاعدة البيانات

// Rate limiting للحماية من الطلبات الكثيرة
interface RateLimitItem {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitItem>()
const RATE_LIMIT_MAX = 10 // الحد الأقصى للطلبات
const RATE_LIMIT_WINDOW = 60 * 1000 // نافزة زمنية (دقيقة واحدة)

function checkRateLimit(clientId: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(clientId)
  
  if (!limit || now > limit.resetTime) {
    // إنشاء أو إعادة تعيين العداد
    rateLimitMap.set(clientId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    })
    return true
  }
  
  if (limit.count >= RATE_LIMIT_MAX) {
    return false // تجاوز الحد الأقصى
  }
  
  limit.count++
  return true
}

// دالة GET محسّنة: جلب توصيات ذكية مع حفظ في قاعدة البيانات
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // التحقق من Rate Limiting
    const clientIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json({
        success: false,
        message: "كثرة الطلبات، انتظر قليلاً",
        error: "rate_limit_exceeded"
      }, { 
        status: 429,
        headers: {
          'Retry-After': '60'
        }
      })
    }
    
    const excludeIds = searchParams.get("excludeIds")?.split(",") || []
    const type = searchParams.get("type") as 'personalized' | 'similar' | 'trending' | 'category_based' | 'mixed'
    const limit = Number.parseInt(searchParams.get("limit") || "8")
    const currentProductId = searchParams.get("currentProductId")
    const currentCategory = searchParams.get("currentCategory")
    
    // التحقق من تسجيل الدخول
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email && !session?.user?.phone) {
      return NextResponse.json({
        success: false,
        message: "يجب تسجيل الدخول للحصول على توصيات مخصصة",
        loginRequired: true,
        data: [],
      }, { status: 401 })
    }

    // إنشاء مفتاح التخزين المؤقت
    const userIdentifier = session.user.email || session.user.phone || session.user.id
    const cacheKey = `${userIdentifier}-${type}-${limit}-${currentProductId || ''}-${currentCategory || ''}`
    
    // فحص التخزين المؤقت في الذاكرة أولاً
    const cached = recommendationsCache.get(cacheKey)
    if (cached && Date.now() < cached.expiry) {
      return NextResponse.json({
        success: true,
        data: cached.data,
        cached: true,
        timestamp: cached.timestamp,
        source: 'memory'
      })
    }

    // جلب بيانات العميل (بحث بالإيميل أو الهاتف أو ID)
    let customer = null
    
    if (session.user.email) {
      customer = await prisma.customer.findUnique({
        where: { email: session.user.email },
        include: {
          behavior: true,
          recommendationHistories: {
            where: {
              createdAt: {
                gte: new Date(Date.now() - DB_CACHE_DURATION)
              },
              recommendationType: type || 'mixed'
            },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      })
    }
    
    if (!customer && session.user.phone) {
      customer = await prisma.customer.findUnique({
        where: { phone: session.user.phone },
        include: {
          behavior: true,
          recommendationHistories: {
            where: {
              createdAt: {
                gte: new Date(Date.now() - DB_CACHE_DURATION)
              },
              recommendationType: type || 'mixed'
            },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      })
    }

    if (!customer) {
      return NextResponse.json({
        success: false,
        message: "العميل غير موجود",
        data: [],
      }, { status: 404 })
    }

    // فحص إذا كان لدينا توصيات محفوظة حديثة في قاعدة البيانات
    const latestRecommendation = customer.recommendationHistories[0]
    if (latestRecommendation && latestRecommendation.recommendedItems) {
      const savedRecommendations = latestRecommendation.recommendedItems as Recommendation[]
      
      // التحقق من أن التوصيات المحفوظة ما زالت صالحة
      if (savedRecommendations && savedRecommendations.length > 0) {
        // حفظ في التخزين المؤقت للذاكرة أيضاً
        recommendationsCache.set(cacheKey, {
          data: savedRecommendations,
          timestamp: Date.now(),
          expiry: Date.now() + CACHE_DURATION
        })
        
        return NextResponse.json({
          success: true,
          data: savedRecommendations,
          cached: true,
          timestamp: latestRecommendation.createdAt.getTime(),
          source: 'database'
        })
      }
    }

    let recommendations: Recommendation[] = []

    try {
      // جلب السلوك الحديث من جدول CustomerBehavior
      const behaviorData = customer.behavior
      const recentBehaviors = await prisma.productInteraction?.findMany({
        where: { customerId: customer.id },
        take: 50,
        orderBy: { createdAt: 'desc' }
      }).catch(() => []) || []

      // استخراج البيانات من السلوك المحفوظ
      const viewedProductIds: string[] = recentBehaviors
        .filter(b => b.interactionType === 'view')
        .map(b => b.productId)
      
      const searchQueries: string[] = await prisma.searchHistory?.findMany({
        where: { customerId: customer.id },
        take: 20,
        orderBy: { id: 'desc' }
      }).then(searches => searches.map(s => s.searchTerm)).catch(() => []) || []

      // الحصول على الفئات المفضلة من سلوك العميل
      const favoriteCategories = behaviorData?.favoriteCategories as Record<string, number> || {}
      const favoriteBrands = behaviorData?.favoriteBrands as Record<string, number> || {}

      // إضافة فلاتر ذكية بناءً على السلوك
      const whereConditions: Record<string, unknown>[] = []

      // إضافة فلتر الفئة الحالية
      if (currentCategory) {
        whereConditions.push(
          { category: currentCategory },
          { tags: { has: currentCategory } }
        )
      }

      // إضافة فلتر الفئات المفضلة
      const topFavoriteCategories = Object.entries(favoriteCategories)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([category]) => category)

      if (topFavoriteCategories.length > 0) {
        whereConditions.push(
          { category: { in: topFavoriteCategories } }
        )
      }

      // إضافة فلتر العلامات التجارية المفضلة
      const topFavoriteBrands = Object.entries(favoriteBrands)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 2)
        .map(([brand]) => brand)

      if (topFavoriteBrands.length > 0) {
        whereConditions.push(
          { brand: { in: topFavoriteBrands } }
        )
      }

      // بناء استعلام ذكي بناءً على سلوك العميل والفئة الحالية
      const baseWhere = {
        AND: [
          { id: { notIn: excludeIds } },
          ...(currentProductId ? [{ id: { not: currentProductId } }] : [])
        ]
      }

      // إضافة الشروط إلى الاستعلام
      const finalWhere = whereConditions.length > 0 
        ? { ...baseWhere, OR: whereConditions }
        : baseWhere

      const productsQuery = {
        where: finalWhere,
        take: limit * 3, // جلب عدد أكبر للفلترة الذكية
        orderBy: [
          { createdAt: 'desc' as const }
        ]
      }

      // جلب المنتجات
      const products = await prisma.product.findMany(productsQuery)

      // تقييم وترتيب المنتجات بطريقة ذكية بناءً على السلوك
      recommendations = products.map(product => {
        let relevanceScore = 30 // نقطة البداية
        let recommendationType = 'general'
        let reason = 'منتج مقترح'

        // زيادة النقاط بناءً على الفئات المفضلة
        if (favoriteCategories[product.category || '']) {
          const categoryScore = favoriteCategories[product.category || ''] * 20
          relevanceScore += categoryScore
          recommendationType = 'personalized'
          reason = 'بناءً على اهتماماتك'
        }

        // زيادة النقاط بناءً على العلامات التجارية المفضلة
        if (favoriteBrands[product.brand || '']) {
          const brandScore = favoriteBrands[product.brand || ''] * 15
          relevanceScore += brandScore
          recommendationType = 'personalized'
          reason = 'علامة تجارية مفضلة'
        }

        // زيادة النقاط إذا كان في نفس فئة المنتج الحالي
        if (currentCategory && product.category === currentCategory) {
          relevanceScore += 25
          recommendationType = 'similar'
          reason = 'منتج مشابه'
        }

        // زيادة النقاط للمنتجات الحديثة
        const daysSinceCreated = (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        if (daysSinceCreated < 30) {
          relevanceScore += 10
          if (recommendationType === 'general') {
            recommendationType = 'trending'
            reason = 'منتج جديد ومميز'
          }
        }

        // زيادة نقاط للمنتجات عالية التقييم
        if (product.rating && product.rating > 4.5) {
          relevanceScore += 15
        } else if (product.rating && product.rating > 4) {
          relevanceScore += 8
        }

        // زيادة نقاط للمنتجات الأكثر مشاهدة
        if (product.views && product.views > 100) {
          relevanceScore += 5
        }

        // تقليل النقاط إذا تم عرض هذا المنتج كثيراً للعميل
        if (viewedProductIds.includes(product.id)) {
          relevanceScore -= 10
        }

        return {
          id: product.id,
          name: product.name,
          price: product.price,
          oldPrice: product.old_price,
          image: product.image || '/placeholder.svg',
          category: product.category || 'عام',
          rating: product.rating,
          recommendationType,
          relevanceScore,
          reason
        }
      })

      // ترتيب بناءً على النقاط وأخذ العدد المطلوب
      recommendations = recommendations
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit)

      // إذا لم نحصل على عدد كافٍ، نضيف منتجات عامة
      if (recommendations.length < limit) {
        const additionalProducts = await prisma.product.findMany({
          where: {
            id: {
              notIn: [...excludeIds, ...recommendations.map(r => r.id)]
            }
          },
          take: limit - recommendations.length,
          orderBy: [
            { createdAt: 'desc' as const }
          ]
        })

        const additionalRecommendations = additionalProducts.map(product => ({
          id: product.id,
          name: product.name,
          price: product.price,
          oldPrice: product.old_price,
          image: product.image || '/placeholder.svg',
          category: product.category || 'عام',
          rating: product.rating,
          recommendationType: 'general',
          relevanceScore: 25,
          reason: 'منتج مختار'
        }))

        recommendations = [...recommendations, ...additionalRecommendations]
      }

      // حفظ التوصيات في قاعدة البيانات
      if (recommendations.length > 0) {
        try {
          await prisma.recommendationHistory.create({
            data: {
              customerId: customer.id,
              recommendationType: type || 'mixed',
              recommendedItems: JSON.parse(JSON.stringify(recommendations)),
              context: JSON.parse(JSON.stringify({
                currentProductId,
                currentCategory,
                behaviorScore: behaviorData?.engagementScore || 0,
                viewedProductsCount: viewedProductIds.length,
                searchesCount: searchQueries.length
              })),
              shown: true
            }
          })
        } catch (dbError) {
          console.error('خطأ في حفظ التوصيات في قاعدة البيانات:', dbError)
        }

        // حفظ في التخزين المؤقت في الذاكرة
        recommendationsCache.set(cacheKey, {
          data: recommendations,
          timestamp: Date.now(),
          expiry: Date.now() + CACHE_DURATION
        })
      }

      return NextResponse.json({
        success: true,
        data: recommendations,
        fresh: true,
        customerEmail: customer.email || customer.phone,
        source: 'generated'
      })

    } catch (error) {
      console.error('خطأ في توليد التوصيات:', error)
      
      // في حالة الخطأ، إرجاع منتجات عامة
      const fallbackProducts = await prisma.product.findMany({
        where: {
          id: { notIn: excludeIds }
        },
        take: limit,
        orderBy: [
          { createdAt: 'desc' as const }
        ]
      })

      const fallbackRecommendations = fallbackProducts.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        oldPrice: product.old_price,
        image: product.image || '/placeholder.svg',
        category: product.category || 'عام',
        rating: product.rating,
        recommendationType: 'fallback',
        relevanceScore: 25,
        reason: 'منتج مقترح'
      }))

      return NextResponse.json({
        success: true,
        data: fallbackRecommendations,
        fallback: true,
        error: "تم استخدام توصيات احتياطية",
      })
    }
  } catch (error) {
    console.error('خطأ عام في API التوصيات:', error)
    return NextResponse.json({ 
      success: false, 
      message: "فشل في جلب التوصيات",
      loginRequired: false,
      data: [],
    }, { status: 500 })
  }
}
