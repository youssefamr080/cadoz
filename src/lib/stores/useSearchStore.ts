import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Fuse, { IFuseOptions } from 'fuse.js';
import type { Product } from '@/types/product';
import type { Inspiration } from '@/types/inspiration';
import { 
  normalizeArabicText, 
  generateAlternativeSpellings, 
  calculateSimilarity,
  correctSpelling
} from '@/lib/utils/arabic-text-utils';

// Define the search result types
export type SearchResultType = 'product' | 'inspiration';
export type FilterType = SearchResultType | 'all';

// Define types for Fuse.js to avoid TypeScript errors
interface FuseResultMatch {
  indices: readonly [number, number][];
  key: string;
  value: string;
}

// Extended Fuse.js options
interface ExtendedFuseOptions {
  keys: string[] | { name: string; weight: number }[];
  threshold?: number;
  distance?: number;
  includeScore?: boolean;
  includeMatches?: boolean;
  minMatchCharLength?: number;
  shouldSort?: boolean;
  findAllMatches?: boolean;
  useExtendedSearch?: boolean;
  ignoreLocation?: boolean;
  isCaseSensitive?: boolean;
  // Extended options not in the standard type
  tokenize?: boolean;
  matchAllTokens?: boolean;
  fieldNormWeight?: number;
}

export interface SearchResult {
  id: string | number;
  name: string;
  description: string;
  image: string;
  price?: number;
  oldPrice?: number;
  discountPercentage?: number;
  category?: string;
  type: SearchResultType;
  relevanceScore: number;
  tags?: string[];
  occasions?: string[];
  inStock?: boolean;
  trending?: boolean;
  exactMatch?: boolean;
  url: string;
  matches?: readonly FuseResultMatch[];
}

interface SearchState {
  // Search query and results
  query: string;
  suggestions: string[];
  recentSearches: string[];
  searchResults: SearchResult[];
  isLoading: boolean;
  error: string | null;
  
  // Filters
  activeFilter: FilterType;
  
  // Search settings
  maxResults: number;
  minQueryLength: number;
  enableSpellCorrection: boolean;
  enableAutocomplete: boolean;
  enableKeywordHighlighting: boolean;
  enableFuzzySearch: boolean;
  
  // Products and inspirations cache
  productsCache: Product[];
  inspirationsCache: Inspiration[];
  
  // Common words and categories in Arabic for suggestions and corrections
  commonWords: string[];
  popularCategories: string[];
  popularOccasions: string[];
  
  // Actions
  setQuery: (query: string) => void;
  search: (query: string, options?: { category?: string; priceRange?: string; sortBy?: string }) => Promise<void>;
  clearSearch: () => void;
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
  setActiveFilter: (filter: FilterType) => void;
  toggleSpellCorrection: () => void;
  toggleAutocomplete: () => void;
  toggleFuzzySearch: () => void;
  toggleKeywordHighlighting: () => void;
  updateProductsCache: (products: Product[]) => void;
  updateInspirationsCache: (inspirations: Inspiration[]) => void;
  generateSuggestions: (input: string) => void;
}

// Create a Fuse.js instance for fuzzy searching
const createFuseInstance = <T>(items: T[], keys: string[] | { name: string; weight: number }[]) => {
  const options: ExtendedFuseOptions = {
    keys,
    threshold: 0.3,        // Lower threshold for stricter matching but still fuzzy (0.3 instead of 0.4)
    distance: 150,         // Increased distance for better Arabic text matching
    includeScore: true,    // Include score in results
    includeMatches: true,  // Include matched indices for highlighting
    minMatchCharLength: 2, // Minimum characters that must match
    shouldSort: true,      // Sort results by score
    findAllMatches: true,  // Find all matches, not just the best one
    useExtendedSearch: true, // Enable extended search
    ignoreLocation: true,  // Ignore location bias (critical for Arabic)
    isCaseSensitive: false, // Case insensitive matching
    tokenize: true,        // Tokenize the search string and search separately
    matchAllTokens: false, // Only match documents with all tokens (not requiring all)
    fieldNormWeight: 2.0   // Increase field-length norm effect
  };
  
  return new Fuse(items, options as IFuseOptions<T>);
};

