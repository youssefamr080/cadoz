import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'يجب توفير مصفوفة من معرفات الهدايا' },
        { status: 400 }
      );
    }

    // Validate and filter valid ObjectId strings
    const validIds = ids.filter(id => 
      typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)
    );

    if (validIds.length === 0) {
      return NextResponse.json(
        { error: 'لم يتم العثور على معرفات صحيحة' },
        { status: 400 }
      );
    }

    // Query inspirations using Prisma
    const inspirations = await prisma.inspiration.findMany({
      where: {
        id: { in: validIds }
      },
      include: {
        ratings: true,
        comments: true,
        box: true,
        products: true,
        sweets: true,
        bag: true
      }
    });

    return NextResponse.json(inspirations);
  } catch (error) {
    console.error('Error fetching inspirations batch:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الهدايا' },
      { status: 500 }
    );
  }
}
