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
  indices: Array<[number, number]>;
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
  category?: string;
  type: SearchResultType;
  relevanceScore: number;
  tags?: string[];
  occasions?: string[];
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

// قائمة موسعة من الكلمات العربية الشائعة لتحسين اقتراحات البحث وتصحيح الإملاء
const commonArabicWords = [
  // كلمات أساسية للهدايا والمناسبات
  'هدية', 'هدايا', 'هدية مميزة', 'هدية فاخرة', 'هدية فريدة', 'هدية شخصية', 'هدية مخصصة',
  'مناسبة', 'عيد', 'عيد ميلاد', 'زفاف', 'زواج', 'خطوبة', 'تخرج', 'نجاح', 'ترقية', 'مولود جديد',
  'مولود', 'مولودة', 'احتفال', 'ذكرى', 'ذكرى سنوية', 'مفاجأة', 'تهنئة', 'شكر', 'اعتذار', 'مصالحة',
  'عيد الأم', 'عيد الأب', 'عيد الحب', 'الفالنتاين', 'رأس السنة', 'يوم المعلم', 'تقاعد',
  
  // فئات المنتجات الأكثر بحثاً
  'ملابس', 'أزياء', 'فساتين', 'قمصان', 'بلوزات', 'بناطيل', 'جواكت', 'معاطف', 'أحذية',
  'إكسسوارات', 'مجوهرات', 'ساعات', 'حقائب', 'شنط', 'نظارات', 'أقلام فاخرة', 'محافظ',
  'عطور', 'عطر رجالي', 'عطر نسائي', 'مكياج', 'ماكياج', 'تجميل', 'عناية بالبشرة', 'كريمات',
  'منزل', 'ديكور', 'أثاث', 'إضاءة', 'مصابيح', 'سجاد', 'وسائد', 'شراشف', 'مفارش',
  'مطبخ', 'أواني', 'أدوات طهي', 'أجهزة مطبخ', 'أطقم تقديم', 'أكواب', 'صحون', 'أطباق',
  'إلكترونيات', 'موبايل', 'هواتف ذكية', 'لابتوب', 'كمبيوتر', 'سماعات', 'كاميرات', 'تلفزيون',
  'ألعاب', 'ألعاب أطفال', 'ألعاب فيديو', 'بلايستيشن', 'إكس بوكس', 'نينتندو', 'ألعاب لوحية',
  'كتب', 'روايات', 'كتب تنمية', 'قرطاسية', 'أدوات مكتبية', 'دفاتر', 'أقلام', 'مذكرات', 'مفكرات',
  'رياضة', 'ملابس رياضية', 'أدوات رياضية', 'صحة', 'لياقة', 'تمارين', 'معدات رياضية',
  
  // منتجات وتصنيفات إضافية
  'ذهب', 'دهب', 'فضة', 'خاتم', 'خواتم', 'دبلة', 'سلسلة', 'سلاسل', 'كوليه', 'أقراط', 'حلق',
  'أساور', 'إسورة', 'غويشة', 'سوار', 'توكات شعر', 'دبابيس', 'بروشات', 'خلخال',
  'حقيبة', 'شنطة', 'شنط', 'باك', 'محفظة', 'جزدان', 'حافظة', 'بوك',
  'ساعة', 'ساعة يد', 'ساعات رجالية', 'ساعات نسائية', 'ساعات رياضية', 'ساعات ذكية',
  'عطر', 'برفان', 'بارفان', 'مسك', 'عود', 'بخور', 'معطر', 'معطرات', 'كولونيا', 'توليت',
  'ميكب', 'ميكاب', 'مكياج', 'مستحضرات تجميل', 'روج', 'أحمر شفاه', 'ظلال عيون', 'ماسكارا',
  
  // وصف المنتجات والفئات المستهدفة
  'رجالي', 'رجالية', 'للرجال', 'شبابي', 'للشباب', 'ذكر', 'ذكور',
  'نسائي', 'نسائية', 'للنساء', 'للسيدات', 'أنثى', 'إناث', 'بنات',
  'أطفال', 'طفل', 'طفلة', 'للأطفال', 'بيبي', 'مواليد', 'رضع', 'حديثي الولادة',
  'جلد', 'جلد طبيعي', 'قطن', 'حرير', 'كتان', 'صوف', 'قماش', 'ساتان',
  'ماركة', 'ماركات', 'براند', 'أصلي', 'أصلية', 'تقليد', 'هاي كوالتي',
  
  // الأخطاء الإملائية والكلمات البديلة الشائعة
  'تيشرت', 'تي شيرت', 'تيشيرت', 'قميص', 'بلوزة', 'بلوزه',
  'بنطلون', 'بنطال', 'جينز', 'جينس', 'سروال', 'بنطلونات',
  'لابتوب', 'لاب توب', 'كمبيوتر', 'كومبيوتر', 'حاسوب', 'بي سي',
  'موبايل', 'محمول', 'فون', 'جوال', 'تليفون', 'سمارت فون',
  'أكسسوارات', 'اكسسوارات', 'إكسسوارات', 'اكسسوار', 'إكسسوار',
  'تابلت', 'لوحي', 'آيباد', 'ايباد', 'تاب', 'لوح إلكتروني',
  'شوكولاتة', 'شوكولاته', 'شكولاته', 'شكولاتة', 'شيكولاتة', 'تشوكلت'
];

