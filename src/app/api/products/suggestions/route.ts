import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSmartSuggestions, tokenizeQuery, getSynonyms, normalizeText } from '@/lib/search/searchEnhancements';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query.trim() || query.length < 2) {
      return NextResponse.json({
        success: true,
        suggestions: []
      });
    }

    console.log('🔍 طلب اقتراحات للنص:', query);

    // الحصول على اقتراحات ذكية أساسية
    const smartSuggestions = generateSmartSuggestions(query);

    // البحث في قاعدة البيانات للحصول على اقتراحات من المنتجات الفعلية
    const words = tokenizeQuery(query);
    const searchConditions: Record<string, unknown>[] = [];

    // بناء شروط البحث للاقتراحات
    for (const word of words) {
      const synonyms = getSynonyms(word);
      for (const synonym of synonyms) {
        searchConditions.push(
          { name: { contains: synonym, mode: 'insensitive' } },
          { category: { contains: synonym, mode: 'insensitive' } },
          { subCategory: { contains: synonym, mode: 'insensitive' } },
          { brand: { contains: synonym, mode: 'insensitive' } }
        );
      }
    }

    // البحث في المنتجات للحصول على اقتراحات
    const products = await prisma.product.findMany({
      where: {
        OR: searchConditions
      },
      select: {
        name: true,
        category: true,
        subCategory: true,
        brand: true
      },
      take: 20
    });

    // استخراج اقتراحات من أسماء المنتجات والفئات
    const productBasedSuggestions: string[] = [];
    
    for (const product of products) {
      // اقتراحات من أسماء المنتجات
      if (product.name) {
        const normalizedName = normalizeText(product.name);
        const normalizedQuery = normalizeText(query);
        if (normalizedName.includes(normalizedQuery)) {
          productBasedSuggestions.push(product.name);
        }
      }

      // اقتراحات مركبة (فئة + علامة تجارية)
      if (product.category && product.brand) {
        const suggestion = `${product.category} ${product.brand}`;
        const normalizedSuggestion = normalizeText(suggestion);
        const normalizedQuery = normalizeText(query);
        if (normalizedSuggestion.includes(normalizedQuery)) {
          productBasedSuggestions.push(suggestion);
        }
      }

      // اقتراحات من الفئات الفرعية + العلامة التجارية
      if (product.subCategory && product.brand) {
        const suggestion = `${product.subCategory} ${product.brand}`;
        const normalizedSuggestion = normalizeText(suggestion);
        const normalizedQuery = normalizeText(query);
        if (normalizedSuggestion.includes(normalizedQuery)) {
          productBasedSuggestions.push(suggestion);
        }
      }
    }

    // دمج جميع الاقتراحات
    const allSuggestions = [
      ...smartSuggestions,
      ...productBasedSuggestions
    ];

    // إزالة التكرارات وترتيب حسب الصلة
    const uniqueSuggestions = [...new Set(allSuggestions)]
      .filter(suggestion => suggestion.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => {
        const aStartsWith = a.toLowerCase().startsWith(query.toLowerCase());
        const bStartsWith = b.toLowerCase().startsWith(query.toLowerCase());
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        return a.length - b.length; // الاقتراحات الأقصر أولاً
      })
      .slice(0, 8); // أفضل 8 اقتراحات

    console.log(`💡 تم إنشاء ${uniqueSuggestions.length} اقتراح`);

    return NextResponse.json({
      success: true,
      suggestions: uniqueSuggestions
    });

  } catch (error) {
    console.error('Error in suggestions API:', error);
    return NextResponse.json(
      {
        success: false,
        suggestions: []
      },
      { status: 500 }
    );
  }
}
