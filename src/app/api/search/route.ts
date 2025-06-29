import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../prisma/generated/client';
import { 
  normalizeArabicText, 
  generateArabicAlternatives,
  enhancedLevenshteinForArabic
} from '@/lib/utils/string-utils';

// إنشاء عميل Prisma
const prisma = new PrismaClient();

// وظائف مساعدة لجلب البيانات
async function getAllProducts() {
  try {
    return await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        old_price: true,
        image: true,
        category: true,
        tags: true,
        stock: true,
        inStock: true,
        trending: true,
        best_seller: true,
        new_arrival: true,
        sale: true,
        discountPercentage: true,
        createdAt: true,
      }
    });
  } catch (error) {
    console.error('خطأ في جلب المنتجات:', error);
    return [];
  }
}

async function getAllInspirations() {
  try {
    return await prisma.inspiration.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        price: true,
        oldPrice: true,
        category: true,
        discountPercentage: true,
        createdAt: true,
      }
    });
  } catch (error) {
    console.error('خطأ في جلب الإلهامات:', error);
    return [];
  }
}

// تحديث قائمة البحوث الشائعة لتشمل اللهجة المصرية
const popularSearches = [
  'هدية', 'عيد ميلاد', 'جواز', 'خطوبة', 'مناسبة', 'تخرج',
  'لبس', 'ملابس', 'اكسسوارات', 'مجوهرات', 'عطور', 'ميكب', 'طقم هدايا',
  'ساعة', 'شنطة', 'محفظة', 'خاتم', 'سلسلة', 'أساور',
  'بيت', 'ديكور', 'مطبخ', 'إلكترونيات', 'موبايل', 'لابتوب',
  'عيال', 'ألعاب', 'كتب', 'ألبوم', 'صور', 'تذكار'
];

