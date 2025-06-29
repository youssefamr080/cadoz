/**
 * ملف تحسينات البحث المتقدمة
 * يحتوي على نظام ذكي للبحث بالمرادفات والبحث الضبابي
 */

// Interface للمنتج
interface Product {
  name?: string;
  description?: string;
  category?: string;
  subCategory?: string;
  brand?: string;
  tags?: string[];
  trending?: boolean;
  best_seller?: boolean;
  new_arrival?: boolean;
  rating?: number;
  [key: string]: unknown;
}

// قاموس المرادفات العربية مع دعم اللهجة المصرية
export const synonymsMap: Record<string, string[]> = {
  // ساعات - مع اللهجة المصرية
  'ساعة': ['ساعات', 'ساعه', 'ووتش', 'watch', 'timepiece'],
  'ساعات': ['ساعة', 'ساعه', 'ووتش', 'watch', 'timepiece'],
  'ساعه': ['ساعة', 'ساعات', 'ووتش', 'watch', 'timepiece'], // اللهجة المصرية
  'ووتش': ['ساعة', 'ساعات', 'ساعه', 'watch', 'timepiece'],
  'watch': ['ساعة', 'ساعات', 'ساعه', 'ووتش', 'timepiece'],
  
  // العلامات التجارية
  'روليكس': ['rolex', 'رولكس'],
  'rolex': ['روليكس', 'رولكس'],
  'كاسيو': ['casio', 'كاسيو'],
  'casio': ['كاسيو', 'كاسيو'],
  'أبل': ['apple', 'ابل'],
  'apple': ['أبل', 'ابل'],
  'سامسونج': ['samsung', 'سامسونغ'],
  'samsung': ['سامسونج', 'سامسونغ'],
  
  // محافظ - مع اللهجة المصرية
  'محفظة': ['محافظ', 'محفظه', 'wallet', 'والت', 'حافظة نقود', 'حافظة فلوس'],
  'محافظ': ['محفظة', 'محفظه', 'wallet', 'والت', 'حافظة نقود', 'حافظة فلوس'],
  'محفظه': ['محفظة', 'محافظ', 'wallet', 'والت', 'حافظة نقود', 'حافظة فلوس'], // اللهجة المصرية
  'wallet': ['محفظة', 'محافظ', 'محفظه', 'والت', 'حافظة نقود', 'حافظة فلوس'],
  'والت': ['محفظة', 'محافظ', 'محفظه', 'wallet', 'حافظة نقود', 'حافظة فلوس'],
  'حافظة': ['محفظة', 'محافظ', 'محفظه', 'wallet', 'والت'],
  'فلوس': ['نقود', 'مال', 'money', 'cash'], // اللهجة المصرية
  
  // نظارات - مع اللهجة المصرية
  'نظارة': ['نظارات', 'نضاره', 'نضارات', 'glasses', 'sunglasses', 'نظارة شمسية'],
  'نظارات': ['نظارة', 'نضاره', 'نضارات', 'glasses', 'sunglasses', 'نظارة شمسية'],
  'نضاره': ['نظارة', 'نظارات', 'نضارات', 'glasses', 'sunglasses'], // اللهجة المصرية
  'نضارات': ['نظارة', 'نظارات', 'نضاره', 'glasses', 'sunglasses'], // اللهجة المصرية
  'glasses': ['نظارة', 'نظارات', 'نضاره', 'نضارات', 'sunglasses', 'نظارة شمسية'],
  'sunglasses': ['نظارة', 'نظارات', 'نضاره', 'نضارات', 'glasses', 'نظارة شمسية'],
  
  // عطور - مع اللهجة المصرية
  'عطر': ['عطور', 'عطورات', 'عضر', 'عضور', 'perfume', 'fragrance', 'ريحه حلوه'],
  'عطور': ['عطر', 'عطورات', 'عضر', 'عضور', 'perfume', 'fragrance', 'ريحه حلوه'],
  'عضر': ['عطر', 'عطور', 'عطورات', 'عضور', 'perfume', 'fragrance'], // اللهجة المصرية
  'عضور': ['عطر', 'عطور', 'عطورات', 'عضر', 'perfume', 'fragrance'], // اللهجة المصرية
  'perfume': ['عطر', 'عطور', 'عطورات', 'عضر', 'عضور', 'fragrance', 'ريحه حلوه'],
  'fragrance': ['عطر', 'عطور', 'عطورات', 'عضر', 'عضور', 'perfume', 'ريحه حلوه'],
  'ريحه': ['عطر', 'عطور', 'perfume', 'fragrance'], // اللهجة المصرية
  
  // هدايا - مع اللهجة المصرية
  'هدية': ['هدايا', 'هديه', 'هدايه', 'gift', 'هداية', 'تحفة', 'حاجه حلوه'],
  'هدايا': ['هدية', 'هديه', 'هدايه', 'gift', 'هداية', 'تحفة', 'حاجه حلوه'],
  'هديه': ['هدية', 'هدايا', 'هدايه', 'gift', 'هداية', 'تحفة'], // اللهجة المصرية
  'هدايه': ['هدية', 'هدايا', 'هديه', 'gift', 'هداية', 'تحفة'], // اللهجة المصرية
  'gift': ['هدية', 'هدايا', 'هديه', 'هدايه', 'هداية', 'تحفة', 'حاجه حلوه'],
  'حاجه': ['شيء', 'منتج', 'حاجة', 'something', 'item'], // اللهجة المصرية
  
  // الجنس
  'رجالي': ['رجال', 'men', 'male', 'للرجال'],
  'رجال': ['رجالي', 'men', 'male', 'للرجال'],
  'men': ['رجالي', 'رجال', 'male', 'للرجال'],
  'نسائي': ['نساء', 'women', 'female', 'للنساء'],
  'نساء': ['نسائي', 'women', 'female', 'للنساء'],
  'women': ['نسائي', 'نساء', 'female', 'للنساء'],
  'اطفال': ['أطفال', 'kids', 'children', 'طفل'],
  'أطفال': ['اطفال', 'kids', 'children', 'طفل'],
  'kids': ['اطفال', 'أطفال', 'children', 'طفل'],
  
  // ألوان
  'أسود': ['اسود', 'black', 'أسود'],
  'اسود': ['أسود', 'black', 'أسود'],
  'black': ['أسود', 'اسود', 'أسود'],
  'أبيض': ['ابيض', 'white', 'أبيض'],
  'ابيض': ['أبيض', 'white', 'أبيض'],
  'white': ['أبيض', 'ابيض', 'أبيض'],
  'أحمر': ['احمر', 'red', 'أحمر'],
  'احمر': ['أحمر', 'red', 'أحمر'],
  'red': ['أحمر', 'احمر', 'أحمر'],
  'أزرق': ['ازرق', 'blue', 'أزرق'],
  'ازرق': ['أزرق', 'blue', 'أزرق'],
  'blue': ['أزرق', 'ازرق', 'أزرق'],
  
  // صفات ومصطلحات مصرية
  'جديد': ['new', 'حديث', 'جديدة'],
  'new': ['جديد', 'حديث', 'جديدة'],
  'مميز': ['special', 'خاص', 'مميزة'],
  'special': ['مميز', 'خاص', 'مميزة'],
  'رخيص': ['cheap', 'سعر قليل', 'رخيصة', 'مش غالي'],
  'cheap': ['رخيص', 'سعر قليل', 'رخيصة', 'مش غالي'],
  'غالي': ['expensive', 'سعر عالي', 'غالية', 'مكلف'],
  'expensive': ['غالي', 'سعر عالي', 'غالية', 'مكلف'],
  
  // مصطلحات مصرية إضافية
  'حلو': ['جميل', 'nice', 'beautiful', 'حلوة'],
  'حلوة': ['جميلة', 'nice', 'beautiful', 'حلو'],
  'كويس': ['جيد', 'good', 'ممتاز', 'كويسة'],
  'كويسة': ['جيدة', 'good', 'ممتازة', 'كويس'],
  'حاجة': ['شيء', 'something', 'منتج', 'item'],
  'حاجات': ['أشياء', 'things', 'منتجات', 'items'],
  'ريحة': ['رائحة', 'smell', 'عطر', 'عبير'],
  'شيك': ['أنيق', 'elegant', 'stylish', 'مودرن'],
  'مودرن': ['حديث', 'modern', 'عصري', 'شيك'],
  'اصلي': ['أصلي', 'original', 'authentic'],
  'تقليد': ['مقلد', 'fake', 'copy'],
  'ماركة': ['علامة تجارية', 'brand', 'براند'],
  'براند': ['علامة تجارية', 'brand', 'ماركة']
};

