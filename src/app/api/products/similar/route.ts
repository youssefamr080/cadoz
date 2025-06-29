import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { searchParams } = new URL(request.url)
    const currentProductId = searchParams.get('currentProductId')
    const category = searchParams.get('category')
    const priceStr = searchParams.get('price')
    const tagsStr = searchParams.get('tags')
    const excludeIds = searchParams.get('excludeIds')?.split(',') || []
    const limit = Math.min(parseInt(searchParams.get('limit') || '8'), 20)

    if (!currentProductId) {
      return NextResponse.json({
        success: false,
        message: 'معرف المنتج الحالي مطلوب',
        data: []
      }, { status: 400 })
    }

    console.log('🔍 البحث عن منتجات مشابهة للمنتج:', currentProductId)

    // جلب المنتج الحالي للمقارنة
    const currentProduct = await prisma.product.findUnique({
      where: { id: currentProductId },
      select: {
        category: true,
        price: true,
        tags: true,
        brand: true,
        subCategory: true
      }
    })

    if (!currentProduct) {
      return NextResponse.json({
        success: false,
        message: 'المنتج الحالي غير موجود',
        data: []
      }, { status: 404 })
    }

    // بناء شروط البحث للمنتجات المشابهة
    const searchCategory = category || currentProduct.category
    const searchPrice = priceStr ? parseFloat(priceStr) : currentProduct.price
    const searchTags = tagsStr ? tagsStr.split(',') : currentProduct.tags
    const currentBrand = currentProduct.brand
    const currentSubCategory = currentProduct.subCategory

    // حساب نطاق السعر (±30%)
    const priceRange = {
      min: searchPrice * 0.7,
      max: searchPrice * 1.3
    }

    // البحث عن المنتجات المشابهة مع معايير متدرجة
    const similarityQueries = [
      // المستوى الأول: نفس الفئة + نطاق سعري مشابه
      {
        AND: [
          { id: { notIn: [currentProductId, ...excludeIds] } },
          { inStock: true },
          { category: searchCategory },
          {
            price: {
              gte: priceRange.min,
              lte: priceRange.max
            }
          }
        ]
      },
      // المستوى الثاني: نفس الفئة الفرعية
      {
        AND: [
          { id: { notIn: [currentProductId, ...excludeIds] } },
          { inStock: true },
          { subCategory: currentSubCategory }
        ]
      },
      // المستوى الثالث: نفس العلامة التجارية
      {
        AND: [
          { id: { notIn: [currentProductId, ...excludeIds] } },
          { inStock: true },
          { brand: currentBrand }
        ]
      },
      // المستوى الرابع: علامات مشتركة
      {
        AND: [
          { id: { notIn: [currentProductId, ...excludeIds] } },
          { inStock: true },
          { tags: { hasSome: searchTags } }
        ]
      },
      // المستوى الخامس: نفس الفئة فقط
      {
        AND: [
          { id: { notIn: [currentProductId, ...excludeIds] } },
          { inStock: true },
          { category: searchCategory }
        ]
      }
    ]

    const allSimilarProducts: {
      id: string
      name: string
      price: number
      old_price?: number | null
      image?: string | null
      category?: string | null
      rating?: number | null
      inStock?: boolean
      trending?: boolean
      tags?: string[] | null
      similarityScore?: number
    }[] = []
    const productIds = new Set<string>()

    // تنفيذ الاستعلامات بالترتيب
    for (const whereClause of similarityQueries) {
      if (allSimilarProducts.length >= limit) break

      try {
        const products = await prisma.product.findMany({
          where: whereClause,
          select: {
            id: true,
            name: true,
            price: true,
            old_price: true,
            image: true,
            category: true,
            subCategory: true,
            brand: true,
            tags: true,
            rating: true,
            inStock: true,
            trending: true,
            views: true
          },
          take: limit * 2, // جلب أكثر للفلترة
          orderBy: [
            { rating: 'desc' },
            { views: 'desc' },
            { trending: 'desc' }
          ]
        })

        // إضافة المنتجات الجديدة فقط
        for (const product of products) {
          if (!productIds.has(product.id) && allSimilarProducts.length < limit) {
            productIds.add(product.id)
            allSimilarProducts.push({
              ...product,
              similarityScore: calculateSimilarityScore(product, currentProduct)
            })
          }
        }
      } catch (error) {
        console.error('خطأ في استعلام المنتجات المشابهة:', error)
      }
    }

    // ترتيب النتائج حسب درجة التشابه
    allSimilarProducts.sort((a, b) => b.similarityScore - a.similarityScore)

    // أخذ العدد المطلوب فقط
    const finalResults = allSimilarProducts.slice(0, limit)

    const processingTime = Date.now() - startTime
    console.log(`📊 وجد ${finalResults.length} منتج مشابه في ${processingTime}ms`)

    return NextResponse.json({
      success: true,
      data: finalResults,
      total: finalResults.length,
      currentProduct: {
        id: currentProductId,
        category: searchCategory,
        price: searchPrice
      },
      processingTime,
      algorithm: 'similarity_scoring'
    })

  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('خطأ في API المنتجات المشابهة:', error)
    
    return NextResponse.json({
      success: false,
      message: 'حدث خطأ أثناء البحث عن المنتجات المشابهة',
      data: [],
      processingTime
    }, { status: 500 })
  }
}

// حساب درجة التشابه بين منتجين
function calculateSimilarityScore(product: {
  category?: string | null
  price: number
  tags?: string[] | null
  rating?: number | null
  brand?: string | null
  trending?: boolean
  views?: number
}, currentProduct: {
  category?: string
  price?: number
  tags?: string[]
  rating?: number
  brand?: string
}): number {
  let score = 0

  // نقاط الفئة (40 نقطة)
  if (product.category === currentProduct.category) {
    score += 40
  }

  // نقاط العلامة التجارية (15 نقطة)
  if (product.brand === currentProduct.brand) {
    score += 15
  }

  // نقاط السعر (20 نقطة)
  if (currentProduct.price > 0) {
    const priceDiff = Math.abs(product.price - currentProduct.price) / currentProduct.price
    if (priceDiff < 0.1) score += 20      // فرق أقل من 10%
    else if (priceDiff < 0.2) score += 15 // فرق أقل من 20%
    else if (priceDiff < 0.3) score += 10 // فرق أقل من 30%
    else if (priceDiff < 0.5) score += 5  // فرق أقل من 50%
  }

  // نقاط العلامات المشتركة (15 نقطة)
  if (currentProduct.tags && product.tags) {
    const commonTags = currentProduct.tags.filter((tag: string) => 
      product.tags.includes(tag)
    )
    score += Math.min(commonTags.length * 3, 15)
  }

  // نقاط إضافية للجودة (10 نقاط)
  if (product.rating >= 4.5) score += 5
  if (product.trending) score += 3
  if (product.views > 100) score += 2

  return Math.round(score)
}
