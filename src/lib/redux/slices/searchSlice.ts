import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit"
import type { Product } from '@/types/product';
import type { Inspiration } from '@/types/inspiration';
import { normalizeArabicText } from '@/lib/utils/arabic-text-utils';

export type SearchResultType = 'product' | 'inspiration';
export type FilterType = SearchResultType | 'all';

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
}

interface SearchState {
  query: string;
  suggestions: string[];
  recentSearches: string[];
  searchResults: SearchResult[];
  isLoading: boolean;
  error: string | null;
  activeFilter: FilterType;
  maxResults: number;
  minQueryLength: number;
  enableSpellCorrection: boolean;
  enableAutocomplete: boolean;
  enableKeywordHighlighting: boolean;
  enableFuzzySearch: boolean;
  productsCache: Product[];
  inspirationsCache: Inspiration[];
}

const initialState: SearchState = {
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
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    setSuggestions(state, action: PayloadAction<string[]>) {
      state.suggestions = action.payload;
    },
    addRecentSearch(state, action: PayloadAction<string>) {
      if (!state.recentSearches.includes(action.payload)) {
        state.recentSearches.unshift(action.payload);
        if (state.recentSearches.length > 10) state.recentSearches.pop();
      }
    },
    clearRecentSearches(state) {
      state.recentSearches = [];
    },
    setActiveFilter(state, action: PayloadAction<FilterType>) {
      state.activeFilter = action.payload;
    },
    setProductsCache(state, action: PayloadAction<Product[]>) {
      state.productsCache = action.payload;
    },
    setInspirationsCache(state, action: PayloadAction<Inspiration[]>) {
      state.inspirationsCache = action.payload;
    },
    clearSearch(state) {
      state.query = '';
      state.suggestions = [];
      state.searchResults = [];
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'حدث خطأ أثناء البحث';
      });
  },
});

// Async thunk for search
export const searchAsync = createAsyncThunk(
  'search/searchAsync',
  async (query: string, { getState }) => {
    // هنا يمكنك وضع منطق البحث الحقيقي (API أو بحث محلي)
    // مؤقتًا: بحث بسيط في الكاش
    const state = getState() as { search: SearchState };
    const { productsCache, inspirationsCache, maxResults } = state.search;
    const normalizedQuery = normalizeArabicText(query);
    // بحث بسيط بالاسم فقط
    const productResults = productsCache.filter(p => normalizeArabicText(p.name).includes(normalizedQuery)).map(p => ({
      id: p.id,
      name: p.name,
      description: p.description || '',
      image: p.image || '',
      price: p.price,
      category: p.category,
      type: 'product' as SearchResultType,
      relevanceScore: 1,
      url: `/product/${p.id}`,
    }));
    const inspirationResults = inspirationsCache.filter(i => normalizeArabicText(i.name).includes(normalizedQuery)).map(i => ({
      id: i.id,
      name: i.name,
      description: i.description || '',
      image: i.image || '',
      type: 'inspiration' as SearchResultType,
      relevanceScore: 1,
      url: `/inspiration/${i.id}`,
    }));
    return [...productResults, ...inspirationResults].slice(0, maxResults);
  }
);

export const {
  setQuery,
  setSuggestions,
  addRecentSearch,
  clearRecentSearches,
  setActiveFilter,
  setProductsCache,
  setInspirationsCache,
  clearSearch,
} = searchSlice.actions;

export default searchSlice.reducer; 