// قاموس تصحيح الأخطاء الإملائية الشائعة مع دعم اللهجة المصرية
export const spellingCorrections: Record<string, string> = {
  // أخطاء شائعة في العربية
  'سااعة': 'ساعة',
  'سأعة': 'ساعة',
  'سأعات': 'ساعات',
  'ساعه': 'ساعة', // اللهجة المصرية (صحيحة)
  'ساعات': 'ساعات', // اللهجة المصرية (صحيحة)
  
  'محفضة': 'محفظة',
  'محفضه': 'محفظة',
  'محفظه': 'محفظة', // اللهجة المصرية (صحيحة)
  'محافض': 'محافظ',
  'محافضه': 'محافظ',
  
  'نضارة': 'نظارة',
  'نضارات': 'نظارات',
  'نضاره': 'نظارة', // اللهجة المصرية (صحيحة)
  'نظاره': 'نظارة',
  
  'عضر': 'عطر', // اللهجة المصرية (صحيحة)
  'عضور': 'عطور', // اللهجة المصرية (صحيحة)
  'عطرر': 'عطر',
  'عطوور': 'عطور',
  
  'هديه': 'هدية', // اللهجة المصرية (صحيحة)
  'هدايه': 'هدايا', // اللهجة المصرية (صحيحة)
  'هداية': 'هدية',
  'هداايا': 'هدايا',
  
  // مصطلحات مصرية شائعة
  'حاجه': 'حاجة', // صحيحة لكن نوحدها
  'حاجة': 'حاجة',
  'حاجات': 'حاجات',
  'ريحه': 'ريحة', // صحيحة لكن نوحدها
  'ريحة': 'ريحة',
  'فلوس': 'فلوس', // صحيحة
  'حلوه': 'حلوة', // صحيحة لكن نوحدها
  'حلوة': 'حلوة',
  
  // أخطاء شائعة في الإنجليزية
  'wach': 'watch',
  'watche': 'watch',
  'walet': 'wallet',
  'wallets': 'wallet',
  'glases': 'glasses',
  'perfum': 'perfume',
  'perfums': 'perfume',
  'rolex': 'rolex',
  'rollex': 'rolex',
  'casio': 'casio',
  'cassio': 'casio'
};

