import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import MiniSearch from 'minisearch';
import { normalizeArabicText, generateArabicAlternatives } from '@/lib/utils/string-utils';

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

    console.log('🔍 البحث بـ MiniSearch عن:', query);

    // جلب جميع المنتجات من قاعدة البيانات (أو مع فلتر الفئة)
    const whereCondition: Record<string, unknown> = category && category !== 'all'
      ? { category: { contains: category, mode: 'insensitive' } }
      : {};

    const products = await prisma.product.findMany({
      where: whereCondition,
      select: {
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
      }
    });

    console.log(`📊 جلب ${products.length} منتج من قاعدة البيانات`);

    // إعداد MiniSearch مع دعم العربية
    const miniSearch = new MiniSearch({
      fields: ['name', 'description', 'category', 'subCategory', 'brand', 'tags'],
      storeFields: ['id', 'name', 'description', 'image', 'price', 'old_price', 'category', 'subCategory', 'brand', 'tags', 'inStock', 'rating', 'trending', 'best_seller'],
      
      // تخصيص التوكين للعربية
      tokenize: (text: string) => {
        const normalized = normalizeArabicText(text);
        return normalized.split(/\s+/).filter(word => word.length > 1);
      },
      
      processTerm: (term: string) => normalizeArabicText(term),
    });

    // تحضير البيانات للفهرسة
    const documentsForSearch = products.map((product, index) => ({
      id: index,
      productId: product.id,
      name: product.name || '',
      description: product.description || '',
      category: product.category || '',
      subCategory: product.subCategory || '',
      brand: product.brand || '',
      tags: Array.isArray(product.tags) ? product.tags.join(' ') : (product.tags || ''),
      price: product.price,
      old_price: product.old_price,
      image: product.image,
      inStock: product.inStock,
      rating: product.rating,
      trending: product.trending,
      best_seller: product.best_seller
    }));

    // إضافة المستندات للفهرس
    miniSearch.addAll(documentsForSearch);

    // تنفيذ البحث مع استراتيجيات متدرجة
    const normalizedQuery = normalizeArabicText(query);
    const alternatives = generateArabicAlternatives(query);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let searchResults: any[] = [];

    // البحث الأساسي
    searchResults = miniSearch.search(query, {
      boost: { name: 3, brand: 2.5, category: 2, subCategory: 1.8, tags: 1.5, description: 1 },
      fuzzy: 0.2,
      prefix: true,
      combineWith: 'OR'
    });

    // إذا لم نجد نتائج جيدة، جرب البحث المُطبّع
    if (searchResults.length === 0 || (searchResults[0] && searchResults[0].score < 0.3)) {
      const normalizedResults = miniSearch.search(normalizedQuery, {
        boost: { name: 3, brand: 2.5, category: 2, subCategory: 1.8, tags: 1.5, description: 1 },
        fuzzy: 0.3,
        prefix: true,
        combineWith: 'OR'
      });
      
      if (normalizedResults.length > 0) {
        searchResults = normalizedResults;
      }
    }

    // إذا ما زلنا نحتاج نتائج أفضل، جرب البدائل الإملائية
    if (searchResults.length === 0 || (searchResults[0] && searchResults[0].score < 0.2)) {
      for (const alt of alternatives) {
        if (alt !== query && alt !== normalizedQuery) {
          const altResults = miniSearch.search(alt, {
            boost: { name: 3, brand: 2.5, category: 2, subCategory: 1.8, tags: 1.5, description: 1 },
            fuzzy: 0.4,
            prefix: true,
            combineWith: 'OR'
          });
          
          if (altResults.length > 0 && altResults[0] && altResults[0].score > 0.1) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            searchResults = altResults.map((r: any) => ({ ...r, score: r.score * 0.8 })); // خفض النقاط للبدائل
            break;
          }
        }
      }
    }

    // تحويل النتائج إلى التنسيق المطلوب مع الترتيب
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let processedResults = searchResults.slice(0, limit).map((result: any) => ({
      id: result.productId,
      name: result.name,
      description: result.description,
      image: result.image,
      price: result.price,
      oldPrice: result.old_price,
      category: result.category,
      subCategory: result.subCategory,
      brand: result.brand,
      type: 'product' as const,
      tags: result.tags ? result.tags.split(' ').filter((t: string) => t.length > 0) : [],
      inStock: result.inStock,
      trending: Boolean(result.trending || result.best_seller),
      rating: result.rating,
      url: `/product/${result.productId}`,
      relevanceScore: result.score,
      searchScore: result.score + (result.trending ? 10 : 0) + (result.rating > 4 ? 5 : 0)
    }));

    // ترتيب النتائج
    if (sortBy === 'price_asc') {
      processedResults = processedResults.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      processedResults = processedResults.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      processedResults = processedResults.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      // ترتيب حسب نقاط MiniSearch المحسنة
      processedResults = processedResults.sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0));
    }

    const results = processedResults;

    console.log(`🎯 إرجاع ${results.length} نتيجة بحث مرتبة حسب الصلة`);

    return NextResponse.json({
      success: true,
      data: results,
      total: results.length,
      query,
      algorithm: 'MiniSearch'
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
