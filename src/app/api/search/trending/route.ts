import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // اتجاهات شائعة مبنية على البيانات الفعلية
    const [
      trendingProducts,
      popularCategories,
      topRatedProducts
    ] = await Promise.all([
      // منتجات ترندنج
      prisma.product.findMany({
        where: { trending: true },
        select: { name: true },
        take: 10,
        orderBy: { views: 'desc' }
      }),
      // فئات شائعة
      prisma.product.groupBy({
        by: ['category'],
        _count: { category: true },
        where: { 
          category: { not: null }
        },
        orderBy: { _count: { category: 'desc' } },
        take: 5
      }),
      // منتجات عالية التقييم
      prisma.product.findMany({
        where: { 
          rating: { gte: 4.0 }
        },
        select: { name: true },
        take: 5,
        orderBy: { rating: 'desc' }
      })
    ]);

    // تجميع الاتجاهات
    const trends = [
      ...trendingProducts.map(p => p.name.split(' ')[0]).slice(0, 3),
      ...popularCategories.map(c => c.category).slice(0, 2),
      ...topRatedProducts.map(p => p.name.split(' ')[0]).slice(0, 2)
    ];

    // إضافة بعض الاتجاهات الثابتة الشائعة
    const staticTrends = ['هدايا', 'عطور', 'ساعات', 'مجوهرات', 'ملابس'];
    
    const allTrends = [...new Set([...trends, ...staticTrends])].slice(0, 8);

    return NextResponse.json({
      success: true,
      data: allTrends
    });

  } catch (error) {
    console.error('Error in trending search API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ أثناء جلب الاتجاهات الشائعة',
        data: ['هدايا', 'عطور', 'ساعات', 'مجوهرات', 'ملابس'] // fallback
      },
      { status: 500 }
    );
  }
}