// قائمة موسعة من الكلمات المصرية الشائعة
const commonEgyptianWords = [
  // كلمات هدايا ومناسبات باللهجة المصرية
  'هدية', 'هدايا', 'هدية حلوة', 'هدية جامدة', 'هدية جامدة', 'هدية شخصية',
  'مناسبة', 'عيد', 'عيد ميلاد', 'جواز', 'خطوبة', 'تخرج', 'نجاح', 'ترقية', 'مولود جديد',
  'مولود', 'مولودة', 'حفلة', 'ذكرى', 'ذكرى سنوية', 'مفاجأة', 'تهنئة', 'شكر', 'عذر', 'مصالحة',
  'عيد الأم', 'عيد الأب', 'الفالنتاين', 'رأس السنة', 'يوم المدرس', 'معاش',
  
  // فئات المنتجات باللهجة المصرية
  'لبس', 'ملابس', 'فستان', 'قميص', 'بلوزة', 'بنطلون', 'جاكيت', 'معطف', 'حذاء',
  'اكسسوارات', 'مجوهرات', 'ساعة', 'شنطة', 'شنتة', 'نظارة', 'قلم فاخر', 'محفظة',
  'عطر', 'عطر رجالي', 'عطر بناتي', 'ميكب', 'ماكياج', 'تجميل', 'كريمات', 'مستحضرات',
  'بيت', 'ديكور', 'أثاث', 'لمبات', 'سجادة', 'مخدة', 'شرشف', 'مفرش',
  'مطبخ', 'أواني', 'أدوات طبخ', 'أجهزة مطبخ', 'طقم تقديم', 'كوباية', 'طبق', 'صحن',
  'إلكترونيات', 'موبايل', 'موبيل', 'لابتوب', 'كمبيوتر', 'سماعات', 'كاميرا', 'تلفزيون',
  'ألعاب', 'ألعاب عيال', 'ألعاب فيديو', 'بلايستيشن', 'إكس بوكس', 'نينتندو', 'ألعاب بوردة',
  'كتب', 'روايات', 'كتب تنمية', 'قرطاسية', 'أدوات مكتب', 'دفتر', 'قلم', 'مفكرة',
  'رياضة', 'ملابس رياضة', 'أدوات رياضة', 'صحة', 'لياقة', 'تمارين', 'معدات رياضة',
  
  // كلمات وصفية مصرية
  'حلو', 'جميل', 'فخم', 'فاخر', 'أصلي', 'تقليد', 'ماركة', 'براند',
  'رخيص', 'غالي', 'سعر مناسب', 'سعر معقول', 'سعر حلو',
  'جديد', 'قديم', 'مستعمل', 'نضيف', 'نظيف', 'مضمون',
  'حجم كبير', 'حجم وسط', 'حجم صغير', 'مقاس كبير', 'مقاس وسط', 'مقاس صغير',
  
  // أخطاء إملائية شائعة في اللهجة المصرية
  'تيشرت', 'تي شيرت', 'تيشيرت', 'قميص', 'بلوزة', 'بلوزه',
  'بنطلون', 'بنطال', 'جينز', 'جينس', 'سروال', 'بنطلونات',
  'لابتوب', 'لاب توب', 'كمبيوتر', 'كومبيوتر', 'حاسوب', 'بي سي',
  'موبايل', 'محمول', 'فون', 'جوال', 'تليفون', 'سمارت فون',
  'أكسسوارات', 'اكسسوارات', 'إكسسوارات', 'اكسسوار', 'إكسسوار',
  'تابلت', 'لوحي', 'آيباد', 'ايباد', 'تاب', 'لوح إلكتروني',
  'شوكولاتة', 'شوكولاته', 'شكولاته', 'شكولاتة', 'شيكولاتة', 'تشوكلت'
];

// تحديث الفئات الشائعة لتشمل اللهجة المصرية
const popularCategories = [
  'لبس', 'ملابس', 'اكسسوارات', 'مجوهرات', 'عطور', 'ميكب',
  'إلكترونيات', 'بيت', 'ديكور', 'مطبخ', 'عيال', 'ألعاب',
  'كتب', 'رياضة', 'صحة', 'هدايا حلوة', 'طقم هدايا', 'هدية شخصية'
];

