import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildEnhancedSearchConditions, calculateRelevanceScore } from '@/lib/search/searchEnhancements';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortBy = searchParams.get('sortBy') || 'relevance';

    console.log('🔍 البحث المحسن عن:', query);

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0
      });
    }

    // بناء شروط البحث المحسنة مع المرادفات والتصحيحات
    const searchConditions = buildEnhancedSearchConditions(query);
    console.log('🔤 تم إنشاء', searchConditions.length, 'شرط بحث محسن');

    let whereCondition: Record<string, unknown> = {
      OR: searchConditions
    };

    // فلتر الفئة
    if (category && category !== 'all') {
      whereCondition.AND = [
        whereCondition,
        { category: { contains: category, mode: 'insensitive' } }
      ];
      whereCondition = { AND: whereCondition.AND };
      delete whereCondition.OR;
    }

    console.log('🔍 شروط البحث:', JSON.stringify(whereCondition, null, 2));

    // البحث في المنتجات
    const products = await prisma.product.findMany({
      where: whereCondition,      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        old_price: true,
        image: true,
        category: true,
        subCategory: true,
        brand: true,
        tags: true,
        stock: true,
        inStock: true,
        rating: true,
        trending: true,
        best_seller: true
      },
      take: limit
    });

    console.log(`📊 وُجد ${products.length} منتج`);

    // تحويل النتائج إلى التنسيق المطلوب
    const results = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      image: product.image,
      price: product.price,
      oldPrice: product.old_price,
      category: product.category,
      subCategory: product.subCategory,
      brand: product.brand,
      type: 'product' as const,
      tags: product.tags || [],
      inStock: product.inStock,
      trending: Boolean(product.trending || product.best_seller),
      rating: product.rating,
      url: `/product/${product.id}`
    }));

    // ترتيب النتائج باستخدام النظام المحسن
    if (sortBy === 'price_asc') {
      results.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      results.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      // ترتيب حسب الصلة الذكية المحسنة
      results.sort((a, b) => {
        const aScore = calculateRelevanceScore(a, query);
        const bScore = calculateRelevanceScore(b, query);
        return bScore - aScore;
      });
    }

    return NextResponse.json({
      success: true,
      data: results,
      total: results.length,
      query
    });

  } catch (error) {
    console.error('Error in products search API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ أثناء البحث في المنتجات',
      },
      { status: 500 }
    );
  }
}