// تحديث الفئات الشائعة لتشمل اللهجة المصرية
const popularCategories = [
  'لبس', 'ملابس', 'اكسسوارات', 'مجوهرات', 'عطور', 'ميكب', 'إلكترونيات',
  'بيت', 'ديكور', 'مطبخ', 'عيال', 'ألعاب', 'هدايا'
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const type = searchParams.get('type') || 'all';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') || '20') : 20;
    const category = searchParams.get('category') || '';
    const priceRange = searchParams.get('priceRange') || '';
    const sortBy = searchParams.get('sortBy') || 'relevance';
    
    // تخطي البحث إذا كان الاستعلام قصيرًا جدًا
    if (query.length < 2) {
      return NextResponse.json({
        success: true,
        data: [],
        suggestions: popularSearches.slice(0, 10),
        message: 'الرجاء إدخال كلمة بحث أطول'
      });
    }
    
    // تحسين معالجة الاستعلام باستخدام تقنيات اللغة العربية المطورة
    const normalizedQuery = normalizeArabicText(query);
    const searchTerms = normalizedQuery.split(/\s+/).filter(term => term.length > 1);
    
    // توليد البدائل اللغوية للمصطلحات للتعامل مع الأخطاء الإملائية الشائعة
    const expandedTerms = searchTerms.flatMap(term => {
      const alternatives = generateArabicAlternatives(term);
      return [term, ...alternatives];
    });
    
    // استخدام مجموعة فريدة من المصطلحات
    const uniqueTerms = Array.from(new Set(expandedTerms));
    
    // جلب البيانات
    let products = [];
    let inspirations = [];
    
    if (type === 'all' || type === 'product') {
      products = await getAllProducts();
    }
    
    if (type === 'all' || type === 'inspiration') {
      inspirations = await getAllInspirations();
    }
    
    // تطبيق تصفية حسب الفئة إذا تم تحديدها
    if (category && category !== 'all') {
      products = products.filter(product => {
        const productCategory = normalizeArabicText(product.category || '');
        const searchCategory = normalizeArabicText(category);
        return productCategory.includes(searchCategory) || searchCategory.includes(productCategory);
      });
    }
    
    // تطبيق تصفية حسب نطاق السعر إذا تم تحديده
    if (priceRange) {
      const [minPrice, maxPrice] = priceRange.split('-').map(Number);
      if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        products = products.filter(product => {
          const price = Number(product.price);
          return price >= minPrice && price <= maxPrice;
        });
      }
    }
    
    // البحث في المنتجات مع تحسين الترتيب
    const productResults = products.map(product => {
      // تحسين حساب درجة الصلة بناءً على حقول متعددة
      const nameScores = uniqueTerms.map(term => {
        const distance = enhancedLevenshteinForArabic(term, normalizeArabicText(product.name));
        const similarity = 1 - (distance / Math.max(term.length, product.name.length));
        return similarity * 10; // الوزن الأعلى للاسم
      });
      
      const descriptionScores = uniqueTerms.map(term => {
        const normDesc = normalizeArabicText(product.description);
        return normDesc.includes(term) ? 5 : 0; // نهج أبسط للوصف
      });
      
      const categoryScores = uniqueTerms.map(term => {
        if (!product.category) return 0;
        const distance = enhancedLevenshteinForArabic(term, normalizeArabicText(product.category));
        const similarity = 1 - (distance / Math.max(term.length, product.category.length));
        return similarity * 8; // وزن عالٍ للفئة
      });
      
      const tagsScores = product.tags && product.tags.length > 0
        ? product.tags.flatMap((tag: string) => {
            return uniqueTerms.map(term => {
              const distance = enhancedLevenshteinForArabic(term, normalizeArabicText(tag));
              const similarity = 1 - (distance / Math.max(term.length, tag.length));
              return similarity * 7; // وزن للعلامات
            });
          })
        : [];
      
      // تحديث: استخدام حقل category مباشرة بدلاً من occasion
      const categoryBoostScore = product.category 
        ? uniqueTerms.map(term => {
            const distance = enhancedLevenshteinForArabic(term, normalizeArabicText(product.category || ''));
            const similarity = 1 - (distance / Math.max(term.length, (product.category || '').length));
            return similarity * 6; // وزن إضافي للفئة
          })
        : [];
      
      // عوامل إضافية تؤثر على الصلة
      const popularityBoost = product.trending || product.best_seller ? 1.5 : 1.0;
      const stockBoost = product.inStock === false ? 0.8 : 1.0; // خفض طفيف للمنتجات غير المتوفرة
      const discountBoost = product.old_price ? 1.2 : 1.0; // تعزيز للمنتجات المخفضة
      
      // حساب متوسط أعلى الدرجات
      const nameScore = Math.max(...nameScores, 0);
      const descriptionScore = Math.max(...descriptionScores, 0);
      const categoryScore = Math.max(...categoryScores, 0);
      const tagsScore = tagsScores.length ? Math.max(...tagsScores) : 0;
      const categoryBoostScoreMax = categoryBoostScore.length ? Math.max(...categoryBoostScore) : 0;
      
      // حساب درجة الصلة المركبة
      let relevanceScore = Math.max(
        nameScore, 
        descriptionScore * 0.8, 
        categoryScore * 0.9, 
        tagsScore * 0.7, 
        categoryBoostScoreMax * 0.6
      );
      
      // تطبيق العوامل المعززة
      relevanceScore *= popularityBoost * stockBoost * discountBoost;
      
      // معلومات إضافية لمساعدة واجهة المستخدم
      const exactMatch = normalizeArabicText(product.name).includes(normalizedQuery) ||
                        uniqueTerms.some(term => normalizeArabicText(product.name).includes(term));
                        
      // حساب نسبة الخصم إذا كانت متوفرة
      let discountPercentage = 0;
      if (product.price && product.old_price) {
        discountPercentage = Math.round((1 - (product.price / product.old_price)) * 100);
      }
      
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        image: product.image,
        price: product.price,
        oldPrice: product.old_price,
        discountPercentage,
        category: product.category,
        type: 'product' as const,
        relevanceScore,
        tags: product.tags || [],
        inStock: product.inStock !== false,
        trending: Boolean(product.trending || product.best_seller),
        exactMatch,
        url: `/product/${product.id}`
      };
    }).filter(result => result.relevanceScore > 0.15);
    
    // البحث في الإلهامات مع تحسينات مماثلة
    const inspirationResults = inspirations.map(inspiration => {
      // محاكاة نفس نهج المنتجات مع تعديلات مناسبة
      const nameScores = uniqueTerms.map(term => {
        const distance = enhancedLevenshteinForArabic(term, normalizeArabicText(inspiration.name));
        const similarity = 1 - (distance / Math.max(term.length, inspiration.name.length));
        return similarity * 10;
      });
      
      const descriptionScores = uniqueTerms.map(term => {
        const normDesc = normalizeArabicText(inspiration.description);
        return normDesc.includes(term) ? 5 : 0;
      });
      
      // البحث في الإلهامات (مبسط حسب الحقول المتوفرة)
      const categoryScores = inspiration.category 
        ? uniqueTerms.map(term => {
            const distance = enhancedLevenshteinForArabic(term, normalizeArabicText(inspiration.category || ''));
            const similarity = 1 - (distance / Math.max(term.length, (inspiration.category || '').length));
            return similarity * 8;
          })
        : [0];
      
      // حساب متوسط أعلى الدرجات
      const nameScore = Math.max(...nameScores, 0);
      const descriptionScore = Math.max(...descriptionScores, 0);
      const categoryScore = Math.max(...categoryScores, 0);
      
      // حساب درجة الصلة المركبة (مبسطة للإلهامات)
      const relevanceScore = Math.max(
        nameScore, 
        descriptionScore * 0.8, 
        categoryScore * 0.9
      );
      
      const exactMatch = normalizeArabicText(inspiration.name).includes(normalizedQuery) ||
                        uniqueTerms.some(term => normalizeArabicText(inspiration.name).includes(term));
      
      return {
        id: inspiration.id,
        name: inspiration.name,
        description: inspiration.description,
        image: inspiration.image,
        price: inspiration.price,
        oldPrice: inspiration.oldPrice,
        category: inspiration.category,
        type: 'inspiration' as const,
        relevanceScore,
        exactMatch,
        url: `/inspiration/${inspiration.id}`
      };
    }).filter(result => result.relevanceScore > 0.15);
    
    // دمج وفرز النتائج مع مراعاة خيار الفرز
    let combinedResults = [...productResults, ...inspirationResults];
    
    // تطبيق خيارات الفرز المختلفة
    switch (sortBy) {
      case 'price-asc':
        combinedResults = combinedResults.sort((a, b) => {
          if (a.type === 'product' && b.type === 'product') {
            return (a.price || 0) - (b.price || 0);
          }
          return 0;
        });
        break;
      case 'price-desc':
        combinedResults = combinedResults.sort((a, b) => {
          if (a.type === 'product' && b.type === 'product') {
            return (b.price || 0) - (a.price || 0);
          }
          return 0;
        });
        break;
      case 'discount':
        combinedResults = combinedResults.sort((a, b) => {
          if (a.type === 'product' && b.type === 'product') {
            return (b.discountPercentage || 0) - (a.discountPercentage || 0);
          }
          return 0;
        });
        break;
      case 'newest':
        // نفترض وجود createdAt أو تاريخ إنشاء المنتج
        break;
      case 'relevance':
      default:
        combinedResults = combinedResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
        break;
    }
    
    // تقييد النتائج إلى الحد المطلوب
    combinedResults = combinedResults.slice(0, limit);
    
    // توليد اقتراحات ذات صلة بناءً على مصطلحات البحث والفئات
    const relatedSuggestions = [];
    
    // اقتراحات بناءً على الفئات ذات الصلة
    if (searchTerms.length > 0) {
      popularCategories.forEach(cat => {
        if (cat !== category && searchTerms.some(term => normalizeArabicText(cat).includes(term))) {
          relatedSuggestions.push(`${query} ${cat}`);
        }
      });
    }
    
    // إضافة اقتراحات البحث الشائعة المتعلقة
    popularSearches.forEach(term => {
      if (term !== query && normalizeArabicText(term).includes(normalizedQuery)) {
        relatedSuggestions.push(term);
      }
    });
    
    // إعادة مجموعة متنوعة من الاقتراحات
    const uniqueSuggestions = Array.from(new Set(relatedSuggestions)).slice(0, 5);
    
    return NextResponse.json({
      success: true,
      data: combinedResults,
      total: combinedResults.length,
      query,
      type,
      category,
      suggestions: uniqueSuggestions,
      facets: {
        categories: Array.from(new Set(productResults.map(p => p.category).filter(Boolean))),
        priceRanges: [
          { min: 0, max: 100, label: 'أقل من 100 ج.م' },
          { min: 100, max: 250, label: '100 - 250 ج.م' },
          { min: 250, max: 500, label: '250 - 500 ج.م' },
          { min: 500, max: 1000, label: '500 - 1000 ج.م' },
          { min: 1000, max: 5000, label: 'أكثر من 1000 ج.م' }
        ]
      }
    });
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ أثناء البحث، يرجى المحاولة مرة أخرى',
      },
      { status: 500 }
    );
  }
}
