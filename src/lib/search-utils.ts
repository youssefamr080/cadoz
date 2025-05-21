// Define types for search parameters
export interface SearchParams {
  category: string
  occasions: string[]
  tags: string[]
  subCategory?: string
  priceRange?: {
    min?: number
    max?: number
  }
  ageRange?: {
    $gte?: number
    $lte?: number
  }
}

// Map of Arabic terms to their variations and related terms
export const termExpansions = {
  // المناسبات الدينية
  "رمضان": ["شهر رمضان", "شهر الصيام", "شهر الخير", "شهر البركة"],
  "عيد الفطر": ["العيد الصغير", "عيد الفطر", "عيد المسلمين"],
  "عيد الأضحى": ["العيد الكبير", "عيد الأضحى", "عيد الحج"],
  "المولد النبوي": ["مولد النبي", "مولد الرسول", "مولد محمد"],
  
  // المناسبات الوطنية والاجتماعية
  "شم النسيم": ["شم النسيم", "عيد الربيع", "شم النسمة"],
  "عيد الحب": ["فالنتاين", "فالنتين", "حب", "رومانسية", "حبيبي", "حبيبتي"],
  "عيد الأم": ["يوم الأم", "عيد الأمهات", "ماما", "والدتي"],
  "رأس السنة": ["رأس السنة الميلادية", "السنة الجديدة", "الكريسماس"],
  "عيد الميلاد": ["الكريسماس", "عيد المسيح", "الميلاد"],
  
  // المناسبات العامة
  "عيد ميلاد": ["بورثداي", "يوم ميلاد", "تورتة"],
  "تخرج": ["جامعة", "كلية", "شهادة", "تخرج"],
  "خطوبة": ["خاتم", "خطوبة", "خطيب", "خطيبة"],
  "زفاف": ["عرس", "زفاف", "عرائس", "عروسة", "عريس"],
  

  // الفئات الفرعية للرجال
  "ساعات": ["ساعة", "ساعات رجالية", "ساعة رجالية"],
  "محافظ": ["محفظة", "محافظ رجالية", "محفظة رجالية"],
  "عطور": ["عطر", "عطور رجالية", "عطر رجالي"],
  "شنط يد": ["شنطة", "شنط رجالية", "شنطة رجالية"],
  "نظارات شمسية": ["نظارة", "نظارات رجالية", "نظارة رجالية"],
  "سبراي": ["سبراي رجالي", "سبراي للرجال"],
  
  // الفئات الفرعية للنساء
  "إكسسوارات": ["إكسسوار", "إكسسوارات نسائية", "إكسسوار نسائي"],
  
  // الفئات الفرعية للأطفال
  "العاب اطفال": ["لعبة", "ألعاب", "ألعاب تعليمية", "ألعاب حركية"],
  "دباديب": ["دبدوب", "دب", "دببة", "دب دمية"],
  "ساعات اطفال": ["ساعة أطفال", "ساعات أطفال"],
  
  // الفئات
  "رجل": ["زوج", "أب", "أخ", "صديق", "شاب"],
  "امرأة": ["زوجة", "أم", "أخت", "صديقة", "بنت"],
  "طفل": ["صغير", "بنت", "ولد", "أطفال", "طفلة", "طفل صغير"]
}

// Expand search terms to include variations and related terms
export function expandSearchTerms(searchParams: SearchParams): SearchParams {
  // Expanded search parameters
  const expandedParams: SearchParams = {
    category: searchParams.category,
    occasions: [...searchParams.occasions],
    tags: [...searchParams.tags],
    subCategory: searchParams.subCategory,
    priceRange: searchParams.priceRange,
    ageRange: searchParams.ageRange
  }

  // Expand tags
  if (expandedParams.tags && expandedParams.tags.length > 0) {
    const expandedTags: string[] = [...expandedParams.tags]

    expandedParams.tags.forEach((tag) => {
      Object.entries(termExpansions).forEach(([key, variations]) => {
        if (variations.includes(tag) || tag.includes(key) || key.includes(tag)) {
          expandedTags.push(...variations)
        }
      })
    })

    expandedParams.tags = [...new Set(expandedTags)]
  }

  // Expand occasions
  if (expandedParams.occasions && expandedParams.occasions.length > 0) {
    const expandedOccasions: string[] = [...expandedParams.occasions]

    expandedParams.occasions.forEach((occasion) => {
      Object.entries(termExpansions).forEach(([key, variations]) => {
        if (variations.includes(occasion) || occasion.includes(key) || key.includes(occasion)) {
          expandedOccasions.push(...variations)
        }
      })
    })

    expandedParams.occasions = [...new Set(expandedOccasions)]
  }

  // Map category to English if needed
  if (expandedParams.category) {
    const categoryMap: Record<string, string> = {
      رجل: "men",
      امرأة: "women",
      طفل: "kids",
    }

    if (categoryMap[expandedParams.category]) {
      expandedParams.category = categoryMap[expandedParams.category]
    }

    Object.entries(termExpansions).forEach(([key, variations]) => {
      if (variations.includes(expandedParams.category) && categoryMap[key]) {
        expandedParams.category = categoryMap[key]
      }
    })
  }

  return expandedParams
}

export interface MongoQuery {
  category?: string;
  subCategory?: string;
  occasions?: { $in: string[] };
  tags?: { $in: string[] };
  price?: {
    $gte?: number;
    $lte?: number;
  };
  ageRange?: {
    $gte?: number;
    $lte?: number;
  };
  $or?: Array<{
    likes?: { $gt: number };
    rating?: { $gt: number };
    views?: { $gt: number };
  }>;
  $sort?: { [key: string]: number };
}

