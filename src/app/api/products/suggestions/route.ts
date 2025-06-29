import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import MiniSearch from 'minisearch';
import { normalizeArabicText, generateArabicAlternatives } from '@/lib/utils/string-utils';

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

    console.log('🔍 طلب اقتراحات MiniSearch للنص:', query);

    // جلب جميع المنتجات لبناء فهرس الاقتراحات
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        subCategory: true,
        brand: true,
        tags: true,
        trending: true,
        best_seller: true
      }
    });

    // إعداد MiniSearch للاقتراحات
    const miniSearch = new MiniSearch({
      fields: ['name', 'category', 'subCategory', 'brand', 'tags'],
      storeFields: ['name', 'category', 'subCategory', 'brand', 'trending', 'best_seller'],
      
      tokenize: (text: string) => {
        const normalized = normalizeArabicText(text);
        return normalized.split(/\s+/).filter(word => word.length > 1);
      },
      
      processTerm: (term: string) => normalizeArabicText(term),
    });

    // تحضير البيانات للفهرسة
    const documentsForSuggestions = products.map((product, index) => ({
      id: index,
      name: product.name || '',
      category: product.category || '',
      subCategory: product.subCategory || '',
      brand: product.brand || '',
      tags: Array.isArray(product.tags) ? product.tags.join(' ') : (product.tags || ''),
      trending: product.trending,
      best_seller: product.best_seller
    }));

    miniSearch.addAll(documentsForSuggestions);

    // تنفيذ البحث للاقتراحات
    const normalizedQuery = normalizeArabicText(query);
    const alternatives = generateArabicAlternatives(query);
    
    // البحث الأساسي للاقتراحات
    let searchResults = miniSearch.search(query, {
      fuzzy: 0.3,
      prefix: true,
      combineWith: 'OR'
    });

    // إضافة النتائج من الاستعلام المُطبّع
    const normalizedResults = miniSearch.search(normalizedQuery, {
      fuzzy: 0.4,
      prefix: true,
      combineWith: 'OR'
    });

    searchResults = [...searchResults, ...normalizedResults];

    // إضافة نتائج من البدائل الإملائية
    for (const alt of alternatives.slice(0, 3)) { // أول 3 بدائل فقط
      if (alt !== query && alt !== normalizedQuery) {
        const altResults = miniSearch.search(alt, {
          fuzzy: 0.5,
          prefix: true,
          combineWith: 'OR'
        });
        searchResults = [...searchResults, ...altResults];
      }
    }

    // استخراج الاقتراحات المختلفة
    const suggestions = new Set<string>();
    
    for (const result of searchResults) {
      // اقتراحات من أسماء المنتجات
      if (result.name && result.name.length > 0) {
        suggestions.add(result.name);
      }
      
      // اقتراحات من الفئات
      if (result.category && result.category.length > 0) {
        suggestions.add(result.category);
      }
      
      // اقتراحات من الفئات الفرعية
      if (result.subCategory && result.subCategory.length > 0) {
        suggestions.add(result.subCategory);
      }
      
      // اقتراحات من العلامات التجارية
      if (result.brand && result.brand.length > 0) {
        suggestions.add(result.brand);
      }
      
      // اقتراحات مركبة للمنتجات الرائجة
      if (result.trending || result.best_seller) {
        if (result.category && result.brand) {
          suggestions.add(`${result.category} ${result.brand}`);
        }
        if (result.subCategory && result.brand) {
          suggestions.add(`${result.subCategory} ${result.brand}`);
        }
      }
    }

    // إضافة اقتراحات ذكية بناءً على الاستعلام
    const smartSuggestions = generateSmartSuggestionsForQuery(query);
    smartSuggestions.forEach(s => suggestions.add(s));

    // ترتيب وفلترة الاقتراحات
    const finalSuggestions = Array.from(suggestions)
      .filter(suggestion => {
        const normalizedSuggestion = normalizeArabicText(suggestion);
        const normalizedQuery = normalizeArabicText(query);
        return suggestion.length > 1 && normalizedSuggestion.includes(normalizedQuery);
      })
      .sort((a, b) => {
        const aNormalized = normalizeArabicText(a);
        const bNormalized = normalizeArabicText(b);
        const queryNormalized = normalizeArabicText(query);
        
        // أولوية للتي تبدأ بنفس الاستعلام
        const aStartsWith = aNormalized.startsWith(queryNormalized);
        const bStartsWith = bNormalized.startsWith(queryNormalized);
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        // ثم الأقصر
        return a.length - b.length;
      })
      .slice(0, 8);

    console.log(`💡 تم إنشاء ${finalSuggestions.length} اقتراح بـ MiniSearch`);

    return NextResponse.json({
      success: true,
      suggestions: finalSuggestions,
      algorithm: 'MiniSearch'
    });

// دالة لتوليد اقتراحات ذكية بناءً على الاستعلام
function generateSmartSuggestionsForQuery(query: string): string[] {
  const smartSuggestions: string[] = [];
  const normalizedQuery = normalizeArabicText(query).toLowerCase();
  
  // اقتراحات للساعات
  if (normalizedQuery.includes('ساع') || normalizedQuery.includes('watch')) {
    smartSuggestions.push('ساعات رجالية', 'ساعات نسائية', 'ساعات ذكية', 'ساعات كلاسيكية');
  }
  
  // اقتراحات للمحافظ
  if (normalizedQuery.includes('محفظ') || normalizedQuery.includes('wallet')) {
    smartSuggestions.push('محافظ رجالية', 'محافظ نسائية', 'محافظ جلدية');
  }
  
  // اقتراحات للنظارات
  if (normalizedQuery.includes('نظار') || normalizedQuery.includes('glasses')) {
    smartSuggestions.push('نظارات شمسية', 'نظارات طبية', 'نظارات رياضية');
  }
  
  // اقتراحات للعطور
  if (normalizedQuery.includes('عطر') || normalizedQuery.includes('perfume')) {
    smartSuggestions.push('عطور رجالية', 'عطور نسائية', 'عطور فرنسية');
  }
  
  return smartSuggestions;
}

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
