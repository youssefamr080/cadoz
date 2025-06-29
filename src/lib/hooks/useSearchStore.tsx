"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SearchResult {
  id: string;
  name: string;
  description: string;
  image: string;
  type: 'product' | 'inspiration';
  price?: number;
  rating?: number;
  category: string;
  tags: string[];
  relevanceScore: number;
  url: string;
  [key: string]: unknown;
}

interface SearchFilters {
  category: string[];
  price: [number, number];
  rating: string;
  brand: string[];
  availability: string[];
  occasion: string[];
  color: string[];
  location: string[];
}

interface SearchAnalytics {
  totalSearches: number;
  avgResponseTime: number;
  topCategories: { name: string; count: number; percentage: number }[];
  searchTrends: { date: string; searches: number; success: number }[];
  popularQueries: { query: string; count: number; successRate: number }[];
  userBehavior: {
    avgSessionTime: number;
    bounceRate: number;
    conversionRate: number;
    repeatSearches: number;
  };
}

interface SearchOptions {
  limit?: number;
  sort?: string;
  filters?: {
    category?: string[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface SearchState {
  query: string;
  results: SearchResult[];
  filters: Partial<SearchFilters>;
  analytics: SearchAnalytics;
  isLoading: boolean;
  error: string | null;
  lastSearchTime: number;
  searchHistory: string[];
  searchTimeout: NodeJS.Timeout | null;
  searchMode: 'smart' | 'exact' | 'fuzzy';
  sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
  viewMode: 'grid' | 'list';
  
  updateSearch: (query: string, options?: SearchOptions) => Promise<void>;
  updateQuery: (query: string) => void; // تحديث النص فقط بدون بحث
  updateFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setSortBy: (sort: string) => void;
  addToHistory: (query: string) => void;
  clearHistory: () => void;
  reset: () => void;
}

const initialAnalytics: SearchAnalytics = {
  totalSearches: 0,
  avgResponseTime: 0,
  topCategories: [],
  searchTrends: [],
  popularQueries: [],
  userBehavior: {
    avgSessionTime: 0,
    bounceRate: 0,
    conversionRate: 0,
    repeatSearches: 0
  }
};

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      query: '',
      results: [],
      filters: {},
      analytics: initialAnalytics,
      isLoading: false,
      error: null,
      lastSearchTime: 0,
      searchHistory: [],
      searchTimeout: null,
      searchMode: 'smart',
      sortBy: 'relevance',
      viewMode: 'grid',

      updateSearch: async (query: string, options = {}) => {
        const state = get();
        
        if (state.searchTimeout) {
          clearTimeout(state.searchTimeout);
        }

        set((state) => ({
          ...state,
          query,
          error: null
        }));

        if (!query.trim()) {
          set((state) => ({
            ...state,
            results: [],
            isLoading: false,
            searchTimeout: null
          }));
          return;
        }

        const searchTimeout = setTimeout(async () => {
          const startTime = Date.now();
          
          set((state) => ({
            ...state,
            isLoading: true,
            lastSearchTime: startTime,
            searchTimeout: null
          }));

          try {
            get().addToHistory(query);

            const params = new URLSearchParams({
              q: query.trim(),
              limit: (options.limit || 50).toString(),
              sortBy: options.sort || get().sortBy
            });

            if (options.filters?.category && Array.isArray(options.filters.category) && options.filters.category.length > 0) {
              params.append('category', options.filters.category[0]);
            }

            console.log('🔍 بدء البحث:', query.trim());

            const [productsResponse, inspirationsResponse] = await Promise.allSettled([
              fetch(`/api/products/search?${params.toString()}`),
              fetch(`/api/inspirations/search?${params.toString()}`)
            ]);

            const allResults: SearchResult[] = [];

            if (productsResponse.status === 'fulfilled' && productsResponse.value.ok) {
              const productsData = await productsResponse.value.json();
              if (productsData.success) {
                allResults.push(...productsData.data);
              }
            }

            if (inspirationsResponse.status === 'fulfilled' && inspirationsResponse.value.ok) {
              const inspirationsData = await inspirationsResponse.value.json();
              if (inspirationsData.success) {
                allResults.push(...inspirationsData.data);
              }
            }

            allResults.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

            const searchTime = Date.now() - startTime;
            
            set((state) => ({
              ...state,
              results: allResults,
              analytics: {
                ...state.analytics,
                totalSearches: state.analytics.totalSearches + 1,
                avgResponseTime: Math.round(
                  (state.analytics.avgResponseTime * state.analytics.totalSearches + searchTime) / 
                  (state.analytics.totalSearches + 1)
                )
              },
              isLoading: false,
              lastSearchTime: searchTime
            }));

          } catch (error) {
            console.error('خطأ في البحث:', error);
            set((state) => ({
              ...state,
              error: error instanceof Error ? error.message : 'خطأ غير معروف',
              isLoading: false,
              results: []
            }));
          }
        }, 300);

        set((state) => ({
          ...state,
          searchTimeout
        }));
      },

      // تحديث النص فقط بدون تنفيذ البحث (للهيدر)
      updateQuery: (query: string) => {
        set((state) => ({
          ...state,
          query
        }));
      },

      updateFilters: (newFilters: Partial<SearchFilters>) => {
        set((state) => {
          const updatedFilters = { ...state.filters, ...newFilters };
          
          if (state.query) {
            setTimeout(() => {
              get().updateSearch(state.query, { filters: updatedFilters });
            }, 100);
          }
          
          return {
            ...state,
            filters: updatedFilters
          };
        });
      },

      clearFilters: () => {
        set((state) => {
          if (state.query) {
            setTimeout(() => {
              get().updateSearch(state.query, { filters: {} });
            }, 100);
          }
          
          return {
            ...state,
            filters: {}
          };
        });
      },

      setViewMode: (mode: 'grid' | 'list') => {
        set((state) => ({ ...state, viewMode: mode }));
      },

      setSortBy: (sort: string) => {
        set((state) => {
          const newSortBy = sort as SearchState['sortBy'];
          
          if (state.query) {
            setTimeout(() => {
              get().updateSearch(state.query, { sort: newSortBy });
            }, 100);
          }
          
          return {
            ...state,
            sortBy: newSortBy
          };
        });
      },

      addToHistory: (query: string) => {
        set((state) => {
          const newHistory = [query, ...state.searchHistory.filter(q => q !== query)].slice(0, 10);
          return {
            ...state,
            searchHistory: newHistory
          };
        });
      },

      clearHistory: () => {
        set((state) => ({
          ...state,
          searchHistory: []
        }));
      },

      reset: () => {
        set({
          query: '',
          results: [],
          filters: {},
          analytics: initialAnalytics,
          isLoading: false,
          error: null,
          lastSearchTime: 0,
          searchHistory: [],
          searchTimeout: null,
          searchMode: 'smart',
          sortBy: 'relevance',
          viewMode: 'grid'
        } as SearchState);
      }
    }),
    {
      name: 'search-store',
      partialize: (state) => ({
        searchHistory: state.searchHistory,
        analytics: state.analytics,
        viewMode: state.viewMode,
        sortBy: state.sortBy
      })
    }
  )
);