export function buildSearchQuery(params: SearchParams, originalMessage: string): MongoQuery {
  const query: MongoQuery = {}

  // Add category if specified
  if (params.category) {
    query.category = params.category
  }

  // Add subcategory if specified
  if (params.subCategory) {
    query.subCategory = params.subCategory
  }

  // Add occasions with expanded terms
  if (params.occasions && params.occasions.length > 0) {
    const expandedOccasions = params.occasions.flatMap(occasion => {
      const variations = termExpansions[occasion] || [occasion]
      const occasionTags = {
        "رمضان": ["هدية رمضان", "هدية صيام"],
        "عيد الفطر": ["هدية عيد", "هدية العيد"],
        "عيد الأضحى": ["هدية عيد", "هدية العيد"],
        "المولد النبوي": ["هدية دينية"],
        "شم النسيم": ["هدية شم النسيم"],
        "عيد الحب": ["هدية رومانسية", "هدية حب"],
        "عيد الأم": ["هدية أم", "هدية ماما"],
        "رأس السنة": ["هدية رأس السنة"],
        "عيد الميلاد": ["هدية كريسماس"],
        "عيد ميلاد": ["هدية بورثداي"],
        "تخرج": ["هدية تخرج"],
        "خطوبة": ["هدية خطوبة"],
        "زفاف": ["هدية زفاف"]
      }
      return [...variations, ...(occasionTags[occasion] || [])]
    })
    query.occasions = { $in: expandedOccasions }
  }

  // Add product category tags
  const productCategories = {
    "هدايا": ["هدية مخصصة", "هدية جاهزة", "هدية فاخرة"],
    "صناديق": ["صندوق هدايا", "صندوق فاخر", "صندوق مخصص"],
    "أكياس": ["كيس هدايا", "كيس أنيق", "كيس مخصص"],
    "شوكولاتة": ["شوكولاتة فاخرة", "شوكولاتة مخصصة"],
    "زهور": ["باقة ورد", "بوكيه", "زهور طبيعية"],
    "عطور": ["عطر فاخر", "عطر مخصص"],
    "إكسسوارات": ["إكسسوار فاخر", "إكسسوار مخصص"]
  }

  // Check for product categories in the message
  Object.entries(productCategories).forEach(([category, tags]) => {
    if (tags.some(tag => originalMessage.includes(tag))) {
      query.tags = { ...query.tags, $in: [...(query.tags?.$in || []), category, ...tags] }
    }
  })

  // Add tags with expanded terms and context
  if (params.tags && params.tags.length > 0) {
    const expandedTags = params.tags.flatMap(tag => 
      termExpansions[tag] || [tag]
    )
    query.tags = { ...query.tags, $in: [...(query.tags?.$in || []), ...expandedTags] }
  }

  // Add price range if specified
  if (params.priceRange) {
    query.price = {}
    if (params.priceRange.min) query.price.$gte = params.priceRange.min
    if (params.priceRange.max) query.price.$lte = params.priceRange.max
  } else {
    // Extract price from message if not specified
    const priceMatch = originalMessage.match(/(\d+)\s*جنيها?|(\d+)\s*جنيه/)
    if (priceMatch) {
      const price = parseInt(priceMatch[1] || priceMatch[2])
      if (price) {
        query.price = { $lte: price * 1.2 } // Allow 20% flexibility
      }
    }
  }

  // Add age-based filtering for kids
  if (params.category === "kids") {
    if (params.ageRange) {
      query.ageRange = params.ageRange
    } else {
      const ageMatch = originalMessage.match(/(\d+)\s*سنة|(\d+)\s*سنين/)
      if (ageMatch) {
        const age = parseInt(ageMatch[1] || ageMatch[2])
        if (age) {
          query.ageRange = {
            $gte: Math.max(0, age - 2),
            $lte: age + 2
          }
        }
      }
    }
  }

  // Add gender-specific preferences
  if (params.category === "women") {
    query.tags = { ...query.tags, $in: [...(query.tags?.$in || []), "هدية نسائية"] }
  } else if (params.category === "men") {
    query.tags = { ...query.tags, $in: [...(query.tags?.$in || []), "هدية رجالية"] }
  }

  return query
}

// Get fallback gifts when no results are found
export function buildFallbackQueries(originalMessage: string): MongoQuery[] {
  const fallbackQueries: MongoQuery[] = []

  // Check for all possible occasions
  Object.entries(termExpansions).forEach(([occasion, terms]) => {
    if (terms.some(term => originalMessage.includes(term))) {
      fallbackQueries.push({
        occasions: { $in: [occasion, ...terms] }
      })
    }
  })

  // Check for gender-specific terms
  const genderTerms = {
    "women": termExpansions["امرأة"],
    "men": termExpansions["رجل"],
    "kids": termExpansions["طفل"]
  }

  Object.entries(genderTerms).forEach(([gender, terms]) => {
    if (terms.some(term => originalMessage.includes(term))) {
      fallbackQueries.push({
        category: gender
      })
    }
  })

  // Add price-based fallback if price is mentioned
  const priceMatch = originalMessage.match(/(\d+)\s*جنيها?|(\d+)\s*جنيه/)
  if (priceMatch) {
    const price = parseInt(priceMatch[1] || priceMatch[2])
    if (price) {
      fallbackQueries.push({
        price: { $lte: price * 1.5 } // More flexible price range for fallback
      })
    }
  }

  // Add popularity-based fallback
  fallbackQueries.push({
    $or: [
      { likes: { $gt: 0 } },
      { rating: { $gt: 0 } },
      { views: { $gt: 0 } }
    ]
  })

  // Add sorting as a separate operation
  fallbackQueries.push({
    $sort: { likes: -1, rating: -1, views: -1 }
  })

  return fallbackQueries
}
