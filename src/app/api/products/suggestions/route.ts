import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import MiniSearch from 'minisearch';
import { normalizeArabicText, generateArabicAlternatives } from '@/lib/utils/string-utils';
import { rateLimiter, createRateLimitKey } from '@/lib/utils/rate-limiter';

// Cache للفهرس المُحسّن مع معرف آخر تحديث
let cachedMiniSearchInstance: MiniSearch | null = null;
let lastCacheUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 دقائق
let isUpdatingCache = false;

// دالة لإنشاء أو تحديث الفهرس المُخزن مؤقتاً
async function getOrCreateCachedMiniSearch(): Promise<MiniSearch> {
  const now = Date.now();
  
  // إذا كان الفهرس موجود وما زال صالحاً، استخدمه
  if (cachedMiniSearchInstance && (now - lastCacheUpdate) < CACHE_DURATION) {
    return cachedMiniSearchInstance;
  }
  
  // إذا كان هناك تحديث جاري، انتظر قليلاً واستخدم الفهرس القديم إن وُجد
  if (isUpdatingCache && cachedMiniSearchInstance) {
    return cachedMiniSearchInstance;
  }
  
  isUpdatingCache = true;
  
  try {
    console.log('� تحديث فهرس MiniSearch للاقتراحات...');
    
    // جلب المنتجات المحدودة للاقتراحات فقط
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
      },
      // تحسين: جلب المنتجات الأكثر أهمية أولاً
      orderBy: [
        { trending: 'desc' },
        { best_seller: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 1000 // حد أقصى للمنتجات لتحسين الأداء
    });

    // إعداد MiniSearch المُحسّن
    const miniSearch = new MiniSearch({
      fields: ['name', 'category', 'subCategory', 'brand', 'tags'],
      storeFields: ['name', 'category', 'subCategory', 'brand', 'trending', 'best_seller'],
      
      tokenize: (text: string) => {
        const normalized = normalizeArabicText(text);
        return normalized.split(/\s+/).filter(word => word.length > 1);
      },
      
      processTerm: (term: string) => normalizeArabicText(term),
      
      // تحسين خيارات البحث
      searchOptions: {
        boost: { name: 2, category: 1.5, brand: 1.3 },
        fuzzy: 0.3
      }
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

    // تحديث الكاش
    cachedMiniSearchInstance = miniSearch;
    lastCacheUpdate = now;
    
    console.log(`✅ تم تحديث فهرس الاقتراحات مع ${products.length} منتج`);
    
    return miniSearch;
    
  } finally {
    isUpdatingCache = false;
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // تطبيق rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = createRateLimitKey(undefined, 'suggestions');
    
    if (!rateLimiter.checkLimit(rateLimitKey, 'suggestions')) {
      const resetTime = rateLimiter.getResetTime(rateLimitKey);
      return NextResponse.json(
        {
          success: false,
          suggestions: [],
          error: 'Too many requests',
          resetIn: Math.ceil(resetTime / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil(resetTime / 1000).toString()
          }
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query.trim() || query.length < 2) {
      return NextResponse.json({
        success: true,
        suggestions: [],
        processingTime: Date.now() - startTime
      });
    }

    console.log('🔍 طلب اقتراحات MiniSearch للنص:', query);

    // الحصول على الفهرس المُخزن مؤقتاً
    const miniSearch = await getOrCreateCachedMiniSearch();

    // تنفيذ البحث المُحسّن للاقتراحات
    const normalizedQuery = normalizeArabicText(query);
    
    // البحث الأساسي مع تحسينات الأداء
    let searchResults = miniSearch.search(query, {
      fuzzy: 0.2, // تقليل المدى الضبابي لتحسين الأداء
      prefix: true,
      combineWith: 'OR',
      boost: { name: 2, category: 1.5, brand: 1.3 }
    });

    // إضافة النتائج من الاستعلام المُطبّع فقط إذا كان مختلفاً
    if (normalizedQuery !== query) {
      const normalizedResults = miniSearch.search(normalizedQuery, {
        fuzzy: 0.3,
        prefix: true,
        combineWith: 'OR'
      });
      searchResults = [...searchResults, ...normalizedResults];
    }

    // إضافة بدائل محدودة لتحسين الأداء (بدل من جميع البدائل)
    const alternatives = generateArabicAlternatives(query);
    const limitedAlternatives = alternatives.slice(0, 2); // أول بديلين فقط
    
    for (const alt of limitedAlternatives) {
      if (alt !== query && alt !== normalizedQuery) {
        const altResults = miniSearch.search(alt, {
          fuzzy: 0.4,
          prefix: true,
          combineWith: 'OR'
        });
        searchResults = [...searchResults, ...altResults.slice(0, 5)]; // أول 5 نتائج فقط
      }
    }

    // استخراج الاقتراحات المُحسّنة باستخدام Set لتجنب التكرار
    const suggestions = new Set<string>();
    
    // تحسين: معالجة النتائج بطريقة أكثر كفاءة
    const processedResults = searchResults.slice(0, 50); // الحد من المعالجة
    
    for (const result of processedResults) {
      // اقتراحات من أسماء المنتجات (أولوية عالية)
      if (result.name && result.name.length > 1) {
        suggestions.add(result.name);
      }
      
      // اقتراحات من الفئات
      if (result.category && result.category.length > 1) {
        suggestions.add(result.category);
      }
      
      // اقتراحات من الفئات الفرعية
      if (result.subCategory && result.subCategory.length > 1) {
        suggestions.add(result.subCategory);
      }
      
      // اقتراحات من العلامات التجارية
      if (result.brand && result.brand.length > 1) {
        suggestions.add(result.brand);
      }
      
      // توقف مبكراً إذا حصلنا على اقتراحات كافية
      if (suggestions.size >= 15) break;
    }

    // إضافة اقتراحات ذكية محدودة
    const smartSuggestions = generateSmartSuggestionsForQuery(query);
    smartSuggestions.slice(0, 3).forEach(s => suggestions.add(s)); // أول 3 فقط

    // ترتيب وفلترة الاقتراحات المُحسّنة
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
      .slice(0, 6); // تقليل العدد لتحسين الأداء

    const processingTime = Date.now() - startTime;
    console.log(`💡 تم إنشاء ${finalSuggestions.length} اقتراح في ${processingTime}ms`);

    return NextResponse.json({
      success: true,
      suggestions: finalSuggestions,
      algorithm: 'MiniSearch-Cached',
      processingTime
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('Error in suggestions API:', error);
    return NextResponse.json(
      {
        success: false,
        suggestions: [],
        processingTime
      },
      { status: 500 }
    );
  }
}

// دالة لتوليد اقتراحات ذكية بناءً على الاستعلام (محسّنة)
function generateSmartSuggestionsForQuery(query: string): string[] {
  const smartSuggestions: string[] = [];
  const normalizedQuery = normalizeArabicText(query).toLowerCase();
  
  // اقتراحات للساعات
  if (normalizedQuery.includes('ساع') || normalizedQuery.includes('watch')) {
    smartSuggestions.push('ساعات رجالية', 'ساعات نسائية');
  }
  
  // اقتراحات للمحافظ
  if (normalizedQuery.includes('محفظ') || normalizedQuery.includes('wallet')) {
    smartSuggestions.push('محافظ رجالية', 'محافظ نسائية');
  }
  
  // اقتراحات للنظارات
  if (normalizedQuery.includes('نظار') || normalizedQuery.includes('glasses')) {
    smartSuggestions.push('نظارات شمسية', 'نظارات طبية');
  }
  
  // اقتراحات للعطور
  if (normalizedQuery.includes('عطر') || normalizedQuery.includes('perfume')) {
    smartSuggestions.push('عطور رجالية', 'عطور نسائية');
  }
  
  return smartSuggestions;
}
