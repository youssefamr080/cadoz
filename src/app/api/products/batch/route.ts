import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'يجب توفير مصفوفة من معرفات المنتجات' },
        { status: 400 }
      );
    }

    // Convert all IDs to strings for Prisma
    const stringIds = ids.map(id => id.toString());
    
    const products = await prisma.product.findMany({
      where: {
        id: { in: stringIds }
      }
    });

    // Map the products to ensure consistent ID format
    const formattedProducts = products.map(product => ({
      ...product,
      _id: product.id
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching products batch:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المنتجات' },
      { status: 500 }
    );
  }
}
