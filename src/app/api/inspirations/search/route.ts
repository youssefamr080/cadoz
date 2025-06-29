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

    console.log('🔍 البحث المحسن في الإلهامات عن:', query);

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0
      });
    }

    // جلب جميع الإلهامات من قاعدة البيانات (أو مع فلتر الفئة)
    const whereCondition: Record<string, unknown> = category && category !== 'all'
      ? { category: { contains: category, mode: 'insensitive' } }
      : {};

    const inspirations = await prisma.inspiration.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        description: true,
        content: true,
        tags: true,
        image: true,
        price: true,
        oldPrice: true,
        category: true,
        rating: true,
        likes: true,
        reviews: true,
        discountPercentage: true,
        createdAt: true
      }
    });

    console.log(`📊 جلب ${inspirations.length} إلهام من قاعدة البيانات`);

    // إعداد MiniSearch مع دعم العربية للإلهامات
    const miniSearch = new MiniSearch({
      fields: ['name', 'description', 'content', 'category', 'tags'],
      storeFields: ['id', 'name', 'description', 'content', 'tags', 'image', 'price', 'oldPrice', 'category', 'rating', 'likes', 'reviews', 'discountPercentage'],
      
      // تخصيص التوكين للعربية
      tokenize: (text: string) => {
        const normalized = normalizeArabicText(text);
        return normalized.split(/\s+/).filter(word => word.length > 1);
      },
      
      processTerm: (term: string) => normalizeArabicText(term),
    });

    // تحضير البيانات للفهرسة - استخدام ID الأصلي
    const documentsForSearch = inspirations.map((inspiration) => ({
      id: inspiration.id, // استخدام ID الأصلي من قاعدة البيانات
      name: inspiration.name || '',
      description: inspiration.description || '',
      content: inspiration.content || '',
      category: inspiration.category || '',
      tags: Array.isArray(inspiration.tags) ? inspiration.tags.join(' ') : (inspiration.tags || ''),
      price: inspiration.price,
      oldPrice: inspiration.oldPrice,
      image: inspiration.image,
      rating: inspiration.rating,
      likes: inspiration.likes,
      reviews: inspiration.reviews,
      discountPercentage: inspiration.discountPercentage
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
      boost: { name: 3, category: 2.5, tags: 2, content: 1.5, description: 1 },
      fuzzy: 0.2,
      prefix: true,
      combineWith: 'OR'
    });

    // إذا لم نجد نتائج جيدة، جرب البحث المُطبّع
    if (searchResults.length === 0 || (searchResults[0] && searchResults[0].score < 0.3)) {
      const normalizedResults = miniSearch.search(normalizedQuery, {
        boost: { name: 3, category: 2.5, tags: 2, content: 1.5, description: 1 },
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
            boost: { name: 3, category: 2.5, tags: 2, content: 1.5, description: 1 },
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
      id: result.id, // استخدام ID الأصلي
      name: result.name,
      description: result.description,
      content: result.content,
      image: result.image,
      price: result.price,
      oldPrice: result.oldPrice,
      category: result.category,
      type: 'inspiration' as const,
      tags: result.tags ? result.tags.split(' ').filter((t: string) => t.length > 0) : [],
      rating: result.rating,
      likes: result.likes,
      reviews: result.reviews,
      discountPercentage: result.discountPercentage,
      url: `/inspiration/${result.id}`, // تصحيح: استخدام result.id
      relevanceScore: result.score,
      searchScore: result.score + (result.likes > 50 ? 10 : 0) + (result.rating > 4 ? 5 : 0)
    }));

    // ترتيب النتائج
    if (sortBy === 'price_asc') {
      processedResults = processedResults.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      processedResults = processedResults.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      processedResults = processedResults.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'likes') {
      processedResults = processedResults.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else {
      // ترتيب حسب نقاط MiniSearch المحسنة
      processedResults = processedResults.sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0));
    }

    const results = processedResults;

    console.log(`🎯 إرجاع ${results.length} نتيجة إلهام مرتبة حسب الصلة`);

    return NextResponse.json({
      success: true,
      data: results,
      total: results.length,
      query,
      algorithm: 'MiniSearch'
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