// الفئات الشائعة المستخدمة للتصفية والاقتراحات
const popularCategories = [
  'ملابس', 'إكسسوارات', 'مجوهرات', 'عطور', 'مكياج', 'إلكترونيات',
  'منزل', 'ديكور', 'مطبخ', 'أطفال', 'ألعاب', 'كتب',
  'رياضة', 'صحة', 'هدايا مميزة', 'طقم هدايا', 'هدية شخصية'
];

// المناسبات الشائعة للبحث
const popularOccasions = [
  'عيد ميلاد', 'خطوبة', 'زواج', 'تخرج', 'مولود جديد',
  'ذكرى سنوية', 'عيد الأم', 'عيد الأب', 'عيد الحب', 'رأس السنة',
  'نجاح', 'ترقية', 'شكر', 'اعتذار', 'مفاجأة'
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
      commonWords: commonArabicWords,
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
          
          // استخراج خيارات التصفية
          const category = options?.category || '';
          const priceRange = options?.priceRange || '';
          const sortBy = options?.sortBy || 'relevance';
          
          // التحقق من إذا كان الاستعلام في البحوث الأخيرة لتحسين النتائج
          const isInRecentSearches = get().recentSearches.includes(query);
          const { productsCache, inspirationsCache } = get();
          
          // تطبيع الاستعلام
          const normalizedQuery = normalizeArabicText(query);
          
          // If the query is not related to recent searches, don't show results
          if (!isInRecentSearches && query.length < 4) {
            set({ searchResults: [], isLoading: false });
            return;
          }
          
          // Search in products with precise settings
          const productFuse = createFuseInstance(
            productsCache,
            [
              { name: 'name', weight: 3 },       // Increased weight for name
              { name: 'category', weight: 2 },     // Increased weight for category
              { name: 'tags', weight: 2 },         // Increased weight for tags
              { name: 'description', weight: 1 }   // Lower weight for description
            ]
          );
          
          // Try different search strategies for products
          let productSearchResults = [];
          
          // 1. First try exact search with original query
          productSearchResults = productFuse.search(query);
          
          // 2. If no results, try with normalized query
          if (productSearchResults.length === 0) {
            productSearchResults = productFuse.search(normalizedQuery);
          }
          
          // 3. If still no results, try with alternative spellings
          if (productSearchResults.length === 0 && query.length >= 3) {
            // For keywords based search, generate alternatives
            const queryKeywords = query.split(/\s+/)
              .flatMap(term => generateAlternativeSpellings(term))
              .filter((term, index, self) => term.length > 1 && self.indexOf(term) === index);
            
            // Try each alternative
            for (const alt of queryKeywords) {
              if (alt !== query && alt !== normalizedQuery) {
                const altResults = productFuse.search(alt);
                if (altResults.length > 0) {
                  productSearchResults = altResults;
                  break; // Stop once we find results
                }
              }
            }
            
            // If still no results and it's a recent search, try with more relaxed settings
            if (productSearchResults.length === 0 && isInRecentSearches) {
              const relaxedProductFuse = createFuseInstance(
                productsCache,
                [
                  { name: 'name', weight: 3 },
                  { name: 'category', weight: 2 },
                  { name: 'tags', weight: 2 },
                  { name: 'description', weight: 1 }
                ]
              );
              
              productSearchResults = relaxedProductFuse.search(query);
            }
          }
          
          // Search in inspirations with similar settings
          const inspirationFuse = createFuseInstance(
            inspirationsCache,
            [
              { name: 'name', weight: 3 },
              { name: 'tags', weight: 2 },
              { name: 'description', weight: 1 }
            ]
          );
          
          // Try different search strategies for inspirations
          let inspirationSearchResults = [];
          
          // 1. First try exact search with original query
          inspirationSearchResults = inspirationFuse.search(query);
          
          // 2. If no results, try with normalized query
          if (inspirationSearchResults.length === 0) {
            inspirationSearchResults = inspirationFuse.search(normalizedQuery);
          }
          
          // 3. If still no results, try with alternative spellings
          if (inspirationSearchResults.length === 0 && query.length >= 3) {
            // For keywords based search, generate alternatives
            const queryKeywords = query.split(/\s+/)
              .flatMap(term => generateAlternativeSpellings(term))
              .filter((term, index, self) => term.length > 1 && self.indexOf(term) === index);
            
            // Try each alternative
            for (const alt of queryKeywords) {
              if (alt !== query && alt !== normalizedQuery) {
                const altResults = inspirationFuse.search(alt);
                if (altResults.length > 0) {
                  inspirationSearchResults = altResults;
                  break; // Stop once we find results
                }
              }
            }
          }
          
          // Convert Fuse.js results to our SearchResult format
          const productResults: SearchResult[] = productSearchResults.map(result => ({
            id: result.item.id,
            name: result.item.name,
            description: result.item.description,
            image: result.item.image,
            price: result.item.price,
            category: result.item.category,
            type: 'product',
            relevanceScore: result.score ? 1 - result.score : 0.5, // Convert Fuse score to relevance (higher is better)
            tags: result.item.tags,
            occasions: result.item.occasions,
            url: result.item.url || `/product/${result.item.id}`,
            matches: result.matches
          }));
          
          const inspirationResults: SearchResult[] = inspirationSearchResults.map(result => ({
            id: result.item.id,
            name: result.item.name,
            description: result.item.description,
            image: result.item.image,
            type: 'inspiration',
            relevanceScore: result.score ? 1 - result.score : 0.5,
            tags: result.item.tags,
            url: result.item.url || `/inspiration/${result.item.id}`,
            matches: result.matches
          }));
          
          // Combine and filter results
          let combinedResults = [...productResults, ...inspirationResults];
          
          // Apply category filter if specified
          if (category) {
            combinedResults = combinedResults.filter(result => {
              if (result.type === 'product') {
                return result.category?.toLowerCase() === category.toLowerCase();
              }
              return true; // Keep inspirations regardless of category
            });
          }
          
          // Apply price range filter if specified
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
              return true; // Keep inspirations regardless of price
            });
          }
          
          // Apply active filter
          const { activeFilter } = get();
          if (activeFilter !== 'all') {
            combinedResults = combinedResults.filter(result => result.type === activeFilter);
          }
          
          // Sort results
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
            // Default: sort by relevance
            combinedResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
          }
          
          // Limit results
          combinedResults = combinedResults.slice(0, get().maxResults);
          
          // Update state with results
          set({ 
            searchResults: combinedResults,
            isLoading: false
          });
          
          // Add to recent searches if we got results
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
