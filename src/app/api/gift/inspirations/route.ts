import { NextResponse } from 'next/server';
import { getInspirationsByCategory, getPopularInspirations, getAllInspirations } from '@/lib/actions/inspiration-actions';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query = searchParams.get('query');
    const sort = searchParams.get('sort') || 'popularity';
    const rating = searchParams.get('rating') ? parseInt(searchParams.get('rating') || '0') : 0;
    const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice') || '0') : 0;
    const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice') || '1000') : 1000;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') || '20') : 20;
    
    let inspirations;
    
    // جلب البيانات حسب الفئة أو جلب الكل
    if (category && category !== 'all') {
      inspirations = await getInspirationsByCategory(category);
    } else {
      // إذا كانت صفحة الهدايا الجاهزة، نجلب جميع الهدايا
      if (searchParams.has('all')) {
        inspirations = await getAllInspirations();
      } else {
        // للصفحة الرئيسية، نجلب الهدايا الشائعة فقط
        inspirations = await getPopularInspirations();
      }
    }
    
    // تطبيق الفلترة الإضافية
    let filteredInspirations = [...inspirations];
    
    // فلترة حسب البحث
    if (query) {
      const queryLower = query.toLowerCase();
      filteredInspirations = filteredInspirations.filter(
        item => item.name.toLowerCase().includes(queryLower) || 
                item.description.toLowerCase().includes(queryLower)
      );
    }
    
    // فلترة حسب التقييم
    if (rating > 0) {
      filteredInspirations = filteredInspirations.filter(item => item.rating >= rating);
    }
    
    // فلترة حسب السعر
    filteredInspirations = filteredInspirations.filter(item => {
      // ابحث عن خاصية السعر المباشرة أو ضمن box أو bag أو أقل سعر منتج
      let price = 0;
      if (typeof item.price === 'number') {
        price = item.price;
      } else if (item.box && typeof item.box.price === 'number') {
        price = item.box.price;
      } else if (item.bag && typeof item.bag.price === 'number') {
        price = item.bag.price;
      } else if (Array.isArray(item.products) && item.products.length > 0) {
        // إذا كانت المنتجات موجودة، استخدم أقل سعر منتج
        interface ProductWithPrice { price?: number }
        const productPrices = (item.products as ProductWithPrice[])
          .map((p) => p.price)
          .filter((p): p is number => typeof p === 'number');
        if (productPrices.length > 0) {
          price = Math.min(...productPrices);
        }
      }
      // إذا لم يوجد سعر، لا يتم استبعاد العنصر
      return price >= minPrice && price <= maxPrice;
    });
    
    // ترتيب النتائج
    switch (sort) {
      case 'price_asc':
        // للتطبيق الفعلي، ستحتاج إلى ترتيب حسب السعر الفعلي
        break;
      case 'price_desc':
        // للتطبيق الفعلي، ستحتاج إلى ترتيب حسب السعر الفعلي
        break;
      case 'rating':
        filteredInspirations.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        // افتراض أن العناصر الأحدث لها معرفات أعلى
        filteredInspirations.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case 'popularity':
      default:
        // ترتيب حسب مزيج من التقييم وعدد المراجعات
        filteredInspirations.sort((a, b) => (b.rating * b.reviews) - (a.rating * a.reviews));
        break;
    }
    
    // تحديد عدد النتائج
    if (limit > 0 && filteredInspirations.length > limit) {
      filteredInspirations = filteredInspirations.slice(0, limit);
    }
    
    return NextResponse.json({
      success: true,
      data: filteredInspirations,
      total: inspirations.length,
      filtered: filteredInspirations.length
    });
  } catch (error) {
    console.error('Error in inspirations API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ أثناء جلب هدايا الإلهام',
      },
      { status: 500 }
    );
  }
}
