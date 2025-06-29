import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        message: 'الرجاء إدخال كلمة بحث أطول'
      });
    }

    // البحث في الإلهامات
    const inspirations = await prisma.inspiration.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        price: true,
        oldPrice: true,
        category: true,
        rating: true,
        createdAt: true
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    // تحويل النتائج
    const results = inspirations.map(inspiration => {
      // حساب درجة بسيطة للصلة
      let relevanceScore = 0;
      const lowerQuery = query.toLowerCase();
      const lowerName = inspiration.name.toLowerCase();
      
      if (lowerName.includes(lowerQuery)) {
        relevanceScore += lowerName.indexOf(lowerQuery) === 0 ? 10 : 5;
      }
      if (inspiration.category?.toLowerCase().includes(lowerQuery)) {
        relevanceScore += 3;
      }
      if (inspiration.description?.toLowerCase().includes(lowerQuery)) {
        relevanceScore += 2;
      }

      return {
        id: inspiration.id,
        name: inspiration.name,
        description: inspiration.description,
        image: inspiration.image,
        price: inspiration.price,
        oldPrice: inspiration.oldPrice,
        category: inspiration.category,
        type: 'inspiration' as const,
        relevanceScore,
        rating: inspiration.rating,
        url: `/inspiration/${inspiration.id}`
      };
    });

    // ترتيب حسب الصلة
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return NextResponse.json({
      success: true,
      data: results,
      total: results.length,
      query
    });

  } catch (error) {
    console.error('Error in inspirations search API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ أثناء البحث في الإلهامات',
      },
      { status: 500 }
    );
  }
}