// تحديث المناسبات لتشمل اللهجة المصرية
const popularOccasions = [
  'عيد ميلاد', 'خطوبة', 'جواز', 'تخرج', 'مولود جديد',
  'ذكرى سنوية', 'عيد الأم', 'عيد الأب', 'الفالنتاين', 'رأس السنة',
  'نجاح', 'ترقية', 'شكر', 'عذر', 'مفاجأة'
];

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      // الحالة الأولية للمخزن
      query: '',
      suggestions: [],
      recentSearches: [],
      searchResults: [],
      isLoading: false,
      error: null,
      activeFilter: 'all',
      maxResults: 20,
      minQueryLength: 2,
      enableSpellCorrection: true,
      enableAutocomplete: true,
      enableKeywordHighlighting: true,
      enableFuzzySearch: true,
      productsCache: [],
      inspirationsCache: [],
      commonWords: commonEgyptianWords,
      popularCategories: popularCategories,
      popularOccasions: popularOccasions,
      
      // Set search query
      setQuery: (query: string) => {
        set({ query });
        
        if (query && query.length >= get().minQueryLength) {
          // تصحيح الأخطاء الإملائية إذا تم تفعيل الخاصية
          if (get().enableSpellCorrection && query.length > 3) {
            const corrected = correctSpelling(query, get().commonWords);
            if (corrected !== query) {
              // إذا تم تصحيح النص، نحتفظ بالتصحيح لعرضه كاقتراح
              set(state => ({
                suggestions: [corrected, ...state.suggestions.filter(s => s !== corrected).slice(0, 4)]
              }));
            }
          }
          
          // توليد اقتراحات ذكية
          get().generateSuggestions(query);
        } else {
          set({ suggestions: [] });
        }
      },
      
      // Generate autocomplete suggestions based on input
      generateSuggestions: (input: string) => {
        if (!input || input.length < 2) {
          set({ suggestions: [] });
          return;
        }
        
        const { productsCache, inspirationsCache, commonWords, enableAutocomplete } = get();
        
        if (!enableAutocomplete) {
          set({ suggestions: [] });
          return;
        }
        
        // Normalize input
        const normalizedInput = normalizeArabicText(input);
        
        // Get all product and inspiration names and descriptions
        const productTerms = productsCache.map(p => p.name);
        const inspirationTerms = inspirationsCache.map(i => i.name);
        const categoryTerms = [...new Set(productsCache.map(p => p.category || ''))];
        const tagTerms = [
          ...new Set(
            [...productsCache, ...inspirationsCache].flatMap(item => item.tags || [])
          )
        ];
        
        // Combine all terms
        const allTerms = [
          ...productTerms,
          ...inspirationTerms,
          ...categoryTerms,
          ...tagTerms,
          ...commonWords
        ].filter(Boolean); // Remove empty strings
        
        // Find terms that start with or contain the input
        const relevantItems = allTerms.filter(term => {
          const normalizedTerm = normalizeArabicText(term);
          // Try direct inclusion match
          return normalizedTerm.includes(normalizedInput) || 
            // Or similarity match if fuzzy search is enabled
            (get().enableFuzzySearch && calculateSimilarity(normalizedTerm, normalizedInput) > 0.7);
        });
        
        // Find terms that are similar but not exact matches (for spell correction)
        const similarTerms = allTerms.filter(term => {
          const normalizedTerm = normalizeArabicText(term);
          if (normalizedTerm.includes(normalizedInput)) return false; // Already included above
          
          // Check if the term is similar using Levenshtein distance
          // For Arabic, we need a higher threshold due to character complexity
          const distance = calculateSimilarity(normalizedTerm, normalizedInput);
          const maxAllowedDistance = Math.max(2, Math.floor(normalizedInput.length / 3));
          return distance <= maxAllowedDistance;
        });
        
        // Sort by relevance (exact match first, then starts with, then contains, then similar)
        const sortedSuggestions = [...relevantItems, ...similarTerms].sort((a, b) => {
          const aNorm = normalizeArabicText(a);
          const bNorm = normalizeArabicText(b);
          
          // Exact match gets highest priority
          if (aNorm === normalizedInput) return -1;
          if (bNorm === normalizedInput) return 1;
          
          // Then terms that start with the input
          const aStartsWith = aNorm.startsWith(normalizedInput);
          const bStartsWith = bNorm.startsWith(normalizedInput);
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          
          // Then check Levenshtein distance for similarity
          const aDistance = calculateSimilarity(aNorm, normalizedInput);
          const bDistance = calculateSimilarity(bNorm, normalizedInput);
          if (aDistance !== bDistance) return aDistance - bDistance;
          
          // Then sort by length (shorter terms first)
          return a.length - b.length;
        });
        
        // Take top 8 unique suggestions (increased from 5 to provide more options)
        const uniqueSuggestions = [...new Set(sortedSuggestions)].slice(0, 8);
        
        set({ suggestions: uniqueSuggestions });
      },  
      
      // Perform search across products and inspirations with filtering options
      search: async (query: string, options?: { category?: string; priceRange?: string; sortBy?: string }) => {
        if (!query || query.length < get().minQueryLength) {
          set({ searchResults: [], isLoading: false });
          return;
        }
        
        try {
          set({ isLoading: true, error: null });
          
          const category = options?.category || '';
          const priceRange = options?.priceRange || '';
          const sortBy = options?.sortBy || 'relevance';
          
          const { productsCache, inspirationsCache } = get();
          
          // تطبيع الاستعلام مع مراعاة اللهجة المصرية
          const normalizedQuery = normalizeArabicText(query);
          const queryTerms = normalizedQuery.split(/\s+/).filter(term => term.length > 1);
          
          // توليد بدائل للكلمات المصرية
          const expandedTerms = queryTerms.flatMap(term => {
            const alternatives = generateAlternativeSpellings(term);
            return [term, ...alternatives];
          });
          
          // استخدام مجموعة فريدة من المصطلحات
          const uniqueTerms = Array.from(new Set(expandedTerms));
          
          // تحسين إعدادات البحث للمنتجات
          const productFuse = createFuseInstance(
            productsCache,
            [
              { name: 'name', weight: 3 },
              { name: 'description', weight: 2 },
              { name: 'category', weight: 2 },
              { name: 'tags', weight: 2 },
              { name: 'occasion', weight: 1.5 }
            ]
          );
          
          // تحسين إعدادات البحث للإلهامات
          const inspirationFuse = createFuseInstance(
            inspirationsCache,
            [
              { name: 'name', weight: 3 },
              { name: 'description', weight: 2 },
              { name: 'tags', weight: 2 },
              { name: 'occasions', weight: 2 }
            ]
          );
          
          // البحث في المنتجات
          let productResults = productFuse.search(query);
          
          // إذا لم توجد نتائج، جرب البحث بالكلمات المصرية
          if (productResults.length === 0) {
            for (const term of uniqueTerms) {
              const results = productFuse.search(term);
              if (results.length > 0) {
                productResults = results;
                break;
              }
            }
          }
          
          // البحث في الإلهامات
          let inspirationResults = inspirationFuse.search(query);
          
          // إذا لم توجد نتائج، جرب البحث بالكلمات المصرية
          if (inspirationResults.length === 0) {
            for (const term of uniqueTerms) {
              const results = inspirationFuse.search(term);
              if (results.length > 0) {
                inspirationResults = results;
                break;
              }
            }
          }
          
          // تحويل النتائج إلى الصيغة المطلوبة
          const productSearchResults: SearchResult[] = productResults.map(result => ({
            id: result.item.id,
            name: result.item.name,
            description: result.item.description,
            image: result.item.image,
            price: result.item.price,
            oldPrice: result.item.old_price,
            discountPercentage: result.item.old_price 
              ? Math.round((1 - (result.item.price / result.item.old_price)) * 100)
              : undefined,
            category: result.item.category,
            type: 'product',
            relevanceScore: result.score ? 1 - result.score : 0.5,
            tags: result.item.tags,
            occasions: result.item.occasion,
            inStock: result.item.inStock !== false,
            trending: Boolean(result.item.trending || result.item.is_trending),
            exactMatch: normalizeArabicText(result.item.name).includes(normalizedQuery),
            url: `/product/${result.item.id}`,
            matches: result.matches as readonly FuseResultMatch[]
          }));
          
          const inspirationSearchResults: SearchResult[] = inspirationResults.map(result => ({
            id: result.item.id,
            name: result.item.name,
            description: result.item.description,
            image: result.item.image,
            type: 'inspiration',
            relevanceScore: result.score ? 1 - result.score : 0.5,
            tags: result.item.tags,
            occasions: result.item.occasions,
            exactMatch: normalizeArabicText(result.item.name).includes(normalizedQuery),
            url: `/inspiration/${result.item.id}`,
            matches: result.matches as readonly FuseResultMatch[]
          }));
          
          // دمج وفرز النتائج
          let combinedResults = [...productSearchResults, ...inspirationSearchResults];
          
          // تطبيق الفلاتر
          if (category) {
            combinedResults = combinedResults.filter(result => {
              if (result.type === 'product') {
                return result.category?.toLowerCase() === category.toLowerCase();
              }
              return true;
            });
          }
          
          if (priceRange && priceRange !== 'all') {
            const [minPrice, maxPrice] = priceRange.split('-').map(Number);
            combinedResults = combinedResults.filter(result => {
              if (result.type === 'product' && result.price !== undefined) {
                if (maxPrice) {
                  return result.price >= minPrice && result.price <= maxPrice;
                } else {
                  return result.price >= minPrice;
                }
              }
              return true;
            });
          }
          
          // تطبيق الفلتر النشط
          const { activeFilter } = get();
          if (activeFilter !== 'all') {
            combinedResults = combinedResults.filter(result => result.type === activeFilter);
          }
          
          // ترتيب النتائج
          if (sortBy === 'price_asc') {
            combinedResults.sort((a, b) => {
              if (a.price === undefined) return 1;
              if (b.price === undefined) return -1;
              return a.price - b.price;
            });
          } else if (sortBy === 'price_desc') {
            combinedResults.sort((a, b) => {
              if (a.price === undefined) return 1;
              if (b.price === undefined) return -1;
              return b.price - a.price;
            });
          } else {
            // الترتيب الافتراضي حسب الصلة
            combinedResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
          }
          
          // تحديد عدد النتائج
          combinedResults = combinedResults.slice(0, get().maxResults);
          
          // تحديث الحالة
          set({ 
            searchResults: combinedResults,
            isLoading: false
          });
          
          // إضافة إلى البحوث الأخيرة
          if (combinedResults.length > 0) {
            get().addRecentSearch(query);
          }
        } catch (error) {
          console.error('Search error:', error);
          set({ 
            error: 'حدث خطأ أثناء البحث، يرجى المحاولة مرة أخرى', 
            isLoading: false 
          });
        }
      },
      
      // Clear search results
      clearSearch: () => {
        set({ 
          query: '', 
          searchResults: [], 
          suggestions: [] 
        });
      },
      
      // Add a term to recent searches
      addRecentSearch: (term: string) => {
        const { recentSearches } = get();
        
        // Remove the term if it already exists
        const filteredSearches = recentSearches.filter(
          search => normalizeArabicText(search) !== normalizeArabicText(term)
        );
        
        // Add the new term at the beginning and limit to 10 items
        set({ 
          recentSearches: [term, ...filteredSearches].slice(0, 10) 
        });
      },
      
      // Clear all recent searches
      clearRecentSearches: () => {
        set({ recentSearches: [] });
      },
      
      // Set active filter
      setActiveFilter: (filter: FilterType) => {
        set({ activeFilter: filter });
        
        // Re-filter existing results if we have any
        const { searchResults, query } = get();
        if (searchResults.length > 0) {
          if (filter === 'all') {
            // Re-run search to get all results
            get().search(query);
          } else {
            // Filter existing results
            const filteredResults = searchResults.filter(result => {
              // Only compare when filter is a SearchResultType
              return result.type === filter;
            });
            set({ searchResults: filteredResults });
          }
        }
      },
      
      // Toggle spell correction
      toggleSpellCorrection: () => {
        set(state => ({ 
          enableSpellCorrection: !state.enableSpellCorrection 
        }));
      },
      
      // Toggle autocomplete
      toggleAutocomplete: () => {
        set(state => ({ 
          enableAutocomplete: !state.enableAutocomplete 
        }));
      },
      
      // Toggle fuzzy search
      toggleFuzzySearch: () => {
        set(state => ({ 
          enableFuzzySearch: !state.enableFuzzySearch 
        }));
      },
      
      // Toggle keyword highlighting
      toggleKeywordHighlighting: () => {
        set(state => ({ 
          enableKeywordHighlighting: !state.enableKeywordHighlighting 
        }));
      },
      
      // Update products cache
      updateProductsCache: (products: Product[]) => {
        set({ productsCache: products });
      },
      
      // Update inspirations cache
      updateInspirationsCache: (inspirations: Inspiration[]) => {
        set({ inspirationsCache: inspirations });
      }
    }),
    {
      name: 'cadoz-search-store',
      partialize: (state) => ({
        recentSearches: state.recentSearches,
        enableSpellCorrection: state.enableSpellCorrection,
        enableAutocomplete: state.enableAutocomplete,
        enableFuzzySearch: state.enableFuzzySearch
      })
    }
  )
);