/**
 * تنظيف النص وإزالة التشكيل
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // إزالة التشكيل العربي
    .replace(/[\u064B-\u0652]/g, '')
    // توحيد الهمزات
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ؤ]/g, 'و')
    .replace(/[ئ]/g, 'ي')
    .replace(/[ة]/g, 'ه')
    // إزالة علامات الترقيم
    .replace(/[.,;:!?()[\]{}'"]/g, ' ')
    // توحيد المسافات
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * تطبيق تصحيح الأخطاء الإملائية
 */
export function correctSpelling(word: string): string {
  const normalizedWord = normalizeText(word);
  return spellingCorrections[normalizedWord] || word;
}

/**
 * الحصول على المرادفات لكلمة معينة
 */
export function getSynonyms(word: string): string[] {
  const normalizedWord = normalizeText(word);
  const correctedWord = correctSpelling(normalizedWord);
  const synonyms = synonymsMap[correctedWord] || [];
  
  // إضافة الكلمة الأصلية والمصححة
  const allSynonyms = [word, correctedWord, ...synonyms];
  
  // إزالة التكرارات
  return [...new Set(allSynonyms)];
}

/**
 * تقسيم النص إلى كلمات مع تنظيف
 */
export function tokenizeQuery(query: string): string[] {
  return normalizeText(query)
    .split(/\s+/)
    .filter(word => word.length > 0)
    .map(word => correctSpelling(word));
}

