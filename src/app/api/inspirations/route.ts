import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // جلب الإلهامات
    const inspirations = await prisma.inspiration.findMany({
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
      skip: skip,
      orderBy: { createdAt: 'desc' }
    });

    // عد الإجمالي
    const total = await prisma.inspiration.count();

    return NextResponse.json({
      success: true,
      data: inspirations,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error in inspirations API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ أثناء جلب الإلهامات',
      },
      { status: 500 }
    );
  }
}
