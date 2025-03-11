// app/api/products/route.ts

import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';

export async function GET(request: Request) {
  try {
    // استخراج معلمات الاستعلام من URL
    const { searchParams } = new URL(request.url);
    const brand = searchParams.get('brand');
    
    // الاتصال بقاعدة البيانات
    const { db } = await connectToDatabase();
    
    // بناء معايير البحث
    const query: { brand?: string } = {};
    if (brand) {
      query.brand = brand;
    }
    
    // جلب المنتجات من قاعدة البيانات
    const products = await db
      .collection('products')
      .find(query)
      .sort({ _id: -1 })
      .toArray();
    
    // إرجاع المنتجات
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}