/**
 * بناء شروط البحث المحسنة مع المرادفات
 */
export function buildEnhancedSearchConditions(query: string): Record<string, unknown>[] {
  const conditions: Record<string, unknown>[] = [];
  const words = tokenizeQuery(query);
  const normalizedQuery = normalizeText(query);
  const correctedQuery = correctSpelling(normalizedQuery);
  
  // البحث بالنص الكامل (الأصلي والمصحح)
  const fullTextQueries = [query, correctedQuery, normalizedQuery];
  
  for (const searchQuery of fullTextQueries) {
    conditions.push(
      { name: { contains: searchQuery, mode: 'insensitive' } },
      { description: { contains: searchQuery, mode: 'insensitive' } },
      { category: { contains: searchQuery, mode: 'insensitive' } },
      { subCategory: { contains: searchQuery, mode: 'insensitive' } },
      { brand: { contains: searchQuery, mode: 'insensitive' } }
    );
  }
  
  // البحث بالكلمات المنفصلة مع المرادفات
  for (const word of words) {
    const synonyms = getSynonyms(word);
    
    for (const synonym of synonyms) {
      conditions.push(
        { name: { contains: synonym, mode: 'insensitive' } },
        { description: { contains: synonym, mode: 'insensitive' } },
        { category: { contains: synonym, mode: 'insensitive' } },
        { subCategory: { contains: synonym, mode: 'insensitive' } },
        { brand: { contains: synonym, mode: 'insensitive' } }
      );
      
      // البحث في العلامات
      if (synonym.length > 1) {
        conditions.push({ tags: { hasSome: [synonym] } });
      }
    }
  }
  
  return conditions;
}

/**
 * حساب درجة الصلة المحسنة
 */
export function calculateRelevanceScore(product: Product, query: string): number {
  const normalizedQuery = normalizeText(query);
  const words = tokenizeQuery(query);
  let score = 0;
  
  const productName = normalizeText(product.name || '');
  const productDesc = normalizeText(product.description || '');
  const productCategory = normalizeText(product.category || '');
  const productSubCategory = normalizeText(product.subCategory || '');
  const productBrand = normalizeText(product.brand || '');
  const productTags = (product.tags || []).map((tag: string) => normalizeText(tag));
  
  // تطابق الاسم (أعلى أولوية)
  if (productName.includes(normalizedQuery)) {
    score += 1000;
  }
  
  // تطابق جزئي في الاسم
  for (const word of words) {
    const synonyms = getSynonyms(word);
    for (const synonym of synonyms) {
      if (productName.includes(normalizeText(synonym))) {
        score += 500;
      }
    }
  }
  
  // تطابق العلامة التجارية
  if (productBrand.includes(normalizedQuery)) {
    score += 800;
  }
  
  for (const word of words) {
    const synonyms = getSynonyms(word);
    for (const synonym of synonyms) {
      if (productBrand.includes(normalizeText(synonym))) {
        score += 400;
      }
    }
  }
  
  // تطابق الفئة الفرعية
  if (productSubCategory.includes(normalizedQuery)) {
    score += 600;
  }
  
  for (const word of words) {
    const synonyms = getSynonyms(word);
    for (const synonym of synonyms) {
      if (productSubCategory.includes(normalizeText(synonym))) {
        score += 300;
      }
    }
  }
  
  // تطابق الفئة الرئيسية
  if (productCategory.includes(normalizedQuery)) {
    score += 400;
  }
  
  for (const word of words) {
    const synonyms = getSynonyms(word);
    for (const synonym of synonyms) {
      if (productCategory.includes(normalizeText(synonym))) {
        score += 200;
      }
    }
  }
  
  // تطابق الوصف
  if (productDesc.includes(normalizedQuery)) {
    score += 200;
  }
  
  for (const word of words) {
    const synonyms = getSynonyms(word);
    for (const synonym of synonyms) {
      if (productDesc.includes(normalizeText(synonym))) {
        score += 100;
      }
    }
  }
  
  // تطابق العلامات
  for (const tag of productTags) {
    if (tag.includes(normalizedQuery)) {
      score += 300;
    }
    
    for (const word of words) {
      const synonyms = getSynonyms(word);
      for (const synonym of synonyms) {
        if (tag.includes(normalizeText(synonym))) {
          score += 150;
        }
      }
    }
  }
  
  // مكافأة للمنتجات الشائعة
  if (product.trending) score += 50;
  if (product.best_seller) score += 50;
  if (product.new_arrival) score += 25;
  if (product.rating && product.rating > 4) score += 25;
  
  return score;
}

/**
 * اقتراحات تلقائية ذكية مع دعم اللهجة المصرية
 */
export function generateSmartSuggestions(query: string): string[] {
  const suggestions: string[] = [];
  const normalizedQuery = normalizeText(query);
  const words = tokenizeQuery(query);
  
  // اقتراحات أساسية مع اللهجة المصرية
  const baseSuggestions = [
    // ساعات
    'ساعة روليكس',
    'ساعة كاسيو', 
    'ساعة أبل',
    'ساعه حلوه', // لهجة مصرية
    'ساعه رجالي', // لهجة مصرية
    'ساعه نسائي', // لهجة مصرية
    'ساعة ذكية',
    'ساعة رياضية',
    
    // محافظ
    'محفظة رجالي',
    'محفظة نسائي',
    'محفظه جلد', // لهجة مصرية
    'محفظه حلوه', // لهجة مصرية
    'محفظة روليكس',
    'محفظة كوتش',
    
    // نظارات
    'نظارة شمسية',
    'نظارة طبية',
    'نضاره شيك', // لهجة مصرية
    'نضاره حلوه', // لهجة مصرية
    'نظارة رايبان',
    'نظارة ماركة',
    
    // عطور
    'عطر رجالي',
    'عطر نسائي',
    'عضر حلو', // لهجة مصرية
    'ريحه حلوه', // لهجة مصرية
    'عطر شانيل',
    'عطر ديور',
    
    // هدايا
    'هدايا أطفال',
    'هديه حلوه', // لهجة مصرية
    'حاجه حلوه للهدية', // لهجة مصرية
    'هدية رومانسية',
    'هدية عيد ميلاد',
    
    // مصطلحات مصرية عامة
    'حاجه حلوه',
    'ماركة كويسه',
    'حاجه شيك',
    'حاجه مودرن',
    'براند اصلي'
  ];
  
  // إضافة الاقتراحات المطابقة مباشرة
  for (const suggestion of baseSuggestions) {
    const normalizedSuggestion = normalizeText(suggestion);
    if (normalizedSuggestion.includes(normalizedQuery) || 
        normalizedQuery.length > 1 && normalizedSuggestion.startsWith(normalizedQuery)) {
      suggestions.push(suggestion);
    }
  }
  
  // اقتراحات بناءً على المرادفات مع تصحيح الأخطاء
  for (const word of words) {
    const correctedWord = correctSpelling(word);
    const synonyms = getSynonyms(correctedWord);
    
    for (const synonym of synonyms) {
      for (const suggestion of baseSuggestions) {
        if (normalizeText(suggestion).includes(normalizeText(synonym))) {
          suggestions.push(suggestion);
        }
      }
    }
  }
  
  // اقتراحات مركبة ذكية باللهجة المصرية
  if (words.length > 0) {
    const firstWord = correctSpelling(words[0]);
    const synonyms = getSynonyms(firstWord);
    
    // إنشاء اقتراحات مركبة
    const combinations = [
      'حلو', 'حلوه', 'شيك', 'كويس', 'مودرن', 'اصلي', 'ماركة'
    ];
    
    for (const synonym of synonyms) {
      for (const combo of combinations) {
        suggestions.push(`${synonym} ${combo}`);
      }
    }
  }
  
  // إزالة التكرارات وإرجاع أفضل 8 اقتراحات
  return [...new Set(suggestions)].slice(0, 8);
}
